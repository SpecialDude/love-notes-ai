
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye, Heart } from 'lucide-react';
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

  useEffect(() => {
    if (data?.recipientName) {
      document.title = `💌 For ${data.recipientName} | LoveNotes`;
    } else {
      document.title = "You have a new message 💌";
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
            origin: { x: 0.5, y: 0.5 }, // Approximate center since this is full screen view
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
                    key="envelope-group"
                    initial={{ scale: 0.8, opacity: 0, y: 100 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 1.5, opacity: 0, y: 200, transition: { duration: 0.8 } }}
                    className="relative w-[340px] md:w-[450px] cursor-pointer"
                    onClick={step === 'CLOSED' ? handleOpen : undefined}
                >
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
                    </div>
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
