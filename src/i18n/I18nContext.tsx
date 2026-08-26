import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { SupportedLang, TranslationDict, TRANSLATIONS, SUPPORTED_LANGUAGES, LanguageMeta } from './translations';

interface I18nContextType {
  language: SupportedLang;
  setLanguage: (lang: SupportedLang) => void;
  currentLangMeta: LanguageMeta;
  languages: LanguageMeta[];
  t: (key: keyof TranslationDict, fallback?: string) => string;
  translateAsync: (text: string, context?: string) => Promise<string>;
  translateBatchAsync: (texts: string[], context?: string) => Promise<string[]>;
  isRTL: boolean;
  isAiTranslating: boolean;
}

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY = 'nanucloud_user_lang';
const CACHE_KEY_PREFIX = 'nanucloud_ai_tr_';

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLang>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && (TRANSLATIONS as any)[saved]) {
        return saved as SupportedLang;
      }
    } catch {}
    return 'pt';
  });

  const [isAiTranslating, setIsAiTranslating] = useState<boolean>(false);

  const currentLangMeta = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  const isRTL = currentLangMeta.dir === 'rtl';

  // Synchronize document direction and lang attribute
  useEffect(() => {
    try {
      document.documentElement.dir = currentLangMeta.dir;
      document.documentElement.lang = language;
      localStorage.setItem(STORAGE_KEY, language);
    } catch {}
  }, [language, currentLangMeta]);

  const setLanguage = useCallback((lang: SupportedLang) => {
    setLanguageState(lang);
  }, []);

  // Instant dictionary translation
  const t = useCallback(
    (key: keyof TranslationDict, fallback?: string): string => {
      const dict = TRANSLATIONS[language] || TRANSLATIONS.pt;
      if (dict && dict[key]) {
        return dict[key];
      }
      const fallbackDict = TRANSLATIONS.pt;
      if (fallbackDict && fallbackDict[key]) {
        return fallbackDict[key];
      }
      return fallback || String(key);
    },
    [language]
  );

  // Dynamic AI translation for unknown dynamic texts with client-side localStorage cache
  const translateAsync = useCallback(
    async (text: string, context?: string): Promise<string> => {
      if (!text || !text.trim() || language === 'pt') {
        return text;
      }

      const cacheKey = `${CACHE_KEY_PREFIX}${language}_${text.trim()}`;
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) return cached;
      } catch {}

      try {
        setIsAiTranslating(true);
        const res = await fetch('/api/ai/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            targetLang: language,
            context
          })
        });

        if (res.ok) {
          const data = await res.json();
          const translated = data.translated || text;
          try {
            localStorage.setItem(cacheKey, translated);
          } catch {}
          return translated;
        }
      } catch (err) {
        console.warn('Dynamic AI translation failed, using fallback:', err);
      } finally {
        setIsAiTranslating(false);
      }

      return text;
    },
    [language]
  );

  // Batch AI translation
  const translateBatchAsync = useCallback(
    async (texts: string[], context?: string): Promise<string[]> => {
      if (!texts || texts.length === 0 || language === 'pt') {
        return texts;
      }

      const results: string[] = [];
      const missingTexts: string[] = [];
      const missingIndices: number[] = [];

      texts.forEach((txt, idx) => {
        const cacheKey = `${CACHE_KEY_PREFIX}${language}_${txt.trim()}`;
        try {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            results[idx] = cached;
            return;
          }
        } catch {}
        missingIndices.push(idx);
        missingTexts.push(txt);
      });

      if (missingTexts.length === 0) {
        return results;
      }

      try {
        setIsAiTranslating(true);
        const res = await fetch('/api/ai/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            texts: missingTexts,
            targetLang: language,
            context
          })
        });

        if (res.ok) {
          const data = await res.json();
          const translatedList = data.translations || [];
          missingIndices.forEach((origIdx, i) => {
            const val = translatedList[i] || missingTexts[i];
            results[origIdx] = val;
            const cacheKey = `${CACHE_KEY_PREFIX}${language}_${missingTexts[i].trim()}`;
            try {
              localStorage.setItem(cacheKey, val);
            } catch {}
          });
          return results;
        }
      } catch (err) {
        console.warn('Batch AI translation error:', err);
      } finally {
        setIsAiTranslating(false);
      }

      // Fallback
      missingIndices.forEach((origIdx, i) => {
        results[origIdx] = missingTexts[i];
      });
      return results;
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      currentLangMeta,
      languages: SUPPORTED_LANGUAGES,
      t,
      translateAsync,
      translateBatchAsync,
      isRTL,
      isAiTranslating
    }),
    [language, setLanguage, currentLangMeta, t, translateAsync, translateBatchAsync, isRTL, isAiTranslating]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
