import { useState, useEffect, useRef } from 'react';
import { sendChatMessage } from '../services/api';
import { 
  FiX, 
  FiMinimize2, 
  FiSend, 
  FiTrash2 
} from 'react-icons/fi';
import { BsRobot, BsStars } from 'react-icons/bs';

const INITIAL_MESSAGE = {
  sender: 'ai',
  text: `👋 **Hello! I'm your EkCode AI Assistant.**\n\nI can help you analyze material catalogs across **ONGC, BPCL, and IOC**, discover duplicates, explain standard codes, and calculate bulk procurement savings under *"One Nation, One Material Code"*.\n\nTry clicking any quick prompt below or ask your own question!`
};

const PROMPT_SUGGESTIONS = [
  'What is the least duplicated material?',
  "What's the most duplicated material?",
  'Find all carbon steel pipes',
  'How much money can we save?',
  '30-second pitch for judges',
  "I don't know about this site — explain what EkCode does"
];

function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('ekcode_chat_history');
      return saved ? JSON.parse(saved) : [INITIAL_MESSAGE];
    } catch {
      return [INITIAL_MESSAGE];
    }
  });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem('ekcode_chat_history', JSON.stringify(messages));
    } catch (e) {
      console.warn('Could not save chat history to localStorage:', e);
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const newMessages = [...messages, { sender: 'user', text: query }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await sendChatMessage(query);
      setMessages([...newMessages, { sender: 'ai', text: res.data?.reply || 'No response received.' }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages([
        ...newMessages, 
        { sender: 'ai', text: '⚠️ Unable to connect to EkCode AI server. Please verify backend is active on port 5000.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([INITIAL_MESSAGE]);
    localStorage.removeItem('ekcode_chat_history');
  };

  const renderFormattedText = (text) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.trim().startsWith('|')) {
        return (
          <div key={idx} className="font-mono text-[11px] overflow-x-auto py-0.5 text-slate-800">
            {line}
          </div>
        );
      }

      if (line.trim().startsWith('###')) {
        return <h4 key={idx} className="text-xs font-bold text-slate-900 mt-2 mb-1">{line.replace(/^###\s*/, '')}</h4>;
      }
      if (line.trim().startsWith('##')) {
        return <h3 key={idx} className="text-sm font-bold text-slate-900 mt-2 mb-1">{line.replace(/^##\s*/, '')}</h3>;
      }

      if (line.trim().startsWith('>')) {
        return (
          <blockquote key={idx} className="border-l-2 border-blue-500 pl-2.5 py-1 my-1 italic text-slate-700 text-[11px] bg-blue-50 rounded-r">
            {line.replace(/^>\s*/, '')}
          </blockquote>
        );
      }

      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
      const cleanLine = isBullet ? line.trim().substring(2) : line;

      const parts = cleanLine.split(/(\*\*.*?\*\*|`.*?`)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="text-slate-900 font-bold">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={pIdx} className="bg-slate-100 text-[#3b82f6] px-1.5 py-0.5 rounded font-mono text-[11px] border border-slate-200">
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={idx} className="flex items-start space-x-1.5 my-1 text-xs">
            <span className="text-[#3b82f6] leading-none mt-1 font-bold">•</span>
            <div className="flex-1 text-slate-800">{renderedParts}</div>
          </div>
        );
      }

      return line.trim() === '' ? (
        <div key={idx} className="h-1.5"></div>
      ) : (
        <p key={idx} className="my-0.5 leading-relaxed text-slate-800">{renderedParts}</p>
      );
    });
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center space-x-3">
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-lg shadow-slate-900/15 border border-slate-700/60 transition-all duration-200 cursor-pointer text-xs font-semibold hover:scale-[1.02] active:scale-95"
            aria-label="Open EkCode AI Assistant"
          >
            <BsRobot className="text-sm text-slate-300" />
            <span>Ask EkCode AI</span>
            <BsStars className="text-amber-400 text-xs" />
          </button>
        </div>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50 w-[94vw] sm:w-[390px] h-[530px] max-h-[82vh] bg-white border border-slate-200 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-150">
          {/* Header */}
          <div className="p-3 bg-white text-slate-900 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 text-sm">
                <BsRobot />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 leading-tight">EkCode AI Copilot</h3>
                <p className="text-[10px] text-slate-500 leading-tight">National Material Standardization DPI</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={clearChat}
                title="Clear conversation"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-xs cursor-pointer"
              >
                <FiTrash2 />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Minimize chat"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors text-xs cursor-pointer"
              >
                <FiMinimize2 />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-xs cursor-pointer"
              >
                <FiX />
              </button>
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs bg-slate-50/70">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-6 h-6 rounded bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5 font-bold text-[10px]">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white font-medium shadow-xs'
                      : 'bg-white text-slate-800 border border-slate-200/90 shadow-2xs'
                  }`}
                >
                  {renderFormattedText(msg.text)}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start items-center space-x-2 text-slate-400">
                <div className="w-6 h-6 rounded bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                  AI
                </div>
                <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 shadow-2xs">
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-3 py-1.5 bg-white border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 flex-shrink-0">
              <BsStars className="text-amber-500" /> Prompts:
            </span>
            {PROMPT_SUGGESTIONS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="whitespace-nowrap text-[11px] px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 text-slate-600 border border-slate-200 transition-colors flex-shrink-0 cursor-pointer font-medium"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-2.5 bg-white border-t border-slate-200">
            <div className="flex items-center space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about materials, duplicates, savings..."
                disabled={loading}
                className="flex-1 bg-white text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 placeholder-slate-400"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
                title="Send message"
              >
                <FiSend className="text-xs" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default FloatingChat;
