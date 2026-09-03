import React, { useState, useRef } from 'react';
import { Transaction } from '../types';
import {
  X,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  Download,
  ExternalLink,
  Trash2,
  Clock,
  ShieldCheck
} from 'lucide-react';

interface ProofAttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  mode?: 'upload' | 'view';
  onSuccess?: (updatedTx: Transaction) => void;
  isAdmin?: boolean;
  onApprove?: (txId: string, notes?: string) => Promise<void>;
  onReject?: (txId: string, notes?: string) => Promise<void>;
}

export const ProofAttachmentModal: React.FC<ProofAttachmentModalProps> = ({
  isOpen,
  onClose,
  transaction,
  mode = 'upload',
  onSuccess,
  isAdmin = false,
  onApprove,
  onReject
}) => {
  const [currentMode, setCurrentMode] = useState<'upload' | 'view'>(mode);
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: number;
    type: string;
    dataUrl: string;
  } | null>(null);
  const [paymentReference, setPaymentReference] = useState<string>(transaction?.paymentReference || '');
  const [notes, setNotes] = useState<string>(transaction?.notes || '');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync when transaction changes
  React.useEffect(() => {
    if (transaction) {
      setPaymentReference(transaction.paymentReference || '');
      setNotes(transaction.notes || '');
      if (mode === 'view' || (transaction.paymentProofUrl && mode !== 'upload')) {
        setCurrentMode('view');
      } else {
        setCurrentMode('upload');
      }
      setSelectedFile(null);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [transaction, mode]);

  if (!isOpen || !transaction) return null;

  const handleProcessFile = (file: File) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    // Max 15MB
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('O ficheiro é demasiado grande. O limite máximo permitido é de 15 MB.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];
    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(file.name);

    if (!isPdf && !isImage && !validTypes.includes(file.type)) {
      setErrorMsg('Formato inválido. Por favor anexe um ficheiro PDF ou imagem (PNG, JPG, JPEG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setSelectedFile({
        name: file.name,
        size: file.size,
        type: file.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
        dataUrl
      });
    };
    reader.onerror = () => {
      setErrorMsg('Não foi possível ler o ficheiro selecionado. Tente novamente.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedFile && !transaction.paymentProofUrl && !paymentReference.trim()) {
      setErrorMsg('Por favor adicione o anexo do comprovativo ou preencha a referência da operação.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('nanucloud_token');
      const res = await fetch('/api/plans/upload-proof', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          transactionId: transaction.id,
          paymentProofUrl: selectedFile?.dataUrl || transaction.paymentProofUrl,
          paymentProofName: selectedFile?.name || transaction.paymentProofName,
          paymentProofSize: selectedFile?.size || transaction.paymentProofSize,
          paymentReference: paymentReference.trim(),
          notes: notes.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Erro ao submeter comprovativo.');
      } else {
        setSuccessMsg('Comprovativo submetido com sucesso! A administração foi notificada para conferência.');
        if (onSuccess && data.transaction) {
          onSuccess(data.transaction);
        }
        setTimeout(() => {
          onClose();
        }, 1800);
      }
    } catch (err) {
      setErrorMsg('Erro de comunicação com o servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/D';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const isCurrentFilePdf = (url?: string, name?: string) => {
    if (!url && !name) return false;
    return (
      url?.startsWith('data:application/pdf') ||
      url?.toLowerCase().endsWith('.pdf') ||
      name?.toLowerCase().endsWith('.pdf')
    );
  };

  const activeProofUrl = selectedFile?.dataUrl || transaction.paymentProofUrl;
  const activeProofName = selectedFile?.name || transaction.paymentProofName || 'Comprovativo_Transacao';
  const isPdf = isCurrentFilePdf(activeProofUrl, activeProofName);

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden font-mono relative">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Paperclip className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-tight">
                {currentMode === 'view' ? 'Visualizar Comprovativo' : 'Submeter Comprovativo de Pagamento'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Transação: <span className="text-indigo-400 font-bold">{transaction.id}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transaction Summary Card */}
        <div className="p-4 bg-slate-900/40 border-b border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3">
          {isAdmin && (
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Cliente Solicitante:</span>
              <span className="font-bold text-indigo-300">
                {transaction.userName || 'Utilizador'}
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">{transaction.userEmail}</span>
            </div>
          )}
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Plano / Montante:</span>
            <span className="font-bold text-slate-200">
              {transaction.planName} — <strong className="text-emerald-400">{transaction.amountKz.toLocaleString('pt-PT')} Kz</strong>
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Créditos a Atribuir:</span>
            <span className="text-amber-400 font-bold font-mono">+{transaction.queriesGranted} pesquisas</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Método:</span>
            <span className="text-slate-300 font-semibold">{transaction.paymentMethod}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Estado:</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded inline-flex items-center gap-1 ${
                transaction.status === 'approved'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : transaction.status === 'pending'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}
            >
              {transaction.status === 'approved' && <ShieldCheck className="w-3 h-3" />}
              {transaction.status === 'pending' && <Clock className="w-3 h-3" />}
              {transaction.status === 'approved' ? 'Aprovado' : transaction.status === 'pending' ? 'Pendente' : 'Rejeitado'}
            </span>
          </div>
        </div>

        {/* Mode switcher tabs if proof already exists */}
        {transaction.paymentProofUrl && (
          <div className="flex border-b border-slate-800 bg-slate-900/20 text-xs">
            <button
              type="button"
              onClick={() => setCurrentMode('view')}
              className={`flex-1 py-2.5 px-4 font-bold border-b-2 transition cursor-pointer flex items-center justify-center gap-1.5 ${
                currentMode === 'view'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Ver Comprovativo Atual</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentMode('upload')}
              className={`flex-1 py-2.5 px-4 font-bold border-b-2 transition cursor-pointer flex items-center justify-center gap-1.5 ${
                currentMode === 'upload'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Anexar Novo Ficheiro</span>
            </button>
          </div>
        )}

        {/* Messages */}
        {errorMsg && (
          <div className="m-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="m-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* VIEW MODE */}
        {currentMode === 'view' && (
          <div className="p-5 space-y-4 text-xs">
            <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  {isPdf ? (
                    <FileText className="w-5 h-5 text-rose-400 shrink-0" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                  <div>
                    <div className="font-bold text-slate-200 truncate max-w-xs">{activeProofName}</div>
                    <div className="text-[10px] text-slate-400">
                      Tamanho: {formatFileSize(transaction.paymentProofSize)}
                    </div>
                  </div>
                </div>
                {activeProofUrl && (
                  <a
                    href={activeProofUrl}
                    download={activeProofName}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition flex items-center gap-1 text-[11px]"
                    title="Descarregar / Abrir noutra janela"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descarregar</span>
                  </a>
                )}
              </div>

              {/* Preview Canvas */}
              {activeProofUrl ? (
                <div className="max-h-72 overflow-y-auto rounded-lg bg-slate-950 p-2 flex items-center justify-center border border-slate-800/80">
                  {isPdf ? (
                    <div className="py-8 text-center space-y-3">
                      <FileText className="w-12 h-12 text-rose-400 mx-auto" />
                      <p className="text-slate-300 text-xs">Documento de Comprovativo Bancário (PDF)</p>
                      <a
                        href={activeProofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Abrir Documento PDF</span>
                      </a>
                    </div>
                  ) : (
                    <img
                      src={activeProofUrl}
                      alt="Comprovativo"
                      className="max-h-64 object-contain rounded shadow"
                    />
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500">Nenhum anexo disponível para esta transação.</div>
              )}

              {transaction.paymentReference && (
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-400 uppercase block">Ref. Informada:</span>
                  <span className="text-indigo-400 font-bold">{transaction.paymentReference}</span>
                </div>
              )}

              {transaction.notes && (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Notas da Operação:</span>
                  <span className="text-slate-300 font-sans text-[11px] block">{transaction.notes}</span>
                </div>
              )}
            </div>

            {isAdmin && transaction.status === 'pending' && (
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-emerald-300 text-xs">Área Financeira: Validação e Ativação do Plano</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Após verificar o comprovativo, confirme a ativação. Serão creditadas automaticamente <strong>+{transaction.queriesGranted} pesquisas</strong> na conta de <strong>{transaction.userName || transaction.userEmail}</strong>.
                </p>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                    Notas de Validação Financeira (Ex: "Confirmado no extrato BFA em 02/09/2026"):
                  </label>
                  <input
                    type="text"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Ex: Verificado no extrato bancário BFA"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isValidating}
                    onClick={async () => {
                      if (!onApprove) return;
                      setIsValidating(true);
                      try {
                        await onApprove(transaction.id, adminNotes);
                        onClose();
                      } finally {
                        setIsValidating(false);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow disabled:opacity-50 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isValidating ? 'A processar...' : `Aprovar & Ativar Plano (+${transaction.queriesGranted} pesquisas)`}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isValidating}
                    onClick={async () => {
                      if (!onReject) return;
                      setIsValidating(true);
                      try {
                        await onReject(transaction.id, adminNotes);
                        onClose();
                      } finally {
                        setIsValidating(false);
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Rejeitar Pagamento</span>
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCurrentMode('upload')}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow transition"
              >
                {isAdmin ? 'Substituir / Anexar Comprovativo' : 'Substituir / Reenviar Comprovativo'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer transition"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* UPLOAD MODE */}
        {currentMode === 'upload' && (
          <form onSubmit={handleSubmitProof} className="p-5 space-y-4 text-xs">
            {/* Dropzone */}
            <div>
              <label className="text-slate-300 font-bold block mb-1">
                Ficheiro do Comprovativo (PDF, PNG, JPG, WEBP) *:
              </label>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center transition cursor-pointer ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : selectedFile
                    ? 'border-emerald-500/60 bg-emerald-950/20'
                    : 'border-slate-700 hover:border-indigo-500 bg-slate-900/50 hover:bg-slate-900'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleProcessFile(e.target.files[0]);
                    }
                  }}
                  accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="flex items-center justify-between text-left gap-3">
                    <div className="flex items-center gap-3">
                      {selectedFile.type === 'application/pdf' ? (
                        <FileText className="w-8 h-8 text-rose-400 shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shrink-0 flex items-center justify-center">
                          <img
                            src={selectedFile.dataUrl}
                            alt="Pré-visualização"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <div className="font-bold text-slate-100 text-xs truncate max-w-xs">
                          {selectedFile.name}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-mono">
                          {formatFileSize(selectedFile.size)} • Pronto para submissão
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                      title="Remover anexo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-200">
                        Clique para escolher o ficheiro
                      </span>{' '}
                      <span className="text-slate-400">ou arraste para esta área</span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Suporta foto do talão bancário ou ficheiro PDF (máx. 15 MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">
                N.º de Referência / Talão / ID Bancário (Opcional se anexado):
              </label>
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Ex: 0048192 / TALÃO BAI-928"
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">
                Observações / Titular da Conta de Envio:
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Ex: Transferido via Multicaixa Express pelo titular Manuel Costa..."
                className="w-full bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-2 px-5 rounded-xl text-xs uppercase tracking-tight flex items-center gap-1.5 transition cursor-pointer shadow"
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'A Enviar...' : 'Submeter Comprovativo com Anexo'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
