
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye, Heart, Timer, Gift, Lock } from 'lucide-react';
import { LetterData, ThemeType, ThemeCategory } from '../types';
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

// --- STANDARD ENVELOPE COMPONENT (UNTOUCHED / PERFECTED) ---
const StandardEnvelope: React.FC<{ data: LetterData, onOpen: () => void, step: string }> = ({ data, onOpen, step }) => {
    const theme = THEMES[data.theme || ThemeType.VELVET];
    
    return (
        <motion.div
            key="envelope-group"
            initial={{ scale: 0.8, opacity: 0, y: 100 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.5, opacity: 0, y: 200, transition: { duration: 0.8 } }}
            className="relative w-[340px] md:w-[450px] cursor-pointer"
            onClick={step === 'CLOSED' ? onOpen : undefined}
        >
            {/* The Envelope Body */}
            <div className={`relative h-[240px] md:h-[300px] ${theme.envelopeColor} rounded-b-xl shadow-2xl flex flex-col items-center justify-center z-20`}>
                
                {/* The Letter Inside (Starts small and tucked in) */}
                <motion.div 
                    className={`absolute w-[90%] h-[180px] ${theme.paperColor} rounded-lg shadow-md z-15 flex flex-col p-4 items-center`}
                    initial={{ y: 0, scale: 0.9 }}
                    animate={step === 'OPENING' ? { 
                        y: -300, 
                        scale: 1,
                        boxShadow: "0 0 50px rgba(255,255,255,0.6)"
                    } : { y: 0, scale: 0.9 }}
                    transition={{ duration: 1.5, ease: "easeInOut", delay: 0.8 }}
                >
                     <div className="w-full h-full opacity-40 overflow-hidden text-[6px] md:text-[8px] leading-relaxed select-none">
                        {data.content}
                     </div>
                </motion.div>

                {/* The Front Pocket (Covers the bottom half of letter) */}
                <div className={`absolute inset-0 z-30 pointer-events-none rounded-b-xl border-t border-white/10 ${theme.envelopeColor}`} 
                     style={{ clipPath: 'polygon(0 0, 50% 40%, 100% 0, 100% 100%, 0 100%)' }}>
                </div>

                {/* Front Text */}
                <div className="absolute bottom-10 z-30 text-white/90 text-center font-elegant pointer-events-none">
                     <p className="text-xs uppercase tracking-widest opacity-60 mb-1">For</p>
                     <h2 className="text-2xl italic font-serif">{data.recipientName}</h2>
                </div>
            </div>

            {/* The Flap (Opens first) */}
            <motion.div
                className={`absolute top-0 left-0 w-full h-[120px] md:h-[150px] ${theme.envelopeColor} z-40 rounded-t-xl origin-top border-b border-black/10`}
                style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)', backfaceVisibility: 'visible' }}
                initial={{ rotateX: 0 }}
                animate={step === 'OPENING' ? { rotateX: 180, zIndex: 1 } : { rotateX: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
            >
                <motion.div 
                    animate={step === 'OPENING' ? { opacity: 0 } : { opacity: 1 }}
                    className="absolute top-[90%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-red-800 rounded-full border-2 border-red-900 shadow-md flex items-center justify-center text-[8px] text-red-200 font-bold"
                >
                    LOVE
                </motion.div>
            </motion.div>

            {/* Tap Hint */}
            {step === 'CLOSED' && (
                <p className="absolute -bottom-12 w-full text-center text-white/70 animate-pulse text-sm">Tap to Open</p>
            )}
        </motion.div>
    );
};

// --- HOLIDAY GIFT BOX COMPONENT (RESTORED PREMIUM VERSION) ---
const HolidayGiftBox: React.FC<{ data: LetterData, onOpen: () => void, step: string }> = ({ data, onOpen, step }) => {
    const theme = THEMES[data.theme || ThemeType.WINTER];

    // Cinematic Animation Sequence
    // 1. Ribbons untie (0-1.5s)
    // 2. Lid opens (1.5s-2.5s)
    // 3. Letter rises (2.5s-4.0s)

    const ribbonVariants = {
        closed: { scale: 1, opacity: 1 },
        opening: { scale: 1.5, opacity: 0, transition: { duration: 1.5, ease: "easeOut" } }
    };

    const lidVariants = {
        closed: { y: 0, rotateX: 0 },
        opening: { 
            y: -120, 
            rotateX: -180, 
            transition: { duration: 1.2, delay: 1.6, ease: "backIn" } 
        }
    };

    const letterVariants = {
        closed: { y: 20, opacity: 0 }, // Starts hidden inside
        opening: { 
            y: -280, 
            opacity: 1, 
            scale: 1.1,
            boxShadow: "0 0 40px rgba(255, 215, 0, 0.6)", // Gold Glow
            transition: { duration: 2.0, delay: 2.8, ease: "easeOut" } 
        }
    };

    return (
        <motion.div
            key="gift-box"
            className="relative w-[300px] h-[220px] cursor-pointer perspective-1000"
            onClick={step === 'CLOSED' ? onOpen : undefined}
            exit={{ scale: 1.5, opacity: 0, y: 100, transition: { duration: 0.8 } }}
        >
             {/* Rising Letter (Behind Box Front, Inside Box) */}
             <div className="absolute inset-0 flex justify-center items-center z-10">
                <motion.div 
                    className={`w-[85%] h-[180px] ${theme.paperColor} rounded shadow-lg p-6 flex flex-col items-center justify-start`}
                    variants={letterVariants}
                    initial="closed"
                    animate={step === 'OPENING' ? "opening" : "closed"}
                >
                     <div className="w-full text-[6px] text-center opacity-60 overflow-hidden leading-relaxed font-serif">
                        {data.content}
                     </div>
                </motion.div>
             </div>

            {/* Box Body (Front Face) */}
            <div className={`absolute bottom-0 w-full h-[220px] ${theme.envelopeColor} rounded-lg shadow-2xl z-20 flex items-center justify-center transform-style-3d`}>
                 <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-lg pointer-events-none"></div>
                 
                 {/* Vertical Ribbon (Front) */}
                 <motion.div 
                    className="absolute h-full w-[40px] bg-red-600 shadow-sm border-x border-red-700"
                    variants={ribbonVariants}
                    initial="closed"
                    animate={step === 'OPENING' ? "opening" : "closed"}
                 />
                 
                 <div className="z-30 text-white font-serif text-center drop-shadow-md">
                    <p className="text-[10px] uppercase tracking-[0.2em] opacity-80 mb-1">A Gift For</p>
                    <h2 className="text-3xl font-bold">{data.recipientName}</h2>
                 </div>
            </div>

            {/* Box Lid (Animates Open) */}
            <motion.div
                className={`absolute top-0 -left-[10px] w-[320px] h-[60px] ${theme.envelopeColor} z-30 rounded-lg shadow-xl flex items-center justify-center transform-style-3d origin-top`}
                variants={lidVariants}
                initial="closed"
                animate={step === 'OPENING' ? "opening" : "closed"}
            >
                <div className="absolute inset-0 bg-white/10 rounded-lg"></div>
                
                 {/* Lid Ribbon Horizontal */}
                <motion.div 
                    className="absolute w-full h-[40px] bg-red-600 shadow-sm border-y border-red-700"
                    variants={ribbonVariants}
                    initial="closed"
                    animate={step === 'OPENING' ? "opening" : "closed"}
                />
                
                {/* 3D Bow Knot */}
                <motion.div 
                    className="absolute -top-[35px] text-red-600 drop-shadow-2xl filter brightness-110"
                    variants={ribbonVariants}
                    initial="closed"
                    animate={step === 'OPENING' ? "opening" : "closed"}
                >
                    <Gift size={70} strokeWidth={1.5} />
                </motion.div>
            </motion.div>

            {step === 'CLOSED' && (
                <p className="absolute -bottom-16 w-full text-center text-white/70 animate-pulse text-sm font-bold tracking-widest uppercase">Tap to Unwrap</p>
            )}
        </motion.div>
    );
};

// --- MAIN VIEW COMPONENT ---
const ViewLetter: React.FC<Props> = ({ data, onBack }) => {
  const { showToast } = useToast();
  const [step, setStep] = useState<'CLOSED' | 'OPENING' | 'READING'>('CLOSED');
  const [musicSrc, setMusicSrc] = useState<string>('');
  const [viewCount, setViewCount] = useState(data.views || 0);
  const [likesCount, setLikesCount] = useState(data.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  const theme = THEMES[data.theme || ThemeType.VELVET];
  const isHolidayTheme = theme.category === ThemeCategory.HOLIDAY;

  useEffect(() => {
    if (data?.recipientName) {
      document.title = `💌 For ${data.recipientName} | LoveNotes`;
    } else {
      document.title = "You have a new message 💌";
    }
  }, [data]);

  useEffect(() => {
    // Check Lock Status
    if (data.unlockDate) {
        const unlock = new Date(data.unlockDate).getTime();
        const now = Date.now();
        if (now < unlock) {
            setIsLocked(true);
            const updateTimer = () => {
                const diff = unlock - Date.now();
                if (diff <= 0) {
                    setIsLocked(false);
                    return;
                }
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                setTimeLeft(`${days}d ${hours}h ${minutes}m`);
            };
            updateTimer();
            const interval = setInterval(updateTimer, 60000); // Update every minute
            return () => clearInterval(interval);
        }
    }
  }, [data.unlockDate]);

  useEffect(() => {
    if (data) {
        let src = data.musicUrl;
        if (!src) src = getRandomMusicUrl() || undefined;
        if (!src) {
            const t = THEMES[data.theme || ThemeType.VELVET];
            src = t.musicUrl;
        }
        if (src) setMusicSrc(src);

        if (data.id && !onBack) {
            incrementViewCount(data.id);
            setViewCount((v) => v + 1);
            
            // Check Like Status
            const likedSet = getLocalLikedIds();
            setIsLiked(likedSet.has(data.id));
        }
    }
  }, [data, onBack]);

  const handleOpen = () => {
    if (isLocked) {
        showToast("This letter is locked until the scheduled time!", "info");
        return;
    }
    setStep('OPENING');
    
    // Fire confetti slightly after opening starts
    setTimeout(() => fireConfetti(), 1000);
    
    // Transition to Reading Mode
    // Holiday animation takes ~4.5s total (ribbon 1.5 + lid 1.0 + letter 2.0)
    // Envelope takes ~2.5s
    const delay = isHolidayTheme ? 5000 : 3000;
    setTimeout(() => setStep('READING'), delay);
  };

  const fireConfetti = () => {
    const themeColors = data.theme === ThemeType.NOIR ? ['#000', '#555'] : ['#ff4d4d', '#ff9a9e', '#ffd1dc'];
    if (isHolidayTheme) themeColors.push('#FFD700', '#228B22'); // Gold/Green for holidays

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
        setIsLiked(!isLiked);
        setLikesCount(p => isLiked ? p + 1 : p - 1);
    }
  };

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
                isLocked ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center text-white text-center p-8 bg-black/30 backdrop-blur-md rounded-2xl border border-white/10"
                    >
                        <Lock size={48} className="mb-4 text-white/50" />
                        <h2 className="text-2xl font-bold mb-2">Time Capsule Locked</h2>
                        <p className="opacity-70 mb-6 max-w-xs">This letter is scheduled to open in the future.</p>
                        <div className="flex items-center gap-3 text-3xl font-mono font-bold text-amber-300">
                            <Timer />
                            <span>{timeLeft}</span>
                        </div>
                    </motion.div>
                ) : isHolidayTheme ? (
                    <HolidayGiftBox data={data} onOpen={handleOpen} step={step} />
                ) : (
                    <StandardEnvelope data={data} onOpen={handleOpen} step={step} />
                )
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
