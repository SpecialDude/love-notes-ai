
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye, Heart, Lock, Gift, Check, Download, Share2, Loader2, Ticket } from 'lucide-react';
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

// --- COMPONENT 1: STANDARD ENVELOPE (Legacy Stable Implementation + Glow) ---
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
                     <div className="w-full h-full opacity-40 overflow-hidden text-[6px] md:text-[8px] leading-relaxed select-none text-black">
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
                <div 
                    className={`absolute inset-0 ${boxBaseColor} rounded-md brightness-75 z-10 shadow-inner`} 
                    style={{ transform: 'translateZ(-20px)' }}
                />

                <motion.div 
                    className={`absolute left-[5%] top-[5%] w-[90%] h-[90%] ${theme.paperColor} rounded-sm shadow-lg flex items-center justify-center p-4`}
                    initial={{ y: 0, scale: 0.9, opacity: 0, z: 0 }}
                    animate={step === 'OPENING' ? { 
                        y: -180, 
                        opacity: 1,
                        scale: 1, 
                        rotateY: 0, 
                        z: 100, 
                        boxShadow: "0 0 50px rgba(255,215,0, 0.6)", 
                    } : { opacity: 0, z: 0 }} 
                    transition={{ 
                        opacity: { delay: 1.5, duration: 0.5 },
                        y: { delay: 1.5, duration: 2.0, ease: "easeInOut" },
                        scale: { delay: 1.5, duration: 2.0 },
                        boxShadow: { delay: 1.5, duration: 2.0 },
                        z: { delay: 3.2, duration: 0 } 
                    }}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    <div className="text-[6px] opacity-40 overflow-hidden h-full text-black leading-relaxed select-none">
                        {data.content}
                    </div>
                </motion.div>

                <div 
                    className={`absolute inset-0 ${boxBaseColor} rounded-md shadow-2xl flex items-center justify-center z-20`}
                    style={{ transform: 'translateZ(20px)' }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20 pointer-events-none rounded-md" />
                    
                    <motion.div 
                        className={`absolute h-full w-12 ${ribbonColor} ${ribbonShadow} z-10`}
                        animate={step === 'OPENING' ? { y: 250, opacity: 0 } : { y: 0, opacity: 1 }}
                        transition={{ duration: 1.5, ease: "easeIn" }}
                    />
                    
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

                <motion.div 
                    className={`absolute -top-10 -left-[5%] w-[110%] h-[60px] ${boxLidColor || boxBaseColor} rounded-md shadow-xl z-30 flex justify-center items-start overflow-visible`}
                    style={{ transformOrigin: "top", transform: 'translateZ(20px)' }}
                    animate={step === 'OPENING' ? { 
                        y: -150, 
                        rotateX: -180, 
                        opacity: 0,
                        transition: { duration: 1.2, ease: "circIn", delay: 0.6 }
                    } : { 
                        y: [0, -3, 0],
                    }}
                    transition={step !== 'OPENING' ? { repeat: Infinity, duration: 4, ease: "easeInOut" } : {}}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-black/10 rounded-md pointer-events-none" />
                    
                    <motion.div 
                        className={`absolute h-full w-12 ${ribbonColor} shadow-sm`} 
                        animate={step === 'OPENING' ? { opacity: 0 } : { opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    />
                    
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
  
  // Time Capsule
  const [isLocked, setIsLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, mins: number, secs: number} | null>(null);

  // Coupon State
  const [isTorn, setIsTorn] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [couponImage, setCouponImage] = useState<string | null>(null);

  useEffect(() => {
    if (data?.recipientName) {
      document.title = `💌 For ${data.recipientName} | LoveNotes`;
    } else {
      document.title = "You have a new message 💌";
    }
    
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
    const confettiDelay = isHoliday ? 2500 : 800;
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
      confetti({ particleCount: 5, angle: 50, spread: 80, origin: { x: 0, y: 0.8 }, colors: themeColors, startVelocity: 60, shapes: ['circle', 'square'], scalar: 1.2 });
      confetti({ particleCount: 5, angle: 130, spread: 80, origin: { x: 1, y: 0.8 }, colors: themeColors, startVelocity: 60, shapes: ['circle', 'square'], scalar: 1.2 });
      if (Date.now() < end) requestAnimationFrame(frame);
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
        confetti({ particleCount: 15, spread: 60, origin: { x: 0.5, y: 0.5 }, colors: ['#ef4444', '#f472b6', '#ffffff'], scalar: 0.8 });
    }

    const success = await toggleLike(data.id, deviceId);
    if (!success) {
        setIsLiked(!isLiked);
        setLikesCount(p => isLiked ? p + 1 : p - 1);
    }
  };

  // --- COUPON LOGIC ---
  const generateCouponImage = async () => {
    const element = document.getElementById('hidden-coupon-clone');
    if (!element) return;
    
    try {
        const canvas = await html2canvas(element, { scale: 2, backgroundColor: null });
        setCouponImage(canvas.toDataURL('image/png'));
    } catch (e) {
        console.error("Image gen failed", e);
    }
  };

  const handleTear = () => {
    generateCouponImage();
    setIsTorn(true); // Triggers the R-to-L peel animation
    
    setTimeout(() => {
        setShowRedeemModal(true);
        fireConfetti();
    }, 1200);
  };

  const handleRedeem = () => {
    if (!data.coupon) return;
    const msg = `Hey! I'm officially redeeming this special coupon for: ${data.coupon.title}! This is such a thoughtful gift, thank you! ✨`;
    const encodedMsg = encodeURIComponent(msg);

    // Share Image + Text using Web Share API if available (Mobile)
    if (navigator.share && couponImage) {
        fetch(couponImage)
        .then(res => res.blob())
        .then(blob => {
            const file = new File([blob], 'love-coupon.png', { type: 'image/png' });
            navigator.share({
                title: 'Redeeming Love Coupon',
                text: msg,
                files: [file]
            }).catch(console.error);
        });
    } else {
        // Fallback: Open WhatsApp/Email based on preference
        if (data.coupon.redemptionMethod === 'WHATSAPP' && data.coupon.senderWhatsApp) {
            window.open(`https://wa.me/${data.coupon.senderWhatsApp.replace(/[^0-9]/g, '')}?text=${encodedMsg}`, '_blank');
        } else if (data.coupon.redemptionMethod === 'EMAIL' && data.coupon.senderEmail) {
            window.open(`mailto:${data.coupon.senderEmail}?subject=Redeeming Love Coupon: ${data.coupon.title}&body=${encodedMsg}`, '_blank');
        } else {
            showToast("Creator didn't provide contact info, but you can save the image!", 'info');
        }
        
        // Also download image for manual sending
        if (couponImage) {
            const link = document.createElement('a');
            link.href = couponImage;
            link.download = `LoveCoupon-${data.coupon.title}.png`;
            link.click();
        }
    }
  };

  const theme = THEMES[data.theme || ThemeType.VELVET];
  const isHoliday = theme.category === ThemeCategory.HOLIDAY;
  const hasCoupon = !!data.coupon;

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
                         <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="flex flex-col items-center">
                            <motion.div animate={{ rotate: [0, -5, 5, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }} className="bg-black/40 backdrop-blur-xl border border-white/20 p-8 rounded-3xl text-center shadow-2xl">
                                <Lock size={48} className="text-white mx-auto mb-4" />
                                <h2 className="text-2xl font-cinematic text-white mb-2">Time Capsule</h2>
                                <p className="text-white/60 text-sm mb-6">Locked until {new Date(data.unlockDate!).toLocaleDateString()}</p>
                                {timeLeft && <div className="grid grid-cols-4 gap-4 text-white"><span className="text-2xl font-mono">{timeLeft.days}d</span><span className="text-2xl font-mono">{timeLeft.hours}h</span><span className="text-2xl font-mono">{timeLeft.mins}m</span><span className="text-2xl font-mono">{timeLeft.secs}s</span></div>}
                            </motion.div>
                         </motion.div>
                    ) : isHoliday ? (
                        <HolidayGiftBox data={data} onOpen={handleOpen} step={step} />
                    ) : (
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
                    <div className="relative w-full max-h-[80vh] overflow-y-auto custom-scrollbar flex flex-col">
                        
                        {/* --- TOP HALF: LETTER BODY --- */}
                        <div className={`
                            relative ${theme.paperColor} p-8 md:p-12 w-full shadow-xl ${theme.textColor} paper-texture flex flex-col rounded-t-sm
                            ${hasCoupon ? '' : 'rounded-b-sm shadow-[0_20px_60px_rgba(0,0,0,0.5)] ring-1 ring-black/5'}
                        `}
                        style={hasCoupon ? { 
                            paddingBottom: '60px',
                            maskImage: 'linear-gradient(to bottom, black calc(100% - 20px), transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, black calc(100% - 20px), transparent 100%)',
                        } : {}}
                        >
                            <div className="absolute top-4 right-4 md:top-6 md:right-6 w-20 h-24 border-4 border-double border-current opacity-30 -rotate-6 flex items-center justify-center">
                                <div className="text-[10px] font-bold uppercase text-center leading-tight">LoveNotes<br/>Air Mail</div>
                            </div>

                            <div className="mb-8 opacity-60 text-xs font-serif uppercase tracking-widest text-left md:text-center border-b border-current pb-4 shrink-0 w-fit mx-0 md:mx-auto">
                                {new Date(data.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                            <h1 className={`text-4xl md:text-5xl mb-8 ${theme.fontFamily} font-bold shrink-0 leading-tight`}>My Dearest {data.recipientName},</h1>
                            <div className={`text-lg md:text-2xl leading-relaxed whitespace-pre-wrap ${theme.fontFamily} opacity-95`}>{data.content}</div>
                            
                            {!hasCoupon && (
                                <div className="mt-12 pt-8 text-right shrink-0">
                                    <p className="text-sm opacity-60 mb-2 font-serif italic">Yours truly,</p>
                                    <p className={`text-3xl md:text-5xl ${theme.fontFamily} font-bold transform -rotate-2 inline-block`}>{data.senderName}</p>
                                </div>
                            )}
                            
                            {!onBack && !hasCoupon && (
                                <div className="mt-12 pt-8 border-t border-black/10 text-center shrink-0">
                                    <a href="/" className="inline-block px-8 py-3 bg-black/5 hover:bg-black/10 text-current rounded-full font-bold transition-all text-sm uppercase tracking-widest">Write Your Own</a>
                                </div>
                            )}
                        </div>

                        {/* --- BOTTOM HALF: COUPON (TEAR-OFF) --- */}
                        {hasCoupon && data.coupon && (
                            <motion.div 
                                className={`
                                    relative ${theme.paperColor} p-8 md:p-12 w-full shadow-xl ${theme.textColor} paper-texture flex flex-col rounded-b-sm
                                    origin-top-left
                                `}
                                style={{ 
                                    marginTop: '-1px', // Seamless join
                                    // High-fidelity jagged top (simulated perforation)
                                    clipPath: 'polygon(0% 10px, 1% 0%, 2% 10px, 3% 0%, 4% 10px, 5% 0%, 6% 10px, 7% 0%, 8% 10px, 9% 0%, 10% 10px, 11% 0%, 12% 10px, 13% 0%, 14% 10px, 15% 0%, 16% 10px, 17% 0%, 18% 10px, 19% 0%, 20% 10px, 21% 0%, 22% 10px, 23% 0%, 24% 10px, 25% 0%, 26% 10px, 27% 0%, 28% 10px, 29% 0%, 30% 10px, 31% 0%, 32% 10px, 33% 0%, 34% 10px, 35% 0%, 36% 10px, 37% 0%, 38% 10px, 39% 0%, 40% 10px, 41% 0%, 42% 10px, 43% 0%, 44% 10px, 45% 0%, 46% 10px, 47% 0%, 48% 10px, 49% 0%, 50% 10px, 51% 0%, 52% 10px, 53% 0%, 54% 10px, 55% 0%, 56% 10px, 57% 0%, 58% 10px, 59% 0%, 60% 10px, 61% 0%, 62% 10px, 63% 0%, 64% 10px, 65% 0%, 66% 10px, 67% 0%, 68% 10px, 69% 0%, 70% 10px, 71% 0%, 72% 10px, 73% 0%, 74% 10px, 75% 0%, 76% 10px, 77% 0%, 78% 10px, 79% 0%, 80% 10px, 81% 0%, 82% 10px, 83% 0%, 84% 10px, 85% 0%, 86% 10px, 87% 0%, 88% 10px, 89% 0%, 90% 10px, 91% 0%, 92% 10px, 93% 0%, 94% 10px, 95% 0%, 96% 10px, 97% 0%, 98% 10px, 99% 0%, 100% 10px, 100% 100%, 0% 100%)'
                                }}
                                animate={isTorn ? { 
                                    rotate: [0, -5, -20], 
                                    x: [0, 0, -1000],
                                    y: [0, 10, 50],
                                    opacity: [1, 1, 0]
                                } : {}}
                                transition={isTorn ? { duration: 1.2, times: [0, 0.1, 1], ease: "easeInOut" } : {}}
                            >
                                <div className={`
                                    border-2 border-dashed p-6 rounded-xl relative
                                    ${data.coupon.style === 'GOLD' ? 'border-yellow-600/30 bg-yellow-500/5' : ''}
                                    ${data.coupon.style === 'SILVER' ? 'border-gray-600/30 bg-gray-500/5' : ''}
                                    ${data.coupon.style === 'ROSE' ? 'border-rose-600/30 bg-rose-500/5' : ''}
                                    ${data.coupon.style === 'BLUE' ? 'border-blue-600/30 bg-blue-500/5' : ''}
                                `}>
                                    <div className={`
                                        absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm border
                                        ${data.coupon.style === 'GOLD' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : ''}
                                        ${data.coupon.style === 'SILVER' ? 'bg-gray-100 text-gray-800 border-gray-300' : ''}
                                        ${data.coupon.style === 'ROSE' ? 'bg-rose-100 text-rose-800 border-rose-300' : ''}
                                        ${data.coupon.style === 'BLUE' ? 'bg-blue-100 text-blue-800 border-blue-300' : ''}
                                    `}>
                                        Love Coupon
                                    </div>
                                    <div className="flex justify-center mb-2 mt-2">
                                        <div className={`
                                            w-10 h-10 rounded-full border-2 flex items-center justify-center opacity-50
                                            ${data.coupon.style === 'GOLD' ? 'border-yellow-600 text-yellow-800' : ''}
                                            ${data.coupon.style === 'SILVER' ? 'border-gray-600 text-gray-800' : ''}
                                            ${data.coupon.style === 'ROSE' ? 'border-rose-600 text-rose-800' : ''}
                                            ${data.coupon.style === 'BLUE' ? 'border-blue-600 text-blue-800' : ''}
                                        `}>
                                            <Ticket size={20} />
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-bold text-center mb-2 font-serif">{data.coupon.title}</h3>
                                    
                                    {data.coupon.secretCode && (
                                        <div className="text-center font-mono text-sm bg-white/50 p-2 rounded mb-4 border border-black/5">
                                            Code: <span className="font-bold select-all">{data.coupon.secretCode}</span>
                                        </div>
                                    )}

                                    {!isTorn && (
                                        <button 
                                            onClick={handleTear}
                                            className="w-full py-3 bg-black text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 mt-4"
                                        >
                                            Tap to Tear & Redeem
                                        </button>
                                    )}
                                </div>

                                <div className="mt-8 text-right shrink-0">
                                    <p className="text-sm opacity-60 mb-2 font-serif italic">Yours truly,</p>
                                    <p className={`text-3xl md:text-5xl ${theme.fontFamily} font-bold transform -rotate-2 inline-block`}>{data.senderName}</p>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* --- REDEMPTION MODAL --- */}
        {showRedeemModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
                <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl relative">
                    <h3 className="text-xl font-bold mb-4 font-serif">Coupon Redeemed! 🎉</h3>
                    
                    {couponImage ? (
                        <img src={couponImage} alt="Coupon" className="w-full rounded-lg shadow-md mb-4 border border-gray-100" />
                    ) : (
                        <div className="h-40 bg-gray-100 rounded-lg animate-pulse mb-4 flex items-center justify-center">
                            <Loader2 className="animate-spin text-gray-400" />
                        </div>
                    )}

                    <p className="text-sm text-gray-500 mb-6">Send this to {data.senderName} to claim your gift.</p>
                    
                    <button 
                        onClick={handleRedeem}
                        className="w-full py-3 bg-[#25D366] text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 mb-3"
                    >
                        <Share2 size={18} /> Send to Creator
                    </button>

                    <button 
                        onClick={() => setShowRedeemModal(false)}
                        className="text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-gray-600"
                    >
                        Close
                    </button>
                </div>
            </div>
        )}

        {/* --- HIDDEN CLONE FOR IMAGE GEN (SVG Method) --- */}
        {data.coupon && (
            <div id="hidden-coupon-clone" style={{ position: 'absolute', top: 0, left: '-9999px', width: '400px' }}>
                {/* SVG Jagged Top Edge filled with Theme Paper Color */}
                <svg width="400" height="15" viewBox="0 0 100 15" preserveAspectRatio="none" style={{ display: 'block' }}>
                    <path 
                        d="M0 15 L2 0 L4 15 L6 0 L8 15 L10 0 L12 15 L14 0 L16 15 L18 0 L20 15 L22 0 L24 15 L26 0 L28 15 L30 0 L32 15 L34 0 L36 15 L38 0 L40 15 L42 0 L44 15 L46 0 L48 15 L50 0 L52 15 L54 0 L56 15 L58 0 L60 15 L62 0 L64 15 L66 0 L68 15 L70 0 L72 15 L74 0 L76 15 L78 0 L80 15 L82 0 L84 15 L86 0 L88 15 L90 0 L92 15 L94 0 L96 15 L98 0 L100 15 V15 H0 Z" 
                        fill={theme.paperHex} 
                    />
                </svg>
                
                {/* Body */}
                <div style={{ backgroundColor: theme.paperHex, padding: '30px', color: '#333', fontFamily: 'serif' }}>
                    <div style={{ 
                        border: '2px dashed #ccc', 
                        padding: '20px', 
                        borderRadius: '10px', 
                        backgroundColor: data.coupon.style === 'GOLD' ? 'rgba(234, 179, 8, 0.05)' : 'rgba(0,0,0,0.05)',
                        textAlign: 'center' 
                    }}>
                         <div style={{ 
                             textTransform: 'uppercase', 
                             fontSize: '10px', 
                             fontWeight: 'bold', 
                             color: data.coupon.style === 'GOLD' ? '#d97706' : '#666', 
                             marginBottom: '5px' 
                         }}>
                             Love Coupon
                         </div>
                         <h2 style={{ fontSize: '24px', margin: '5px 0' }}>{data.coupon.title}</h2>
                         
                         {data.coupon.secretCode && (
                            <div style={{ marginTop: '10px', padding: '5px', backgroundColor: '#fff', fontFamily: 'monospace', border: '1px solid #eee' }}>Code: {data.coupon.secretCode}</div>
                         )}
                    </div>
                    <div style={{ marginTop: '30px', textAlign: 'right' }}>
                        <p style={{ fontSize: '12px', fontStyle: 'italic', marginBottom: '5px' }}>Yours truly,</p>
                        <p style={{ fontSize: '28px', fontWeight: 'bold' }}>{data.senderName}</p>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default ViewLetter;
