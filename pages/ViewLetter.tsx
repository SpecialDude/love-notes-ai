
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye } from 'lucide-react';
import { LetterData, ThemeType } from '../types';
import { THEMES } from '../constants';
import { incrementViewCount } from '../services/firebase';
import AnimatedBackground from '../components/AnimatedBackground';
import MusicPlayer from '../components/MusicPlayer';
import confetti from 'canvas-confetti';

interface Props {
  data: LetterData; // Now receives fully hydrated data
  onBack?: () => void;
}

const ViewLetter: React.FC<Props> = ({ data, onBack }) => {
  const [step, setStep] = useState<'CLOSED' | 'OPENING' | 'READING'>('CLOSED');
  const [musicSrc, setMusicSrc] = useState<string>('');
  const [viewCount, setViewCount] = useState(data.views || 0);

  useEffect(() => {
    if (data) {
        // Prioritize specific music saved with the letter
        if (data.musicUrl) {
            setMusicSrc(data.musicUrl);
        } else {
             // Fallback for legacy notes or if no env var was set during creation
            const theme = THEMES[data.theme || ThemeType.VELVET];
            setMusicSrc(theme.musicUrl);
        }

        // Increment view count if this is a fresh view (has ID and no onBack aka not preview)
        if (data.id && !onBack) {
            incrementViewCount(data.id);
            // Optimistically increment local state
            setViewCount((v) => v + 1);
        }
    }
  }, [data, onBack]);

  const handleOpen = () => {
    setStep('OPENING');
    
    // Trigger confetti slightly after start
    setTimeout(() => {
        fireConfetti();
    }, 500);

    // Transition to reading mode after animation completes
    setTimeout(() => {
        setStep('READING');
    }, 2500);
  };

  const fireConfetti = () => {
    const themeColors = data.theme === ThemeType.NOIR ? ['#000', '#555'] : ['#ff4d4d', '#ff9a9e', '#ffd1dc'];
    
    // Continuous confetti for 3.5 seconds
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

  const theme = THEMES[data.theme || ThemeType.VELVET];

  return (
    <div className={`min-h-screen relative overflow-hidden flex flex-col items-center justify-center ${theme.bgGradient}`}>
      <AnimatedBackground theme={data.theme} />
      
      {/* Play the selected music */}
      {musicSrc && <MusicPlayer src={musicSrc} autoPlay={true} />}

      {/* Navigation Buttons */}
      <div className="fixed top-6 left-6 z-50 flex gap-2">
          {onBack ? (
            <button 
                onClick={onBack}
                className="flex items-center gap-2 px-4 py-2 bg-black/20 backdrop-blur-md border border-white/20 rounded-full shadow-lg text-white font-bold hover:bg-black/40 transition-all"
            >
                <ArrowLeft size={18} /> Back to Editor
            </button>
          ) : (
            <a 
                href="/"
                className="flex items-center gap-2 px-4 py-2 bg-black/20 backdrop-blur-md border border-white/20 rounded-full shadow-lg text-white font-bold hover:bg-black/40 transition-all text-xs uppercase tracking-wide"
            >
                <ArrowLeft size={16} /> Create
            </a>
          )}
      </div>

      {/* View Counter Display */}
      {step === 'READING' && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-2 px-3 py-1 bg-black/20 backdrop-blur-sm rounded-full text-white/70 text-xs">
              <Eye size={14} /> {viewCount}
          </div>
      )}

      {/* 3D Scene Container */}
      <div className="relative w-full max-w-4xl h-[80vh] flex items-center justify-center perspective-1000">
        
        <AnimatePresence mode="wait">
            
            {/* STAGE 1 & 2: THE ENVELOPE OPENING */}
            {step !== 'READING' && (
                <motion.div
                    key="envelope-group"
                    initial={{ scale: 0.8, opacity: 0, y: 100 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 1.5, opacity: 0, y: 200, transition: { duration: 0.8 } }}
                    className="relative w-[340px] md:w-[450px] cursor-pointer"
                    onClick={step === 'CLOSED' ? handleOpen : undefined}
                >
                    {/* The Envelope Body (Back + Pocket) */}
                    <div className={`relative h-[240px] md:h-[300px] ${theme.envelopeColor} rounded-b-xl shadow-2xl flex flex-col items-center justify-center z-20`}>
                        
                        {/* Letter sliding out animation */}
                        <motion.div 
                            className={`absolute w-[90%] h-[90%] ${theme.paperColor} rounded-lg shadow-md z-10 flex flex-col p-6 items-center`}
                            initial={{ y: 0 }}
                            animate={step === 'OPENING' ? { y: -200, zIndex: 0 } : { y: 0 }}
                            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
                        >
                             {/* Preview Text on sliding card */}
                             <div className="w-full h-full opacity-30 overflow-hidden text-[6px] md:text-[8px] leading-relaxed select-none">
                                {data.content}
                             </div>
                        </motion.div>

                        {/* Front Pocket of Envelope (Visual overlay) */}
                        <div className={`absolute inset-0 z-30 pointer-events-none rounded-b-xl border-t border-white/10 ${theme.envelopeColor}`} 
                             style={{ clipPath: 'polygon(0 0, 50% 40%, 100% 0, 100% 100%, 0 100%)' }}>
                        </div>

                        {/* Text on Envelope */}
                        <div className="absolute bottom-10 z-40 text-white/90 text-center font-elegant">
                             <p className="text-xs uppercase tracking-widest opacity-60 mb-1">For</p>
                             <h2 className="text-2xl italic font-serif">{data.recipientName}</h2>
                        </div>
                    </div>

                    {/* The Flap (Top Triangle) */}
                    <motion.div
                        className={`absolute top-0 left-0 w-full h-[120px] md:h-[150px] ${theme.envelopeColor} z-30 rounded-t-xl origin-top border-b border-black/10`}
                        style={{ 
                            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                            backfaceVisibility: 'visible' 
                        }}
                        initial={{ rotateX: 0 }}
                        animate={step === 'OPENING' ? { rotateX: 180, zIndex: 0 } : { rotateX: 0 }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                    >
                         {/* Wax Seal */}
                        <motion.div 
                            animate={step === 'OPENING' ? { opacity: 0 } : { opacity: 1 }}
                            className="absolute top-[90%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-red-800 rounded-full border-2 border-red-900 shadow-md flex items-center justify-center text-[8px] text-red-200 font-bold"
                        >
                            LOVE
                        </motion.div>
                    </motion.div>
                    
                    {step === 'CLOSED' && (
                        <p className="absolute -bottom-12 w-full text-center text-white/70 animate-pulse text-sm">
                            Tap to Open
                        </p>
                    )}
                </motion.div>
            )}

            {/* STAGE 3: THE FULL LETTER */}
            {step === 'READING' && (
                <motion.div 
                    key="letter-full"
                    initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 0.8, type: "spring" }}
                    className="relative z-50 w-full max-w-2xl px-4 flex justify-center"
                >
                    <div className={`
                        relative ${theme.paperColor} 
                        p-8 md:p-12 
                        w-full
                        max-h-[80vh]
                        overflow-y-auto
                        custom-scrollbar
                        shadow-[0_0_50px_rgba(0,0,0,0.5)] 
                        ${theme.textColor}
                        paper-texture
                        flex flex-col
                        rounded-sm
                    `}>
                        {/* Tape/Sticker effect at top */}
                        <div className="sticky top-0 left-0 right-0 h-0 flex justify-center z-10">
                            <div className="relative -top-10 w-32 h-8 bg-white/30 backdrop-blur-sm rotate-1 shadow-sm transform" />
                        </div>

                        <div className="flex-1 flex flex-col">
                            <div className="mb-8 opacity-60 text-xs font-serif uppercase tracking-widest text-center border-b border-current pb-4 shrink-0">
                                {new Date(data.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>

                            <h1 className={`text-4xl md:text-5xl mb-8 ${theme.fontFamily} font-bold shrink-0`}>
                                My Dearest {data.recipientName},
                            </h1>
                            
                            <div className={`text-lg md:text-2xl leading-relaxed whitespace-pre-wrap ${theme.fontFamily} opacity-90`}>
                                {data.content}
                            </div>
                            
                            <div className="mt-12 pt-8 text-right shrink-0">
                                <p className="text-sm opacity-60 mb-2 font-serif italic">Yours truly,</p>
                                <p className={`text-3xl md:text-5xl ${theme.fontFamily} font-bold transform -rotate-2 inline-block`}>
                                    {data.senderName}
                                </p>
                            </div>

                            {!onBack && (
                                <div className="mt-12 pt-8 border-t border-black/10 text-center shrink-0">
                                    <a href="/" className="inline-block px-8 py-3 bg-black/5 hover:bg-black/10 text-current rounded-full font-bold transition-all text-sm uppercase tracking-widest">
                                        Write Your Own
                                    </a>
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
