import React, { useState, useEffect } from 'react';
import { FiscalProposal } from '../../types';
import { Bot, CheckCircle2, XCircle, AlertTriangle, Sparkles, BookOpen, Scale, ArrowRight } from 'lucide-react';

interface AdminFiscalAiTabProps {
  isSuperAdmin: boolean;
}

export const AdminFiscalAiTab: React.FC<AdminFiscalAiTabProps> = ({ isSuperAdmin }) => {
  const [proposals, setProposals] = useState<FiscalProposal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/fiscal-proposals');
      if (res.ok) {
        const data = await res.json();
        setProposals(data.proposals || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setIsProcessingId(id);
    setAlertMsg(null);
    try {
      const res = await fetch(`/api/admin/fiscal-proposals/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok) {
        setAlertMsg({ text: 'Proposta fiscal aprovada e aplicada aos motores de cálculo com sucesso!', type: 'success' });
        loadProposals();
      } else {
        setAlertMsg({ text: data.error || 'Erro ao aprovar proposta.', type: 'error' });
      }
    } catch (err) {
      setAlertMsg({ text: 'Erro ao comunicar com o servidor.', type: 'error' });
    } finally {
      setIsProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setIsProcessingId(id);
    setAlertMsg(null);
    try {
      const res = await fetch(`/api/admin/fiscal-proposals/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok) {
        setAlertMsg({ text: 'Proposta fiscal rejeitada e arquivada.', type: 'success' });
        loadProposals();
      } else {
        setAlertMsg({ text: data.error || 'Erro ao rejeitar proposta.', type: 'error' });
      }
    } catch (err) {
      setAlertMsg({ text: 'Erro ao comunicar com o servidor.', type: 'error' });
    } finally {
      setIsProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-5 md:p-6 shadow-sm">
        <div className="flex justify-between items-start border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Inteligência Artificial Fiscal & Atualizações Tributárias (AGT / OGE)</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-1">
              Monitorização contínua de diplomas legais, decretos do Diário da República de Angola e pautas aduaneiras.
              As propostas aprovadas atualizam imediatamente as taxas do simulador.
            </p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5" />
            <span>Fiscal Engine v2.4</span>
          </div>
        </div>

        {alertMsg && (
          <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
            alertMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}>
            {alertMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{alertMsg.text}</span>
          </div>
        )}
      </div>

      {/* Proposals List */}
      {loading ? (
        <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          A verificar diplomas legais e decretos fiscais com IA...
        </div>
      ) : proposals.length === 0 ? (
        <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          Nenhuma proposta fiscal pendente no momento. Todas as regras fiscais estão em conformidade com a AGT.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {proposals.map((item) => {
            const isPending = item.status === 'pending';
            const isApproved = item.status === 'approved';

            return (
              <div
                key={item.id}
                className={`bg-[#1E293B] border ${
                  isPending
                    ? 'border-amber-500/40 bg-gradient-to-r from-[#1E293B] to-[#1e233b]'
                    : isApproved
                    ? 'border-emerald-500/30'
                    : 'border-slate-800 opacity-60'
                } p-5 rounded-xl space-y-4`}
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                      {item.countryName} ({item.countryCode})
                    </span>
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                      {item.taxType}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Detetado em: {new Date(item.detectedAt).toLocaleDateString('pt-PT')}
                    </span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase self-start sm:self-auto ${
                    isApproved
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : isPending
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {isApproved ? 'Aprovado & Ativo' : isPending ? 'Requer Aprovação' : 'Rejeitado'}
                  </span>
                </div>

                {/* Values Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0F172A] p-3 rounded-lg border border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Taxa Anterior</span>
                    <span className="text-rose-400 font-bold text-sm">{item.currentValue}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-amber-400 hidden sm:inline" />
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Taxa Proposta (IA)</span>
                      <span className="text-emerald-400 font-bold text-sm">{item.proposedValue}%</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Diploma Legal</span>
                    <span className="text-slate-300 font-semibold text-[11px]">{item.sourceLaw}</span>
                  </div>
                </div>

                {/* Reason & Law Reference */}
                <p className="text-slate-300 text-xs font-sans leading-relaxed bg-slate-900/50 p-3 rounded-lg border border-slate-800/80">
                  <strong className="text-slate-100 block mb-1">Fundamentação Jurídica & Impacto Fiscal:</strong>
                  {item.reason}
                </p>

                {/* Action Buttons */}
                {isPending && isSuperAdmin && (
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleReject(item.id)}
                      disabled={isProcessingId === item.id}
                      className="px-4 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 transition font-bold disabled:opacity-50"
                    >
                      Rejeitar
                    </button>
                    <button
                      onClick={() => handleApprove(item.id)}
                      disabled={isProcessingId === item.id}
                      className="px-5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5 shadow disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Aprovar & Atualizar Simulador</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
