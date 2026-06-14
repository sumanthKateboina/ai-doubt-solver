// ============================================
// Dashboard.jsx - Main Dashboard Page
// ============================================
// Shows a welcome header, stats cards, and the
// list of all conversations. Lets users create
// new chats and delete existing ones.
// ============================================

import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare, Plus, BookOpen, BarChart2,
  Clock, Loader2, Brain, Trash2,
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';
import { chatAPI } from '../services/api';
import Navbar from '../components/Layout/Navbar';

const SUBJECT_COLORS = {
  Mathematics:       'bg-blue-950/60 text-blue-400 border border-blue-900/40',
  Physics:           'bg-purple-950/60 text-purple-400 border border-purple-900/40',
  Chemistry:         'bg-green-950/60 text-green-400 border border-green-900/40',
  Biology:           'bg-emerald-950/60 text-emerald-400 border border-emerald-900/40',
  History:           'bg-orange-950/60 text-orange-400 border border-orange-900/40',
  Geography:         'bg-yellow-950/60 text-yellow-400 border border-yellow-900/40',
  English:           'bg-pink-950/60 text-pink-400 border border-pink-900/40',
  'Computer Science':'bg-indigo-950/60 text-indigo-400 border border-indigo-900/40',
  Economics:         'bg-red-950/60 text-red-400 border border-red-900/40',
  General:           'bg-slate-800/60 text-slate-300 border border-slate-700/40',
  Other:             'bg-slate-800/60 text-slate-400 border border-slate-700/40',
};

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const { chats, loadingChats, loadChats, createChat, deleteChat } = useContext(ChatContext);
  const [stats, setStats] = useState(null);
  const [creatingChat, setCreatingChat] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadChats();
    chatAPI.getStats()
      .then(({ data }) => setStats(data.stats))
      .catch((err) => console.error(err));
  }, []);

  const handleNewChat = async () => {
    setCreatingChat(true);
    const chat = await createChat();
    setCreatingChat(false);
    if (chat) {
      navigate(`/chat/${chat._id}`);
    }
  };

  // handleOpenChat - navigate to the chat detail page
  const handleOpenChat = (chatId) => navigate(`/chat/${chatId}`);

  const handleDelete = async (e, chatId) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation?')) {
      await deleteChat(chatId);
    }
  };

  // Utility: convert a timestamp to a human-readable "time ago" string
  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Hello, {user?.name?.split(' ')[0]}!
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">What would you like to learn today?</p>
          </div>
          <button onClick={handleNewChat} disabled={creatingChat} className="btn-primary">
            {creatingChat
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
              : <><Plus className="w-4 h-4" /> New Chat</>
            }
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Card 1 */}
            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-950/40 text-blue-400 border border-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalChats}</p>
                <p className="text-slate-400 text-sm">Conversations</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.totalDoubts}</p>
                <p className="text-slate-400 text-sm">Doubts Solved</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-950/40 text-purple-400 border border-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <BarChart2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {Object.keys(stats.subjectBreakdown || {}).length}
                </p>
                <p className="text-slate-400 text-sm">Subjects Covered</p>
              </div>
            </div>
          </div>
        )}

        {/* Conversations List */}
        <div className="card">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-500" />
            Recent Conversations
          </h2>

          {loadingChats ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-indigo-950/40 border border-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="font-medium text-white mb-2">No conversations yet</h3>
              <p className="text-sm text-slate-400 mb-6">Start by asking your first doubt!</p>
              <button onClick={handleNewChat} className="btn-primary">
                <Plus className="w-4 h-4" /> Start New Chat
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/40">
              {chats.map(chat => (
                <div
                  key={chat._id}
                  onClick={() => handleOpenChat(chat._id)}
                  className="flex items-center gap-4 py-3.5 px-3 -mx-2 rounded-lg hover:bg-slate-800/30 cursor-pointer group transition-colors"
                >
                  <div className="w-10 h-10 bg-indigo-950/40 border border-indigo-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-medium text-sm text-white truncate">{chat.title}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 border ${SUBJECT_COLORS[chat.subject] || SUBJECT_COLORS.General}`}>
                        {chat.subject}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{chat.lastMessage || 'Empty conversation'}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-slate-500">{timeAgo(chat.lastActivity)}</span>
                    <button
                      onClick={(e) => handleDelete(e, chat._id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
