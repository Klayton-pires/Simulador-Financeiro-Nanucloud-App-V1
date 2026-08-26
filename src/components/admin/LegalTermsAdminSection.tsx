import React, { useState, useEffect } from 'react';
import {
  Scale,
  FileText,
  AlertTriangle,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Check,
  Eye,
  Edit3,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import {
  LegalTermsConfig,
  LegalTermSection,
  getLegalTerms,
  saveLegalTerms,
  resetLegalTermsToDefault
} from '../../data/legalTerms';

interface LegalTermsAdminSectionProps {
  onSaveSnapshot: (section: string, payload: any) => void;
  showSaveNotice: (msg: string) => void;
}

export const LegalTermsAdminSection: React.FC<LegalTermsAdminSectionProps> = ({
  onSaveSnapshot,
  showSaveNotice
}) => {
  const [terms, setTerms] = useState<LegalTermsConfig>(() => getLegalTerms());
  const [previewMode, setPreviewMode] = useState<boolean>(false);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setTerms(e.detail);
      }
    };
    window.addEventListener('nanucloud_legal_terms_updated', handleUpdate);
    return () => window.removeEventListener('nanucloud_legal_terms_updated', handleUpdate);
  }, []);

  const handleSave = () => {
    saveLegalTerms(terms);
    onSaveSnapshot('Termos de Uso & Políticas Legais', terms);
    showSaveNotice('Termos de Uso e Políticas Legais guardados com sucesso!');
  };

  const handleReset = () => {
    if (window.confirm('Deseja restaurar as cláusulas e avisos para o padrão original da NANUCLOUD?')) {
      const def = resetLegalTermsToDefault();
      setTerms(def);
      onSaveSnapshot('Termos de Uso & Políticas Legais (Restaurado)', def);
      showSaveNotice('Termos restaurados para a versão padrão!');
    }
  };

  const handleAddSection = () => {
    const newSec: LegalTermSection = {
      id: `sec_${Date.now()}`,
      title: `${terms.sections.length + 1}. Nova Cláusula Legal`,
      content: 'Insira aqui o texto descritivo desta cláusula legal...',
      bulletPoints: ['Alínea informativa ou condição 1', 'Alínea informativa ou condição 2']
    };
    setTerms({
      ...terms,
      sections: [...terms.sections, newSec]
    });
  };

  const handleRemoveSection = (index: number) => {
    const updated = terms.sections.filter((_, i) => i !== index);
    setTerms({ ...terms, sections: updated });
  };

  const handleSectionChange = (index: number, field: keyof LegalTermSection, val: any) => {
    const updated = [...terms.sections];
    updated[index] = { ...updated[index], [field]: val };
    setTerms({ ...terms, sections: updated });
  };

  const handleBulletChange = (secIdx: number, bulletIdx: number, val: string) => {
    const updated = [...terms.sections];
    const bullets = [...(updated[secIdx].bulletPoints || [])];
    bullets[bulletIdx] = val;
    updated[secIdx].bulletPoints = bullets;
    setTerms({ ...terms, sections: updated });
  };

  const handleAddBullet = (secIdx: number) => {
    const updated = [...terms.sections];
    const bullets = [...(updated[secIdx].bulletPoints || [])];
    bullets.push('Novo item de especificação...');
    updated[secIdx].bulletPoints = bullets;
    setTerms({ ...terms, sections: updated });
  };

  const handleRemoveBullet = (secIdx: number, bulletIdx: number) => {
    const updated = [...terms.sections];
    const bullets = (updated[secIdx].bulletPoints || []).filter((_, i) => i !== bulletIdx);
    updated[secIdx].bulletPoints = bullets;
    setTerms({ ...terms, sections: updated });
  };

  return (
    <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-400" /> GESTÃO DE TERMOS DE USO & POLÍTICAS LEGAIS
            </h3>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-mono font-bold">
              Super Admin
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Personalize termos de adesão, aviso essencial de isenção de responsabilidade, regras de reembolso e adicione cláusulas customizadas.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer ${
              previewMode
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            {previewMode ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{previewMode ? 'Modo Editor' : 'Pré-visualizar Termos'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-200 px-3 py-2 rounded-xl text-xs font-mono transition cursor-pointer"
            title="Restaurar valores padrão"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-5 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" /> Guardar Termos
          </button>
        </div>
      </div>

      {/* ================= PREVIEW MODE ================= */}
      {previewMode ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-6 text-xs font-sans text-slate-300">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white font-mono">{terms.title}</h2>
            <p className="text-slate-400 text-xs mt-0.5">{terms.subtitle} • Versão {terms.version} • {terms.lastUpdated}</p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex gap-3 text-amber-300">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <p className="font-bold text-amber-200 uppercase tracking-wider mb-1 font-mono">
                {terms.disclaimerTitle}
              </p>
              <p className="text-slate-300 leading-relaxed font-sans">{terms.disclaimerContent}</p>
            </div>
          </div>

          {terms.sections.map((sec, idx) => (
            <div key={sec.id || idx} className="space-y-2">
              <h4 className="text-sm font-bold text-indigo-300 font-mono uppercase tracking-wider">{sec.title}</h4>
              <p className="text-slate-300 leading-relaxed">{sec.content}</p>
              {sec.bulletPoints && sec.bulletPoints.length > 0 && (
                <ul className="space-y-1.5 pl-4 list-disc marker:text-indigo-500 text-slate-300">
                  {sec.bulletPoints.map((bp, bIdx) => (
                    <li key={bIdx}>{bp}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {terms.customClause && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="font-bold text-indigo-300 font-mono uppercase block mb-1">Cláusula Complementar</span>
              <p>{terms.customClause}</p>
            </div>
          )}

          <div className="pt-2 text-[11px] text-slate-500 font-mono">
            Contacto de Suporte: {terms.contactSupportText}
          </div>
        </div>
      ) : (
        /* ================= EDITOR MODE ================= */
        <div className="space-y-6 font-mono text-xs">
          
          {/* Header configuration */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" /> Título, Versão & Subtítulo
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-[10px] text-slate-400 block mb-1">TÍTULO PRINCIPAL</label>
                <input
                  type="text"
                  value={terms.title}
                  onChange={(e) => setTerms({ ...terms, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">VERSÃO DOS TERMOS</label>
                <input
                  type="text"
                  value={terms.version}
                  onChange={(e) => setTerms({ ...terms, version: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-indigo-300 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">SUBTÍTULO / DESCRITIVO INSTITUCIONAL</label>
              <input
                type="text"
                value={terms.subtitle}
                onChange={(e) => setTerms({ ...terms, subtitle: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Disclaimer Box */}
          <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-5 space-y-4">
            <h4 className="font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Caixa de Aviso Essencial (Simulador Fiscal)
            </h4>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">TÍTULO DO AVISO</label>
              <input
                type="text"
                value={terms.disclaimerTitle}
                onChange={(e) => setTerms({ ...terms, disclaimerTitle: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">CONTEÚDO DO AVISO</label>
              <textarea
                rows={3}
                value={terms.disclaimerContent}
                onChange={(e) => setTerms({ ...terms, disclaimerContent: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
              />
            </div>
          </div>

          {/* Sections List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" /> Cláusulas e Secções Estruturadas ({terms.sections.length})
              </h4>

              <button
                type="button"
                onClick={handleAddSection}
                className="bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Cláusula
              </button>
            </div>

            {terms.sections.map((sec, secIdx) => (
              <div key={sec.id || secIdx} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex-1">
                    <label className="text-[9px] text-slate-500 block">TÍTULO DA CLÁUSULA #{secIdx + 1}</label>
                    <input
                      type="text"
                      value={sec.title}
                      onChange={(e) => handleSectionChange(secIdx, 'title', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-indigo-300 font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveSection(secIdx)}
                    className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition"
                    title="Eliminar Secção"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="text-[9px] text-slate-500 block mb-1">TEXTO INTRODUTÓRIO / PARÁGRAFO</label>
                  <textarea
                    rows={2}
                    value={sec.content}
                    onChange={(e) => handleSectionChange(secIdx, 'content', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-sans"
                  />
                </div>

                {/* Bullet Points */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider">Alíneas e Detalhes ({sec.bulletPoints?.length || 0}):</span>
                    <button
                      type="button"
                      onClick={() => handleAddBullet(secIdx)}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-bold"
                    >
                      <Plus className="w-3 h-3" /> Adicionar Alínea
                    </button>
                  </div>

                  {(sec.bulletPoints || []).map((bp, bpIdx) => (
                    <div key={bpIdx} className="flex items-center gap-2">
                      <span className="text-indigo-400 text-xs font-bold">•</span>
                      <input
                        type="text"
                        value={bp}
                        onChange={(e) => handleBulletChange(secIdx, bpIdx, e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveBullet(secIdx, bpIdx)}
                        className="p-1 text-slate-500 hover:text-rose-400"
                        title="Remover"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Extra Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">CLÁUSULA COMPLEMENTAR / SLA CORPORATIVO</label>
              <textarea
                rows={3}
                value={terms.customClause || ''}
                onChange={(e) => setTerms({ ...terms, customClause: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                placeholder="Insira detalhes sobre contratos empresariais ou SLA..."
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">CONTACTO DO DEPARTAMENTO JURÍDICO & SUPORTE</label>
              <input
                type="text"
                value={terms.contactSupportText}
                onChange={(e) => setTerms({ ...terms, contactSupportText: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">Exibido no rodapé do modal de termos.</p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
