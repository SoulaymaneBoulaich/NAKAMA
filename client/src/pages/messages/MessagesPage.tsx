import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Search, Plus, Send, Phone, Video, 
  Info, ChevronLeft, MessageSquare, Image as ImageIcon,
  Smile, X, Mic, BarChart3
} from 'lucide-react';
import { messagingSocket as socket } from '../../api/socket';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { NewConversationModal } from '../../components/messages/NewConversationModal';
import { Avatar } from '../../components/common/Avatar';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { CallModal } from '../../components/messages/CallModal';
import { PollCreationModal } from './PollCreationModal';
import { PollMessage } from './PollMessage';

export const MessagesPage = () => {
    const { id: conversationId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [conversations, setConversations] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [messageInput, setMessageInput] = useState('');
    const [isNewConvModalOpen, setIsNewConvModalOpen] = useState(false);
    const [isPollModalOpen, setIsPollModalOpen] = useState(false);
    const [isTyping, setIsTyping] = useState<any>(null);
    const activeConversation = conversations.find((c: any) => c.id === conversationId) || null;
    
    // Feature States
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showAttachMenu, setShowAttachMenu] = useState(false);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [messageSearchQuery, setMessageSearchQuery] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [pendingMedia, setPendingMedia] = useState<{ file: File, previewUrl: string } | null>(null);

    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<BlobPart[]>([]);

    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const attachMenuRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Call State
    const [callState, setCallState] = useState({
        isOpen: false,
        isReceiving: false,
        callerName: '',
        callerId: '',
        isVideo: false,
    });
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
            if (attachMenuRef.current && !attachMenuRef.current.contains(event.target as Node)) {
                setShowAttachMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        socket.connect();
        fetchConversations();
        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (conversationId) {
            fetchMessages(conversationId);
            socket?.emit('join-conversation', { conversationId, userId: user?.id });
        } else {
            setMessages([]);
        }
    }, [conversationId, socket, user]);

    useEffect(() => {
        if (!socket || !conversationId) return;

        socket.on('new-message', (msg: any) => {
            setMessages((prev: any) => [msg, ...prev]);
            setIsTyping(null);
            fetchConversations();
            scrollToBottom();
        });

        socket.on('typing-indicator', ({ username }: any) => {
            setIsTyping({ username });
            setTimeout(() => setIsTyping(null), 3000);
        });

        socket.on('message-updated', ({ messageId, content }: any) => {
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content } : m));
        });

        // WebRTC Socket Listeners
        socket.on('call-made', async (data: any) => {
            setCallState({
                isOpen: true,
                isReceiving: true,
                callerName: data.callerName || 'Unknown',
                callerId: data.callerId,
                isVideo: data.isVideo
            });
            peerConnectionRef.current = setupPeerConnection();
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
        });

        socket.on('answer-made', async (data: any) => {
            if (peerConnectionRef.current) {
                await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
            }
        });

        socket.on('ice-candidate', (data: any) => {
            if (peerConnectionRef.current && data.senderId !== user?.id) {
                peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        });

        socket.on('call-ended', () => endCall());
        socket.on('call-rejected', () => endCall());

        return () => {
            socket.off('new-message');
            socket.off('typing-indicator');
            socket.off('call-made');
            socket.off('answer-made');
            socket.off('ice-candidate');
            socket.off('call-ended');
            socket.off('call-rejected');
            socket.off('message-updated');
        };
    }, [conversationId, socket, user?.id]);

    const setupPeerConnection = () => {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket?.emit('ice-candidate', {
                    conversationId,
                    senderId: user?.id,
                    candidate: event.candidate
                });
            }
        };

        pc.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
        };

        return pc;
    };

    const startCall = async (isVideo: boolean) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: isVideo, audio: true });
            setLocalStream(stream);
            localStreamRef.current = stream;
            
            const pc = setupPeerConnection();
            peerConnectionRef.current = pc;
            
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            setCallState({
                isOpen: true,
                isReceiving: false,
                callerName: activeConversation?.otherUser?.username || '',
                callerId: activeConversation?.otherUser?.id || '',
                isVideo
            });

            socket?.emit('call-user', {
                conversationId,
                callerId: user?.id,
                callerName: user?.username,
                offer,
                isVideo
            });
        } catch (error) {
            console.error('Failed to start call', error);
        }
    };

    const acceptCall = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: callState.isVideo, audio: true });
            setLocalStream(stream);
            localStreamRef.current = stream;

            const pc = peerConnectionRef.current;
            if (!pc) return;

            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            setCallState(prev => ({ ...prev, isReceiving: false }));

            socket?.emit('make-answer', {
                conversationId,
                answer,
                answererId: user?.id
            });
        } catch (error) {
            console.error('Failed to accept call', error);
        }
    };

    const rejectCall = () => {
        socket?.emit('reject-call', { conversationId, rejectedBy: user?.id });
        endCall();
    };

    const endCall = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
            setLocalStream(null);
        }
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        setRemoteStream(null);
        setCallState(prev => ({ ...prev, isOpen: false, isReceiving: false }));
    };

    const handleEndCallAction = () => {
        socket?.emit('end-call', { conversationId, endedBy: user?.id });
        endCall();
    };

    const fetchConversations = async () => {
        try {
            const res = await api.get('/messages');
            
            const mockConvo = {
                id: 'mock-123',
                otherUser: { id: 'user-999', username: 'Luffy_PirateKing', avatar: '' },
                messages: [{ content: 'Yo! I\'m Luffy!' }],
                updatedAt: new Date().toISOString()
            };
            const updatedConvos = [mockConvo, ...res.data];
            setConversations(updatedConvos);

            if (conversationId) {
                // Derived variable handles activeConversation now
            }
        } catch (err) {
            console.error('Fetch conversations error:', err);
        }
    };

    const fetchMessages = async (id: string) => {
        try {
            if (id === 'mock-123') {
                setMessages([{
                    id: 'mock-initial',
                    senderId: 'user-999',
                    content: 'Yo! I\'m Luffy! Tell me about yourself!',
                    createdAt: new Date().toISOString(),
                    sender: { id: 'user-999', username: 'Luffy_PirateKing', avatar: '' }
                }]);
                scrollToBottom();
                return;
            }
            const res = await api.get(`/messages/${id}/messages`);
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

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if ((!messageInput.trim() && !pendingMedia) || !conversationId) return;

        if (pendingMedia) {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', pendingMedia.file);

            try {
                const isVideo = pendingMedia.file.type.startsWith('video/');
                const endpoint = isVideo ? '/upload/video' : '/upload/image';
                
                const response = await api.postForm(endpoint, { file: pendingMedia.file }, {
                    timeout: 60000 // 60 seconds for large media uploads
                });
                const mediaUrl = response.data.url;
                
                socket?.emit('send-message', {
                    conversationId,
                    senderId: user?.id,
                    content: `[${isVideo ? 'VIDEO' : 'IMAGE'}]${mediaUrl}`
                });
            } catch (err: any) {
                console.error('Failed to upload media', err);
                const errorMsg = err.response?.data?.error || err.message || 'Unknown error';
                alert(`Failed to upload media: ${errorMsg}`);
            } finally {
                setIsUploading(false);
            }
            URL.revokeObjectURL(pendingMedia.previewUrl);
            setPendingMedia(null);
        }

        if (messageInput.trim()) {
            socket?.emit('send-message', {
                conversationId,
                senderId: user?.id,
                content: messageInput.trim()
            });
            setMessageInput('');
        }
    };

    const handleCreatePoll = (pollData: any) => {
        if (!conversationId) return;
        socket?.emit('send-message', {
            conversationId,
            senderId: user?.id,
            content: '[POLL]' + JSON.stringify(pollData)
        });
    };

    const handleVotePoll = (messageId: string, optionIndex: number) => {
        if (!conversationId) return;
        
        // Optimistic update for mock
        if (conversationId === 'mock-123') {
            setMessages(prev => prev.map(m => {
                if (m.id === messageId && m.content.startsWith('[POLL]')) {
                    const data = JSON.parse(m.content.replace('[POLL]', ''));
                    const option = data.options[optionIndex];
                    if (option.votes.includes(user?.id)) {
                        option.votes = option.votes.filter((id: string) => id !== user?.id);
                    } else {
                        data.options.forEach((o: any) => o.votes = o.votes.filter((id: string) => id !== user?.id));
                        option.votes.push(user?.id);
                    }
                    return { ...m, content: '[POLL]' + JSON.stringify(data) };
                }
                return m;
            }));
            return;
        }

        socket?.emit('vote-poll', {
            conversationId,
            messageId,
            userId: user?.id,
            optionIndex
        });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !conversationId) return;

        const previewUrl = URL.createObjectURL(file);
        setPendingMedia({ file, previewUrl });
        
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleToggleRecording = async () => {
        if (isRecording && mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];
            
            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    const base64Audio = reader.result as string;
                    socket?.emit('send-message', {
                        conversationId,
                        senderId: user?.id,
                        content: `[AUDIO]${base64Audio}`
                    });
                };
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Microphone access denied', error);
        }
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
                                <Avatar 
                                    src={c.otherUser?.avatar} 
                                    username={c.otherUser?.username} 
                                    size="lg"
                                />
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
                                    {c.lastMessage?.senderUsername === user?.username ? 'You: ' : ''}
                                    {c.lastMessage?.content?.startsWith('[IMAGE]') ? '📷 Photo' : 
                                     c.lastMessage?.content?.startsWith('[VIDEO]') ? '🎥 Video' : 
                                     c.lastMessage?.content?.startsWith('[AUDIO]') ? '🎤 Voice message' : 
                                     c.lastMessage?.content?.startsWith('[POLL]') ? '📊 Poll' : 
                                     c.lastMessage?.content}
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
                                <Avatar 
                                    src={activeConversation.otherUser?.avatar} 
                                    username={activeConversation.otherUser?.username} 
                                    size="md"
                                />
                                <div>
                                    <h3 className="font-bold text-sm leading-none">{activeConversation.otherUser?.username}</h3>
                                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest mt-1">Online</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-[var(--text-secondary)]">
                                <button onClick={() => setIsSearchActive(!isSearchActive)} className={`p-2 hover:text-white transition-colors ${isSearchActive ? 'text-red-500' : ''}`}><Search size={18} /></button>
                                <button onClick={() => startCall(false)} className="p-2 hover:text-white transition-colors"><Phone size={18} /></button>
                                <button onClick={() => startCall(true)} className="p-2 hover:text-white transition-colors"><Video size={18} /></button>
                                <button onClick={() => navigate(`/profile/${activeConversation.otherUser?.username}`)} className="p-2 hover:text-white transition-colors"><Info size={18} /></button>
                            </div>
                        </div>

                        {/* Search Bar for Thread */}
                        {isSearchActive && (
                            <div className="p-3 bg-black/20 border-b border-[var(--border-color)]">
                                <div className="relative max-w-md mx-auto">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
                                    <input 
                                        autoFocus
                                        type="text"
                                        placeholder="Search messages..."
                                        value={messageSearchQuery}
                                        onChange={(e) => setMessageSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-9 h-9 bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded-xl text-sm focus:outline-none focus:border-red-500"
                                    />
                                    {messageSearchQuery && (
                                        <button 
                                            onClick={() => setMessageSearchQuery('')} 
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-white"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col-reverse custom-scrollbar">
                            <div ref={messagesEndRef} />
                            {isTyping && (
                                <div className="text-[10px] text-[var(--text-secondary)] mt-2 italic animate-pulse">
                                    {isTyping.username} is typing...
                                </div>
                            )}
                            {(messages.filter(m => m.content?.toLowerCase().includes(messageSearchQuery.toLowerCase()))).map((m: any) => {
                                const isOwn = m.senderId === user?.id;
                                return (
                                    <div key={m.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4 group animate-in fade-in slide-in-from-bottom-1`}>
                                        {!isOwn && (
                                            <Avatar 
                                                src={m.sender.avatar} 
                                                username={m.sender.username} 
                                                size="sm"
                                                className="mr-2 mt-auto"
                                            />
                                        )}
                                        <div className="max-w-[70%] space-y-1">
                                            <div className={`px-4 py-2 rounded-2xl relative ${
                                                isOwn 
                                                ? 'bg-red-600 text-white rounded-br-none' 
                                                : 'bg-[var(--bg-tertiary)] text-white rounded-bl-none border border-[var(--border-color)]'
                                            } ${m.content.startsWith('[IMAGE]') || m.content.startsWith('[VIDEO]') || m.content.startsWith('[AUDIO]') ? 'p-1 bg-transparent border-none' : ''}`}>
                                                {m.content.startsWith('[IMAGE]') ? (
                                                    <img src={m.content.replace('[IMAGE]', '')} alt="Attachment" className="max-w-full rounded-xl max-h-64 object-cover" />
                                                ) : m.content.startsWith('[VIDEO]') ? (
                                                    <video src={m.content.replace('[VIDEO]', '')} controls className="max-w-full rounded-xl max-h-64 object-cover" />
                                                ) : m.content.startsWith('[AUDIO]') ? (
                                                    <audio controls src={m.content.replace('[AUDIO]', '')} className="max-w-[240px] h-10" />
                                                ) : m.content.startsWith('[POLL]') ? (
                                                    <PollMessage 
                                                        pollData={JSON.parse(m.content.replace('[POLL]', ''))} 
                                                        currentUserId={user?.id}
                                                        isOwn={isOwn}
                                                        onVote={(idx) => handleVotePoll(m.id, idx)}
                                                    />
                                                ) : (
                                                    <p className="text-sm leading-relaxed">{m.content}</p>
                                                )}
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
                        <div className="p-6 bg-gradient-to-t from-[var(--bg-secondary)] to-transparent flex flex-col gap-2">
                            {pendingMedia && (
                                <div className="relative inline-block w-fit bg-black/40 p-2 rounded-xl border border-[var(--border-color)] ml-14">
                                    {pendingMedia.file.type.startsWith('video/') ? (
                                        <video src={pendingMedia.previewUrl} className="max-h-48 rounded-lg object-cover" controls />
                                    ) : (
                                        <img src={pendingMedia.previewUrl} className="max-h-48 rounded-lg object-cover" />
                                    )}
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            URL.revokeObjectURL(pendingMedia.previewUrl);
                                            setPendingMedia(null);
                                        }} 
                                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-lg hover:bg-red-500 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                            <form onSubmit={handleSendMessage} className="flex gap-4 items-end glass-card p-2 rounded-2xl border border-[var(--border-color)] relative">
                                <div className="relative" ref={attachMenuRef}>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowAttachMenu(!showAttachMenu)}
                                        className="p-3 text-[var(--text-secondary)] hover:text-white transition-colors"
                                    >
                                        <Plus size={20} />
                                    </button>
                                    
                                    {showAttachMenu && (
                                        <div className="absolute bottom-full left-0 mb-2 w-48 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col">
                                            <button 
                                                type="button"
                                                disabled={isUploading}
                                                onClick={() => { fileInputRef.current?.click(); setShowAttachMenu(false); }}
                                                className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-sm transition-colors text-left disabled:opacity-50"
                                            >
                                                <ImageIcon size={16} className="text-blue-400" />
                                                <span>Photo & Video</span>
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => { setIsPollModalOpen(true); setShowAttachMenu(false); }}
                                                className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-sm transition-colors text-left"
                                            >
                                                <BarChart3 size={16} className="text-green-400" />
                                                <span>Create Poll</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <input 
                                    type="file" 
                                    accept="image/*,video/*" 
                                    className="hidden" 
                                    ref={fileInputRef} 
                                    onChange={handleImageUpload} 
                                />
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
                                <div className="relative">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className="p-3 text-[var(--text-secondary)] hover:text-white transition-colors"
                                    >
                                        <Smile size={20} />
                                    </button>
                                    {showEmojiPicker && (
                                        <div ref={emojiPickerRef} className="absolute bottom-full right-0 mb-2 z-50 shadow-2xl rounded-xl overflow-hidden border border-white/10">
                                            <EmojiPicker 
                                                theme={Theme.DARK} 
                                                onEmojiClick={(emojiData) => {
                                                    setMessageInput(prev => prev + emojiData.emoji);
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    <button 
                                        type="button" 
                                        onClick={handleToggleRecording}
                                        className={`p-3 transition-colors rounded-xl ${isRecording ? 'text-red-500 bg-red-500/10 animate-pulse' : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'}`}
                                        title={isRecording ? 'Stop Recording' : 'Record Voice Message'}
                                    >
                                        <Mic size={20} />
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={(!messageInput.trim() && !pendingMedia) || isUploading}
                                        className="p-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl transition-all"
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
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

            <CallModal 
                isOpen={callState.isOpen}
                isReceiving={callState.isReceiving}
                callerName={callState.callerName}
                isVideo={callState.isVideo}
                localStream={localStream}
                remoteStream={remoteStream}
                onAccept={acceptCall}
                onReject={rejectCall}
                onEndCall={handleEndCallAction}
                onToggleVideo={() => {
                    if (localStream) {
                        localStream.getVideoTracks().forEach(track => {
                            track.enabled = !track.enabled;
                        });
                    }
                }}
                onToggleAudio={() => {
                    if (localStream) {
                        localStream.getAudioTracks().forEach(track => {
                            track.enabled = !track.enabled;
                        });
                    }
                }}
            />

            <PollCreationModal 
                isOpen={isPollModalOpen}
                onClose={() => setIsPollModalOpen(false)}
                onSubmit={handleCreatePoll}
            />
        </div>
    );
};
