import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  Trash2,
  Save,
  Check,
  Video,
  Image as ImageIcon,
  FileText,
  AlertTriangle,
  Eye,
  EyeOff,
  ExternalLink,
  Sparkles,
  Info,
  Radio
} from 'lucide-react';
import { MarketingNotification } from '../../types';

export const INITIAL_MARKETING_NOTIFICATIONS: MarketingNotification[] = [
  {
    id: 'mkt_01',
    type: 'text',
    title: 'Novo Módulo de Intermediários & Comissões',
    message: 'Simule comissões brutas e retenções fiscais por lei para negócios e prestadores de serviços de forma automatizada.',
    badge: 'Novidade',
    category: 'comunicacao',
    recommendedDimensions: 'Formato de Texto Rico (Máx 250 caracteres)',
    targetAudience: 'all',
    isActive: true,
    actionText: 'Experimentar Agora',
    actionUrl: '#intermediarios',
    createdAt: new Date().toISOString()
  },
  {
    id: 'mkt_02',
    type: 'image',
    title: 'Campanha de Recargas: 20% Mais Consultas',
    message: 'Adira ao Plano Empresarial e receba consultas de simulação fiscal adicionais sem custos.',
    mediaUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80',
    badge: 'Promoção',
    category: 'promocao',
    recommendedDimensions: '1200 × 630 px (1.91:1 Banner) ou 1080 × 1080 px (1:1 Quadrado) - Máx 2MB',
    maxSizeMb: 2,
    targetAudience: 'clients',
    isActive: true,
    actionText: 'Ver Planos',
    actionUrl: '#planos',
    createdAt: new Date().toISOString()
  },
  {
    id: 'mkt_03',
    type: 'video',
    title: 'Tutorial em Vídeo: Como Calcular Despacho Aduaneiro',
    message: 'Aprenda passo a passo a calcular valor FOB, CIF, Direitos Aduaneiros e Imposto Especial de Consumo em 3 minutos.',
    mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    badge: 'Vídeo Tutorial',
    category: 'aviso',
    recommendedDimensions: '1920 × 1080 px (16:9 Full HD) - Vídeo MP4 ou Link YouTube/Vimeo - Máx 25MB',
    maxSizeMb: 25,
    targetAudience: 'all',
    isActive: false,
    actionText: 'Assistir Tutorial',
    createdAt: new Date().toISOString()
  }
];

interface MarketingBroadcastSectionProps {
  onSaveSnapshot: (section: string, payload: any) => void;
  showSaveNotice: (msg: string) => void;
}

export const MarketingBroadcastSection: React.FC<MarketingBroadcastSectionProps> = ({
  onSaveSnapshot,
  showSaveNotice
}) => {
  const [notifications, setNotifications] = useState<MarketingNotification[]>(() => {
    const saved = localStorage.getItem('nanucloud_marketing_broadcasts');
    return saved ? JSON.parse(saved) : INITIAL_MARKETING_NOTIFICATIONS;
  });

  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newType, setNewType] = useState<'text' | 'image' | 'video'>('text');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newMessage, setNewMessage] = useState<string>('');
  const [newMediaUrl, setNewMediaUrl] = useState<string>('');
  const [newActionText, setNewActionText] = useState<string>('');
  const [newActionUrl, setNewActionUrl] = useState<string>('');
  const [newCategory, setNewCategory] = useState<'comunicacao' | 'publicidade' | 'aviso' | 'promocao' | 'outro'>('comunicacao');
  const [newAudience, setNewAudience] = useState<'all' | 'clients' | 'visitors' | 'admins'>('all');

  const getRecommendedDimensions = (type: 'text' | 'image' | 'video') => {
    switch (type) {
      case 'image':
        return '1200 × 630 px (1.91:1 Horizontal) ou 1080 × 1080 px (1:1) — Formato JPG/PNG/WebP (Máx 2MB)';
      case 'video':
        return '1920 × 1080 px (16:9 Widescreen) — Link YouTube, Vimeo ou MP4 Direto (Máx 25MB)';
      default:
        return 'Formato de Texto Padrão (Recomendado 80-280 caracteres sem quebra de layout)';
    }
  };

  const handleToggleActive = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, isActive: !n.isActive } : n));
    setNotifications(updated);
  };

  const handleDelete = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
  };

  const handleSaveAll = () => {
    localStorage.setItem('nanucloud_marketing_broadcasts', JSON.stringify(notifications));
    onSaveSnapshot('Notificações & Marketing', notifications);
    showSaveNotice('Campanhas de marketing e comunicações salvas com sucesso!');
  };

  const handleCreateNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) return;

    const created: MarketingNotification = {
      id: `mkt_${Date.now()}`,
      type: newType,
      title: newTitle.trim(),
      message: newMessage.trim(),
      mediaUrl: newMediaUrl.trim() || undefined,
      actionText: newActionText.trim() || undefined,
      actionUrl: newActionUrl.trim() || undefined,
      badge: newCategory.toUpperCase(),
      category: newCategory,
      recommendedDimensions: getRecommendedDimensions(newType),
      targetAudience: newAudience,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    const updated = [created, ...notifications];
    setNotifications(updated);
    localStorage.setItem('nanucloud_marketing_broadcasts', JSON.stringify(updated));
    setIsCreating(false);
    setNewTitle('');
    setNewMessage('');
    setNewMediaUrl('');
    setNewActionText('');
    setNewActionUrl('');
    showSaveNotice(`Comunicação "${created.title}" criada com sucesso!`);
  };

  return (
    <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-indigo-400" /> NOTIFICAÇÕES & CAMPANHAS DE MARKETING (BACK-END)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Crie e ative avisos, comunicações, publicidades e vídeos com dimensões e proporções recomendadas para preservar o layout padrão da aplicação.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            onClick={() => setIsCreating(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2 px-4 rounded-xl text-xs font-mono flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-indigo-400" /> Nova Comunicação
          </button>
          <button
            onClick={handleSaveAll}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-5 rounded-xl text-xs font-mono uppercase tracking-wider flex items-center gap-2 shadow-md transition cursor-pointer"
          >
            <Save className="w-4 h-4" /> Guardar Notificações
          </button>
        </div>
      </div>

      {/* Recommended Dimensions Guide Banner */}
      <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs font-mono space-y-2">
        <div className="flex items-center gap-2 text-indigo-300 font-bold">
          <Info className="w-4 h-4 text-indigo-400" />
          <span>Diretrizes e Padrões de Dimensão para Prevenção de Distorção Visual</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-slate-300">
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <strong className="text-sky-300 block mb-0.5">📄 Mensagens de Texto:</strong>
            Até 250 caracteres com botão de ação rápida (CTA).
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <strong className="text-emerald-300 block mb-0.5">🖼️ Banners & Imagens:</strong>
            1200×630 px (1.91:1) ou 1080×1080 px (1:1) máx 2MB.
          </div>
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            <strong className="text-purple-300 block mb-0.5">🎥 Vídeos Promocionais:</strong>
            1920×1080 px (16:9 Widescreen) ou link YouTube/Vimeo.
          </div>
        </div>
      </div>

      {/* Creation Modal / Inline Form */}
      {isCreating && (
        <form
          onSubmit={handleCreateNotification}
          className="p-5 bg-slate-900/90 border border-indigo-500/40 rounded-2xl space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" /> Adicionar Nova Notificação / Campanha
            </h4>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Tipo de Média</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="text">Mensagem de Texto / Aviso</option>
                <option value="image">Imagem / Banner Gráfico</option>
                <option value="video">Vídeo Explicativo / Publicidade</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Categoria</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="comunicacao">Comunicação Institucional</option>
                <option value="promocao">Promoção de Planos</option>
                <option value="aviso">Aviso / Manutenção</option>
                <option value="publicidade">Publicidade & Parceiros</option>
                <option value="outro">Outros</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Público-Alvo</label>
              <select
                value={newAudience}
                onChange={(e) => setNewAudience(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">Todos os Utilizadores & Visitantes</option>
                <option value="clients">Apenas Clientes Autenticados</option>
                <option value="visitors">Apenas Visitantes Anónimos</option>
                <option value="admins">Equipa de Gestão & Suporte</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Título da Campanha *</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex: Atualização da Pauta Aduaneira 2026"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {newType !== 'text' && (
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  URL da Imagem ou Vídeo ({getRecommendedDimensions(newType).split('—')[0]})
                </label>
                <input
                  type="url"
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  placeholder={newType === 'video' ? 'https://youtube.com/watch?v=...' : 'https://exemplo.com/banner.png'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">Mensagem / Texto Informativo *</label>
            <textarea
              required
              rows={2}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Descreva a mensagem clara e concisa para os utilizadores..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Texto do Botão CTA (Opcional)</label>
              <input
                type="text"
                value={newActionText}
                onChange={(e) => setNewActionText(e.target.value)}
                placeholder="Ex: Saber Mais / Ativar Agora"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Link de Destino CTA (Opcional)</label>
              <input
                type="text"
                value={newActionUrl}
                onChange={(e) => setNewActionUrl(e.target.value)}
                placeholder="Ex: #planos ou https://..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-5 rounded-xl text-xs font-mono uppercase shadow cursor-pointer"
            >
              Publicar Notificação
            </button>
          </div>
        </form>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-slate-500 font-mono text-xs">
            Nenhuma notificação configurada no momento.
          </div>
        ) : (
          notifications.map((item) => {
            const TypeIcon = item.type === 'video' ? Video : item.type === 'image' ? ImageIcon : FileText;

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  item.isActive
                    ? 'bg-slate-900/90 border-slate-800'
                    : 'bg-slate-950/60 border-slate-900 opacity-60'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        item.type === 'video'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : item.type === 'image'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                      }`}
                    >
                      <TypeIcon className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-bold text-slate-200 font-mono">{item.title}</h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {item.badge || item.category}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          Público: {item.targetAudience}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{item.message}</p>
                      <span className="text-[10px] font-mono text-slate-400 block mt-1.5">
                        📐 Dimensões Padrão: {item.recommendedDimensions}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(item.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        item.isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {item.isActive ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ativa</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Inativa</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                      title="Remover Notificação"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
