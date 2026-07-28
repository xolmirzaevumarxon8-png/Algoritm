import React, { useState, useEffect, useCallback } from 'react';
import { Search, Send, MessageSquare, MoreVertical, Phone, Video } from 'lucide-react';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';
import { useSocket } from '../../hooks/useSocket';

export interface Contact {
  id: string;
  name: string;
  role: string;
  lastMsg: string;
  time: string;
  unread: number;
  online: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  time: string;
  isMine: boolean;
}

const Messages: React.FC = () => {
  const [activeChat, setActiveChat] = useState<Contact | null>(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { socket, isConnected } = useSocket();

  // Fetch initial real contacts from backend
  useEffect(() => {
    let isMounted = true;
    
    const fetchContacts = async () => {
      try {
        setIsLoading(true);
        const res = await apiClient.get('/chat/contacts');
        if (isMounted) {
          setContacts(res.data);
          if (res.data.length > 0) setActiveChat(res.data[0]);
        }
      } catch (error) {
        console.error("Failed to load contacts", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    fetchContacts();
    
    return () => { isMounted = false; };
  }, []);

  // Fetch messages when activeChat changes
  useEffect(() => {
    let isMounted = true;
    if (!activeChat) return;

    const fetchMessages = async () => {
      try {
        const res = await apiClient.get(`/chat/messages/${activeChat.id}`);
        if (isMounted) setMessages(res.data);
      } catch (error) {
        console.error("Failed to load messages", error);
      }
    };
    
    fetchMessages();

    return () => { isMounted = false; };
  }, [activeChat]);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !activeChat) return;
    
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true
    };
    
    // Optimistic UI Update
    setMessages(prev => [...prev, newMsg]);
    const sentText = inputText;
    setInputText('');

    // Update last message in contacts list
    setContacts(prev => prev.map(c => c.id === activeChat.id ? { ...c, lastMsg: sentText, time: 'Hozir' } : c));
    
    try {
      await apiClient.post(`/chat/messages/${activeChat.id}`, { text: sentText });
    } catch (error) {
      console.error("Failed to persist message", error);
    }

    if (socket && isConnected) {
       socket.emit('sendMessage', { to: activeChat.id, text: sentText });
    }
  }, [inputText, activeChat, socket, isConnected]);

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (msg: any) => {
        if (activeChat && msg.senderId === activeChat.id) {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            senderId: msg.senderId,
            text: msg.text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMine: false
          }]);
        }
      };
      socket.on('receiveMessage', handleNewMessage);
      return () => {
        socket.off('receiveMessage', handleNewMessage);
      }
    }
  }, [socket, activeChat]);

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)] bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-800/80 flex overflow-hidden">
      {/* Sidebar - Contacts */}
      <div className="w-80 sm:w-96 border-r border-slate-200/60 dark:border-slate-800/80 flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
        <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/80">
          <h2 className="text-xl font-bold flex items-center mb-4 text-slate-800 dark:text-slate-50">
            <MessageSquare className="w-6 h-6 mr-2.5 text-indigo-500" /> Muloqotlar
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input 
              type="text" 
              placeholder="Kontaktlarni qidirish..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-700/80 rounded-2xl bg-white dark:bg-slate-850 text-sm outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isLoading ? (
             <div className="p-8 text-center text-slate-400 text-sm font-medium">Kontaktlar yuklanmoqda...</div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">Kontaktlar topilmadi</div>
          ) : filteredContacts.map(contact => (
            <div 
              key={contact.id} 
              onClick={() => setActiveChat(contact)}
              className={`p-4 border-b border-slate-100 dark:border-slate-800/40 cursor-pointer hover:bg-white dark:hover:bg-slate-800/60 transition-colors flex items-start gap-3.5 ${activeChat?.id === contact.id ? 'bg-indigo-500/10 dark:bg-indigo-950/20 border-l-4 border-l-indigo-500' : ''}`}
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  {contact.name.charAt(0)}
                </div>
                {contact.online && <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{contact.name}</h4>
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 whitespace-nowrap ml-2">{contact.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{contact.lastMsg}</p>
                  {contact.unread > 0 && (
                    <span className="bg-indigo-600 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center ml-2 shrink-0">
                      {contact.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900">
        {/* Chat Header */}
        {activeChat ? (
          <>
            <div className="h-20 border-b border-slate-200/60 dark:border-slate-800/80 bg-white dark:bg-slate-900 px-6 flex items-center justify-between shadow-xs z-10 shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 bg-gradient-to-tr from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                  {activeChat.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">{activeChat.name}</h3>
                  <p className="text-xs text-emerald-500 dark:text-emerald-400 font-semibold mt-0.5">{activeChat.online ? 'Onlayn' : 'Oflayn'}</p>
                </div>
              </div>
              <div className="flex space-x-2 text-slate-400 dark:text-slate-500">
                <button className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><Phone className="w-5 h-5" /></button>
                <button className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><Video className="w-5 h-5" /></button>
                <button className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><MoreVertical className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30 dark:bg-slate-950/20 custom-scrollbar">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-3xl px-5 py-3 text-sm ${msg.isMine ? 'bg-indigo-600 text-white rounded-br-xs shadow-md shadow-indigo-500/10' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs shadow-xs border border-slate-200/50 dark:border-slate-700/60'}`}>
                    <p className="leading-relaxed font-medium">{msg.text}</p>
                    <span className={`text-[10px] font-semibold block mt-1.5 ${msg.isMine ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-800/80 shrink-0">
              <div className="flex items-center gap-3">
                <input 
                  type="text" 
                  placeholder="Xabaringizni yozing..." 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 py-3 px-5 bg-slate-100/70 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm transition-all"
                />
                <button 
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 transition-all shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-2">
            <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-medium">Xabar yuborish uchun muloqotni tanlang</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
