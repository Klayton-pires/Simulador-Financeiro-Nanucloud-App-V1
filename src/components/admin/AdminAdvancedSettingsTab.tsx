import React, { useState } from 'react';
import { SystemSettings } from '../../types';
import { Settings, Image, Database, Phone, Mail, MapPin, Share2, DollarSign, CheckCircle2, AlertCircle, RefreshCw, Globe, Shield } from 'lucide-react';

interface AdminAdvancedSettingsTabProps {
  settingsData: SystemSettings;
  onSaveSettings: (updated: SystemSettings) => Promise<void>;
  isSuperAdmin: boolean;
}

export const AdminAdvancedSettingsTab: React.FC<AdminAdvancedSettingsTabProps> = ({
  settingsData,
  onSaveSettings,
  isSuperAdmin
}) => {
  const [formData, setFormData] = useState<SystemSettings>({ ...settingsData });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setAlertMsg(null);
    try {
      await onSaveSettings(formData);
      setAlertMsg({ text: 'Todas as configurações da empresa e parâmetros foram atualizados com sucesso!', type: 'success' });
    } catch (err) {
      setAlertMsg({ text: 'Erro ao guardar configurações.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-5 md:p-6 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-tight flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-400" />
            <span>Definições Globais, Empresa & Redes Sociais</span>
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-1">
            Personalize logotipo, contactos oficiais, rodapé, NIF, pagamentos e monetização da plataforma.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-lg transition shadow flex items-center gap-2 self-start md:self-auto"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isSaving ? 'A Gravar...' : 'Guardar Todas as Definições'}</span>
        </button>
      </div>

      {alertMsg && (
        <div className={`p-4 rounded-xl flex items-center gap-2 ${
          alertMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
        }`}>
          {alertMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* 1. Logótipo e Identidade Visual */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-5 space-y-4">
        <h4 className="text-xs font-bold text-slate-200 uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
          <Image className="w-4 h-4 text-indigo-400" />
          <span>1. Logótipo & Identidade da Empresa</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-3">
            <div>
              <label className="text-slate-400 block mb-1">Nome Oficial da Empresa *</label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full bg-[#0F172A] border border-slate-700 text-slate-100 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">URL do Logótipo (ou Deixar em branco para usar o Logo Vetorial padrão)</label>
              <input
                type="text"
                placeholder="https://exemplo.com/logo.png"
                value={formData.companyLogoUrl || ''}
                onChange={(e) => setFormData({ ...formData, companyLogoUrl: e.target.value })}
                className="w-full bg-[#0F172A] border border-slate-700 text-slate-100 rounded-lg px-3 py-2 font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Logo Preview */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-lg p-3 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] text-slate-500 uppercase mb-2">Pré-visualização do Logótipo</span>
            {formData.companyLogoUrl ? (
              <img
                src={formData.companyLogoUrl}
                alt="Logo Preview"
                className="max-h-12 max-w-full object-contain"
                onError={(e) => { (e.target as any).style.display = 'none'; }}
              />
            ) : (
              <div className="text-emerald-400 font-bold text-base tracking-wider flex items-center gap-1.5">
                <span className="text-indigo-400">NANU</span><span>CLOUD</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Contactos, Endereço, NIF e Rodapé */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-5 space-y-4">
        <h4 className="text-xs font-bold text-slate-200 uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
          <MapPin className="w-4 h-4 text-sky-400" />
          <span>2. Contactos Oficiais, NIF, Endereço & Rodapé</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-slate-400 block mb-1">Telefone Principal (Apoio) *</label>
            <input
              type="text"
              value={formData.companyPhone1 || '+244929462681'}
              onChange={(e) => setFormData({ ...formData, companyPhone1: e.target.value })}
              className="w-full bg-[#0F172A] border border-slate-700 text-slate-100 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Telefone Alternativo</label>
            <input
              type="text"
              value={formData.companyPhone2 || '+244954269353'}
              onChange={(e) => setFormData({ ...formData, companyPhone2: e.target.value })}
              className="w-full bg-[#0F172A] border border-slate-700 text-slate-100 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">NIF da Empresa</label>
            <input
              type="text"
              value={formData.companyNif || '5001234567'}
              onChange={(e) => setFormData({ ...formData, companyNif: e.target.value })}
              className="w-full bg-[#0F172A] border border-slate-700 text-slate-100 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Email Principal *</label>
            <input
              type="email"
              value={formData.companyEmail1 || 'suporte.simulador@nanucloud.com'}
              onChange={(e) => setFormData({ ...formData, companyEmail1: e.target.value })}
              className="w-full bg-[#0F172A] border border-slate-700 text-slate-100 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Email Alternativo</label>
            <input
              type="email"
              value={formData.companyEmail2 || 'joaquim.monteiro@nanucloud.com'}
              onChange={(e) => setFormData({ ...formData, companyEmail2: e.target.value })}
              className="w-full bg-[#0F172A] border border-slate-700 text-slate-100 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Texto de Copyright (Rodapé)</label>
            <input
              type="text"
              value={formData.footerCopyrightText || '2026 NANUCLOUD | ALL RIGHTS RESERVED'}
              onChange={(e) => setFormData({ ...formData, footerCopyrightText: e.target.value })}
              className="w-full bg-[#0F172A] border border-slate-700 text-slate-100 rounded-lg px-3 py-2"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="text-slate-400 block mb-1">Endereço Físico Completo</label>
            <input
              type="text"
              value={formData.companyAddress || 'Angola, Luanda, Viana, Capalanca'}
              onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
              className="w-full bg-[#0F172A] border border-slate-700 text-slate-100 rounded-lg px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* 3. EMIS Multicaixa Express & Pagamentos Eletrónicos */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-5 space-y-4">
        <h4 className="text-xs font-bold text-slate-200 uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
          <DollarSign className="w-4 h-4 text-amber-400" />
          <span>3. Integração EMIS Multicaixa Express (Pronto para Ativação Futura)</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-slate-400 block mb-1">Código de Entidade EMIS</label>
            <input
              type="text"
              placeholder="Ex: 99123"
              value={formData.emisEntityId || ''}
              onChange={(e) => setFormData({ ...formData, emisEntityId: e.target.value })}
              className="w-full bg-[#0F172A] border border-slate-700 text-slate-100 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Terminal ID EMIS</label>
            <input
              type="text"
              placeholder="Ex: TRM001"
              value={formData.emisTerminalId || ''}
              onChange={(e) => setFormData({ ...formData, emisTerminalId: e.target.value })}
              className="w-full bg-[#0F172A] border border-slate-700 text-slate-100 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Chave de API / Segredo EMIS</label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.emisApiKey || ''}
              onChange={(e) => setFormData({ ...formData, emisApiKey: e.target.value })}
              className="w-full bg-[#0F172A] border border-slate-700 text-slate-100 rounded-lg px-3 py-2"
            />
          </div>

          <div className="sm:col-span-3 flex items-center gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={formData.emisAutoActivate || false}
                onChange={(e) => setFormData({ ...formData, emisAutoActivate: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 bg-slate-900 border-slate-700"
              />
              <span>Ativação Automática de Planos após Callback da EMIS</span>
            </label>
          </div>
        </div>
      </div>

      {/* 4. Google AdSense & Monetização */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-5 space-y-4">
        <h4 className="text-xs font-bold text-slate-200 uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
          <Globe className="w-4 h-4 text-emerald-400" />
          <span>4. Monetização com Google AdSense (Exclusivo para Modo Gratuito)</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-slate-400 block mb-1">Publisher ID (Google AdSense)</label>
            <input
              type="text"
              placeholder="ca-pub-XXXXXXXXXXXXXXXX"
              value={formData.googleAdsensePublisherId || ''}
              onChange={(e) => setFormData({ ...formData, googleAdsensePublisherId: e.target.value })}
              className="w-full bg-[#0F172A] border border-slate-700 text-slate-100 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Ad Slot ID</label>
            <input
              type="text"
              placeholder="1234567890"
              value={formData.googleAdsenseSlotId || ''}
              onChange={(e) => setFormData({ ...formData, googleAdsenseSlotId: e.target.value })}
              className="w-full bg-[#0F172A] border border-slate-700 text-slate-100 rounded-lg px-3 py-2"
            />
          </div>

          <div className="flex items-center gap-3 pt-6">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={formData.googleAdsenseEnabled || false}
                onChange={(e) => setFormData({ ...formData, googleAdsenseEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 bg-slate-900 border-slate-700"
              />
              <span>Ativar Banners de Anúncios no Modo Gratuito</span>
            </label>
          </div>
        </div>
      </div>

      {/* 5. Redes Sociais da Empresa */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-5 space-y-4">
        <h4 className="text-xs font-bold text-slate-200 uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
          <Share2 className="w-4 h-4 text-purple-400" />
          <span>5. Redes Sociais Oficiais (Apenas aparecem no rodapé se preenchidos)</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-slate-400 block mb-1">Facebook URL</label>
            <input
              type="text"
              placeholder="https://facebook.com/nanucloud"
              value={formData.socialFacebook || ''}
              onChange={(e) => setFormData({ ...formData, socialFacebook: e.target.value })}
              className="w-full bg-[#0F172A] border border-slate-700 text-slate-100 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Instagram URL</label>
            <input
              type="text"
              placeholder="https://instagram.com/nanucloud"
              value={formData.socialInstagram || ''}
              onChange={(e) => setFormData({ ...formData, socialInstagram: e.target.value })}
              className="w-full bg-[#0F172A] border border-slate-700 text-slate-100 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">LinkedIn URL</label>
            <input
              type="text"
              placeholder="https://linkedin.com/company/nanucloud"
              value={formData.socialLinkedIn || ''}
              onChange={(e) => setFormData({ ...formData, socialLinkedIn: e.target.value })}
              className="w-full bg-[#0F172A] border border-slate-700 text-slate-100 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">X (Twitter) URL</label>
            <input
              type="text"
              placeholder="https://x.com/nanucloud"
              value={formData.socialTwitterX || ''}
              onChange={(e) => setFormData({ ...formData, socialTwitterX: e.target.value })}
              className="w-full bg-[#0F172A] border border-slate-700 text-slate-100 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">YouTube URL</label>
            <input
              type="text"
              placeholder="https://youtube.com/@nanucloud"
              value={formData.socialYouTube || ''}
              onChange={(e) => setFormData({ ...formData, socialYouTube: e.target.value })}
              className="w-full bg-[#0F172A] border border-slate-700 text-slate-100 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">WhatsApp Grupo / Canal</label>
            <input
              type="text"
              placeholder="https://chat.whatsapp.com/..."
              value={formData.socialWhatsApp || ''}
              onChange={(e) => setFormData({ ...formData, socialWhatsApp: e.target.value })}
              className="w-full bg-[#0F172A] border border-slate-700 text-slate-100 rounded-lg px-3 py-2"
            />
          </div>
        </div>
      </div>
    </form>
  );
};
