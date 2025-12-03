
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Wand2, Copy, Check, Eye, Heart, Loader2, Globe, Lock } from 'lucide-react';
import { ThemeType, RelationshipType, LetterData } from '../types';
import { THEMES } from '../constants';
import { generateOrEnhanceMessage, suggestTheme } from '../services/gemini';
import { saveLetterToCloud } from '../services/firebase';
import { getRandomMusicUrl } from '../utils/music';
import AnimatedBackground from '../components/AnimatedBackground';
import confetti from 'canvas-confetti';
import { SocialShare } from '../components/SocialShare';

interface Props {
  onPreview: (data: LetterData) => void;
  initialData?: LetterData;
}

const CreateLetter: React.FC<Props> = ({ onPreview, initialData }) => {
  const [senderName, setSenderName] = useState(initialData?.senderName || '');
  const [recipientName, setRecipientName] = useState(initialData?.recipientName || '');
  const [relationship, setRelationship] = useState<RelationshipType>(initialData?.relationship || RelationshipType.PARTNER);
  const [content, setContent] = useState(initialData?.content || '');
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>(initialData?.theme || ThemeType.VELVET);
  const [isPublic, setIsPublic] = useState(initialData?.isPublic || false);
  
  const [generatedLink, setGeneratedLink] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [aiMode, setAiMode] = useState<'DRAFT' | 'POLISH'>((initialData?.content?.length || 0) > 50 ? 'POLISH' : 'DRAFT');

  useEffect(() => {
    if (initialData) {
        setSenderName(initialData.senderName);
        setRecipientName(initialData.recipientName);
        setRelationship(initialData.relationship);
        setContent(initialData.content);
        setSelectedTheme(initialData.theme);
        setIsPublic(initialData.isPublic);
        setAiMode(initialData.content.length > 50 ? 'POLISH' : 'DRAFT');
    }
  }, [initialData]);

  const handleContentChange = (val: string) => {
    setContent(val);
    setAiMode(val.length > 50 ? 'POLISH' : 'DRAFT');
  };

  const handleAIMagic = async () => {
    if (!senderName && !recipientName) {
        alert("Please enter your names first so the AI knows who is writing!");
        return;
    }
    
    setIsThinking(true);
    const result = await generateOrEnhanceMessage(content, senderName || 'Me', recipientName || 'My Love', relationship, aiMode);
    
    if (result === content && content.length > 0) {
       // Only warn if content didn't change (and wasn't empty)
       // console.warn("AI returned identical content.");
    }

    setContent(result);
    setAiMode('POLISH'); 
    
    if (content.length < 20 && result.length > 20) {
        const suggested = await suggestTheme(result, relationship);
        if (suggested) setSelectedTheme(suggested);
    }
    
    setIsThinking(false);
  };

  const getLetterData = (): LetterData => {
    // 1. Try to use existing music URL (if editing)
    // 2. Try to get a new random music URL from Env
    // 3. Explicitly default to NULL if neither exists (Firestore crashes on undefined)
    let music = initialData?.musicUrl;
    if (!music) {
        const randomMusic = getRandomMusicUrl();
        music = randomMusic || undefined;
    }
    
    // Explicitly nullify if undefined to satisfy Firestore
    const safeMusicUrl = music ?? null;

    return {
        senderName,
        recipientName,
        relationship,
        content,
        theme: selectedTheme,
        date: new Date().toISOString(),
        isPublic,
        views: 0,
        musicUrl: safeMusicUrl as string | undefined // TS casting, but runtime value is null or string
    };
  };

  const handlePreview = () => {
    if (!content) return alert("Please write a message first!");
    onPreview(getLetterData());
  };

  const fireContinuousConfetti = () => {
      const duration = 3000;
      const end = Date.now() + duration;

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: ['#ff0000', '#ffa500', '#ffffff'],
        });
        
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: ['#ff0000', '#ffa500', '#ffffff'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
  };

  const handleGenerateLink = async () => {
    if (!content) return alert("Please write a message first!");
    
    setIsSaving(true);
    // Force a fresh read of the data to ensure musicUrl is set
    const data = getLetterData();
    
    try {
        // Save to Firestore
        const id = await saveLetterToCloud(data);
        
        if (id) {
            const url = `${window.location.origin}/#/${id}`;
            setGeneratedLink(url);
            fireContinuousConfetti();
        }
    } catch (e) {
        console.error("Save failed", e);
        setIsSaving(false); // Reset loading state on error
    } finally {
        setIsSaving(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const currentTheme = THEMES[selectedTheme];

  return (
    <div className={`min-h-screen relative flex items-center justify-center p-4 pt-20 sm:p-4 transition-colors duration-700 ${currentTheme.bgGradient}`}>
      <AnimatedBackground theme={selectedTheme} />
      
      {/* Navigation to Feed */}
      <div className="absolute top-4 right-4 z-50">
          <a href="/#/feed" className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white font-bold transition-all text-xs sm:text-sm border border-white/20 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95">
              <Globe size={14} className="sm:w-4 sm:h-4" /> 
              {/* Show 'Feed' on mobile so user knows it's a button, 'Community Feed' on Desktop */}
              <span className="inline sm:hidden">Feed</span>
              <span className="hidden sm:inline">Community Feed</span>
          </a>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-3xl bg-black/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="bg-white/10 p-6 md:p-8 border-b border-white/10">
            <h1 className="text-3xl font-cinematic text-white text-center tracking-widest mb-2 text-shadow-sm">LoveNotes</h1>
            <p className="text-white/60 text-center text-sm">Create a timeless memory</p>
        </div>

        <div className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-white/70 uppercase tracking-wider ml-1">To</label>
                    <input 
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="Recipient Name"
                        className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:bg-white/20 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all font-medium"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-white/70 uppercase tracking-wider ml-1">From</label>
                    <input 
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="Your Name"
                        className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:bg-white/20 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all font-medium"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-white/70 uppercase tracking-wider ml-1">Relationship</label>
                <div className="flex flex-wrap gap-2">
                    {[
                        { id: RelationshipType.PARTNER, label: 'Partner' },
                        { id: RelationshipType.CRUSH, label: 'Crush' },
                        { id: RelationshipType.FRIEND, label: 'Best Friend' },
                        { id: RelationshipType.SIBLING, label: 'Family' },
                        { id: RelationshipType.SELF, label: 'Myself' },
                        { id: RelationshipType.OTHER, label: 'Other' },
                    ].map((rel) => (
                        <button 
                            key={rel.id}
                            onClick={() => setRelationship(rel.id)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${relationship === rel.id ? 'bg-white text-black border-white shadow-lg scale-105' : 'bg-transparent text-white border-white/20 hover:bg-white/10'}`}
                        >
                            {rel.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2 relative">
                <div className="flex justify-between items-end">
                    <label className="text-xs font-bold text-white/70 uppercase tracking-wider ml-1">Your Message</label>
                    <button 
                        onClick={handleAIMagic}
                        disabled={isThinking}
                        className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/30 hover:bg-indigo-500/50 border border-indigo-400/30 rounded-lg text-indigo-100 text-xs font-bold transition-all"
                    >
                        {isThinking ? <Sparkles size={12} className="animate-spin" /> : <Wand2 size={12} />}
                        {aiMode === 'DRAFT' ? 'AI Draft' : 'AI Enhance'}
                    </button>
                </div>
                
                <div className="relative">
                    <textarea 
                        value={content}
                        onChange={(e) => handleContentChange(e.target.value)}
                        placeholder="Write something from your heart..."
                        className={`
                            w-full min-h-[200px] bg-white/5 border border-white/10 rounded-xl p-5 
                            text-white placeholder-white/30 text-lg leading-relaxed resize-none 
                            focus:outline-none focus:bg-white/10 focus:ring-1 focus:ring-white/20 transition-all
                            ${currentTheme.fontFamily}
                        `}
                    />
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between">
                <div className="space-y-2 flex-1">
                    <label className="text-xs font-bold text-white/70 uppercase tracking-wider ml-1">Select Theme</label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                        {Object.values(THEMES).map(t => (
                            <button
                                key={t.id}
                                onClick={() => setSelectedTheme(t.id)}
                                className={`group relative aspect-square rounded-xl border-2 transition-all duration-300 ${selectedTheme === t.id ? 'border-white scale-110 shadow-xl ring-2 ring-white/20' : 'border-transparent hover:scale-105 opacity-80 hover:opacity-100'}`}
                                style={{ background: t.previewColor }}
                                title={t.name}
                            >
                                {selectedTheme === t.id && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Check size={14} className="text-white drop-shadow-md" />
                                    </div>
                                )}
                                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
                                    {t.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Public Toggle */}
                <div className="flex flex-col gap-2 min-w-[140px]">
                    <label className="text-xs font-bold text-white/70 uppercase tracking-wider ml-1">Visibility</label>
                    <button 
                        onClick={() => setIsPublic(!isPublic)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${isPublic ? 'bg-green-500/20 border-green-500/50 text-green-100' : 'bg-white/5 border-white/10 text-white/60'}`}
                    >
                        <span className="text-xs font-bold flex items-center gap-2">
                            {isPublic ? <Globe size={14} /> : <Lock size={14} />}
                            {isPublic ? 'Public Feed' : 'Private'}
                        </span>
                        <div className={`w-8 h-4 rounded-full relative transition-colors ${isPublic ? 'bg-green-500' : 'bg-gray-600'}`}>
                            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${isPublic ? 'left-4.5' : 'left-0.5'}`} style={{ left: isPublic ? '18px' : '2px' }} />
                        </div>
                    </button>
                </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
                {!generatedLink ? (
                    <>
                         <button 
                            onClick={handlePreview}
                            className="flex-1 py-3.5 rounded-xl font-bold text-white bg-white/10 hover:bg-white/20 border border-white/10 transition-all flex items-center justify-center gap-2"
                        >
                            <Eye size={18} /> Preview
                        </button>
                        <button 
                            onClick={handleGenerateLink}
                            disabled={isSaving}
                            className="flex-[2] py-3.5 rounded-xl font-bold text-black bg-white hover:bg-gray-100 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Heart size={18} className="text-rose-500 fill-rose-500 group-hover:scale-125 transition-transform duration-300" />}
                            {isSaving ? 'Generating...' : 'Generate Magic Link'}
                        </button>
                    </>
                ) : (
                    <div className="flex flex-col gap-4 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="w-full bg-green-500/20 border border-green-500/30 rounded-xl p-2 flex items-center gap-2">
                            <input 
                                readOnly 
                                value={generatedLink} 
                                className="flex-1 bg-transparent text-sm text-white px-3 py-2 outline-none font-mono"
                            />
                            <button 
                                onClick={copyToClipboard} 
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${isCopied ? 'bg-green-500 text-white shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}
                            >
                                {isCopied ? <Check size={16} /> : <Copy size={16} />}
                                {isCopied ? 'Copied!' : 'Copy'}
                            </button>
                            <button 
                                onClick={() => setGeneratedLink('')}
                                className="px-3 py-2 text-xs text-white/50 hover:text-white underline"
                            >
                                Reset
                            </button>
                        </div>
                        
                        <div className="text-center">
                             <p className="text-white/60 text-xs uppercase tracking-widest mb-3 font-bold">Share via</p>
                             <SocialShare 
                                url={generatedLink} 
                                message="I wrote a special secret note for you 💌✨ Tap to reveal:" 
                             />
                        </div>
                    </div>
                )}
            </div>

        </div>
      </motion.div>
    </div>
  );
};

export default CreateLetter;
