import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Search, Plus, Send, Phone, Video, 
  Info, ChevronLeft, MessageSquare, Image as ImageIcon
} from 'lucide-react';
import { messagingSocket as socket } from '../../api/socket';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { NewConversationModal } from '../../components/messages/NewConversationModal';


export const MessagesPage = () => {
    const { id: conversationId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [messageInput, setMessageInput] = useState('');
    const [isNewConvModalOpen, setIsNewConvModalOpen] = useState(false);
    const [isTyping, setIsTyping] = useState<any>(null);
    const [activeConversation, setActiveConversation] = useState<any>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (conversationId) {
            fetchMessages(conversationId);
            socket?.emit('join-conversation', { conversationId, userId: user?.id });
        } else {
            setMessages([]);
            setActiveConversation(null);
        }
    }, [conversationId, socket, user]);

    useEffect(() => {
        if (socket) {
            socket.on('new-message', (message: any) => {
                if (message.conversationId === conversationId) {
                    setMessages(prev => [message, ...prev]);
                    scrollToBottom();
                }
                // Refresh conversations to update last message preview
                fetchConversations();
            });

            socket.on('typing-indicator', (data: any) => {
                if (data.conversationId === conversationId) {
                    setIsTyping(data);
                    // Clear after 3 seconds of inactivity
                    const timeout = setTimeout(() => setIsTyping(null), 3000);
                    return () => clearTimeout(timeout);
                }
            });

            return () => {
                socket.off('new-message');
                socket.off('typing-indicator');
            };
        }
    }, [socket, conversationId]);

    const fetchConversations = async () => {
        try {
            const res = await api.get('/api/messages');
            setConversations(res.data);
            if (conversationId) {
                const active = res.data.find((c: any) => c.id === conversationId);
                setActiveConversation(active);
            }
        } catch (err) {
            console.error('Fetch conversations error:', err);
        }
    };

    const fetchMessages = async (id: string) => {
        try {
            const res = await api.get(`/api/messages/${id}/messages`);
            setMessages(res.data);
            scrollToBottom();
        } catch (err) {
            console.error('Fetch messages error:', err);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!messageInput.trim() || !conversationId) return;

        socket?.emit('send-message', {
            conversationId,
            senderId: user?.id,
            content: messageInput
        });

        setMessageInput('');
    };

    const handleTyping = () => {
        socket?.emit('typing', {
            conversationId,
            userId: user?.id,
            username: user?.username
        });
    };

    const filteredConversations = conversations.filter((c: any) => 
        c.otherUser?.username?.toLowerCase()?.includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-[var(--bg-primary)] pt-16 overflow-hidden">
            
            {/* Left Panel: Conversation List */}
            <div className={`w-full md:w-80 lg:w-96 border-r border-[var(--border-color)] flex flex-col bg-[var(--bg-secondary)] transition-all ${conversationId ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold font-[var(--font-syne)] uppercase tracking-tight">Messages</h1>
                        <button 
                            onClick={() => setIsNewConvModalOpen(true)}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                        <input 
                            type="text"
                            placeholder="Search chats..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/20 border border-[var(--border-color)] rounded-xl pl-10 pr-4 py-2 text-sm focus:border-red-500 outline-none transition-colors"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredConversations.map((c: any) => (
                        <div 
                            key={c.id}
                            onClick={() => navigate(`/messages/${c.id}`)}
                            className={`p-4 flex items-center gap-4 cursor-pointer transition-colors relative border-b border-[var(--border-subtle)] ${c.id === conversationId ? 'bg-red-600/10 border-r-2 border-r-red-500' : 'hover:bg-white/5'}`}
                        >
                            <div className="relative">
                                <img src={c.otherUser?.avatar || '/default-avatar.png'} className="w-12 h-12 rounded-full object-cover border border-[var(--border-color)]" alt="" />
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[var(--bg-secondary)] rounded-full" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h3 className="font-bold text-sm truncate">{c.otherUser?.username}</h3>
                                    <span className="text-[10px] text-[var(--text-secondary)]">
                                        {c.lastMessage ? formatDistanceToNow(new Date(c.lastMessage.createdAt), { addSuffix: false }) : ''}
                                    </span>
                                </div>
                                <p className="text-xs text-[var(--text-secondary)] truncate">
                                    {c.lastMessage?.senderUsername === user?.username ? 'You: ' : ''}{c.lastMessage?.content}
                                </p>
                            </div>
                            {c.unreadCount > 0 && (
                                <div className="w-2 h-2 bg-red-500 rounded-full" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel: Active Thread */}
            <div className={`flex-1 flex flex-col transition-all ${!conversationId ? 'hidden md:flex' : 'flex'}`}>
                {conversationId && activeConversation ? (
                    <>
                        {/* Thread Header */}
                        <div className="h-16 border-b border-[var(--border-color)] flex items-center justify-between px-6 bg-[var(--bg-secondary)]/50 backdrop-blur-md sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                <button onClick={() => navigate('/messages')} className="md:hidden p-2 -ml-2 hover:bg-white/5 rounded-full">
                                    <ChevronLeft size={20} />
                                </button>
                                <img src={activeConversation.otherUser?.avatar || '/default-avatar.png'} className="w-10 h-10 rounded-full border border-[var(--border-color)]" alt="" />
                                <div>
                                    <h3 className="font-bold text-sm leading-none">{activeConversation.otherUser?.username}</h3>
                                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest mt-1">Online</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-[var(--text-secondary)]">
                                <button className="p-2 hover:text-white transition-colors"><Phone size={18} /></button>
                                <button className="p-2 hover:text-white transition-colors"><Video size={18} /></button>
                                <button className="p-2 hover:text-white transition-colors"><Info size={18} /></button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col-reverse custom-scrollbar">
                            <div ref={messagesEndRef} />
                            {isTyping && (
                                <div className="text-[10px] text-[var(--text-secondary)] mt-2 italic animate-pulse">
                                    {isTyping.username} is typing...
                                </div>
                            )}
                            {messages.map((m: any) => {
                                const isOwn = m.senderId === user?.id;
                                return (
                                    <div key={m.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group animate-in fade-in slide-in-from-bottom-1`}>
                                        {!isOwn && (
                                            <img src={m.sender.avatar || '/default-avatar.png'} className="w-8 h-8 rounded-full mr-2 mt-auto" alt="" />
                                        )}
                                        <div className="max-w-[70%] space-y-1">
                                            <div className={`px-4 py-2 rounded-2xl relative ${
                                                isOwn 
                                                ? 'bg-red-600 text-white rounded-br-none' 
                                                : 'bg-[var(--bg-tertiary)] text-white rounded-bl-none border border-[var(--border-color)]'
                                            }`}>
                                                <p className="text-sm leading-relaxed">{m.content}</p>
                                            </div>
                                            <p className={`text-[10px] text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap px-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                                                {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Message Input */}
                        <div className="p-6 bg-gradient-to-t from-[var(--bg-secondary)] to-transparent">
                            <form onSubmit={handleSendMessage} className="flex gap-4 items-end glass-card p-2 rounded-2xl border border-[var(--border-color)]">
                                <button type="button" className="p-3 text-[var(--text-secondary)] hover:text-white transition-colors">
                                    <Plus size={20} />
                                </button>
                                <button type="button" className="p-3 text-[var(--text-secondary)] hover:text-white transition-colors hidden sm:block">
                                    <ImageIcon size={20} />
                                </button>
                                <textarea 
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        } else {
                                            handleTyping();
                                        }
                                    }}
                                    placeholder="Keep it NAKAMA..."
                                    className="flex-1 bg-transparent border-none outline-none py-3 px-2 resize-none text-sm min-h-[44px] max-h-32 custom-scrollbar"
                                    rows={1}
                                />
                                <button 
                                    type="submit"
                                    disabled={!messageInput.trim()}
                                    className="p-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl transition-all"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-30">
                        <div className="bg-red-600/10 p-8 rounded-full mb-6">
                            <MessageSquare size={64} className="text-red-500" />
                        </div>
                        <h2 className="text-2xl font-black font-[var(--font-syne)] uppercase tracking-tighter">Private Chamber</h2>
                        <p className="max-w-xs mt-2 text-sm">Select a conversation from the left to start coordinating with your crew.</p>
                    </div>
                )}
            </div>

            {isNewConvModalOpen && (
                <NewConversationModal 
                    onClose={() => setIsNewConvModalOpen(false)}
                    onStart={(id: string) => {
                        setIsNewConvModalOpen(false);
                        navigate(`/messages/${id}`);
                        fetchConversations();
                    }}
                />
            )}
        </div>
    );
};
