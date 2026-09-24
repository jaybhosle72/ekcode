import { useState, useRef, useEffect } from 'react';
import ChatBubble from '../components/ChatBubble';
import { MdSend } from 'react-icons/md';
import { sendChatMessage } from '../services/api';

function Chat() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your EkCode AI assistant. I can help you analyze material data across ONGC, BPCL, and IOC catalogs, discover duplicates, or explain match reasoning. What would you like to know?", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (textToSend = input) => {
    const text = typeof textToSend === 'string' ? textToSend : input;
    if (!text || !text.trim()) return;
    
    const userMsg = { id: Date.now(), text, isUser: true };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await sendChatMessage(text);
      const reply = res.data?.reply || "I analyzed the material catalogs, but couldn't find a matching record. Try searching for 'carbon steel pipes' or 'most duplicated material'.";
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: reply, 
        isUser: false 
      }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: "⚠️ Could not connect to EkCode Assistant server. Please ensure the backend is running on port 5000.", 
        isUser: false 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const suggestions = [
    "How many duplicates were found?",
    "What's the most duplicated material?",
    "Find all carbon steel pipes",
    "How much money can we save?"
  ];

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col bg-[#1e293b] border border-[#334155] rounded-xl overflow-hidden">
      <div className="p-4 bg-[#0f172a] border-b border-[#334155]">
        <h2 className="text-lg font-semibold text-white">EkCode AI Assistant</h2>
        <p className="text-xs text-[#94a3b8]">Ask anything about your material catalogs</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <ChatBubble key={msg.id} message={msg.text} isUser={msg.isUser} />
        ))}
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-[#1e293b] text-[#94a3b8] border border-[#334155] rounded-2xl rounded-tl-none px-4 py-3 flex space-x-1 items-center">
              <div className="w-2 h-2 bg-[#94a3b8] rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-[#94a3b8] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-[#94a3b8] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-[#0f172a] border-t border-[#334155]">
        <div className="flex flex-wrap gap-2 mb-3">
          {suggestions.map((sug, i) => (
            <button 
              key={i}
              onClick={() => handleSend(sug)}
              className="text-xs px-3 py-1.5 bg-[#1e293b] border border-[#334155] text-[#94a3b8] hover:text-white hover:border-slate-400 rounded-full transition-colors"
            >
              {sug}
            </button>
          ))}
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your question..."
            className="flex-1 bg-[#1e293b] border border-[#334155] rounded-full py-2 px-4 text-[#f1f5f9] focus:outline-none focus:border-slate-400"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <MdSend />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
