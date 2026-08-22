import React, { useState } from 'react';
import {
  Send,
  MessageSquare,
  Mail,
  Sparkles,
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  Gift,
  Zap,
  Filter
} from 'lucide-react';
import { UserSafe, MarketingCampaign } from '../types';
import { INITIAL_CLIENTS } from '../data/mockDatabase';

interface MarketingCampaignsTabProps {
  currentUser: UserSafe;
}

export const MarketingCampaignsTab: React.FC<MarketingCampaignsTabProps> = ({ currentUser }) => {
  const [campaignType, setCampaignType] = useState<'both' | 'sms' | 'email'>('both');
  const [targetAudience, setTargetAudience] = useState<'all' | 'low_credits' | 'inactive' | 'birthday_today'>('all');
  const [template, setTemplate] = useState<string>('promo_discount');
  const [customTitle, setCustomTitle] = useState<string>('PROMOÇÃO EXCLUSIVA: 30% DE BÓNUS EM CONSULTAS FISCAIS');
  const [customMessage, setCustomMessage] = useState<string>(
    'Olá {NOME}! A NANUCLOUD está a oferecer 30% extra de consultas fiscais na recarga do Plano Ouro ou Diamante. Renove hoje e mantenha a sua precificação 100% segura com as novas regras da AGT.'
  );
  const [sentSuccess, setSentSuccess] = useState<boolean>(false);
  const [campaignHistory, setCampaignHistory] = useState<MarketingCampaign[]>([
    {
      id: 'camp_001',
      title: 'Boas-Vindas e Atualização Pauta Aduaneira 2026',
      type: 'both',
      targetAudience: 'Todos os Clientes',
      message: 'Estimado cliente, informamos que a nova pauta aduaneira 2026 já se encontra ativa no nosso simulador de importação.',
      recipientCount: 4,
      status: 'sent',
      sentAt: '2026-08-15T14:30:00.000Z'
    }
  ]);

  const clients = INITIAL_CLIENTS;

  const handleApplyTemplate = (tplKey: string) => {
    setTemplate(tplKey);
    switch (tplKey) {
      case 'promo_discount':
        setCustomTitle('PROMOÇÃO EXCLUSIVA: 30% DE BÓNUS EM CONSULTAS FISCAIS');
        setCustomMessage(
          'Olá {NOME}! A NANUCLOUD preparou uma condição especial: recarregue o seu plano e receba 30% de bónus em consultas adicionais com suporte a lotes Excel e API.'
        );
        break;
      case 'low_credits_alert':
        setCustomTitle('ALERTA DE SALDO: AS SUAS CONSULTAS FISCAIS ESTÃO A TERMINAR');
        setCustomMessage(
          'Atenção {NOME}, restam poucas consultas no seu plano NANUCLOUD. Recarregue agora para não interromper os seus cálculos diários de faturamento e PVP.'
        );
        break;
      case 'fiscal_update_notice':
        setCustomTitle('COMUNICADO FISCAL URGENTE: ATUALIZAÇÃO AGT / CÓDIGO DO IVA');
        setCustomMessage(
          'Estimado {NOME}, foram publicadas novas diretrizes fiscais pela AGT. O seu simulador NANUCLOUD já foi atualizado automaticamente para cumprir a legislação.'
        );
        break;
      case 'birthday_holiday_greeting':
        setCustomTitle('PARABÉNS DA EQUIPA NANUCLOUD! 🎂');
        setCustomMessage(
          'Feliz Aniversário, {NOME}! Em comemoração a este dia especial, creditámos 100 consultas bónus na sua conta NANUCLOUD. Desejamos muito sucesso!'
        );
        break;
    }
  };

  const handleSendCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle || !customMessage) return;

    const newCamp: MarketingCampaign = {
      id: `camp_${Date.now()}`,
      title: customTitle,
      type: campaignType,
      targetAudience: targetAudience,
      message: customMessage,
      recipientCount: clients.length,
      status: 'sent',
      sentAt: new Date().toISOString()
    };

    setCampaignHistory([newCamp, ...campaignHistory]);
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-100 font-mono">MARKETING, SMS & DISPARO DE E-MAILS</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                Multicanal SMS + E-mail
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Envio automatizado de promoções de recarga, alertas de saldo, comunicados fiscais e felicitações
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Form + History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form de Disparo */}
        <div className="lg:col-span-2 bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" /> NOVA CAMPANHA DE COMUNICAÇÃO
          </h3>

          {/* Quick Templates */}
          <div>
            <label className="text-xs font-mono font-bold text-slate-300 block mb-2">MODELOS PRÉ-CONFIGURADOS:</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'promo_discount', label: 'Promoção de Recarga', icon: Sparkles },
                { id: 'low_credits_alert', label: 'Alerta Saldo Baixo', icon: AlertCircle },
                { id: 'fiscal_update_notice', label: 'Aviso Fiscal AGT', icon: FileText },
                { id: 'birthday_holiday_greeting', label: 'Felicitações / Aniversário', icon: Gift }
              ].map((tpl) => {
                const Icon = tpl.icon;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl.id)}
                    className={`p-2.5 rounded-xl border text-[11px] font-mono text-left transition-all flex flex-col gap-1 ${
                      template === tpl.id
                        ? 'bg-indigo-500/20 border-indigo-500 text-white font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-indigo-400" />
                    {tpl.label}
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSendCampaign} className="space-y-4 text-xs font-mono">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-300 block mb-1">CANAL DE DISPARO</label>
                <select
                  value={campaignType}
                  onChange={(e) => setCampaignType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="both">SMS + E-mail (Recomendado)</option>
                  <option value="sms">Apenas SMS Gateway</option>
                  <option value="email">Apenas E-mail Transacional</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">PÚBLICO-ALVO (DESTINATÁRIOS)</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">Todos os Clientes Ativos ({clients.length})</option>
                  <option value="low_credits">Clientes com Menos de 50 Consultas</option>
                  <option value="birthday_today">Aniversariantes de Hoje</option>
                  <option value="inactive">Clientes Inativos há mais de 15 dias</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">TÍTULO DO COMUNICADO / ASSUNTO</label>
              <input
                type="text"
                required
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">
                CONTEÚDO DA MENSAGEM (Use <code className="text-indigo-400">&#123;NOME&#125;</code> para personalizar)
              </label>
              <textarea
                rows={4}
                required
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            {sentSuccess && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" /> Campanha disparada com sucesso para todos os destinatários selecionados!
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-colors"
              >
                <Send className="w-4 h-4" /> Disparar Mensagem Agora
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: Histórico de Disparos */}
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" /> HISTÓRICO DE CAMPANHAS
          </h3>

          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {campaignHistory.map((c) => (
              <div key={c.id} className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-300 text-[11px] line-clamp-1">{c.title}</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold uppercase">
                    {c.status}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] line-clamp-2 leading-relaxed">{c.message}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                  <span>{c.recipientCount} Destinatários</span>
                  <span>{new Date(c.sentAt).toLocaleDateString('pt-PT')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
