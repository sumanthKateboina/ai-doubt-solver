// ============================================
// MessageBubble.jsx - Single Chat Message
// ============================================
// Renders one message bubble:
//   - User messages → right-aligned, blue bg
//   - AI messages   → left-aligned, white bg
//                     with markdown + syntax highlighting
// Both show an input-type badge and timestamp.
// AI bubbles include a hover-reveal copy button.
// ============================================

import { Brain, User, Image, Mic, FileText, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import toast from 'react-hot-toast';

// ── Sub-component: small badge showing text / image / voice ──
const InputTypeBadge = ({ type }) => {
  const badges = {
    image: { icon: <Image className="w-3 h-3" />, label: 'Image', cls: 'bg-purple-950/60 text-purple-400 border border-purple-900/40' },
    voice: { icon: <Mic   className="w-3 h-3" />, label: 'Voice', cls: 'bg-amber-950/60 text-amber-400 border border-amber-900/40'  },
    text:  { icon: <FileText className="w-3 h-3" />, label: 'Text', cls: 'bg-indigo-950/60 text-indigo-300 border border-indigo-900/40'  },
  };
  const badge = badges[type] || badges.text;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium border ${badge.cls}`}>
      {badge.icon} {badge.label}
    </span>
  );
};

const MarkdownRenderer = ({ content }) => (
  <div className="markdown-content">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" {...props}>
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className="bg-slate-950/80 text-pink-400 px-1.5 py-0.5 rounded text-xs font-mono border border-slate-800/60" {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);

export default function MessageBubble({ message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const copyContent = () => {
    navigator.clipboard.writeText(message.content)
      .then(() => {
        setCopied(true);
        toast.success('Copied!');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        toast.error('Failed to copy content');
      });
  };

  const timestamp = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  // ── User bubble (right side) ────────────────────────────────
  if (isUser) {
    return (
      <div className="flex justify-end mb-3 animate-fade-in">
        <div className="flex flex-col items-end gap-1 max-w-[80%]">
          {/* Image attachment preview */}
          {message.imageUrl && (
            <img
              src={message.imageUrl}
              alt="Uploaded"
              className="rounded-xl max-w-xs max-h-64 object-contain border border-slate-800 mb-1"
            />
          )}
          {/* Voice transcription note */}
          {message.inputType === 'voice' && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Mic className="w-3 h-3 text-amber-400" />
              <span>Voice message transcribed</span>
            </div>
          )}
          <div className="bg-gradient-to-tr from-indigo-950 to-purple-950 border border-amber-500/25 text-white rounded-2xl rounded-br-sm px-4 py-2.5 shadow-lg shadow-indigo-950/40">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
          <div className="flex items-center gap-2 px-1">
            <InputTypeBadge type={message.inputType} />
            <span className="text-xs text-slate-500">{timestamp}</span>
          </div>
        </div>
        <div className="w-8 h-8 bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0 ml-2 mt-auto shadow-lg shadow-amber-500/20">
          <User className="w-4 h-4 text-slate-950" />
        </div>
      </div>
    );
  }

  // ── AI bubble (left side) ───────────────────────────────────
  return (
    <div className="flex items-start gap-2.5 mb-3 animate-fade-in">
      <div className="w-8 h-8 bg-gradient-to-tr from-purple-800 to-indigo-900 border border-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-lg shadow-indigo-950/30">
        <Brain className="w-4 h-4 text-amber-400" />
      </div>
      <div className="flex-1 max-w-[90%]">
        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl rounded-bl-sm px-4 py-3 shadow-2xl border border-slate-900 relative group">
          {/* Copy button — visible on hover */}
          <button
            onClick={copyContent}
            className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
          >
            {copied
              ? <Check className="w-3.5 h-3.5 text-green-400" />
              : <Copy  className="w-3.5 h-3.5" />
            }
          </button>
          <MarkdownRenderer content={message.content} />
        </div>
        <div className="flex items-center gap-1 px-1 mt-1">
          <span className="text-xs text-slate-500">{timestamp}</span>
        </div>
      </div>
    </div>
  );
}
