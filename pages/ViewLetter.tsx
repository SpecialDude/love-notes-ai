import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye, Heart, Lock, Gift, Ticket, Download, MessageCircle, Copy, Check } from 'lucide-react';
import { LetterData, ThemeType, ThemeCategory } from '../types';
import { THEMES } from '../constants';
import { incrementViewCount, toggleLike } from '../services/firebase';
import { getRandomMusicUrl } from '../utils/music';
import { getDeviceId, getLocalLikedIds, addLocalLike, removeLocalLike } from '../utils/device';
import AnimatedBackground from '../components/AnimatedBackground';
import MusicPlayer from '../components/MusicPlayer';
import confetti from 'canvas-confetti';
import { useToast } from '../components/Toast';
import html2canvas from 'html2canvas';

interface Props {
  data: LetterData;
  onBack?: () => void;
}

// --- COMPONENT 1: STANDARD ENVELOPE (Legacy Implementation + Glow) ---
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
            <div className={`relative h-[240px] md:h-[300px] ${theme.envelopeColor} rounded-b-xl shadow-2xl flex flex-col items-center justify-center z-20`}>
                {/* The Letter (Legacy Logic: z-10, y:0 -> y:-200) */}
                <motion.div 
                    className={`absolute w-[90%] h-[90%] ${theme.paperColor} rounded-lg shadow-md z-10 flex flex-col p-6 items-center`}
                    initial={{ y: 0 }}
                    animate={step === 'OPENING' ? { 
                        y: -200, 
                        zIndex: 0, // Moves behind as it exits in legacy code, but we want it visible
                        boxShadow: "0 0 50px rgba(255,255,255,0.8)" // THE GLOW UPDATE
                    } : { y: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
                >
                     <div className="w-full h-full opacity-30 overflow-hidden text-[6px] md:text-[8px] leading-relaxed select-none text-black">
                        {data.content}
                     </div>
                </motion.div>
                
                {/* Pocket */}
                <div className={`absolute inset-0 z-30 pointer-events-none rounded-b-xl border-t border-white/10 ${theme.envelopeColor}`} 
                     style={{ clipPath: 'polygon(0 0, 50% 40%, 100% 0, 100% 100%, 0 100%)' }}>
                </div>
                
                {/* Front Text */}
                <div className="absolute bottom-10 z-40 text-white/90 text-center font-elegant pointer-events-none">
                     <p className="text-xs uppercase tracking-widest opacity-60 mb-1">For</p>
                     <h2 className="text-2xl italic font-serif">{data.recipientName}</h2>
                </div>
            </div>
            
            {/* Flap */}
            <motion.div
                className={`absolute top-0 left-0 w-full h-[120px] md:h-[150px] ${theme.envelopeColor} z-30 rounded-t-xl origin-top border-b border-black/10`}
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
            
            {step === 'CLOSED' && (
                <p className="absolute -bottom-12 w-full text-center text-white/70 animate-pulse text-sm">Tap to Open</p>
            )}
        </motion.div>
    );
};

// --- COMPONENT 2: HOLIDAY GIFT BOX (Premium 3D Animation) ---
const HolidayGiftBox: React.FC<{ data: LetterData, onOpen: () => void, step: string }> = ({ data, onOpen, step }) => {
    const theme = THEMES[data.theme || ThemeType.WINTER];
    const boxBaseColor = theme.envelopeColor;
    const boxLidColor = theme.envelopeColor.replace('800', '700').replace('900', '800'); 
    const ribbonColor = 'bg-yellow-400';
    const ribbonShadow = 'shadow-md';

    return (
        <div 
            className="relative w-[280px] h-[220px] preserve-3d transform-style-3d hover:scale-105 transition-transform duration-300 cursor-pointer"
            onClick={step === 'CLOSED' ? onOpen : undefined}
        >
                {/* --- LAYER 1: Back Wall (Inside of box) - Pushed Back --- */}
                <div 
                    className={`absolute inset-0 ${boxBaseColor} rounded-md brightness-75 z-10 shadow-inner`} 
                    style={{ transform: 'translateZ(-20px)' }}
                />

                {/* --- LAYER 2: The Letter (Sandwiched) --- */}
                <motion.div 
                    className={`absolute left-[5%] top-[5%] w-[90%] h-[90%] ${theme.paperColor} rounded-sm shadow-lg flex items-center justify-center p-4`}
                    // Initial State: Hidden (opacity 0), Middle Depth (z: 0), Normal Size
                    initial={{ y: 0, scale: 0.9, opacity: 0, z: 0 }}
                    animate={step === 'OPENING' ? { 
                        y: -180, // Slides UP
                        opacity: 1,
                        scale: 1, 
                        rotateY: 0, 
                        z: 100, // Move Forward to act as Front Layer at the end
                        boxShadow: "0 0 50px rgba(255,215,0, 0.6)", // Magical Glow
                    } : { opacity: 0, z: 0 }} 
                    transition={{ 
                        opacity: { delay: 1.5, duration: 0.5 }, // Fade in only when lid opens
                        y: { delay: 1.5, duration: 2.0, ease: "easeInOut" }, // Rise slowly
                        scale: { delay: 1.5, duration: 2.0 },
                        boxShadow: { delay: 1.5, duration: 2.0 },
                        z: { delay: 3.2, duration: 0 } // JUMP to front only after fully risen
                    }}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    <div className="text-[6px] opacity-40 overflow-hidden h-full text-black leading-relaxed select-none">
                        {data.content}
                    </div>
                </motion.div>

                {/* --- LAYER 3: Front Wall (Visible Face) - Pushed Front --- */}
                <div 
                    className={`absolute inset-0 ${boxBaseColor} rounded-md shadow-2xl flex items-center justify-center z-20`}
                    style={{ transform: 'translateZ(20px)' }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none rounded-md" />
                    
                    {/* Vertical Ribbon */}
                    <motion.div 
                        className={`absolute h-full w-12 ${ribbonColor} ${ribbonShadow} z-10`}
                        animate={step === 'OPENING' ? { y: 250, opacity: 0 } : { y: 0, opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeIn" }}
                    />
                    
                    {/* Gift Tag */}
                    <motion.div 
                        className="absolute z-20 top-[55%] left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#fff1f2] border-2 border-yellow-500/30 px-5 py-3 rounded shadow-lg transform -rotate-2 flex flex-col items-center min-w-[120px]"
                        animate={step === 'OPENING' ? { opacity: 0, y: 50 } : { opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rounded-full ring-1 ring-white/50" />
                        <span className="text-[8px] uppercase tracking-widest text-gray-500 mb-0.5 font-sans">For</span>
                        <span className="font-serif text-xl text-gray-900 font-bold leading-none text-center">{data.recipientName}</span>
                    </motion.div>
                </div>

                {/* --- LAYER 4: Box Lid (Top) --- */}
                <motion.div 
                    className={`absolute -top-10 -left-[5%] w-[110%] h-[60px] ${boxLidColor || boxBaseColor} rounded-md shadow-xl z-30 flex justify-center items-start overflow-visible`}
                    style={{ transformOrigin: "top", transform: 'translateZ(20px)' }}
                    animate={step === 'OPENING' ? { 
                        y: -150, 
                        rotateX: -180, 
                        opacity: 0,
                        transition: { duration: 1.2, ease: "circIn", delay: 0.6 }
                    } : { 
                        y: [0, -3, 0], // Idle bounce
                    }}
                    transition={step !== 'OPENING' ? { repeat: Infinity, duration: 4, ease: "easeInOut" } : {}}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-black/10 rounded-md pointer-events-none" />
                    
                    <motion.div 
                        className={`absolute h-full w-12 ${ribbonColor} shadow-sm`} 
                        animate={step === 'OPENING' ? { opacity: 0 } : { opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    />
                    
                    {/* THE BOW */}
                    <motion.div 
                        className="absolute -top-10 w-full flex justify-center items-end"
                        animate={step === 'OPENING' ? { scale: 0, opacity: 0, rotate: 45 } : { scale: 1, opacity: 1 }}
                        transition={{ duration: 1.2, ease: "backIn" }} 
                    >
                        <div className={`w-16 h-16 rounded-full border-[8px] border-yellow-400 rotate-45 rounded-br-none absolute -left-2 drop-shadow-md`} />
                        <div className={`w-16 h-16 rounded-full border-[8px] border-yellow-400 -rotate-45 rounded-bl-none absolute -right-2 drop-shadow-md`} />
                        <div className={`relative z-10 w-8 h-8 rounded-full ${ribbonColor} shadow-inner flex items-center justify-center`}>
                            <Gift size={16} className="text-yellow-700 opacity-50" />
                        </div>
                    </motion.div>
                </motion.div>

                {step === 'CLOSED' && (
                    <p className="absolute -bottom-16 w-full text-center text-white/80 animate-pulse font-bold tracking-widest text-sm uppercase">Tap to Unwrap</p>
                )}
        </div>
    );
};


// --- MAIN COMPONENT ---
const ViewLetter: React.FC<Props> = ({ data, onBack }) => {
  const { showToast } = useToast();
  const [step, setStep] = useState<'CLOSED' | 'OPENING' | 'READING'>('CLOSED');
  const [musicSrc, setMusicSrc] = useState<string>('');
  const [viewCount, setViewCount] = useState(data.views || 0);
  const [likesCount, setLikesCount] = useState(data.likes || 0);
  const [isLiked, setIsLiked] = useState(false);
  
  // Coupon State
  const [isCouponTorn, setIsCouponTorn] = useState(false);
  const couponRef = useRef<HTMLDivElement>(null);
  
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
    
    const isHoliday = THEMES[data.theme].category === ThemeCategory.HOLIDAY;
    
    // Adjust timing based on type
    const confettiDelay = isHoliday ? 2500 : 500;
    const readDelay = isHoliday ? 4000 : 2500;

    setTimeout(() => fireConfetti(), confettiDelay);
    setTimeout(() => setStep('READING'), readDelay);
  };

  const fireConfetti = () => {
    const themeColors = data.theme === ThemeType.NOIR ? ['#000', '#555'] : ['#ff4d4d', '#ff9a9e', '#ffd1dc'];
    if (data.theme === ThemeType.HOLLY) { themeColors.push('#15803d'); themeColors.push('#b91c1c'); themeColors.push('#fbbf24'); }
    
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
    
    if (isLiked) {
        setIsLiked(false);
        setLikesCount(p => p - 1);
        removeLocalLike(data.id);
        showToast("Oh no... 💔 Unliked", 'info');
    } else {
        setIsLiked(true);
        setLikesCount(p => p + 1);
        addLocalLike(data.id);
        
        confetti({
            particleCount: 15,
            spread: 60,
            origin: { x: 0.5, y: 0.5 },
            colors: ['#ef4444', '#f472b6', '#ffffff'],
            scalar: 0.8
        });
    }

    const success = await toggleLike(data.id, deviceId);
    if (!success) {
        setIsLiked(!isLiked);
        setLikesCount(p => isLiked ? p + 1 : p - 1);
    }
  };

  const handleRedeemCoupon = async () => {
     if (!data.coupon || isCouponTorn) return;
     
     setIsCouponTorn(true);
     
     // Celebration Confetti
     confetti({
        particleCount: 40,
        spread: 70,
        origin: { x: 0.5, y: 0.8 },
        colors: ['#FFD700', '#C0C0C0', '#ffffff'],
        shapes: ['star']
     });
     
     // Generate Image for download
     if (couponRef.current) {
         try {
             const canvas = await html2canvas(couponRef.current, { backgroundColor: null, scale: 2 });
             const link = document.createElement('a');
             link.download = `LoveCoupon-${data.recipientName}.png`;
             link.href = canvas.toDataURL();
             link.click();
             showToast("Ticket downloaded! 🎟️", "success");
         } catch (e) {
             console.error("Image gen failed", e);
         }
     }

     const coupon = data.coupon;
     const message = `Hey! I am officially redeeming my Love Coupon for: ${coupon.title} 🎟️✨${coupon.secretCode ? ` (Code: ${coupon.secretCode})` : ''}`;
     
     // Open WhatsApp if number provided, else generic share
     if (coupon.senderWhatsApp) {
         setTimeout(() => {
            window.open(`https://wa.me/${coupon.senderWhatsApp}?text=${encodeURIComponent(message)}`, '_blank');
         }, 1500);
     } else {
         setTimeout(() => {
            window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
         }, 1500);
     }
  };

  const theme = THEMES[data.theme || ThemeType.VELVET];
  const isHoliday = theme.category === ThemeCategory.HOLIDAY;

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
                <div className="relative">
                    {isLocked ? (
                         // LOCKED (TIME CAPSULE)
                         <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="flex flex-col items-center"
                         >
                            <motion.div 
                                animate={{ rotate: [0, -5, 5, -5, 5, 0] }}
                                transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}
                                className="bg-black/40 backdrop-blur-xl border border-white/20 p-8 rounded-3xl text-center shadow-2xl"
                            >
                                <Lock size={48} className="text-white mx-auto mb-4" />
                                <h2 className="text-2xl font-cinematic text-white mb-2">Time Capsule</h2>
                                <p className="text-white/60 text-sm mb-6">Locked until {new Date(data.unlockDate!).toLocaleDateString()}</p>
                                
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
                         </motion.div>
                    ) : isHoliday ? (
                        // HOLIDAY THEMES
                        <HolidayGiftBox data={data} onOpen={handleOpen} step={step} />
                    ) : (
                        // STANDARD ENVELOPE (LEGACY)
                        <StandardEnvelope data={data} onOpen={handleOpen} step={step} />
                    )}
                </div>
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
                        {/* Stamp - Position updated for Mobile */}
                        <div className="absolute top-4 right-4 md:top-6 md:right-6 w-20 h-24 border-4 border-double border-current opacity-30 -rotate-6 flex items-center justify-center">
                            <div className="text-[10px] font-bold uppercase text-center leading-tight">LoveNotes<br/>Air Mail</div>
                        </div>

                        <div className="flex-1 flex flex-col relative z-10">
                            {/* Date - Aligned Left on Mobile */}
                            <div className="mb-8 opacity-60 text-xs font-serif uppercase tracking-widest text-left md:text-center border-b border-current pb-4 shrink-0 w-fit mx-0 md:mx-auto">
                                {new Date(data.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                            <h1 className={`text-4xl md:text-5xl mb-8 ${theme.fontFamily} font-bold shrink-0 leading-tight`}>My Dearest {data.recipientName},</h1>
                            <div className={`text-lg md:text-2xl leading-relaxed whitespace-pre-wrap ${theme.fontFamily} opacity-95`}>{data.content}</div>
                            
                            {/* --- COUPON ATTACHMENT WITH TEAR ANIMATION --- */}
                            {data.coupon && (
                                <div className="mt-12 py-8 relative">
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white/50 backdrop-blur-sm px-2 text-[10px] uppercase tracking-widest text-black/40 z-20">
                                        Tap to Tear & Redeem
                                    </div>
                                    
                                    <div 
                                        className={`relative mx-auto max-w-sm shadow-xl rounded-lg overflow-hidden group cursor-pointer
                                            ${data.coupon.style === 'GOLD' ? 'bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-50 border border-yellow-400 text-yellow-900' : ''}
                                            ${data.coupon.style === 'SILVER' ? 'bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 border border-gray-400 text-gray-800' : ''}
                                            ${data.coupon.style === 'ROSE' ? 'bg-gradient-to-br from-rose-50 via-rose-100 to-rose-50 border border-rose-300 text-rose-900' : ''}
                                            ${data.coupon.style === 'BLUE' ? 'bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 border border-blue-300 text-blue-900' : ''}
                                        `}
                                        onClick={handleRedeemCoupon}
                                        ref={couponRef}
                                    >
                                        {/* Stub (Top Part) */}
                                        <div className="p-4 flex items-center justify-between bg-black/5 relative z-10">
                                            <div className="flex items-center gap-2 opacity-70">
                                                <Gift size={16} />
                                                <span className="text-[10px] uppercase tracking-widest font-bold">Love Coupon</span>
                                            </div>
                                            <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center opacity-50">
                                                <Ticket size={12} />
                                            </div>
                                        </div>

                                        {/* Perforation Line */}
                                        <div className="relative h-0 border-t-2 border-dashed border-black/20 -mt-[1px] z-10">
                                            <div className="absolute -left-2 -top-2 w-4 h-4 rounded-full bg-white" />
                                            <div className="absolute -right-2 -top-2 w-4 h-4 rounded-full bg-white" />
                                        </div>

                                        {/* Ticket (Bottom Part - Tears Away) */}
                                        <motion.div 
                                            className="p-6 flex flex-col items-center text-center gap-2 bg-white/20 backdrop-blur-sm"
                                            animate={isCouponTorn ? { 
                                                rotate: 15, 
                                                y: 100, 
                                                opacity: 0, 
                                                pointerEvents: 'none'
                                            } : {}}
                                            transition={{ duration: 0.8, ease: "easeIn" }}
                                            style={{ transformOrigin: "top left" }}
                                        >
                                            <h3 className="font-serif text-2xl font-bold leading-tight">{data.coupon.title}</h3>
                                            <p className="text-xs opacity-60 uppercase tracking-wider mt-1">Valid Forever</p>
                                            
                                            <div className="mt-4 px-6 py-2 bg-black/5 rounded-full text-xs font-bold uppercase tracking-wider group-hover:bg-black/10 transition-colors">
                                                Redeem Gift
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Reveal Message (Underneath) */}
                                    {isCouponTorn && (
                                        <motion.div 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="absolute inset-0 flex flex-col items-center justify-center text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6"
                                        >
                                            <p className="text-green-600 font-bold mb-2 flex items-center gap-2"><Check size={16} /> Redeemed!</p>
                                            <p className="text-sm text-gray-600 mb-4">You've claimed this gift.</p>
                                            
                                            {data.coupon.secretCode && (
                                                <div className="mb-4 bg-gray-200 px-4 py-2 rounded-md font-mono text-sm border border-gray-300 select-all">
                                                    <span className="text-xs text-gray-500 block mb-1 uppercase tracking-widest">Secret Code</span>
                                                    {data.coupon.secretCode}
                                                </div>
                                            )}
                                            
                                            <div className="flex gap-2">
                                                {data.coupon.redemptionLink && (
                                                    <a href={data.coupon.redemptionLink} target="_blank" rel="noreferrer" className="text-xs bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 flex items-center gap-1">
                                                        <Gift size={12} /> View Gift
                                                    </a>
                                                )}
                                                {data.coupon.senderWhatsApp && (
                                                     <a 
                                                        href={`https://wa.me/${data.coupon.senderWhatsApp}?text=${encodeURIComponent(`I am redeeming: ${data.coupon.title}`)}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-xs bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 flex items-center gap-1"
                                                     >
                                                        <MessageCircle size={12} /> WhatsApp
                                                     </a>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-4">Image saved to downloads</p>
                                        </motion.div>
                                    )}
                                </div>
                            )}

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