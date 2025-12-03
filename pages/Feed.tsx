import React, { useEffect, useState, useRef, useCallback } from 'react';
import { LetterData, ThemeType } from '../types';
import { getPublicFeed, incrementViewCount } from '../services/firebase';
import { THEMES } from '../constants';
import AnimatedBackground from '../components/AnimatedBackground';
import MusicPlayer from '../components/MusicPlayer';
import { ArrowLeft, Eye, Heart, Loader2 } from 'lucide-react';
import { DocumentSnapshot } from 'firebase/firestore';

const Feed: React.FC = () => {
  const [letters, setLetters] = useState<LetterData[]>([]);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [activeTheme, setActiveTheme] = useState<ThemeType>(ThemeType.VELVET);
  const [activeMusic, setActiveMusic] = useState<string>('');
  const [activeIndex, setActiveIndex] = useState<number>(0);
  
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading]);

  const loadMore = async () => {
    setLoading(true);
    const result = await getPublicFeed(lastDoc);
    setLetters(prev => [...prev, ...result.letters]);
    setLastDoc(result.lastDoc);
    setLoading(false);
  };

  useEffect(() => {
    loadMore();
  }, []);

  // Track visibility for active card detection
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const container = e.currentTarget;
      const index = Math.round(container.scrollTop / window.innerHeight);
      
      if (index !== activeIndex && letters[index]) {
          setActiveIndex(index);
          const currentLetter = letters[index];
          const theme = THEMES[currentLetter.theme];
          setActiveTheme(currentLetter.theme);
          setActiveMusic(theme.musicUrl);
      }
  };

  // Smart View Counting: Only count if user stays on card for 2 seconds
  useEffect(() => {
      const currentLetter = letters[activeIndex];
      if (!currentLetter || !currentLetter.id) return;

      const timer = setTimeout(() => {
          incrementViewCount(currentLetter.id!);
          // Optimistically update view count in UI
          setLetters(prev => prev.map((l, i) => i === activeIndex ? { ...l, views: (l.views || 0) + 1 } : l));
      }, 2000);

      return () => clearTimeout(timer);
  }, [activeIndex, letters]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black text-white">
        
        {/* Dynamic Background that changes based on active scroll item */}
        <div className={`absolute inset-0 transition-colors duration-1000 ${THEMES[activeTheme].bgGradient}`}>
            <AnimatedBackground theme={activeTheme} />
        </div>

        {/* Dynamic Music */}
        {activeMusic && <MusicPlayer src={activeMusic} autoPlay={true} />}

        {/* Back Button */}
        <div className="fixed top-4 left-4 z-50">
            <a href="/" className="flex items-center gap-2 px-4 py-2 bg-black/20 backdrop-blur-md border border-white/20 rounded-full text-white font-bold text-sm hover:bg-black/40 transition-all">
                <ArrowLeft size={16} /> Home
            </a>
        </div>

        {/* Infinite Scroll Container */}
        <div 
            className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth relative z-10 no-scrollbar"
            onScroll={handleScroll}
        >
            {letters.map((letter, index) => {
                const theme = THEMES[letter.theme];
                const isLast = index === letters.length - 1;
                
                return (
                    <div 
                        key={letter.id || index} 
                        ref={isLast ? lastElementRef : null}
                        className="h-screen w-full snap-start snap-always flex items-center justify-center p-4"
                    >
                        {/* Feed Card */}
                        <div className={`
                            relative w-full max-w-xl max-h-[80vh] overflow-y-auto custom-scrollbar
                            ${theme.paperColor} ${theme.textColor} ${theme.fontFamily}
                            rounded-xl shadow-2xl p-8 md:p-12
                            paper-texture flex flex-col
                        `}>
                            {/* Header */}
                            <div className="flex justify-between items-center mb-6 opacity-60 border-b border-current pb-2">
                                <span className="text-xs uppercase tracking-widest">
                                    {new Date(letter.date).toLocaleDateString()}
                                </span>
                                <div className="flex items-center gap-1 text-xs font-bold">
                                    <Eye size={14} /> {letter.views || 0}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 flex flex-col justify-center min-h-[300px]">
                                <h2 className="text-3xl font-bold mb-6">Dear {letter.recipientName},</h2>
                                <p className="text-xl md:text-2xl leading-relaxed whitespace-pre-wrap opacity-90">
                                    {letter.content}
                                </p>
                                <div className="mt-8 text-right">
                                    <p className="text-sm opacity-60 italic mb-1">Love,</p>
                                    <p className="text-2xl font-bold transform -rotate-2 inline-block">
                                        {letter.senderName}
                                    </p>
                                </div>
                            </div>

                            {/* Footer Interaction */}
                            <div className="mt-8 pt-6 border-t border-current/10 flex justify-center opacity-70">
                                <div className="flex gap-2 items-center text-xs uppercase tracking-widest">
                                    <Heart size={14} className="fill-current" />
                                    <span>{letter.relationship}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            {loading && (
                <div className="h-20 w-full flex items-center justify-center">
                    <Loader2 className="animate-spin text-white" />
                </div>
            )}
            
            {!loading && letters.length === 0 && (
                 <div className="h-screen flex items-center justify-center flex-col text-white/70">
                     <p>No public notes yet.</p>
                     <a href="/" className="mt-4 underline">Be the first to write one!</a>
                 </div>
            )}
        </div>
    </div>
  );
};

export default Feed;