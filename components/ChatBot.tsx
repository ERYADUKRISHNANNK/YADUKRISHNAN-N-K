import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Volume2, VolumeX, Mic, Sparkles } from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  audio?: string;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: 'Hello! I am your AirGuard AI assistant. How can I help you protect your breath today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Generate text response
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: input }] }
        ],
        config: {
          systemInstruction: "You are AirGuard AI, an expert in environmental science, air quality, and respiratory health. Provide concise, helpful, and scientifically accurate advice. If asked about specific health conditions like asthma, provide protocol-based safety tips.",
        }
      });

      const modelText = response.text || "I'm sorry, I couldn't process that.";
      const modelMessage: Message = { id: (Date.now() + 1).toString(), role: 'model', text: modelText };

      // Generate audio if enabled
      if (isVoiceEnabled) {
        try {
          const ttsResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Say clearly: ${modelText}` }] }],
            config: {
              responseModalities: [Modality.AUDIO],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
              },
            },
          });

          const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
          if (base64Audio) {
            modelMessage.audio = `data:audio/mp3;base64,${base64Audio}`;
            playAudio(modelMessage.audio);
          }
        } catch (audioErr) {
          console.error("TTS Error:", audioErr);
        }
      }

      setMessages(prev => [...prev, modelMessage]);
    } catch (err) {
      console.error("Chat Error:", err);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "I'm having trouble connecting to my brain. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const playAudio = (audioSrc: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioSrc;
      audioRef.current.play();
    } else {
      const audio = new Audio(audioSrc);
      audioRef.current = audio;
      audio.play();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-[100] w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center border-2 border-white/20 backdrop-blur-sm"
      >
        <MessageSquare className="w-6 h-6" />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"
        />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed inset-x-4 bottom-24 top-20 z-[101] md:left-auto md:right-6 md:w-96 bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] border border-slate-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-primary to-blue-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg leading-none">AirGuard AI</h3>
                  <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mt-1">Environmental Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  {isVoiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                  }`}>
                    {msg.text}
                    {msg.audio && (
                      <button 
                        onClick={() => playAudio(msg.audio!)}
                        className="mt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
                      >
                        <Volume2 className="w-3 h-3" /> Replay Audio
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white p-4 rounded-3xl rounded-tl-none border border-slate-100 flex gap-1">
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 bg-white border-t border-slate-100">
              <div className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about air quality, health..."
                  className="flex-1 bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-primary/20 outline-none placeholder:text-slate-400"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
              <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest mt-4">Powered by Gemini AI Intelligence</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
