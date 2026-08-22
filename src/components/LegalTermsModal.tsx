import React from 'react';
import { ShieldCheck, Scale, FileText, AlertTriangle, CheckCircle, X, HelpCircle } from 'lucide-react';

interface LegalTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LegalTermsModal: React.FC<LegalTermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-mono">TERMOS DE USO & POLÍTICA DE REEMBOLSO</h2>
              <p className="text-xs text-slate-400">NANUCLOUD Tech Solutions — Transparência, Segurança e Isenção de Responsabilidade</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs leading-relaxed">
          
          {/* Important Notice */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex gap-3 text-amber-300">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <p className="font-bold text-amber-200 uppercase tracking-wider mb-1 font-mono">
                AVISO ESSENCIAL: NATUREZA DE SIMULADOR
              </p>
              <p className="text-slate-300">
                A plataforma NANUCLOUD é uma ferramenta tecnológica de simulação, modelagem comercial e suporte à tomada de decisão de precificação. A NANUCLOUD e os seus desenvolvedores não são agentes fiscais, autoridades governamentais nem substituem a consulta a Técnicos Oficiais de Contas (TOC), contabilistas certificados ou despachantes aduaneiros credenciados. Os resultados gerados dependem dos dados inseridos pelo próprio utilizador.
              </p>
            </div>
          </div>

          {/* Section 1: Termos de Uso */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2 font-mono uppercase tracking-wider">
              <FileText className="w-4 h-4" /> 1. Termos de Utilização do Serviço
            </h3>
            <ul className="space-y-2 text-slate-300 pl-4 list-disc marker:text-indigo-500">
              <li>
                <strong>Gratuituidade e Acesso:</strong> O acesso básico e simulações diárias são disponibilizados gratuitamente. O utilizador pode optar por subscrever planos de consultas adicionais ou módulos avançados conforme as suas necessidades operacionais.
              </li>
              <li>
                <strong>Responsabilidade pelas Credenciais:</strong> O utilizador é o único responsável pela guarda, sigilo e não partilha dos seus dados de acesso. A NANUCLOUD não se responsabiliza por acessos não autorizados decorrentes de negligência do utilizador. Em caso de extravio ou suspeita de comprometimento, a nossa equipa disponibiliza o reset imediato de senha.
              </li>
              <li>
                <strong>Disponibilidade e Escalabilidade:</strong> Empregamos mecanismos inteligentes de limitação de volume para evitar sobrecargas no servidor e garantir que a aplicação funcione de forma fluida em todas as plataformas (Web, Desktop e Mobile).
              </li>
            </ul>
          </div>

          {/* Section 2: Isenção de Responsabilidade */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2 font-mono uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> 2. Limitação de Responsabilidade
            </h3>
            <p className="text-slate-300">
              A NANUCLOUD empenha-se diariamente em manter as alíquotas fiscais e fórmulas matemáticas alinhadas com as fontes oficiais (AGT, AT, Receita Federal, DNRE, etc.). Contudo, alterações legislativas supervenientes, interpretações aduaneiras particulares ou taxas alfandegárias extraordinárias não geram qualquer tipo de responsabilidade civil, financeira ou fiscal para a NANUCLOUD.
            </p>
          </div>

          {/* Section 3: Política de Reembolso */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-indigo-300 flex items-center gap-2 font-mono uppercase tracking-wider">
              <CheckCircle className="w-4 h-4" /> 3. Política de Reembolso e Devoluções
            </h3>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-2 text-slate-300">
              <p>
                Como a plataforma disponibiliza testes e simulações gratuitas prévias antes de qualquer pagamento, as recargas de consultas e ativações de planos seguem critérios transparentes:
              </p>
              <ul className="space-y-1.5 pl-4 list-disc marker:text-emerald-500">
                <li>
                  <strong>Requisito de Provas Concretas:</strong> Pedidos de reembolso devem ser submetidos via Ticket de Suporte num prazo máximo de até 7 dias úteis após o pagamento, acompanhados de comprovativo de transação e evidência inequívoca de falha técnica insanável atribuível exclusivamente ao sistema.
                </li>
                <li>
                  <strong>Consultas Utilizadas:</strong> Planos ou pacotes onde as consultas já tenham sido consumidas pelo utilizador não são elegíveis a reembolso proporcional.
                </li>
                <li>
                  <strong>Resolução Amigável:</strong> A nossa equipa de apoio prioriza sempre a compensação imediata em créditos adicionais de consulta ou suporte prioritário personalizado para garantir a máxima satisfação de todos os clientes.
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end bg-slate-900/60">
          <button
            onClick={onClose}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-lg text-xs font-mono uppercase tracking-wider transition-colors"
          >
            Compreendi e Concordo
          </button>
        </div>

      </div>
    </div>
  );
};
