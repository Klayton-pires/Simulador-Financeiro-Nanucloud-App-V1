import React from 'react';
import { ShieldCheck, Building2, ExternalLink, Sparkles, Award } from 'lucide-react';

export interface PartnerItem {
  id: string;
  name: string;
  category: string;
  badge: string;
  description: string;
  logoIcon: string;
  colorBg: string;
  colorBorder: string;
  colorText: string;
}

export const OFFICIAL_PARTNERS: PartnerItem[] = [
  {
    id: 'agt',
    name: 'AGT Angola',
    category: 'Administração Geral Tributária',
    badge: 'Conformidade Fiscal',
    description: 'Enquadramento tributário, pautas aduaneiras e códigos de IVA homologados.',
    logoIcon: '🇦🇴 AGT',
    colorBg: 'bg-emerald-500/10',
    colorBorder: 'border-emerald-500/30',
    colorText: 'text-emerald-300'
  },
  {
    id: 'emis',
    name: 'EMIS Multicaixa',
    category: 'Rede Interbancária Nacional',
    badge: 'Pagamentos Seguros',
    description: 'Liquidação imediata de recargas via Multicaixa GPO e Multicaixa Express.',
    logoIcon: '💳 EMIS',
    colorBg: 'bg-indigo-500/10',
    colorBorder: 'border-indigo-500/30',
    colorText: 'text-indigo-300'
  },
  {
    id: 'primavera',
    name: 'Primavera BSS',
    category: 'ERP Empresarial & POS',
    badge: 'Integração REST',
    description: 'Sincronização em tempo real de preços, custos e margens de venda.',
    logoIcon: '💼 PRIMAVERA',
    colorBg: 'bg-sky-500/10',
    colorBorder: 'border-sky-500/30',
    colorText: 'text-sky-300'
  },
  {
    id: 'sap',
    name: 'SAP Business',
    category: 'Software Corporativo',
    badge: 'Enterprise Connector',
    description: 'Compatibilidade com tabelas de artigos, inventários e regras fiscais.',
    logoIcon: '🌐 SAP',
    colorBg: 'bg-amber-500/10',
    colorBorder: 'border-amber-500/30',
    colorText: 'text-amber-300'
  },
  {
    id: 'phc',
    name: 'PHC Software',
    category: 'Gestão Comercial & Faturação',
    badge: 'Sync Automático',
    description: 'Exportação e importação contínua de preços de venda recomendados.',
    logoIcon: '⚡ PHC',
    colorBg: 'bg-purple-500/10',
    colorBorder: 'border-purple-500/30',
    colorText: 'text-purple-300'
  },
  {
    id: 'odoo',
    name: 'Odoo & Sage',
    category: 'Ecossistema Aberto de Gestão',
    badge: 'Multiplataforma',
    description: 'Módulos de contabilidade e cálculo de landed cost internacional.',
    logoIcon: '📊 ODOO',
    colorBg: 'bg-rose-500/10',
    colorBorder: 'border-rose-500/30',
    colorText: 'text-rose-300'
  }
];

interface PartnersShowcaseProps {
  compact?: boolean;
}

export const PartnersShowcase: React.FC<PartnersShowcaseProps> = ({ compact = false }) => {
  return (
    <div className="w-full my-6 bg-gradient-to-b from-slate-900/90 to-[#0F172A] border border-slate-800/90 rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs md:text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
              <span>PARCEIROS INSTITUCIONAIS & INTEGRAÇÕES TECNOLÓGICAS</span>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded font-mono">
                Homologado
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Conexões nativas e alinhamento com os principais sistemas de faturação, bancos e entidades fiscais.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Segurança Bancária & Conformidade</span>
        </div>
      </div>

      {/* Grid of Partners */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {OFFICIAL_PARTNERS.map((p) => (
          <div
            key={p.id}
            className={`p-3.5 rounded-xl border ${p.colorBorder} ${p.colorBg} hover:scale-[1.02] transition-transform duration-200 flex flex-col justify-between group shadow-sm`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-black text-xs text-slate-100 tracking-wider">
                  {p.logoIcon}
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-900/60 text-slate-400 border border-slate-800">
                  {p.badge}
                </span>
              </div>
              <h4 className="font-bold text-xs text-slate-200 font-mono line-clamp-1">{p.name}</h4>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5 line-clamp-2 leading-tight">
                {p.description}
              </p>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[9px] font-mono text-slate-500">
              <span>{p.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
