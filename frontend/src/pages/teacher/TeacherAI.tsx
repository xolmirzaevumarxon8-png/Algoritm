import { useState, useEffect } from 'react';
import { Bot, Send, Sparkles, BookOpen, PenTool, CheckCircle, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const TeacherAI = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<{role: 'ai' | 'user', text: string}[]>([]);
  const [input, setInput] = useState('');

  // Setup initial message when component mounts or language changes
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: 'ai', text: t('teacher_ai.initial_msg') }]);
    } else {
      // Update the first message if it's the initial message
      const newMessages = [...messages];
      if (newMessages[0].role === 'ai') {
        newMessages[0].text = t('teacher_ai.initial_msg');
        setMessages(newMessages);
      }
    }
  }, [t]);

  const handleSend = () => {
    if(!input.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput('');
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: t('teacher_ai.response_msg') 
      }]);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center">
            <BrainCircuit className="w-8 h-8 mr-3 text-purple-500" />
            {t('teacher_ai.title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t('teacher_ai.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Prompts */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-white mb-2">{t('teacher_ai.quick_generators')}</h3>
          {[
            { title: t('teacher_ai.gen_quiz'), icon: CheckCircle, desc: t('teacher_ai.gen_quiz_desc'), color: 'text-blue-500' },
            { title: t('teacher_ai.gen_lesson'), icon: BookOpen, desc: t('teacher_ai.gen_lesson_desc'), color: 'text-emerald-500' },
            { title: t('teacher_ai.gen_hw'), icon: PenTool, desc: t('teacher_ai.gen_hw_desc'), color: 'text-purple-500' },
          ].map((prompt, i) => (
            <motion.button 
              key={i} 
              whileHover={{ scale: 1.02 }}
              onClick={() => setInput(prompt.title)}
              className="w-full text-left bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-purple-200 dark:hover:border-purple-900 transition-colors"
            >
              <div className="flex items-center mb-1">
                <prompt.icon className={`w-5 h-5 mr-2 ${prompt.color}`} />
                <h4 className="font-semibold text-slate-800 dark:text-white">{prompt.title}</h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{prompt.desc}</p>
            </motion.button>
          ))}

          <div className="mt-8 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/50 rounded-xl">
            <h4 className="font-bold text-purple-800 dark:text-purple-300 flex items-center text-sm mb-2">
              <Sparkles className="w-4 h-4 mr-2" /> {t('teacher_ai.ai_capabilities')}
            </h4>
            <ul className="text-xs text-purple-700 dark:text-purple-400 space-y-2">
              <li>• {t('teacher_ai.evaluates_code')}</li>
              <li>• {t('teacher_ai.constructive_feedback')}</li>
              <li>• {t('teacher_ai.translates_materials')}</li>
            </ul>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center bg-slate-50/50 dark:bg-slate-800/20 rounded-t-2xl">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mr-3">
              <Bot className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">Algoritm AI</h3>
              <p className="text-xs text-emerald-500 font-medium">{t('teacher_ai.online')}</p>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm'}`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 rounded-b-2xl">
            <div className="relative flex items-center">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={t('teacher_ai.placeholder')}
                className="w-full pl-4 pr-12 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm dark:text-white shadow-sm"
              />
              <button 
                onClick={handleSend}
                className="absolute right-2 p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeacherAI;
