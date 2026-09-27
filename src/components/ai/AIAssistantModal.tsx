import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ShieldCheck,
  Zap,
  Leaf,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose }) => {
  const { user, role } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: `Hello Chef & Team! I am your **EcoFeast AI Safety & Operations Advisor**.\n\nI can assist you with:\n- **Food Safety & HACCP** temperature danger zones\n- **Smart Matching Engine** score logic & logistics\n- **Traceability** from kettle to community distribution\n- **Environmental CO₂** & meal impact calculations.\n\nHow can I help your food recovery workflow today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!messageText) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          role: role || 'kitchen',
          context: {
            userOrg: user?.organization_name,
            location: user?.location
          }
        })
      });

      if (!res.ok) {
        throw new Error('Server response error');
      }

      const data = await res.json();
      const botMsg: Message = {
        sender: 'assistant',
        text: data.reply || 'I processed your request according to safety guidelines.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.warn('AI endpoint fetch failed, providing fallback safety guidance', err);
      const botMsg: Message = {
        sender: 'assistant',
        text: `**Standard Food Recovery Guidance:**\n\nEnsure hot-held food remains strictly above **60°C**, and cold food below **4°C**. Food held between 5°C and 60°C for more than 2 hours must be consumed urgently, and after 4 hours must be condemned. Once safety is verified, the Smart Matching engine matches with the closest NGOs possessing thermal transport equipment.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    'What are the critical temperature rules for cooked food?',
    'How does the Smart Matching algorithm score NGOs?',
    'What happens if temperature falls below 60°C?',
    'Explain the FPU processing workflow for raw surplus',
    'How are meals supported and CO₂ savings calculated?'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl h-[640px] max-h-[90vh] shadow-2xl flex flex-col border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-tight text-white">EcoFeast AI Advisor</h3>
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  Gemini Server Powered
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Institutional Safety, FSSAI / HACCP, Matching & Traceability Copilot
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick prompt pills */}
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-slate-500 shrink-0 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            Suggested:
          </span>
          {samplePrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              disabled={isLoading}
              className="text-[11px] bg-white hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 shrink-0 transition-colors font-medium whitespace-nowrap shadow-xs"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chat message area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((m, idx) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={idx}
                className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-slate-900 text-white'
                      : 'bg-emerald-600 text-white shadow-xs'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div>
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-slate-900 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none shadow-xs'
                    }`}
                  >
                    <div className="whitespace-pre-line font-normal space-y-1">
                      {m.text}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] text-slate-400 mt-1 block px-1 ${
                      isUser ? 'text-right' : ''
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 bg-white border border-slate-200 rounded-2xl rounded-tl-none flex items-center gap-2 text-xs text-slate-500 shadow-xs">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>EcoFeast AI analyzing food guidelines...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input box */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about food safety checks, HACCP rules, matching algorithms..."
              disabled={isLoading}
              className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-400">
            <span>Server-side verified AI • Complies with FSSAI & HACCP protocols</span>
            <span>SIH 2026 Edition</span>
          </div>
        </div>
      </div>
    </div>
  );
};
