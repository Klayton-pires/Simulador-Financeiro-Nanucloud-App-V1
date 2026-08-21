import React, { useState, useEffect } from 'react';
import { Plan, UserSafe, BankAccount } from '../types';
import { Gem, Check, Sparkles, X, CreditCard, Send, ShieldCheck, ArrowRight, Clock, HelpCircle, PhoneCall, Copy, Building, MessageSquare, AlertCircle, Smartphone, Hash } from 'lucide-react';
import { NanuCloudLogo } from './NanuCloudLogo';

interface PlansModalProps {
  user: UserSafe | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
  onPurchaseSuccess: () => void;
  onOpenSupportChat?: () => void;
}

export const PlansModal: React.FC<PlansModalProps> = ({
  user,
  isOpen,
  onClose,
  onOpenAuth,
  onPurchaseSuccess,
  onOpenSupportChat
}) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [unitQueryPriceKz, setUnitQueryPriceKz] = useState<number>(50);
  const [minCustomPriceKz, setMinCustomPriceKz] = useState<number>(500);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [bankInfo, setBankInfo] = useState<any>(null);

  // Custom Plan input
  const [customAmountKz, setCustomAmountKz] = useState<number>(2000);

  // Checkout Step State
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<Plan | null>(null);
  const [isCustomCheckout, setIsCustomCheckout] = useState<boolean>(false);
  const [paymentTab, setPaymentTab] = useState<'bank_transfer' | 'express_ref' | 'express_mobile'>('bank_transfer');
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [expressMobileNumber, setExpressMobileNumber] = useState<string>('');
  const [proofNotes, setProofNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedIban, setCopiedIban] = useState<string | null>(null);
  const [authPromptOpen, setAuthPromptOpen] = useState<boolean>(false);
  const [pendingSelectedPlan, setPendingSelectedPlan] = useState<Plan | null>(null);
  const [pendingIsCustom, setPendingIsCustom] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  useEffect(() => {
    // If user was prompted to login and has now logged in, resume checkout!
    if (user && authPromptOpen) {
      setAuthPromptOpen(false);
      if (pendingIsCustom) {
        setIsCustomCheckout(true);
        setSelectedPlanForCheckout(null);
      } else if (pendingSelectedPlan) {
        setSelectedPlanForCheckout(pendingSelectedPlan);
        setIsCustomCheckout(false);
      }
    }
  }, [user, authPromptOpen, pendingSelectedPlan, pendingIsCustom]);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/plans');
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans || []);
        setUnitQueryPriceKz(data.unitQueryPriceKz || 50);
        setMinCustomPriceKz(data.minCustomPlanPriceKz || 500);
        setBankAccounts(data.bankAccounts || []);
        setBankInfo(data.bankInfo);
        if (data.bankAccounts && data.bankAccounts.length > 0) {
          setSelectedBankId(data.bankAccounts[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
  };

  if (!isOpen) return null;

  const calculatedCustomQueries = Math.floor(customAmountKz / unitQueryPriceKz);

  const handleSelectPlan = (plan: Plan) => {
    if (!user) {
      setPendingSelectedPlan(plan);
      setPendingIsCustom(false);
      setAuthPromptOpen(true);
      return;
    }
    setSelectedPlanForCheckout(plan);
    setIsCustomCheckout(false);
    setErrorMsg(null);
    setOrderSuccess(false);
  };

  const handleSelectCustomPlan = () => {
    if (!user) {
      setPendingSelectedPlan(null);
      setPendingIsCustom(true);
      setAuthPromptOpen(true);
      return;
    }
    setSelectedPlanForCheckout(null);
    setIsCustomCheckout(true);
    setErrorMsg(null);
    setOrderSuccess(false);
  };

  const copyToClipboard = (text: string, ibanId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIban(ibanId);
    setTimeout(() => setCopiedIban(null), 2500);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (paymentTab === 'bank_transfer' && !paymentReference.trim()) {
      setErrorMsg('Por favor, informe a referência do comprovativo ou o número de talão bancário.');
      return;
    }

    if (paymentTab === 'express_mobile' && !expressMobileNumber.trim()) {
      setErrorMsg('Por favor, introduza o número de telemóvel associado ao Multicaixa Express.');
      return;
    }

    setIsSubmitting(true);

    try {
      const planId = isCustomCheckout ? 'plan_custom' : selectedPlanForCheckout?.id;
      const amount = isCustomCheckout ? customAmountKz : selectedPlanForCheckout?.priceKz;
      
      const reference = paymentTab === 'bank_transfer' 
        ? paymentReference.trim()
        : (paymentTab === 'express_ref' ? `MCX-REF-${Math.floor(100000000 + Math.random() * 900000000)}` : `MCX-TEL-${expressMobileNumber.trim()}`);

      const notes = paymentTab === 'bank_transfer'
        ? `[Transferência Bancária - Banco ID: ${selectedBankId}] ${proofNotes}`
        : (paymentTab === 'express_ref' ? `[Referência Multicaixa Express - Aguarda EMIS] ${proofNotes}` : `[Compra Direta Express - Nº ${expressMobileNumber}] ${proofNotes}`);

      const res = await fetch('/api/plans/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          customAmountKz: isCustomCheckout ? customAmountKz : undefined,
          paymentMethod: paymentTab,
          paymentReference: reference,
          notes
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Erro ao processar pedido.');
      } else {
        setOrderSuccess(true);
        onPurchaseSuccess();
      }
    } catch (err) {
      setErrorMsg('Erro de comunicação com o servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkoutAmount = isCustomCheckout ? customAmountKz : (selectedPlanForCheckout?.priceKz || 0);
  const checkoutPlanName = isCustomCheckout ? `Plano Personalizado (${customAmountKz.toLocaleString('pt-PT')} Kz)` : (selectedPlanForCheckout?.name || '');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-[#1E293B] border border-slate-800 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal: Login / Register Required Prompt */}
        {authPromptOpen && !user && (
          <div className="fixed inset-0 z-60 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#1E293B] border border-indigo-500/40 rounded-xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-100 font-mono uppercase tracking-tight">
                Inicie Sessão ou Crie a sua Conta
              </h3>
              <p className="text-xs text-slate-300 font-mono leading-relaxed">
                Para aderir a um plano e receber as suas pesquisas, por favor inicie sessão ou registe a sua conta. Após o registo ou login, será imediatamente encaminhado para as opções de pagamento!
              </p>
              <div className="pt-2 flex flex-col gap-2 font-mono text-xs">
                <button
                  onClick={() => {
                    onOpenAuth();
                  }}
                  className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg transition uppercase tracking-tight cursor-pointer shadow"
                >
                  Entrar ou Registar Agora
                </button>
                <button
                  onClick={() => setAuthPromptOpen(false)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                >
                  Voltar aos Planos
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Plans Showcase */}
        {!selectedPlanForCheckout && !isCustomCheckout && (
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto">
              <div className="flex justify-center mb-3">
                <NanuCloudLogo className="h-10" isDarkTheme={true} />
              </div>
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-mono font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>3 Consultas Grátis Iniciais • Recarga a 50 Kz por pesquisa</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-100 font-mono uppercase tracking-tight">
                Planos & Recargas de Consultas
              </h2>
              <p className="text-xs text-slate-400 mt-1.5 font-mono">
                Desbloqueie simulações adicionais, cálculo aduaneiro de importação e processamento em lote Excel.
              </p>
            </div>

            {/* Standard 5 Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {plans
                .filter((p) => !p.isCustom)
                .map((plan) => (
                  <div
                    key={plan.id}
                    className={`bg-[#0F172A] border rounded-xl p-4 flex flex-col justify-between transition-all shadow-sm ${
                      plan.badge === 'Mais Recomendado'
                        ? 'border-indigo-500 ring-1 ring-indigo-500/50'
                        : 'border-slate-800'
                    }`}
                  >
                    <div>
                      {plan.badge && (
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded w-fit mb-2.5 block">
                          {plan.badge}
                        </span>
                      )}

                      <h3 className="font-bold text-sm text-slate-100 font-mono">{plan.name}</h3>

                      <div className="my-2.5">
                        <span className="text-xl font-bold text-slate-100 font-mono">
                          {plan.priceKz.toLocaleString('pt-PT')}
                        </span>
                        <span className="text-xs text-slate-400 font-bold ml-1 font-mono">Kz</span>
                      </div>

                      <div className="bg-[#1E293B] p-2 rounded-lg border border-slate-800 mb-3 text-xs font-mono font-semibold text-amber-300 flex items-center justify-between">
                        <span>{plan.queriesCount} Pesquisas</span>
                        <span className="text-[10px] text-slate-400">({plan.validityDays}d)</span>
                      </div>

                      <ul className="space-y-1.5 text-[11px] text-slate-300 mb-5 font-mono">
                        {plan.features.map((feat, fidx) => (
                          <li key={fidx} className="flex items-start gap-1.5 leading-tight">
                            <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-mono font-bold uppercase tracking-tight transition shadow-sm cursor-pointer ${
                        plan.badge === 'Mais Recomendado'
                          ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
                      }`}
                    >
                      Aderir ao Plano
                    </button>
                  </div>
                ))}
            </div>

            {/* Custom Plan Box */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 md:p-6 shadow-sm">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-tight">
                    Plano Personalizado Sob Medida
                  </span>
                  <h3 className="text-base md:text-lg font-bold text-slate-100 font-mono uppercase tracking-tight">
                    Escolha o valor que deseja recarregar
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xl font-mono">
                    Cada pesquisa custa apenas <strong className="text-slate-200">{unitQueryPriceKz} Kz</strong> (mínimo de {minCustomPriceKz.toLocaleString('pt-PT')} Kz). Desbloqueia automaticamente todos os módulos de importação e Excel.
                  </p>
                </div>

                <div className="bg-[#1E293B] border border-slate-800 p-4 rounded-xl w-full md:w-80 space-y-3 font-mono text-xs">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 flex justify-between">
                      <span>Valor em Kwanzas:</span>
                      <strong className="text-indigo-400">{customAmountKz.toLocaleString('pt-PT')} Kz</strong>
                    </label>
                    <input
                      type="range"
                      min={minCustomPriceKz}
                      max="100000"
                      step="500"
                      value={customAmountKz}
                      onChange={(e) => setCustomAmountKz(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between bg-[#0F172A] p-2 rounded-lg text-xs border border-slate-800">
                    <span className="text-slate-400">Total de Consultas:</span>
                    <strong className="text-amber-400 font-bold text-sm">
                      {calculatedCustomQueries} pesquisas
                    </strong>
                  </div>

                  <button
                    onClick={handleSelectCustomPlan}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold py-2 px-3 rounded-lg text-xs uppercase tracking-tight transition shadow-sm cursor-pointer"
                  >
                    Recarregar {customAmountKz.toLocaleString('pt-PT')} Kz
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Payment Options & Proof Submission */}
        {(selectedPlanForCheckout || isCustomCheckout) && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedPlanForCheckout(null);
                  setIsCustomCheckout(false);
                }}
                className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                ← Voltar aos planos
              </button>

              {onOpenSupportChat && (
                <button
                  type="button"
                  onClick={onOpenSupportChat}
                  className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Dúvidas? Fale com o Suporte</span>
                </button>
              )}
            </div>

            {orderSuccess ? (
              <div className="text-center py-10 space-y-4 font-mono">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-100 uppercase tracking-tight">
                  Pedido Registado com Sucesso!
                </h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  A nossa equipa de administração irá verificar o pagamento e creditar as suas consultas de imediato. Acompanhe o estado das transações no seu perfil.
                </p>
                <button
                  onClick={onClose}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-mono font-bold py-2 px-5 rounded-lg text-xs uppercase tracking-tight transition cursor-pointer shadow"
                >
                  Concluir & Voltar ao Simulador
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Summary Header */}
                <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Plano Selecionado:</span>
                    <h3 className="text-sm md:text-base font-bold text-slate-100">{checkoutPlanName}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Total a Pagar:</span>
                    <span className="text-lg md:text-xl font-bold text-emerald-400">
                      {checkoutAmount.toLocaleString('pt-PT')} Kz
                    </span>
                  </div>
                </div>

                {/* Payment Method Selector Tabs */}
                <div>
                  <label className="text-xs font-mono font-bold text-slate-300 block mb-2">
                    Selecione o Método de Pagamento:
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => setPaymentTab('bank_transfer')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-3 transition cursor-pointer ${
                        paymentTab === 'bank_transfer'
                          ? 'bg-indigo-500/15 border-indigo-500 text-white'
                          : 'bg-[#0F172A] border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Building className="w-5 h-5 text-indigo-400 shrink-0" />
                      <div>
                        <div className="font-bold">Transferência Bancária</div>
                        <div className="text-[10px] text-slate-400">Lista oficial de IBANs</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentTab('express_ref')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-3 transition cursor-pointer relative ${
                        paymentTab === 'express_ref'
                          ? 'bg-indigo-500/15 border-indigo-500 text-white'
                          : 'bg-[#0F172A] border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Hash className="w-5 h-5 text-amber-400 shrink-0" />
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <span>Referência Express</span>
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded">Brevemente</span>
                        </div>
                        <div className="text-[10px] text-slate-400">Pagamento por Referência EMIS</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentTab('express_mobile')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-3 transition cursor-pointer relative ${
                        paymentTab === 'express_mobile'
                          ? 'bg-indigo-500/15 border-indigo-500 text-white'
                          : 'bg-[#0F172A] border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Smartphone className="w-5 h-5 text-sky-400 shrink-0" />
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <span>Compra Direta Express</span>
                          <span className="text-[9px] bg-sky-500/20 text-sky-300 px-1.5 py-0.2 rounded">Brevemente</span>
                        </div>
                        <div className="text-[10px] text-slate-400">Débito direto via telemóvel</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* TAB 1: TRANSFERÊNCIA BANCÁRIA (IBANS) */}
                {paymentTab === 'bank_transfer' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Lista de IBANs */}
                    <div className="space-y-3 font-mono">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-200 uppercase tracking-tight flex items-center gap-1.5">
                          <Building className="w-4 h-4 text-indigo-400" />
                          <span>Contas Bancárias Oficiais NANUCLOUD:</span>
                        </h4>
                        <span className="text-[10px] text-slate-400">({bankAccounts.length} Bancos disponíveis)</span>
                      </div>

                      <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                        {bankAccounts.map((acc) => (
                          <div
                            key={acc.id}
                            onClick={() => setSelectedBankId(acc.id)}
                            className={`p-3 rounded-xl border transition cursor-pointer ${
                              selectedBankId === acc.id
                                ? 'bg-indigo-500/10 border-indigo-500 ring-1 ring-indigo-500/30'
                                : 'bg-[#0F172A] border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-xs text-slate-100">{acc.bankName}</span>
                              <span className="text-[10px] text-emerald-400 font-bold">{acc.currency}</span>
                            </div>
                            <div className="bg-[#1E293B] p-2 rounded border border-slate-800 flex items-center justify-between text-xs text-indigo-300">
                              <span className="font-mono select-all text-[11px] font-semibold">{acc.iban}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(acc.iban, acc.id);
                                }}
                                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700 transition"
                                title="Copiar IBAN"
                              >
                                {copiedIban === acc.id ? (
                                  <span className="text-[10px] text-emerald-400 font-bold">Copiado!</span>
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                              <span>Titular: <strong className="text-slate-300">{acc.holder}</strong></span>
                              {acc.swift && <span>SWIFT: {acc.swift}</span>}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-mono flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>
                          <strong>Nota Importante:</strong> A validação e crédito de consultas via transferência bancária é efetuada após confirmação e conferência do comprovativo pela administração.
                        </span>
                      </div>
                    </div>

                    {/* Submissão do Comprovativo */}
                    <div className="space-y-3 font-mono text-xs">
                      <h4 className="font-bold text-slate-200 uppercase tracking-tight flex items-center gap-1.5">
                        <Send className="w-4 h-4 text-emerald-400" />
                        <span>Submeter Comprovativo / N.º de Talão</span>
                      </h4>

                      {errorMsg && (
                        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                          {errorMsg}
                        </div>
                      )}

                      <form onSubmit={handleSubmitOrder} className="space-y-3">
                        <div>
                          <label className="text-slate-400 font-bold block mb-1">
                            N.º de Referência do Talão / ID da Transação *:
                          </label>
                          <input
                            type="text"
                            required
                            value={paymentReference}
                            onChange={(e) => setPaymentReference(e.target.value)}
                            placeholder="Ex: 0048192 / TALÃO BAI-928"
                            className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="text-slate-400 font-bold block mb-1">
                            Observações / Titular da Conta de Origem (Opcional):
                          </label>
                          <textarea
                            value={proofNotes}
                            onChange={(e) => setProofNotes(e.target.value)}
                            rows={3}
                            placeholder="Ex: Transferido a partir da conta de Joaquim Silva no Banco BFA..."
                            className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500 font-sans"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-tight flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                          <span>{isSubmitting ? 'A submeter...' : 'Confirmar & Submeter Comprovativo'}</span>
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* TAB 2: PAGAMENTO POR REFERÊNCIA MULTICAIXA EXPRESS (EMIS) */}
                {paymentTab === 'express_ref' && (
                  <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 font-mono space-y-4">
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
                      <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                      <div>
                        <strong>Serviço em fase de ativação junto da EMIS (Brevemente Disponível):</strong>
                        <p className="mt-0.5 text-[11px] text-slate-300">
                          A NANUCLOUD já deixou toda a arquitetura de pagamentos por referência pronta. Pode gerar uma referência demonstrativa ou optar por Transferência Bancária imediata.
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-4 max-w-md mx-auto space-y-3 text-xs">
                      <div className="text-center pb-2 border-b border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Referência Multicaixa</span>
                        <div className="text-lg font-bold text-slate-100 mt-1">EMIS / PAGAMENTOS EXPRESS</div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between py-1 border-b border-slate-800/60">
                          <span className="text-slate-400">Entidade:</span>
                          <span className="font-bold text-slate-100">00142 (NANUCLOUD)</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800/60">
                          <span className="text-slate-400">Referência:</span>
                          <span className="font-bold text-indigo-400 text-sm tracking-wider">944 935 617</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">Montante:</span>
                          <span className="font-bold text-emerald-400 text-sm">{checkoutAmount.toLocaleString('pt-PT')} Kz</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleSubmitOrder}
                        disabled={isSubmitting}
                        className="w-full mt-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-tight flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Simular Pagamento por Referência</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 3: COMPRA DIRETA VIA MULTICAIXA EXPRESS (TELEFONE) */}
                {paymentTab === 'express_mobile' && (
                  <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-5 font-mono space-y-4">
                    <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs flex items-start gap-2">
                      <Clock className="w-4 h-4 shrink-0 mt-0.5 text-sky-400" />
                      <div>
                        <strong>Compra Direta via Telemóvel Multicaixa Express (Brevemente Disponível):</strong>
                        <p className="mt-0.5 text-[11px] text-slate-300">
                          Receberá uma notificação instantânea no aplicativo Multicaixa Express no seu telemóvel para autorizar com o seu PIN.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmitOrder} className="bg-[#1E293B] border border-slate-800 rounded-xl p-4 max-w-md mx-auto space-y-3 text-xs">
                      <div>
                        <label className="text-slate-400 font-bold block mb-1">
                          Número de Telemóvel Multicaixa Express:
                        </label>
                        <div className="relative">
                          <Smartphone className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                          <input
                            type="tel"
                            required
                            value={expressMobileNumber}
                            onChange={(e) => setExpressMobileNumber(e.target.value)}
                            placeholder="944 935 617"
                            className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 rounded-lg pl-9 pr-3 py-2 text-xs outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="p-2.5 rounded bg-[#0F172A] border border-slate-800 text-slate-400 text-[11px]">
                        Valor a debitar: <strong className="text-emerald-400">{checkoutAmount.toLocaleString('pt-PT')} Kz</strong>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 px-4 rounded-lg text-xs uppercase tracking-tight flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>Enviar Pedido de Pagamento ao Express</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

