
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { LetterData, ThemeType } from '../types';
import { getPublicFeed, incrementViewCount, toggleLike } from '../services/firebase';
import { THEMES } from '../constants';
import { getRandomMusicUrl } from '../utils/music';
import { getDeviceId, getLocalLikedIds, addLocalLike, removeLocalLike } from '../utils/device';
import AnimatedBackground from '../components/AnimatedBackground';
import MusicPlayer from '../components/MusicPlayer';
import { SocialShare } from '../components/SocialShare';
import { ArrowLeft, Eye, Heart, Loader2, Share2, Check, ChevronDown, Copy } from 'lucide-react';
import { DocumentSnapshot } from 'firebase/firestore';
import { useToast } from '../components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const Feed: React.FC = () => {
  const { showToast } = useToast();
  const [letters, setLetters] = useState<LetterData[]>([]);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [activeTheme, setActiveTheme] = useState<ThemeType>(ThemeType.VELVET);
  const [activeMusic, setActiveMusic] = useState<string>('');
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [shareModalLetterId, setShareModalLetterId] = useState<string | null>(null);
  
  // Like State
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  // Track viewed IDs to prevent double counting in same session
  const viewedIds = useRef<Set<string>>(new Set());
  
  // Set Title
  useEffect(() => {
    document.title = "💖 Community Feed | LoveNotes";
    // Initialize Liked Cache
    setLikedIds(getLocalLikedIds());
  }, []);

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
    try {
        const result = await getPublicFeed(lastDoc);
        if (result.letters.length > 0) {
            setLetters(prev => {
                const newLetters = result.letters.filter(n => !prev.find(p => p.id === n.id));
                return [...prev, ...newLetters];
            });
            setLastDoc(result.lastDoc);
        }
    } catch (e: any) {
        if (e.message === 'MISSING_INDEX') {
             showToast("🚨 Developer Check: Open Console to Create Firebase Index", 'error');
        } else {
             console.error("Feed error", e);
        }
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadMore();
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const container = e.currentTarget;
      const index = Math.round(container.scrollTop / container.clientHeight);
      
      if (index !== activeIndex && letters[index]) {
          setActiveIndex(index);
          const currentLetter = letters[index];
          const theme = THEMES[currentLetter.theme];
          setActiveTheme(currentLetter.theme);
          
          let music = currentLetter.musicUrl;
          if (!music) music = getRandomMusicUrl() || undefined;
          if (!music) music = theme.musicUrl;
          
          if (music) setActiveMusic(music);
      }
  };

  // View counting logic
  useEffect(() => {
      const currentLetter = letters[activeIndex];
      if (!currentLetter || !currentLetter.id) return;

      if (activeMusic === '') {
        const theme = THEMES[currentLetter.theme];
        setActiveTheme(currentLetter.theme);
        
        let music = currentLetter.musicUrl;
        if (!music) music = getRandomMusicUrl() || undefined;
        if (!music) music = theme.musicUrl;
        
        if (music) setActiveMusic(music);
      }

      if (viewedIds.current.has(currentLetter.id)) return;

      const timer = setTimeout(() => {
          if (currentLetter.id) {
            incrementViewCount(currentLetter.id);
            viewedIds.current.add(currentLetter.id);
            
            setLetters(prev => prev.map((l, i) => 
                i === activeIndex ? { ...l, views: (l.views || 0) + 1 } : l
            ));
          }
      }, 2000);

      return () => clearTimeout(timer);
  }, [activeIndex, letters]);

  const handleToggleLike = async (letterId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const deviceId = getDeviceId();
    const isLiked = likedIds.has(letterId);

    // 1. Optimistic Update (Immediate Feedback)
    if (isLiked) {
        // SAD: Unlike
        const newSet = new Set(likedIds);
        newSet.delete(letterId);
        setLikedIds(newSet);
        removeLocalLike(letterId);
        
        setLetters(prev => prev.map(l => l.id === letterId ? { ...l, likes: (l.likes || 0) - 1 } : l));
        
        // Sad Tooltip via Toast
        showToast("Oh no... 💔 Unliked", 'info');
    } else {
        // HAPPY: Like
        const newSet = new Set(likedIds);
        newSet.add(letterId);
        setLikedIds(newSet);
        addLocalLike(letterId);
        
        setLetters(prev => prev.map(l => l.id === letterId ? { ...l, likes: (l.likes || 0) + 1 } : l));

        // HAPPY: Confetti
        const btn = event.currentTarget.getBoundingClientRect();
        const x = (btn.left + btn.width / 2) / window.innerWidth;
        const y = (btn.top + btn.height / 2) / window.innerHeight;
        
        confetti({
            particleCount: 15,
            spread: 60,
            origin: { x, y },
            colors: ['#ef4444', '#f472b6', '#ffffff'],
            shapes: ['circle', 'square'], // Heart shape support varies by browser, sticking to reliable shapes
            scalar: 0.8
        });
    }

    // 2. Server Update (Background)
    const success = await toggleLike(letterId, deviceId);
    if (!success) {
        // Revert if server fails (Rare)
        if (isLiked) {
            addLocalLike(letterId);
            setLikedIds(prev => new Set(prev).add(letterId));
            setLetters(prev => prev.map(l => l.id === letterId ? { ...l, likes: (l.likes || 0) + 1 } : l));
        } else {
            removeLocalLike(letterId);
            setLikedIds(prev => { const n = new Set(prev); n.delete(letterId); return n; });
            setLetters(prev => prev.map(l => l.id === letterId ? { ...l, likes: (l.likes || 0) - 1 } : l));
        }
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black text-white">
        <div className={`absolute inset-0 transition-colors duration-1000 ${THEMES[activeTheme].bgGradient}`}>
            <AnimatedBackground theme={activeTheme} />
        </div>

        {activeMusic && <MusicPlayer src={activeMusic} autoPlay={true} />}

        <div className="fixed top-0 left-0 w-full z-50 p-4 flex justify-between items-start pointer-events-none">
            <a href="/" className="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-black/20 backdrop-blur-md border border-white/20 rounded-full text-white font-bold text-xs uppercase tracking-wide hover:bg-black/40 transition-all shadow-lg hover:scale-105">
                <ArrowLeft size={14} /> Create Note
            </a>
        </div>

        {letters.length > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-1 opacity-60 animate-bounce pointer-events-none">
                <span className="text-[10px] uppercase tracking-widest text-white font-medium">Scroll</span>
                <ChevronDown size={20} className="text-white" />
            </div>
        )}

        <div 
            className="h-full w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth relative z-10 no-scrollbar"
            onScroll={handleScroll}
        >
            {letters.map((letter, index) => {
                const theme = THEMES[letter.theme];
                const isLast = index === letters.length - 1;
                const isActive = index === activeIndex;
                const isLiked = letter.id ? likedIds.has(letter.id) : false;
                
                return (
                    <div 
                        key={letter.id || index} 
                        ref={isLast ? lastElementRef : null}
                        className="h-screen w-full snap-start snap-always flex items-center justify-center p-4 md:p-6 relative"
                    >
                         <div className="relative w-full max-w-4xl flex items-center justify-center">
                            
                            {/* The Letter Card */}
                            <div className={`
                                relative w-full max-w-xl max-h-[70vh] 
                                flex flex-col
                                ${theme.paperColor} ${theme.textColor} ${theme.fontFamily}
                                rounded-sm shadow-[0_10px_40px_rgba(0,0,0,0.3)] 
                                paper-texture
                                transition-all duration-700
                                ${isActive ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-40 translate-y-10'}
                            `}>
                                <div className="absolute -top-3 -right-3 w-16 h-20 bg-white border-4 border-double border-gray-300 shadow-md transform rotate-6 z-20 flex items-center justify-center overflow-hidden">
                                    <div className="w-[90%] h-[90%] border border-dashed border-gray-400 opacity-50 bg-gray-100 flex items-center justify-center">
                                        <Heart size={20} className="text-red-300 fill-red-100" />
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar pl-8 py-8 pr-16 md:p-12 md:pr-12">
                                    <div className="mb-6 opacity-60 text-xs font-serif uppercase tracking-widest border-b border-current pb-2 w-fit">
                                        {new Date(letter.date).toLocaleDateString()}
                                    </div>

                                    <h2 className="text-3xl font-bold mb-6">Dear {letter.recipientName},</h2>
                                    
                                    <p className="text-xl md:text-2xl leading-relaxed whitespace-pre-wrap opacity-95">
                                        {letter.content}
                                    </p>

                                    <div className="mt-12 text-right">
                                        <p className="text-sm opacity-60 italic mb-2">Yours truly,</p>
                                        <p className="text-2xl font-bold transform -rotate-2 inline-block">
                                            {letter.senderName}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Actions */}
                            <div className={`
                                absolute right-2 bottom-24 md:right-[-60px] md:bottom-auto 
                                flex flex-col gap-6 z-30
                                transition-all duration-500 delay-300
                                ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}
                            `}>
                                {/* Like Button */}
                                {letter.id && (
                                    <motion.button 
                                        whileTap={{ scale: 0.8 }}
                                        onClick={(e) => handleToggleLike(letter.id!, e)}
                                        className="flex flex-col items-center gap-1 group relative"
                                    >
                                        <div className={`
                                            w-12 h-12 flex items-center justify-center backdrop-blur-md rounded-full border shadow-lg transition-all duration-300
                                            ${isLiked ? 'bg-red-500/20 border-red-500 text-red-500 scale-110' : 'bg-black/20 border-white/20 text-white hover:bg-white/20'}
                                        `}>
                                            <Heart size={20} className={`transition-all duration-300 ${isLiked ? 'fill-red-500' : ''}`} />
                                        </div>
                                        <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/20 px-2 py-0.5 rounded-full">
                                            {letter.likes || 0}
                                        </span>
                                    </motion.button>
                                )}

                                {/* Views */}
                                <div className="flex flex-col items-center gap-1 group">
                                    <div className="w-12 h-12 flex items-center justify-center bg-black/20 backdrop-blur-md rounded-full text-white border border-white/20 shadow-lg group-hover:bg-black/40 transition-colors">
                                        <Eye size={20} />
                                    </div>
                                    <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/20 px-2 py-0.5 rounded-full">
                                        {letter.views || 0}
                                    </span>
                                </div>

                                {/* Share */}
                                {letter.id && (
                                    <button 
                                        onClick={() => setShareModalLetterId(letter.id!)}
                                        className="flex flex-col items-center gap-1 group active:scale-90 transition-transform"
                                    >
                                        <div className={`w-12 h-12 flex items-center justify-center backdrop-blur-md rounded-full border shadow-lg transition-colors ${shareModalLetterId === letter.id ? 'bg-white text-black' : 'bg-black/20 border-white/20 text-white hover:bg-white/20'}`}>
                                            <Share2 size={20} />
                                        </div>
                                        <span className="text-[10px] font-bold text-white drop-shadow-md bg-black/20 px-2 py-0.5 rounded-full">
                                            Share
                                        </span>
                                    </button>
                                )}

                                {/* Relationship Tag */}
                                <div className="flex flex-col items-center gap-1">
                                    <div className="w-12 h-12 flex items-center justify-center bg-pink-500/20 backdrop-blur-md rounded-full text-pink-200 border border-pink-500/30 shadow-lg">
                                        <Heart size={20} className="fill-pink-500/50" />
                                    </div>
                                    <span className="text-[10px] font-bold text-white drop-shadow-md uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-full max-w-[70px] truncate text-center">
                                        {letter.relationship}
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>
                );
            })}

            {loading && (
                <div className="h-40 w-full flex items-center justify-center snap-center">
                    <div className="flex flex-col items-center gap-2">
                         <Loader2 className="animate-spin text-white" size={32} />
                         <span className="text-white/50 text-xs uppercase tracking-widest">Loading more notes...</span>
                    </div>
                </div>
            )}
            
            {!loading && letters.length === 0 && (
                 <div className="h-screen flex items-center justify-center flex-col text-white/70 p-8 text-center">
                     <Heart size={48} className="text-white/20 mb-4" />
                     <p className="text-xl mb-4 font-serif">No public notes found yet.</p>
                     <p className="text-sm opacity-50 mb-8 max-w-md">Be the first to share your love with the world. Your note will appear here for everyone to see.</p>
                     <a href="/" className="px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl hover:scale-105">
                         Write a Note
                     </a>
                 </div>
            )}
        </div>

        {shareModalLetterId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setShareModalLetterId(null)}>
                <div 
                    className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl animate-in zoom-in-95 duration-200" 
                    onClick={e => e.stopPropagation()}
                >
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 font-serif">Share LoveNote</h3>
                    <p className="text-gray-500 text-sm mb-6">Spread the love with the world</p>
                    
                    <SocialShare 
                        url={`${window.location.origin}/#/${shareModalLetterId}`} 
                        message="Read this beautiful note on LoveNotes 💖✨"
                    />
                    
                    <button 
                        onClick={() => setShareModalLetterId(null)} 
                        className="mt-8 text-gray-400 hover:text-gray-800 font-bold text-xs uppercase tracking-widest transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default Feed;
