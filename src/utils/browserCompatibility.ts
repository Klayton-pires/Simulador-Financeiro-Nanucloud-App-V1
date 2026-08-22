// browserCompatibility.ts - Suporte e Polyfills para Navegadores Antigos e Novos
/**
 * Garante que a aplicação NANUCLOUD funcione perfeitamente em:
 * - Chrome / Chromium 50+
 * - Safari 10+ (iOS e Mac)
 * - Mozilla Firefox 50+
 * - Microsoft Edge (Legado e Chromium)
 * - Navegadores móveis antigos (Android WebViews, Opera Mini, UC Browser)
 */

export function initBrowserCompatibility(): void {
  try {
    // 1. Polyfill para globalThis
    if (typeof (window as any).globalThis === 'undefined') {
      (window as any).globalThis = window;
    }

    // 2. Polyfill para structuredClone (Browsers antigos)
    if (typeof (window as any).structuredClone === 'undefined') {
      (window as any).structuredClone = (obj: any) => {
        if (obj === undefined) return undefined;
        return JSON.parse(JSON.stringify(obj));
      };
    }

    // 3. Polyfill para Promise.allSettled
    if (!Promise.allSettled) {
      (Promise as any).allSettled = function (promises: Iterable<Promise<any>>) {
        return Promise.all(
          Array.from(promises).map((p) =>
            Promise.resolve(p).then(
              (value) => ({ status: 'fulfilled', value }),
              (reason) => ({ status: 'rejected', reason })
            )
          )
        );
      };
    }

    // 4. Polyfill para Array.prototype.flat
    if (!Array.prototype.flat) {
      (Array.prototype as any).flat = function (depth = 1) {
        return (depth > 0
          ? this.reduce(
              (acc: any[], val: any) =>
                acc.concat(Array.isArray(val) ? (val as any).flat(depth - 1) : val),
              []
            )
          : this.slice());
      };
    }

    // 5. Polyfill para Object.fromEntries
    if (!Object.fromEntries) {
      Object.fromEntries = function (entries: any) {
        if (!entries || !entries[Symbol.iterator]) {
          throw new TypeError('Object.fromEntries() requires a single iterable argument');
        }
        const obj: Record<string, any> = {};
        for (const [key, val] of entries) {
          obj[key] = val;
        }
        return obj;
      };
    }

    // 6. Polyfill Seguro para LocalStorage (caso cookies/storage estejam bloqueados ou em navegadores antigos)
    try {
      const testKey = '__nanucloud_test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
    } catch (e) {
      console.warn('LocalStorage inacessível ou restrito. Ativando MemoryStorage Fallback...');
      const memoryStorage: Record<string, string> = {};
      const storageFallback = {
        getItem: (key: string) => memoryStorage[key] || null,
        setItem: (key: string, value: string) => {
          memoryStorage[key] = String(value);
        },
        removeItem: (key: string) => {
          delete memoryStorage[key];
        },
        clear: () => {
          Object.keys(memoryStorage).forEach((k) => delete memoryStorage[k]);
        },
        key: (idx: number) => Object.keys(memoryStorage)[idx] || null,
        get length() {
          return Object.keys(memoryStorage).length;
        }
      };
      Object.defineProperty(window, 'localStorage', {
        value: storageFallback,
        writable: true
      });
    }

    // 7. Clipboard Fallback seguro
    if (!navigator.clipboard) {
      (navigator as any).clipboard = {
        writeText: (text: string) => {
          return new Promise<void>((resolve, reject) => {
            try {
              const textArea = document.createElement('textarea');
              textArea.value = text;
              textArea.style.position = 'fixed';
              textArea.style.left = '-999999px';
              textArea.style.top = '-999999px';
              document.body.appendChild(textArea);
              textArea.focus();
              textArea.select();
              const successful = document.execCommand('copy');
              document.body.removeChild(textArea);
              if (successful) resolve();
              else reject(new Error('Falha ao copiar'));
            } catch (err) {
              reject(err);
            }
          });
        }
      };
    }
  } catch (err) {
    console.warn('Compatibilidade inicializada com avisos:', err);
  }
}
