import React, { useEffect, useRef, useState } from 'react';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, X } from 'lucide-react';

interface CallModalProps {
    isOpen: boolean;
    isReceiving: boolean;
    callerName?: string;
    isVideo: boolean;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    onAccept: () => void;
    onReject: () => void;
    onEndCall: () => void;
    onToggleVideo: () => void;
    onToggleAudio: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({
    isOpen,
    isReceiving,
    callerName,
    isVideo,
    localStream,
    remoteStream,
    onAccept,
    onReject,
    onEndCall,
    onToggleVideo,
    onToggleAudio
}) => {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const backgroundLocalVideoRef = useRef<HTMLVideoElement>(null);

    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(!isVideo);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setIsVideoOff(!isVideo);
            setIsMuted(false);
        }
    }, [isOpen, isVideo]);

    // Synthetic Ringtone Generator
    useEffect(() => {
        const isRinging = isOpen && !remoteStream;
        if (!isRinging) return;

        let audioCtx: AudioContext | null = null;
        let interval: NodeJS.Timeout;

        try {
            audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const playTone = () => {
                if (!audioCtx) return;
                const osc1 = audioCtx.createOscillator();
                const osc2 = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();

                osc1.type = 'sine';
                osc2.type = 'sine';
                osc1.frequency.value = 440;
                osc2.frequency.value = 480;

                osc1.connect(gainNode);
                osc2.connect(gainNode);
                gainNode.connect(audioCtx.destination);

                gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime + 1.9);
                gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 2.0);

                osc1.start(audioCtx.currentTime);
                osc2.start(audioCtx.currentTime);
                osc1.stop(audioCtx.currentTime + 2.0);
                osc2.stop(audioCtx.currentTime + 2.0);
            };

            playTone();
            interval = setInterval(playTone, 4000);
        } catch (e) {
            console.error("Audio API not supported or blocked");
        }

        return () => {
            if (interval) clearInterval(interval);
            if (audioCtx && audioCtx.state !== 'closed') audioCtx.close();
        };
    }, [isOpen, remoteStream]);

    useEffect(() => {
        if (localStream) {
            if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
            if (backgroundLocalVideoRef.current) backgroundLocalVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    if (!isOpen) return null;

    const handleToggleMute = () => {
        setIsMuted(!isMuted);
        onToggleAudio();
    };

    const handleToggleVideo = () => {
        setIsVideoOff(!isVideoOff);
        onToggleVideo();
    };

    if (isReceiving && !remoteStream && !localStream) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="glass-card w-full max-w-sm rounded-3xl border border-[var(--border-color)] overflow-hidden flex flex-col items-center justify-center p-8 animate-in zoom-in-95">
                    <div className="w-24 h-24 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mb-6 animate-pulse">
                        <Phone size={40} className="text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold font-[var(--font-syne)] mb-2">{callerName}</h2>
                    <p className="text-[var(--text-secondary)] mb-8">Incoming {isVideo ? 'video' : 'voice'} call...</p>
                    
                    <div className="flex gap-6">
                        <button onClick={onReject} className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all">
                            <PhoneOff size={24} className="text-white" />
                        </button>
                        <button onClick={onAccept} className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-all animate-bounce">
                            {isVideo ? <Video size={24} className="text-white" /> : <Phone size={24} className="text-white" />}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
            <div className="w-full h-full relative flex flex-col items-center justify-center overflow-hidden">
                {/* Background Video */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {remoteStream && isVideo ? (
                        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    ) : !remoteStream && isVideo && localStream && !isVideoOff ? (
                        <video ref={backgroundLocalVideoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-90" />
                    ) : null}
                    
                    {(!remoteStream || (!isVideo && remoteStream)) && (
                        <div className="absolute flex flex-col items-center z-10 bg-black/40 p-12 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl">
                            <div className="w-32 h-32 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center mb-6 shadow-2xl border-4 border-white/20">
                                <span className="text-5xl font-bold text-white uppercase">{callerName?.charAt(0) || '?'}</span>
                            </div>
                            <h2 className="text-3xl font-bold font-[var(--font-syne)] text-white shadow-black drop-shadow-md tracking-tight">{callerName}</h2>
                            <p className="text-white/80 mt-3 font-medium px-6 py-2 rounded-full border border-white/10 bg-white/5 uppercase text-sm tracking-widest animate-pulse">
                                {!remoteStream ? 'Calling...' : 'Connected'}
                            </p>
                            {remoteStream && <audio ref={remoteVideoRef} autoPlay />}
                        </div>
                    )}
                </div>

                {/* Local Video Picture-in-Picture */}
                {isVideo && localStream && !isVideoOff && remoteStream && (
                    <div className="absolute top-8 right-8 w-48 h-64 bg-black rounded-2xl overflow-hidden border-2 border-[var(--border-color)] shadow-2xl z-20 transition-all duration-500">
                        <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    </div>
                )}

                {/* Controls */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-6 glass-card px-8 py-4 rounded-full border border-[var(--border-color)] z-10">
                    <button 
                        onClick={handleToggleMute}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-600/20 text-red-500' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    >
                        {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                    
                    <button 
                        onClick={onEndCall}
                        className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition-all mx-2"
                    >
                        <PhoneOff size={24} className="text-white" />
                    </button>

                    {isVideo && (
                        <button 
                            onClick={handleToggleVideo}
                            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isVideoOff ? 'bg-red-600/20 text-red-500' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                            {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
