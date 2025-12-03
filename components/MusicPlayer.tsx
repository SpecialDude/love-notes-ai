
import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { getRandomMusicUrl } from '../utils/music';

interface Props {
  src: string;
  autoPlay?: boolean;
}

const MusicPlayer: React.FC<Props> = ({ src, autoPlay }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);

  // Sync prop src to internal state, resetting fallback logic when song changes
  useEffect(() => {
    setCurrentSrc(src);
    setUsedFallback(false);
    setHasError(false);
  }, [src]);

  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.volume = 0.5;
        // Try autoplay if we already interacted
        if (autoPlay && hasInteracted && !hasError && audioRef.current.paused) {
             const playPromise = audioRef.current.play();
             if (playPromise !== undefined) {
                playPromise
                  .then(() => setIsPlaying(true))
                  .catch(error => {
                      // Autoplay often fails without interaction, this is normal
                      setIsPlaying(false);
                  });
             }
        }
    }
  }, [currentSrc, autoPlay, hasInteracted, hasError]);

  // Expose a listener for the first interaction on the page to unlock AudioContext
  useEffect(() => {
    const handleInteraction = () => {
        setHasInteracted(true);
        if (autoPlay && audioRef.current && audioRef.current.paused && !hasError) {
             audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
        window.removeEventListener('click', handleInteraction);
        window.removeEventListener('touchstart', handleInteraction);
        window.removeEventListener('keydown', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    return () => {
        window.removeEventListener('click', handleInteraction);
        window.removeEventListener('touchstart', handleInteraction);
        window.removeEventListener('keydown', handleInteraction);
    };
  }, [autoPlay, hasError]);

  const togglePlay = () => {
    if (!audioRef.current || hasError) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Play failed:", e));
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
      if (!audioRef.current) return;
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
  }

  const handleError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const target = e.target as HTMLAudioElement;
    console.warn(`MusicPlayer Error (${target.error?.code}): Could not load ${currentSrc}.`);
    
    // Fallback Logic
    if (!usedFallback) {
        console.log("Attempting to fallback to music from Environment Variables...");
        const fallbackUrl = getRandomMusicUrl();
        
        if (fallbackUrl && fallbackUrl !== currentSrc) {
            console.log("Fallback URL found:", fallbackUrl);
            setUsedFallback(true);
            setCurrentSrc(fallbackUrl);
            // We do not setHasError(true) yet, we give the fallback a chance
            return;
        } else {
            console.warn("No fallback URL available in Env Vars or it is the same as broken URL.");
        }
    }

    // If we are here, either fallback failed or wasn't available
    setHasError(true);
    setIsPlaying(false);
  };

  if (hasError) return null; // Hide player if completely broken

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-white/80 backdrop-blur-sm p-3 rounded-full shadow-lg border border-pink-100 transition-all hover:scale-105 animate-in fade-in slide-in-from-bottom-4">
      <audio 
        ref={audioRef} 
        src={currentSrc} 
        loop 
        preload="auto" 
        onError={handleError}
      />
      
      <button 
        onClick={toggleMute}
        className="p-2 rounded-full hover:bg-pink-100 text-pink-600 transition-colors"
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      <button 
        onClick={togglePlay}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-pink-500 text-white hover:bg-pink-600 transition-colors shadow-md"
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        )}
      </button>
    </div>
  );
};

export default MusicPlayer;
