// ============================================
// ChatPage.jsx - Chat Detail Page
// ============================================
// Loads the active chat by URL param, renders
// all messages, shows a typing indicator while
// the AI is responding, and auto-scrolls to
// the latest message.
// ============================================

import { useEffect, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain } from 'lucide-react';
import { ChatContext } from '../context/ChatContext';
import MessageBubble from '../components/Chat/MessageBubble';
import InputArea from '../components/Chat/InputArea';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Navbar from '../components/Layout/Navbar';

export default function ChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeChat, loadChat, sendingMessage } = useContext(ChatContext);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (id) {
      loadChat(id);
    }
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, sendingMessage]);

  // Show spinner while the chat is loading
  if (!activeChat) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  const SUBJECT_COLORS = {
    Mathematics:       'bg-blue-950/60 text-blue-400 border-blue-900/40',
    Physics:           'bg-purple-950/60 text-purple-400 border-purple-900/40',
    Chemistry:         'bg-green-950/60 text-green-400 border-green-900/40',
    Biology:           'bg-emerald-950/60 text-emerald-400 border-emerald-900/40',
    General:           'bg-slate-800/60 text-slate-300 border-slate-700/40',
  };
  const subjectColor = SUBJECT_COLORS[activeChat.subject] || 'bg-slate-800/60 text-slate-300 border-slate-700/40';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Chat header */}
      <div className="bg-slate-900/40 backdrop-blur-md border-b border-slate-900 px-4 py-3 sticky top-16 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-white text-sm truncate">{activeChat.title}</h2>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${subjectColor}`}>
            {activeChat.subject}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-1">
          {activeChat.messages.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-20 h-20 bg-indigo-950/40 border border-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
                <Brain className="w-10 h-10 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Ask Your First Doubt!</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">
                Type a question, upload an image, or record your voice. I'm here to help!
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-6">
                {['What is photosynthesis?', 'Solve x² + 5x + 6 = 0', "Explain Newton's laws"].map(q => (
                  <div key={q} className="bg-indigo-950/40 text-indigo-300 border border-indigo-900/30 text-xs px-3 py-1.5 rounded-full">
                    "{q}"
                  </div>
                ))}
              </div>
            </div>
          ) : (
            activeChat.messages.map((msg, i) => (
              <MessageBubble key={msg._id || i} message={msg} />
            ))
          )}

          {/* Typing indicator - shown while AI is generating a response */}
          {sendingMessage && (
            <div className="flex items-start gap-3 mt-3">
              <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/10">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl rounded-bl-sm px-4 py-3 shadow-2xl border border-slate-800/60">
                <div className="flex gap-1.5 items-center h-5">
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - sticky at bottom */}
      <div className="sticky bottom-0 bg-slate-950/80 backdrop-blur-lg border-t border-slate-900 shadow-2xl">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <InputArea subject={activeChat.subject} />
        </div>
      </div>
    </div>
  );
}
