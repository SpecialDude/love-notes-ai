
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye, Heart, Lock, Clock, Gift } from 'lucide-react';
import { LetterData, ThemeType } from '../types';
import { THEMES } from '../constants';
import { incrementViewCount, toggleLike } from '../services/firebase';
import { getRandomMusicUrl } from '../utils/music';
import { getDeviceId, getLocalLikedIds, addLocalLike, removeLocalLike } from '../utils/device';
import AnimatedBackground from '../components/AnimatedBackground';
import MusicPlayer from '../components/MusicPlayer';
import confetti from 'canvas-confetti';
import { useToast } from '../components/Toast';

interface Props {
  data: LetterData;
  onBack?: () => void;
}

const ViewLetter: React.FC<Props> = ({ data, onBack }) => {
  const { showToast } = useToast();
  const [step, setStep] = useState<'CLOSED' | 'OPENING' | 'READING'>('CLOSED');
  const [musicSrc, setMusicSrc] = useState<string>('');
  const [viewCount, setViewCount] = useState(data.views || 0);
  const [likesCount, setLikesCount] = useState(data.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  
  // Time Capsule State
  const [isLocked, setIsLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, mins: number, secs: number} | null>(null);

  useEffect(() => {
    if (data?.recipientName) {
      document.title = `💌 For ${data.recipientName} | LoveNotes`;
    } else {
      document.title = "You have a new message 💌";
    }
    
    // Check Lock Status
    if (data.unlockDate) {
        const unlockTime = new Date(data.unlockDate).getTime();
        if (Date.now() < unlockTime) {
            setIsLocked(true);
            const updateTimer = () => {
                const now = Date.now();
                const diff = unlockTime - now;
                if (diff <= 0) {
                    setIsLocked(false);
                    return;
                }
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const secs = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft({ days, hours, mins, secs });
            };
            updateTimer();
            const interval = setInterval(updateTimer, 1000);
            return () => clearInterval(interval);
        }
    }
  }, [data]);

  useEffect(() => {
    if (data) {
        let src = data.musicUrl;
        if (!src) src = getRandomMusicUrl() || undefined;
        if (!src) {
            const theme = THEMES[data.theme || ThemeType.VELVET];
            src = theme.musicUrl;
        }
        if (src) setMusicSrc(src);

        if (data.id && !onBack && !isLocked) {
            incrementViewCount(data.id);
            setViewCount((v) => v + 1);
            
            // Check Like Status
            const likedSet = getLocalLikedIds();
            setIsLiked(likedSet.has(data.id));
        }
    }
  }, [data, onBack, isLocked]);

  const handleOpen = () => {
    if (isLocked) {
        showToast("This Time Capsule is still locked! 🔒", "info");
        // Shake animation triggering logic could go here
        return;
    }
    setStep('OPENING');
    setTimeout(() => fireConfetti(), 500);
    setTimeout(() => setStep('READING'), 2500);
  };

  const fireConfetti = () => {
    const themeColors = data.theme === ThemeType.NOIR ? ['#000', '#555'] : ['#ff4d4d', '#ff9a9e', '#ffd1dc'];
    const duration = 3500;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 50,
        spread: 80,
        origin: { x: 0, y: 0.8 },
        colors: themeColors,
        startVelocity: 60,
        shapes: ['circle', 'square'],
        scalar: 1.2,
      });
      confetti({
        particleCount: 5,
        angle: 130,
        spread: 80,
        origin: { x: 1, y: 0.8 },
        colors: themeColors,
        startVelocity: 60,
        shapes: ['circle', 'square'],
        scalar: 1.2,
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const handleToggleLike = async () => {
    if (!data.id) return;
    const deviceId = getDeviceId();
    
    // Optimistic Update
    if (isLiked) {
        setIsLiked(false);
        setLikesCount(p => p - 1);
        removeLocalLike(data.id);
        showToast("Oh no... 💔 Unliked", 'info');
    } else {
        setIsLiked(true);
        setLikesCount(p => p + 1);
        addLocalLike(data.id);
        
        // Button Confetti
        confetti({
            particleCount: 15,
            spread: 60,
            origin: { x: 0.5, y: 0.5 },
            colors: ['#ef4444', '#f472b6', '#ffffff'],
            scalar: 0.8
        });
    }

    // Server Sync
    const success = await toggleLike(data.id, deviceId);
    if (!success) {
        // Revert
        setIsLiked(!isLiked);
        setLikesCount(p => isLiked ? p + 1 : p - 1);
    }
  };

  const theme = THEMES[data.theme || ThemeType.VELVET];
  const isWinter = data.theme === ThemeType.WINTER;

  return (
    <div className={`min-h-screen relative overflow-hidden flex flex-col items-center justify-center ${theme.bgGradient}`}>
      <AnimatedBackground theme={data.theme} />
      {musicSrc && <MusicPlayer src={musicSrc} autoPlay={true} />}

      <div className="fixed top-6 left-6 z-50 flex gap-2">
          {onBack ? (
            <button onClick={onBack} className="flex items-center gap-2 px-4 py-2 bg-black/20 backdrop-blur-md border border-white/20 rounded-full shadow-lg text-white font-bold hover:bg-black/40 transition-all">
                <ArrowLeft size={18} /> Back to Editor
            </button>
          ) : (
            <a href="/" className="flex items-center gap-2 px-4 py-2 bg-black/20 backdrop-blur-md border border-white/20 rounded-full shadow-lg text-white font-bold hover:bg-black/40 transition-all text-xs uppercase tracking-wide">
                <ArrowLeft size={16} /> Create
            </a>
          )}
      </div>

      {step === 'READING' && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-2">
               {/* Like Button */}
               {data.id && !onBack && (
                  <motion.button 
                    whileTap={{ scale: 0.8 }}
                    onClick={handleToggleLike}
                    className={`
                        flex items-center gap-2 px-3 py-1 backdrop-blur-sm rounded-full text-xs border shadow-lg transition-all
                        ${isLiked ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-black/20 border-white/20 text-white/70 hover:bg-white/10'}
                    `}
                  >
                      <Heart size={14} className={isLiked ? 'fill-red-500' : ''} />
                      {likesCount}
                  </motion.button>
               )}
               
               <div className="flex items-center gap-2 px-3 py-1 bg-black/20 backdrop-blur-sm rounded-full text-white/70 text-xs border border-white/10">
                  <Eye size={14} /> {viewCount}
              </div>
          </div>
      )}

      <div className="relative w-full max-w-4xl h-[80vh] flex items-center justify-center perspective-1000">
        <AnimatePresence mode="wait">
            {step !== 'READING' && (
                <motion.div
                    key="closed-container"
                    initial={{ scale: 0.8, opacity: 0, y: 100 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 1.5, opacity: 0, y: 200, transition: { duration: 0.8 } }}
                    className="relative w-[340px] md:w-[450px] cursor-pointer"
                    onClick={handleOpen}
                >
                    {isLocked ? (
                         // LOCKED STATE
                         <div className="flex flex-col items-center">
                            <motion.div 
                                animate={{ rotate: [0, -5, 5, -5, 5, 0] }}
                                transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
                                className="bg-black/40 backdrop-blur-xl border border-white/20 p-8 rounded-3xl text-center shadow-2xl"
                            >
                                <Lock size={48} className="text-white mx-auto mb-4" />
                                <h2 className="text-2xl font-cinematic text-white mb-2">Time Capsule</h2>
                                <p className="text-white/60 text-sm mb-6">This message is locked until {new Date(data.unlockDate!).toLocaleDateString()}</p>
                                
                                {timeLeft && (
                                    <div className="grid grid-cols-4 gap-4 text-white">
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-bold font-mono">{timeLeft.days}</span>
                                            <span className="text-[10px] uppercase opacity-50">Days</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-bold font-mono">{timeLeft.hours}</span>
                                            <span className="text-[10px] uppercase opacity-50">Hrs</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-bold font-mono">{timeLeft.mins}</span>
                                            <span className="text-[10px] uppercase opacity-50">Mins</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-bold font-mono">{timeLeft.secs}</span>
                                            <span className="text-[10px] uppercase opacity-50">Secs</span>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                         </div>
                    ) : isWinter ? (
                        // WINTER THEME GIFT BOX
                         <div className="relative w-[280px] h-[280px] md:w-[320px] md:h-[320px] flex items-center justify-center">
                            {/* Box Body */}
                            <div className="absolute inset-x-0 bottom-0 h-[240px] bg-red-700 rounded-lg shadow-2xl flex items-center justify-center z-10 border border-white/10">
                                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-16 bg-red-900/50" />
                                <Gift size={64} className="text-white/20" />
                            </div>
                            
                            {/* Box Lid (Animates Off) */}
                            <motion.div 
                                animate={step === 'OPENING' ? { y: -300, rotate: -10, opacity: 0 } : { y: 0 }}
                                transition={{ duration: 1, ease: 'easeInOut' }}
                                className="absolute top-0 inset-x-[-10px] h-[60px] bg-red-800 rounded-lg shadow-xl z-20 border-b-4 border-black/20"
                            >
                                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-16 bg-yellow-400 shadow-sm" />
                                {/* Bow */}
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-32 h-16">
                                     <div className="absolute left-0 w-16 h-16 rounded-full border-[8px] border-yellow-400 rotate-45 rounded-tl-none border-b-transparent border-r-transparent" />
                                     <div className="absolute right-0 w-16 h-16 rounded-full border-[8px] border-yellow-400 -rotate-45 rounded-tr-none border-b-transparent border-l-transparent" />
                                     <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-yellow-400 rounded-full shadow-md" />
                                </div>
                            </motion.div>
                            
                            <p className="absolute -bottom-12 w-full text-center text-white/70 animate-pulse text-sm">Tap to Unwrap</p>
                         </div>
                    ) : (
                        // STANDARD ENVELOPE
                        <div className={`relative h-[240px] md:h-[300px] ${theme.envelopeColor} rounded-b-xl shadow-2xl flex flex-col items-center justify-center z-20`}>
                            <motion.div 
                                className={`absolute w-[90%] h-[90%] ${theme.paperColor} rounded-lg shadow-md z-10 flex flex-col p-6 items-center`}
                                initial={{ y: 0 }}
                                animate={step === 'OPENING' ? { y: -200, zIndex: 0 } : { y: 0 }}
                                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
                            >
                                <div className="w-full h-full opacity-30 overflow-hidden text-[6px] md:text-[8px] leading-relaxed select-none">
                                    {data.content}
                                </div>
                            </motion.div>
                            <div className={`absolute inset-0 z-30 pointer-events-none rounded-b-xl border-t border-white/10 ${theme.envelopeColor}`} 
                                style={{ clipPath: 'polygon(0 0, 50% 40%, 100% 0, 100% 100%, 0 100%)' }}>
                            </div>
                            <div className="absolute bottom-10 z-40 text-white/90 text-center font-elegant">
                                <p className="text-xs uppercase tracking-widest opacity-60 mb-1">For</p>
                                <h2 className="text-2xl italic font-serif">{data.recipientName}</h2>
                            </div>
                            
                            {/* Envelope Flap */}
                            <motion.div
                                className={`absolute top-[-1px] left-0 w-full h-[120px] md:h-[150px] ${theme.envelopeColor} z-30 rounded-t-xl origin-top border-b border-black/10`}
                                style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)', backfaceVisibility: 'visible' }}
                                initial={{ rotateX: 0 }}
                                animate={step === 'OPENING' ? { rotateX: 180, zIndex: 0 } : { rotateX: 0 }}
                                transition={{ duration: 0.6, ease: "easeInOut" }}
                            >
                                <motion.div 
                                    animate={step === 'OPENING' ? { opacity: 0 } : { opacity: 1 }}
                                    className="absolute top-[90%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-red-800 rounded-full border-2 border-red-900 shadow-md flex items-center justify-center text-[8px] text-red-200 font-bold"
                                >
                                    LOVE
                                </motion.div>
                            </motion.div>
                            
                            <p className="absolute -bottom-12 w-full text-center text-white/70 animate-pulse text-sm">Tap to Open</p>
                        </div>
                    )}
                </motion.div>
            )}

            {step === 'READING' && (
                <motion.div 
                    key="letter-full"
                    initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="relative z-50 w-full max-w-2xl px-4 flex justify-center"
                >
                    <div className={`relative ${theme.paperColor} p-8 md:p-12 w-full max-h-[80vh] overflow-y-auto custom-scrollbar shadow-[0_0_50px_rgba(0,0,0,0.5)] ${theme.textColor} paper-texture flex flex-col rounded-sm`}>
                        <div className="sticky top-0 left-0 right-0 h-0 flex justify-center z-10">
                            <div className="relative -top-10 w-32 h-8 bg-white/30 backdrop-blur-sm rotate-1 shadow-sm transform" />
                        </div>
                        <div className="flex-1 flex flex-col">
                            <div className="mb-8 opacity-60 text-xs font-serif uppercase tracking-widest text-center border-b border-current pb-4 shrink-0">
                                {new Date(data.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                            <h1 className={`text-4xl md:text-5xl mb-8 ${theme.fontFamily} font-bold shrink-0`}>My Dearest {data.recipientName},</h1>
                            <div className={`text-lg md:text-2xl leading-relaxed whitespace-pre-wrap ${theme.fontFamily} opacity-90`}>{data.content}</div>
                            <div className="mt-12 pt-8 text-right shrink-0">
                                <p className="text-sm opacity-60 mb-2 font-serif italic">Yours truly,</p>
                                <p className={`text-3xl md:text-5xl ${theme.fontFamily} font-bold transform -rotate-2 inline-block`}>{data.senderName}</p>
                            </div>
                            {!onBack && (
                                <div className="mt-12 pt-8 border-t border-black/10 text-center shrink-0">
                                    <a href="/" className="inline-block px-8 py-3 bg-black/5 hover:bg-black/10 text-current rounded-full font-bold transition-all text-sm uppercase tracking-widest">Write Your Own</a>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ViewLetter;
