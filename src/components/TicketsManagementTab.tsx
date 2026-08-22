import React, { useState } from 'react';
import {
  LifeBuoy,
  MessageSquare,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Plus,
  Send,
  Search,
  Filter,
  History,
  X,
  UserCheck
} from 'lucide-react';
import { UserSafe, SupportTicket } from '../types';
import { INITIAL_TICKETS, INITIAL_CLIENTS } from '../data/mockDatabase';

interface TicketsManagementTabProps {
  currentUser: UserSafe;
}

export const TicketsManagementTab: React.FC<TicketsManagementTabProps> = ({ currentUser }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('nanucloud_tickets_db');
    return saved ? JSON.parse(saved) : INITIAL_TICKETS;
  });

  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [replyText, setReplyText] = useState<string>('');
  const [transferUserId, setTransferUserId] = useState<string>('');
  const [transferNotes, setTransferNotes] = useState<string>('');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);

  // Available staff members for ticket assignment
  const staffMembers = [
    { id: currentUser.id, name: `${currentUser.name} (Eu)` },
    { id: 'usr_admin_1', name: 'Super Administrador NANUCLOUD' },
    { id: 'usr_admin_2', name: 'Gestor Fiscal Carlos' },
    { id: 'usr_admin_3', name: 'Consultora Aduaneira Maria' },
    { id: 'usr_admin_4', name: 'Suporte Técnico Engenharia' }
  ];

  const handleSaveTickets = (updated: SupportTicket[]) => {
    setTickets(updated);
    localStorage.setItem('nanucloud_tickets_db', JSON.stringify(updated));
    if (selectedTicket) {
      const refreshed = updated.find((t) => t.id === selectedTicket.id);
      if (refreshed) setSelectedTicket(refreshed);
    }
  };

  const handleStatusChange = (ticketId: string, newStatus: SupportTicket['status']) => {
    const updated = tickets.map((t) => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          history: [
            ...t.history,
            {
              timestamp: new Date().toISOString(),
              action: `Estado alterado para ${newStatus.toUpperCase()}`,
              actorName: currentUser.name
            }
          ]
        };
      }
      return t;
    });
    handleSaveTickets(updated);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    const updated = tickets.map((t) => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: 'em_analise' as const,
          updatedAt: new Date().toISOString(),
          history: [
            ...t.history,
            {
              timestamp: new Date().toISOString(),
              action: 'Resposta Enviada pelo Operador',
              actorName: currentUser.name,
              notes: replyText.trim()
            }
          ]
        };
      }
      return t;
    });

    handleSaveTickets(updated);
    setReplyText('');
  };

  const handleTransferTicket = () => {
    if (!selectedTicket || !transferUserId) return;
    const targetStaff = staffMembers.find((s) => s.id === transferUserId);
    const targetName = targetStaff ? targetStaff.name : 'Outro Operador';

    const updated = tickets.map((t) => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          status: 'transferido' as const,
          assignedToUserId: transferUserId,
          assignedToUserName: targetName,
          updatedAt: new Date().toISOString(),
          history: [
            ...t.history,
            {
              timestamp: new Date().toISOString(),
              action: `Ticket Transferido para ${targetName}`,
              actorName: currentUser.name,
              notes: transferNotes || 'Transferência de atendimento'
            }
          ]
        };
      }
      return t;
    });

    handleSaveTickets(updated);
    setIsTransferModalOpen(false);
    setTransferNotes('');
  };

  const filteredTickets = tickets.filter((t) => {
    if (filterStatus === 'all') return true;
    return t.status === filterStatus;
  });

  const getStatusBadge = (status: SupportTicket['status']) => {
    switch (status) {
      case 'aberto':
        return <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold">Aberto</span>;
      case 'em_analise':
        return <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">Em Análise</span>;
      case 'aguardando_cliente':
        return <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px]">Aguardando Cliente</span>;
      case 'transferido':
        return <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold">Transferido</span>;
      case 'resolvido':
        return <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">Resolvido</span>;
      case 'fechado':
        return <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">Fechado</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-100 font-mono">CENTRAL DE TICKETS & ATENDIMENTO</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                {tickets.length} Chamados
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Gestão de chamados de suporte, transferências de filas entre operadores e histórico de auditoria
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 py-2 px-3 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Todos os Estados</option>
            <option value="aberto">Abertos</option>
            <option value="em_analise">Em Análise</option>
            <option value="transferido">Transferidos</option>
            <option value="resolvido">Resolvidos</option>
            <option value="fechado">Fechados</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Ticket List + Selected Ticket Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Tickets List */}
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-4 space-y-3 max-h-[700px] overflow-y-auto">
          <h3 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider px-2">
            FILA DE CHAMADOS ({filteredTickets.length})
          </h3>

          <div className="space-y-2">
            {filteredTickets.map((ticket) => {
              const isSelected = selectedTicket?.id === ticket.id;
              return (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs font-mono ${
                    isSelected
                      ? 'bg-indigo-500/20 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-bold text-indigo-300 text-[11px]">{ticket.ticketNumber}</span>
                    {getStatusBadge(ticket.status)}
                  </div>

                  <h4 className="font-bold text-slate-100 text-xs line-clamp-1 mb-1">{ticket.subject}</h4>
                  
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                    <span>{ticket.userName}</span>
                    <span>{new Date(ticket.createdAt).toLocaleDateString('pt-PT')}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Ticket Detail & Transfer Controls */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTicket ? (
            <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-6">
              
              {/* Ticket Top Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-indigo-400">{selectedTicket.ticketNumber}</span>
                    {getStatusBadge(selectedTicket.status)}
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {selectedTicket.department || 'Geral'}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-100 font-mono">{selectedTicket.subject}</h2>
                </div>

                {/* Transfer Button */}
                <button
                  onClick={() => setIsTransferModalOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 transition-colors self-start shadow-md"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" /> Transferir Ticket
                </button>
              </div>

              {/* Client Info Banner */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">CLIENTE:</span>
                  <span className="text-slate-200 font-bold">{selectedTicket.userName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">EMAIL / CONTACTO:</span>
                  <span className="text-slate-300">{selectedTicket.userEmail}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">ATRIBUÍDO A:</span>
                  <span className="text-purple-300 font-bold">{selectedTicket.assignedToUserName || 'Não atribuído'}</span>
                </div>
              </div>

              {/* Client Message */}
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                  DESCRIÇÃO DO CLIENTE:
                </span>
                <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 text-xs font-mono text-slate-200 leading-relaxed">
                  {selectedTicket.message}
                </div>
              </div>

              {/* Ticket History & Transfers Timeline */}
              <div className="space-y-3">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-2">
                  <History className="w-3.5 h-3.5 text-indigo-400" /> HISTÓRICO & AUDITORIA DE ATENDIMENTO
                </span>
                
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedTicket.history.map((h, idx) => (
                    <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-xs font-mono flex items-start justify-between gap-4">
                      <div>
                        <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                          {h.action}
                        </div>
                        {h.notes && <p className="text-slate-300 mt-1 text-[11px]">{h.notes}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 block">{h.actorName}</span>
                        <span className="text-[10px] text-slate-500 block">{new Date(h.timestamp).toLocaleTimeString('pt-PT')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Quick Actions & Reply Form */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400">MUDAR ESTADO:</span>
                  <button
                    onClick={() => handleStatusChange(selectedTicket.id, 'em_analise')}
                    className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-mono font-bold hover:bg-amber-500/30 transition-colors"
                  >
                    Em Análise
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedTicket.id, 'aguardando_cliente')}
                    className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-300 text-xs font-mono font-bold hover:bg-blue-500/30 transition-colors"
                  >
                    Aguardando Cliente
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedTicket.id, 'resolvido')}
                    className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold hover:bg-emerald-500/30 transition-colors"
                  >
                    Resolvido
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedTicket.id, 'fechado')}
                    className="px-3 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs font-mono hover:bg-slate-700 transition-colors"
                  >
                    Fechar Ticket
                  </button>
                </div>

                <form onSubmit={handleSendReply} className="space-y-2">
                  <textarea
                    rows={3}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Escreva uma resposta oficial ao cliente..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-mono font-bold py-2 px-5 rounded-xl text-xs flex items-center gap-2 transition-colors shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" /> Enviar Resposta
                    </button>
                  </div>
                </form>
              </div>

            </div>
          ) : (
            <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
              <MessageSquare className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-200 font-mono">NENHUM TICKET SELECIONADO</h3>
              <p className="text-xs">Selecione um chamado da fila à esquerda para visualizar e interagir.</p>
            </div>
          )}
        </div>

      </div>

      {/* Modal: Transferir Ticket */}
      {isTransferModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-slate-200">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-3">
                <ArrowRightLeft className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-slate-100 font-mono">TRANSFERIR ATENDIMENTO</h3>
              </div>
              <button onClick={() => setIsTransferModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-mono">
              <div>
                <label className="font-bold text-slate-300 block mb-1">TRANSFERIR PARA QUAL OPERADOR?</label>
                <select
                  value={transferUserId}
                  onChange={(e) => setTransferUserId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="">Selecione o operador ou departamento...</option>
                  {staffMembers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">MOTIVO / NOTAS DA TRANSFERÊNCIA</label>
                <textarea
                  rows={3}
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  placeholder="Ex: Encaminhado para análise aduaneira especializada..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleTransferTicket}
                  disabled={!transferUserId}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold"
                >
                  Confirmar Transferência
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
