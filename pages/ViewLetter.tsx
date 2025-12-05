
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
        return;
    }
    setStep('OPENING');
    
    // Confetti timing depends on animation type (Gift vs Envelope)
    const isHoliday = THEMES[data.theme].category === 'HOLIDAY';
    // For gift box: Ribbons(0.5s) + Lid(0.6s) + Letter Rise(1.4s) -> approx 2.5s total transition
    const confettiDelay = isHoliday ? 1500 : 800; 
    
    setTimeout(() => fireConfetti(), confettiDelay); 
    setTimeout(() => setStep('READING'), isHoliday ? 3500 : 2000); 
  };

  const fireConfetti = () => {
    const themeColors = data.theme === ThemeType.NOIR ? ['#000', '#555'] : ['#ff4d4d', '#ff9a9e', '#ffd1dc'];
    if (data.theme === ThemeType.HOLLY) { themeColors.push('#15803d'); themeColors.push('#b91c1c'); themeColors.push('#fbbf24'); }
    if (data.theme === ThemeType.WINTER || data.theme === ThemeType.FROST) { themeColors.push('#ffffff'); themeColors.push('#bae6fd'); }

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
  const isHoliday = theme.category === 'HOLIDAY';
  
  // Box Styling
  const boxBaseColor = theme.envelopeColor;
  const boxLidColor = theme.envelopeColor.replace('800', '700').replace('900', '800'); // Slightly lighter for lid
  const ribbonColor = 'bg-yellow-400';
  
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
          <div className="fixed top-6 right-6 z-50 flex items-center gap-2 animate-in fade-in duration-1000">
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
                    exit={{ scale: 1.1, opacity: 0, transition: { duration: 0.5 } }}
                    className="relative cursor-pointer group"
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
                    ) : isHoliday ? (
                        // 3D GIFT BOX (Sequenced)
                        <div className="relative w-[260px] h-[200px] preserve-3d transform-style-3d hover:scale-105 transition-transform duration-300">
                             
                             {/* --- LAYER 1: The Letter (Hidden Inside, Rises Last) --- */}
                             <motion.div 
                                className={`absolute left-[5%] top-[5%] w-[90%] h-[90%] ${theme.paperColor} rounded-sm shadow-lg z-10 flex items-center justify-center p-4`}
                                initial={{ y: 0, scale: 0.9, opacity: 0 }}
                                animate={step === 'OPENING' ? { 
                                    y: -300, 
                                    scale: 1, 
                                    opacity: 1,
                                    rotateY: 360,
                                    boxShadow: "0 0 40px rgba(255,255,255,0.6)",
                                    zIndex: 50, // Ensures it appears above the box lid
                                    transition: { duration: 1.5, ease: "backOut", delay: 1.1 } // Starts AFTER Lid opens
                                } : {}}
                             >
                                <div className="text-[6px] opacity-40 overflow-hidden h-full">
                                    {data.content}
                                </div>
                             </motion.div>

                             {/* --- LAYER 2: Box Base (Includes Vertical Ribbon) --- */}
                             <div className={`absolute inset-0 ${boxBaseColor} rounded-md shadow-2xl flex items-center justify-center z-20`}>
                                {/* Gradients for depth */}
                                <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none rounded-md" />
                                
                                {/* Vertical Ribbon (Slides off first) */}
                                <motion.div 
                                    className={`absolute h-full w-10 ${ribbonColor} shadow-sm`}
                                    animate={step === 'OPENING' ? { y: 200, opacity: 0 } : { y: 0, opacity: 1 }}
                                    transition={{ duration: 0.5, ease: "easeIn" }}
                                />
                             </div>

                             {/* --- LAYER 3: Box Lid (Includes Horizontal Ribbon & Bow) --- */}
                             <motion.div 
                                className={`absolute -top-10 -left-[5%] w-[110%] h-[60px] ${boxLidColor || boxBaseColor} rounded-md shadow-xl z-30 flex justify-center items-start overflow-visible`}
                                style={{ transformOrigin: "top" }}
                                animate={step === 'OPENING' ? { 
                                    y: -150, 
                                    rotateX: -180, 
                                    opacity: 0,
                                    transition: { duration: 0.6, ease: "circIn", delay: 0.5 } // Starts AFTER Ribbon
                                } : { 
                                    y: [0, -3, 0], // Idle
                                }}
                                transition={step !== 'OPENING' ? { repeat: Infinity, duration: 4, ease: "easeInOut" } : {}}
                             >
                                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-black/10 rounded-md pointer-events-none" />
                                  
                                  {/* Horizontal Ribbon on Lid */}
                                  <motion.div 
                                    className={`absolute h-full w-10 ${ribbonColor} shadow-sm`} 
                                    animate={step === 'OPENING' ? { opacity: 0 } : { opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                  />
                                  
                                  {/* THE BOW (Unties First) */}
                                  <motion.div 
                                    className="absolute -top-10 w-full flex justify-center items-end"
                                    animate={step === 'OPENING' ? { scale: 0, opacity: 0, rotate: 45 } : { scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.4, ease: "backIn" }} // Happens very first
                                  >
                                        <div className={`w-16 h-16 rounded-full border-[8px] border-yellow-400 rotate-45 rounded-br-none absolute -left-2 drop-shadow-md`} />
                                        <div className={`w-16 h-16 rounded-full border-[8px] border-yellow-400 -rotate-45 rounded-bl-none absolute -right-2 drop-shadow-md`} />
                                        <div className={`relative z-10 w-8 h-8 rounded-full ${ribbonColor} shadow-inner`} />
                                  </motion.div>
                             </motion.div>

                             <p className="absolute -bottom-16 w-full text-center text-white/80 animate-pulse font-bold tracking-widest text-sm uppercase">Tap to Unwrap</p>
                        </div>
                    ) : (
                        // STANDARD ENVELOPE (Fixed Visuals)
                        <div className={`relative h-[220px] md:h-[260px] w-[300px] md:w-[350px] flex flex-col items-center justify-center z-20`}>
                            
                            {/* 1. Envelope Back Face (Background) */}
                            <div className={`absolute inset-0 rounded-b-lg ${theme.envelopeColor} brightness-75 z-10 shadow-lg`}></div>

                            {/* 2. The Letter Inside (Strictly Masked) */}
                            <motion.div 
                                className={`absolute bottom-2 w-[90%] h-[90%] ${theme.paperColor} rounded-sm shadow-md z-20 flex flex-col p-6 items-center border border-black/5`}
                                initial={{ y: 0 }}
                                animate={step === 'OPENING' ? { 
                                    y: -300, 
                                    scale: 1.1,
                                    rotate: [0, -2, 2, 0],
                                    zIndex: 50, // Moves above everything ONLY after leaving
                                    transition: { duration: 1.0, ease: "easeInOut", delay: 0.3 } 
                                } : { y: 0 }}
                                // STRICT MASK: Ensures letter doesn't peek out bottom rounded corners
                                style={step !== 'OPENING' ? { clipPath: 'inset(0 5% 0 5% round 0 0 5px 5px)' } : {}}
                            >
                                <div className="w-full h-full opacity-30 overflow-hidden text-[6px] md:text-[8px] leading-relaxed select-none">
                                    {data.content}
                                </div>
                            </motion.div>

                            {/* 3. Envelope Pocket (Front Face) */}
                            {/* Uses clip-path to create the V-shape while keeping the bottom rectangular to cover the letter */}
                            <div className={`absolute inset-0 z-30 pointer-events-none rounded-b-lg border-t border-black/10 ${theme.envelopeColor} shadow-inner`} 
                                style={{ clipPath: 'polygon(0 0, 50% 55%, 100% 0, 100% 100%, 0 100%)' }}>
                            </div>
                            
                            <div className="absolute bottom-8 z-40 text-white/90 text-center font-elegant w-full px-4 pointer-events-none">
                                <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">A Letter For</p>
                                <h2 className="text-3xl italic font-serif truncate drop-shadow-md">{data.recipientName}</h2>
                            </div>
                            
                            {/* 4. Envelope Flap */}
                            <motion.div
                                className={`absolute top-[-1px] left-0 w-full h-[55%] ${theme.envelopeColor} z-40 rounded-t-lg origin-top border-b border-black/20 brightness-90`}
                                style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)', backfaceVisibility: 'visible' }}
                                initial={{ rotateX: 0 }}
                                animate={step === 'OPENING' ? { rotateX: 180, zIndex: 0 } : { rotateX: 0 }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                            >
                                <motion.div 
                                    animate={step === 'OPENING' ? { opacity: 0 } : { opacity: 1 }}
                                    className="absolute top-[85%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-red-800 rounded-full border-2 border-red-900 shadow-lg flex items-center justify-center"
                                >
                                    <Heart size={20} className="text-red-200 fill-red-200/50" />
                                </motion.div>
                            </motion.div>
                            
                            <p className="absolute -bottom-12 w-full text-center text-white/70 animate-pulse text-sm font-medium tracking-wide">Tap to Open</p>
                        </div>
                    )}
                </motion.div>
            )}

            {step === 'READING' && (
                <motion.div 
                    key="letter-full"
                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
                    className="relative z-50 w-full max-w-2xl px-4 flex justify-center"
                >
                    <div className={`relative ${theme.paperColor} p-8 md:p-12 w-full max-h-[80vh] overflow-y-auto custom-scrollbar shadow-[0_20px_60px_rgba(0,0,0,0.5)] ${theme.textColor} paper-texture flex flex-col rounded-sm ring-1 ring-black/5`}>
                        {/* Stamp */}
                        <div className="absolute top-6 right-6 w-20 h-24 border-4 border-double border-current opacity-30 -rotate-6 flex items-center justify-center">
                            <div className="text-[10px] font-bold uppercase text-center leading-tight">LoveNotes<br/>Air Mail</div>
                        </div>

                        <div className="flex-1 flex flex-col relative z-10">
                            <div className="mb-8 opacity-60 text-xs font-serif uppercase tracking-widest border-b border-current pb-4 shrink-0 w-fit">
                                {new Date(data.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                            <h1 className={`text-4xl md:text-5xl mb-8 ${theme.fontFamily} font-bold shrink-0 leading-tight`}>My Dearest {data.recipientName},</h1>
                            <div className={`text-lg md:text-2xl leading-relaxed whitespace-pre-wrap ${theme.fontFamily} opacity-95`}>{data.content}</div>
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
