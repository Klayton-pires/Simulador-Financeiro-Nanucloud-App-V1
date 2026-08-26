import React, { useState } from 'react';
import {
  History,
  Undo2,
  Clock,
  User,
  Shield,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  FileJson,
  Eye,
  Layers
} from 'lucide-react';
import { ConfigSnapshot, UserSafe } from '../../types';

export const INITIAL_CONFIG_SNAPSHOTS: ConfigSnapshot[] = [
  {
    id: 'snap_01',
    section: 'banks',
    sectionName: 'Coordenadas Bancárias (6)',
    authorEmail: 'joaquim.monteiro@nanucloud.com',
    authorName: 'Joaquim Monteiro (Super Admin)',
    authorRole: 'super_admin',
    timestamp: '2026-08-25T14:20:00.000Z',
    summary: 'Atualização do IBAN do Banco BAI e BFA com verificação de titular.',
    payload: { updated: true, bankCount: 6 }
  },
  {
    id: 'snap_02',
    section: 'credits',
    sectionName: 'Créditos Gratuitos & Pesquisas',
    authorEmail: 'joaquim.monteiro@nanucloud.com',
    authorName: 'Joaquim Monteiro (Super Admin)',
    authorRole: 'super_admin',
    timestamp: '2026-08-25T11:00:00.000Z',
    summary: 'Ajuste de 10 consultas gratuitas no registo e 3 para visitantes da página.',
    payload: { freeQueriesOnRegister: 10, freeQueriesForVisitors: 3 }
  },
  {
    id: 'snap_03',
    section: 'countries',
    sectionName: 'Visibilidade de Países',
    authorEmail: 'joaquim.monteiro@nanucloud.com',
    authorName: 'Joaquim Monteiro (Super Admin)',
    authorRole: 'super_admin',
    timestamp: '2026-08-24T16:45:00.000Z',
    summary: 'Homologação fiscal e ajuste de visibilidade de pautas aduaneiras.',
    payload: { hiddenCountries: [] }
  }
];

interface ConfigHistoryRevertSectionProps {
  currentUser: UserSafe;
  onRevertSnapshot: (snapshot: ConfigSnapshot) => void;
  showSaveNotice: (msg: string) => void;
}

export const ConfigHistoryRevertSection: React.FC<ConfigHistoryRevertSectionProps> = ({
  currentUser,
  onRevertSnapshot,
  showSaveNotice
}) => {
  const isSuperAdmin = currentUser.role === 'superadmin' || currentUser.role === 'super_admin' || currentUser.role === 'admin_level1' || currentUser.role === 'admin';

  const [snapshots, setSnapshots] = useState<ConfigSnapshot[]>(() => {
    const saved = localStorage.getItem('nanucloud_config_history');
    return saved ? JSON.parse(saved) : INITIAL_CONFIG_SNAPSHOTS;
  });

  const [selectedSnapshot, setSelectedSnapshot] = useState<ConfigSnapshot | null>(null);

  const handleRevert = (snapshot: ConfigSnapshot) => {
    if (!isSuperAdmin) {
      alert('Acesso Restrito: Apenas o Super Administrador pode reverter alterações de configuração do sistema.');
      return;
    }

    const confirmRevert = window.confirm(
      `Tem a certeza de que deseja restaurar as configurações de "${snapshot.sectionName}" para a versão guardada em ${new Date(
        snapshot.timestamp
      ).toLocaleString('pt-PT')}?`
    );

    if (confirmRevert) {
      onRevertSnapshot(snapshot);
      showSaveNotice(`Configurações de "${snapshot.sectionName}" revertidas com sucesso!`);
    }
  };

  return (
    <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" /> HISTÓRICO DE AUDITORIA & REVERSÃO DE ALTERAÇÕES
            </h3>
            <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded font-mono font-bold">
              Exclusivo Super Admin
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Registo de todas as alterações efetuadas nas áreas de configuração. Em caso de erro, reverta instantaneamente com 1-clique.
          </p>
        </div>
      </div>

      {/* Security Banner */}
      <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs font-mono space-y-2">
        <div className="flex items-center gap-2 text-indigo-300 font-bold">
          <Shield className="w-4 h-4 text-indigo-400" />
          <span>Proteção Contínua e Ponto de Restauro Seguro</span>
        </div>
        <p className="text-slate-300 font-sans text-[11px] leading-relaxed">
          Cada vez que uma área de configuração é gravada (Contas Bancárias, Motores de Banco, RBAC, AdSense, Contactos, Pagamentos, Créditos, Temas ou Marketing), é criado automaticamente um instantâneo criptografado com data, autor e conteúdo para permitir recuperação total de desastres.
        </p>
      </div>

      {/* Snapshots Timeline List */}
      <div className="space-y-3">
        {snapshots.length === 0 ? (
          <div className="text-center py-8 text-slate-500 font-mono text-xs">
            Nenhum registo de histórico encontrado.
          </div>
        ) : (
          snapshots.map((snap) => {
            return (
              <div
                key={snap.id}
                className="p-4 rounded-2xl border border-slate-800 bg-slate-900/90 hover:border-slate-700 transition space-y-3"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
                      <RotateCcw className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-slate-200">
                          {snap.sectionName}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {new Date(snap.timestamp).toLocaleString('pt-PT')}
                        </span>
                        <span className="text-[10px] font-mono text-indigo-300">
                          Autor: {snap.authorName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{snap.summary}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedSnapshot(snap)}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver Conteúdo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRevert(snap)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-rose-600 hover:bg-rose-500 text-white shadow transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                      <span>Reverter Alterações</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Snapshot Inspector Modal */}
      {selectedSnapshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-mono text-xs">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div className="flex items-center gap-2">
                <FileJson className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-slate-200 uppercase">
                  Instantâneo: {selectedSnapshot.sectionName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSnapshot(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕ Fechar
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <strong>Data de Criação:</strong> {new Date(selectedSnapshot.timestamp).toLocaleString('pt-PT')}
                </div>
                <div>
                  <strong>Autor:</strong> {selectedSnapshot.authorName} ({selectedSnapshot.authorRole})
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1 text-[11px]">Conteúdo JSON Armazenado:</span>
                <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-emerald-400 overflow-x-auto max-h-64">
                  {JSON.stringify(selectedSnapshot.payload, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end gap-2 bg-slate-900/60">
              <button
                type="button"
                onClick={() => setSelectedSnapshot(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => {
                  const snap = selectedSnapshot;
                  setSelectedSnapshot(null);
                  handleRevert(snap);
                }}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 px-5 rounded-xl uppercase flex items-center gap-1.5 shadow cursor-pointer"
              >
                <Undo2 className="w-4 h-4" /> Reverter Para Esta Versão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
