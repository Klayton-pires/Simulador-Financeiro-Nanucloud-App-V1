import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, CheckCircle, XCircle, AlertCircle, RefreshCw, MessageSquare, Plus, Search, Trash2, Globe, BookOpen } from 'lucide-react';

interface BotKnowledgeItem {
  id: string;
  question: string;
  keywords: string[];
  answer: string;
  language: string;
  category: string;
  isApproved: boolean;
  learnedAt: string;
}

interface UnresolvedBotQuestion {
  id: string;
  question: string;
  detectedLang: string;
  askedAt: string;
  userEmail?: string;
  status: 'pending' | 'answered' | 'ignored';
  adminNotes?: string;
}

export const AdminBotLearningTab: React.FC = () => {
  const [unresolvedQuestions, setUnresolvedQuestions] = useState<UnresolvedBotQuestion[]>([]);
  const [knowledgeList, setKnowledgeList] = useState<BotKnowledgeItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeSubTab, setActiveSubTab] = useState<'unresolved' | 'knowledge' | 'test'>('unresolved');
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form for answering & teaching bot
  const [selectedQuestion, setSelectedQuestion] = useState<UnresolvedBotQuestion | null>(null);
  const [answerText, setAnswerText] = useState<string>('');
  const [keywordsText, setKeywordsText] = useState<string>('');
  const [category, setCategory] = useState<string>('fiscal');
  const [language, setLanguage] = useState<string>('pt');

  // Form for manual knowledge creation
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [newAnswer, setNewAnswer] = useState<string>('');
  const [newKeywords, setNewKeywords] = useState<string>('');
  const [newLang, setNewLang] = useState<string>('pt');
  const [newCategory, setNewCategory] = useState<string>('fiscal');

  // Knowledge search
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Interactive Test
  const [testPrompt, setTestPrompt] = useState<string>('');
  const [testResponse, setTestResponse] = useState<any | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resUnresolved, resKnowledge] = await Promise.all([
        fetch('/api/chat/admin/unresolved'),
        fetch('/api/chat/admin/knowledge')
      ]);

      if (resUnresolved.ok) {
        const data = await resUnresolved.json();
        setUnresolvedQuestions(data);
      }
      if (resKnowledge.ok) {
        const data = await resKnowledge.json();
        setKnowledgeList(data);
      }
    } catch (err) {
      console.error('Error loading bot data:', err);
      setFeedback({ text: 'Falha ao carregar dados do robô.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAnswerModal = (q: UnresolvedBotQuestion) => {
    setSelectedQuestion(q);
    setAnswerText('');
    setLanguage(q.detectedLang || 'pt');
    // Generate initial keywords from words in question
    const words = q.question
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .split(/\s+/)
      .filter((w) => w.length > 3);
    setKeywordsText(Array.from(new Set(words)).join(', '));
  };

  const handleAnswerAndLearn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestion || !answerText.trim()) return;

    try {
      const kwArray = keywordsText
        .split(',')
        .map((k) => k.trim().toLowerCase())
        .filter(Boolean);

      const res = await fetch('/api/chat/admin/answer-learn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: selectedQuestion.id,
          answer: answerText,
          keywords: kwArray,
          language,
          category
        })
      });

      if (res.ok) {
        setFeedback({
          text: 'Resposta guardada com sucesso! O robô aprendeu e responderá a perguntas similares automaticamente.',
          type: 'success'
        });
        setSelectedQuestion(null);
        fetchData();
      } else {
        const d = await res.json();
        setFeedback({ text: d.error || 'Erro ao guardar resposta.', type: 'error' });
      }
    } catch (err) {
      setFeedback({ text: 'Erro ao comunicar com o servidor.', type: 'error' });
    }
  };

  const handleIgnoreQuestion = async (questionId: string) => {
    if (!confirm('Tem a certeza que deseja ignorar esta pergunta? Ela não será ensinada ao robô.')) return;

    try {
      const res = await fetch('/api/chat/admin/ignore-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId })
      });

      if (res.ok) {
        setFeedback({ text: 'Pergunta marcada como ignorada.', type: 'success' });
        fetchData();
      }
    } catch (err) {
      setFeedback({ text: 'Erro ao ignorar pergunta.', type: 'error' });
    }
  };

  const handleCreateKnowledgeManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    try {
      const kwArray = newKeywords
        .split(',')
        .map((k) => k.trim().toLowerCase())
        .filter(Boolean);

      const res = await fetch('/api/chat/admin/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: newQuestion,
          answer: newAnswer,
          keywords: kwArray,
          language: newLang,
          category: newCategory
        })
      });

      if (res.ok) {
        setFeedback({ text: 'Novo conhecimento adicionado à base do robô com sucesso!', type: 'success' });
        setNewQuestion('');
        setNewAnswer('');
        setNewKeywords('');
        fetchData();
      } else {
        const d = await res.json();
        setFeedback({ text: d.error || 'Erro ao adicionar conhecimento.', type: 'error' });
      }
    } catch (err) {
      setFeedback({ text: 'Erro de comunicação.', type: 'error' });
    }
  };

  const handleDeleteKnowledge = async (id: string) => {
    if (!confirm('Deseja eliminar este item da base de conhecimento do robô?')) return;

    try {
      const res = await fetch(`/api/chat/admin/knowledge/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setFeedback({ text: 'Item de conhecimento removido com sucesso.', type: 'success' });
        fetchData();
      }
    } catch (err) {
      setFeedback({ text: 'Erro ao remover item.', type: 'error' });
    }
  };

  const handleTestBot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPrompt.trim()) return;

    setIsTesting(true);
    setTestResponse(null);
    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: testPrompt,
          sessionId: 'test_admin_session'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setTestResponse(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTesting(false);
    }
  };

  const pendingQuestions = unresolvedQuestions.filter((q) => q.status === 'pending');
  const filteredKnowledge = knowledgeList.filter(
    (k) =>
      k.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.keywords.some((kw) => kw.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-bold text-slate-100 font-mono uppercase tracking-tight">
                Gestão & Aprendizagem do Assistente Robô
              </h2>
              {pendingQuestions.length > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                  {pendingQuestions.length} Perguntas Pendentes
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Notificações de perguntas não respondidas, aprendizagem contínua e suporte multilíngue (PT, EN, FR, ES)
            </p>
          </div>
        </div>

        <button
          onClick={fetchData}
          disabled={isLoading}
          className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-2 border border-slate-700 cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Atualizar Dados</span>
        </button>
      </div>

      {/* Alert message */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs font-mono flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('unresolved')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'unresolved'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Perguntas Pendentes ({pendingQuestions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('knowledge')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'knowledge'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Base de Conhecimento ({knowledgeList.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('test')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'test'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Testar Respostas do Robô</span>
        </button>
      </div>

      {/* SUB-TAB 1: UNRESOLVED QUESTIONS */}
      {activeSubTab === 'unresolved' && (
        <div className="space-y-4">
          <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              💡 <strong>Como funciona a aprendizagem do robô:</strong> Sempre que um utilizador fizer uma pergunta fiscal para a qual o robô ainda não tem resposta registada, o sistema regista a notificação aqui. Se a pergunta for importante, clique em <strong>"Responder & Ensinar"</strong> para adicionar a resposta à base do robô. O robô passará a responder instantaneamente a perguntas similares em qualquer idioma! Se não for importante, basta clicar em <strong>"Ignorar"</strong>.
            </p>
          </div>

          {pendingQuestions.length === 0 ? (
            <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-12 text-center text-slate-400 font-mono space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-slate-200">Nenhuma pergunta pendente de aprendizagem!</p>
              <p className="text-xs text-slate-500">Todas as dúvidas fiscais dos utilizadores foram atendidas e aprendidas pelo robô.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {pendingQuestions.map((q) => (
                <div
                  key={q.id}
                  className="bg-[#1E293B] border border-slate-800 hover:border-indigo-500/40 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-mono uppercase font-bold">
                        Pendente
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono uppercase">
                        Idioma: {q.detectedLang.toUpperCase()}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(q.askedAt).toLocaleString('pt-PT')}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-100 font-mono">"{q.question}"</p>
                    {q.userEmail && (
                      <p className="text-[11px] text-slate-400 font-mono">Utilizador: {q.userEmail}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <button
                      onClick={() => handleIgnoreQuestion(q.id)}
                      className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition cursor-pointer"
                    >
                      Ignorar
                    </button>
                    <button
                      onClick={() => handleOpenAnswerModal(q)}
                      className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold transition flex items-center gap-1.5 shadow cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Responder & Ensinar ao Robô</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: KNOWLEDGE BASE MANAGER */}
      {activeSubTab === 'knowledge' && (
        <div className="space-y-6">
          {/* Add Knowledge Form */}
          <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-5 md:p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-tight flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              Adicionar Novo Conhecimento Manualmente
            </h3>

            <form onSubmit={handleCreateKnowledgeManual} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-slate-400 font-bold uppercase text-[11px]">Pergunta ou Tema Fiscal</label>
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Ex: Como funciona a retenção na fonte em serviços em Angola?"
                    required
                    className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 font-bold uppercase text-[11px]">Idioma</label>
                  <select
                    value={newLang}
                    onChange={(e) => setNewLang(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
                  >
                    <option value="pt">Português (PT)</option>
                    <option value="en">English (EN)</option>
                    <option value="fr">Français (FR)</option>
                    <option value="es">Español (ES)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold uppercase text-[11px]">Palavras-Chave (Separadas por vírgula)</label>
                <input
                  type="text"
                  value={newKeywords}
                  onChange={(e) => setNewKeywords(e.target.value)}
                  placeholder="Ex: retencao, servicos, 6.5, angola, imposto industrial, tpa"
                  className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 rounded-lg px-3 py-2 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold uppercase text-[11px]">Resposta Oficial do Robô</label>
                <textarea
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  rows={3}
                  placeholder="Escreva a resposta clara e detalhada com as regras fiscais e percentagens aplicáveis..."
                  required
                  className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 rounded-lg p-3 outline-none focus:border-indigo-500 font-sans text-xs"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition shadow cursor-pointer uppercase text-xs flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Gravar Conhecimento</span>
              </button>
            </form>
          </div>

          {/* Search and List */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar conhecimentos do robô..."
                  className="w-full bg-[#1E293B] border border-slate-800 text-slate-100 rounded-lg pl-9 pr-3 py-2 text-xs font-mono outline-none focus:border-indigo-500"
                />
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Total Registados: <strong>{filteredKnowledge.length}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {filteredKnowledge.map((item) => (
                <div key={item.id} className="bg-[#1E293B] border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-mono uppercase font-bold">
                        {item.language.toUpperCase()}
                      </span>
                      <span className="text-xs font-bold text-slate-100 font-mono">{item.question}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteKnowledge(item.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 font-sans leading-relaxed bg-[#0F172A] p-3 rounded-lg border border-slate-800/80">
                    {item.answer}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-500 font-mono">Palavras-chave:</span>
                    {item.keywords.map((kw, i) => (
                      <span key={i} className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: TEST ROBOT RESPONSES */}
      {activeSubTab === 'test' && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-xl p-5 md:p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Testador Interativo de Respostas do Robô
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Escreva qualquer pergunta em qualquer idioma (Português, Inglês, Francês, Espanhol) para verificar se o robô responde corretamente com base nos conhecimentos aprendidos.
          </p>

          <form onSubmit={handleTestBot} className="space-y-3 font-mono">
            <div className="flex gap-2">
              <input
                type="text"
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                placeholder="Ex: Como calcular a retenção na fonte em serviços em Angola?"
                className="flex-1 bg-[#0F172A] border border-slate-800 text-slate-100 rounded-lg px-3 py-2 text-xs outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={isTesting}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isTesting ? 'A testar...' : 'Testar'}</span>
              </button>
            </div>
          </form>

          {testResponse && (
            <div className="mt-4 p-4 rounded-xl bg-[#0F172A] border border-indigo-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-indigo-400 font-bold">Resposta Gerada pelo Robô:</span>
                <span className="text-slate-500 text-[10px]">Origem: Base de Conhecimento NANUCLOUD</span>
              </div>
              <p className="text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-line">
                {testResponse.reply}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Answer & Teach Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 uppercase flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Responder & Ensinar ao Robô
              </h3>
              <button
                onClick={() => setSelectedQuestion(null)}
                className="text-slate-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#0F172A] p-3 rounded-lg border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Pergunta Feita pelo Utilizador:</span>
              <p className="text-xs font-bold text-slate-100 font-mono">"{selectedQuestion.question}"</p>
              <span className="text-[10px] text-indigo-400">Idioma Detectado: {selectedQuestion.detectedLang.toUpperCase()}</span>
            </div>

            <form onSubmit={handleAnswerAndLearn} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 font-bold text-[10px] uppercase">Idioma da Resposta</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                  >
                    <option value="pt">Português (PT)</option>
                    <option value="en">English (EN)</option>
                    <option value="fr">Français (FR)</option>
                    <option value="es">Español (ES)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 font-bold text-[10px] uppercase">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 rounded-lg px-2.5 py-1.5 text-xs outline-none"
                  >
                    <option value="fiscal">Fiscal / Impostos</option>
                    <option value="plans">Planos & Preços</option>
                    <option value="import">Importação / Alfândega</option>
                    <option value="services">Prestação de Serviços</option>
                    <option value="support">Suporte Técnico</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold text-[10px] uppercase">Palavras-Chave de Reconhecimento</label>
                <input
                  type="text"
                  value={keywordsText}
                  onChange={(e) => setKeywordsText(e.target.value)}
                  placeholder="Ex: retencao, servicos, 6.5, angola"
                  required
                  className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 rounded-lg px-3 py-2 text-xs outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-bold text-[10px] uppercase">Resposta Definitiva para Ensinar ao Robô</label>
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  rows={4}
                  placeholder="Escreva a resposta fiscal oficial..."
                  required
                  className="w-full bg-[#0F172A] border border-slate-800 text-slate-100 rounded-lg p-3 text-xs outline-none font-sans"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedQuestion(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow cursor-pointer uppercase"
                >
                  Guardar & Ensinar Robô
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
