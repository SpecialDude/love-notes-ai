
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Wand2, Copy, Check, Eye, Heart, Loader2, Globe, Lock, Download, Calendar, Clock, ChevronRight, Gift, Ticket, MessageCircle, Mail, Key, Utensils, Clapperboard } from 'lucide-react';
import { ThemeType, RelationshipType, LetterData, ThemeCategory, CouponStyle, RedemptionMethod } from '../types';
import { THEMES, COUNTRY_CODES } from '../constants';
import { generateOrEnhanceMessage, suggestTheme } from '../services/gemini';
import { saveLetterToCloud } from '../services/firebase';
import { getRandomMusicUrl } from '../utils/music';
import AnimatedBackground from '../components/AnimatedBackground';
import confetti from 'canvas-confetti';
import { SocialShare } from '../components/SocialShare';
import { useToast } from '../components/Toast';

interface Props {
  onPreview: (data: LetterData) => void;
  initialData?: LetterData;
}

const CreateLetter: React.FC<Props> = ({ onPreview, initialData }) => {
  const { showToast } = useToast();
  const [senderName, setSenderName] = useState(initialData?.senderName || '');
  const [recipientName, setRecipientName] = useState(initialData?.recipientName || '');
  const [relationship, setRelationship] = useState<RelationshipType>(initialData?.relationship || RelationshipType.PARTNER);
  const [content, setContent] = useState(initialData?.content || '');
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>(initialData?.theme || ThemeType.WINTER);
  const [isPublic, setIsPublic] = useState(initialData?.isPublic || false);
  
  // Theme Categories
  const [activeCategory, setActiveCategory] = useState<ThemeCategory>(THEMES[initialData?.theme || ThemeType.WINTER].category);

  // Time Capsule State
  const [isTimeCapsule, setIsTimeCapsule] = useState(!!initialData?.unlockDate);
  const [unlockDate, setUnlockDate] = useState(initialData?.unlockDate || '');

  // Coupon State
  const [hasCoupon, setHasCoupon] = useState(!!initialData?.coupon);
  const [couponTitle, setCouponTitle] = useState(initialData?.coupon?.title || '');
  const [couponStyle, setCouponStyle] = useState<CouponStyle>(initialData?.coupon?.style || 'GOLD');
  const [redemptionMethod, setRedemptionMethod] = useState<RedemptionMethod>(initialData?.coupon?.redemptionMethod || 'WHATSAPP');
  const [countryCode, setCountryCode] = useState('+234');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [senderEmail, setSenderEmail] = useState(initialData?.coupon?.senderEmail || '');
  const [secretCode, setSecretCode] = useState(initialData?.coupon?.secretCode || '');
  
  const [generatedLink, setGeneratedLink] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [aiMode, setAiMode] = useState<'DRAFT' | 'POLISH'>((initialData?.content?.length || 0) > 50 ? 'POLISH' : 'DRAFT');
  
  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Set Page Title and PWA Listener
  useEffect(() => {
    document.title = "Write a LoveNote ✒️ | Create Something Beautiful";
    
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    if (initialData) {
        setSenderName(initialData.senderName);
        setRecipientName(initialData.recipientName);
        setRelationship(initialData.relationship);
        setContent(initialData.content);
        setSelectedTheme(initialData.theme);
        setIsPublic(initialData.isPublic);
        if (initialData.unlockDate) {
            setIsTimeCapsule(true);
            setUnlockDate(initialData.unlockDate);
        }
        if (initialData.coupon) {
            setHasCoupon(true);
            setCouponTitle(initialData.coupon.title);
            setCouponStyle(initialData.coupon.style);
            setRedemptionMethod(initialData.coupon.redemptionMethod);
            setSenderEmail(initialData.coupon.senderEmail || '');
            setSecretCode(initialData.coupon.secretCode || '');
            
            // Handle WhatsApp split if stored
            if (initialData.coupon.senderWhatsApp) {
                // Heuristic: try to match known codes
                const foundCode = COUNTRY_CODES.find(c => initialData.coupon!.senderWhatsApp!.startsWith(c.code));
                if (foundCode) {
                    setCountryCode(foundCode.code);
                    setPhoneNumber(initialData.coupon.senderWhatsApp.slice(foundCode.code.length));
                } else {
                    setPhoneNumber(initialData.coupon.senderWhatsApp);
                }
            }
        }
        setAiMode(initialData.content.length > 50 ? 'POLISH' : 'DRAFT');
        // Update category based on initial theme
        if (initialData.theme) {
            setActiveCategory(THEMES[initialData.theme].category);
        }
    }
  }, [initialData]);

  const handleContentChange = (val: string) => {
    setContent(val);
    setAiMode(val.length > 50 ? 'POLISH' : 'DRAFT');
  };

  const handleAIMagic = async () => {
    if (!senderName && !recipientName) {
        showToast("Please enter names first so the AI knows who is writing!", 'error');
        return;
    }
    
    setIsThinking(true);
    const result = await generateOrEnhanceMessage(content, senderName || 'Me', recipientName || 'My Love', relationship, aiMode);
    
    setContent(result);
    setAiMode('POLISH'); 
    
    if (content.length < 20 && result.length > 20) {
        const suggested = await suggestTheme(result, relationship);
        if (suggested) {
            setSelectedTheme(suggested);
            setActiveCategory(THEMES[suggested].category);
        }
    }
    
    setIsThinking(false);
    showToast("✨ AI magic applied!", 'success');
  };

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setDeferredPrompt(null);
      });
    }
  };

  const getLetterData = (): LetterData => {
    let music = initialData?.musicUrl;
    if (!music) {
        const theme = THEMES[selectedTheme];
        music = theme.musicUrl; 
    }
    const safeMusicUrl = music ?? null;

    let couponData = undefined;
    if (hasCoupon && couponTitle.trim()) {
        couponData = {
            title: couponTitle,
            style: couponStyle,
            redemptionMethod: redemptionMethod,
            senderEmail: senderEmail || undefined,
            secretCode: secretCode || undefined,
            senderWhatsApp: undefined
        };
        
        if (redemptionMethod === 'WHATSAPP' && phoneNumber.trim()) {
            // Clean phone number
            const cleanNum = phoneNumber.replace(/\D/g, '');
            couponData.senderWhatsApp = `${countryCode}${cleanNum}`;
        }
    }

    return {
        senderName,
        recipientName,
        relationship,
        content,
        theme: selectedTheme,
        date: new Date().toISOString(),
        isPublic,
        views: 0,
        likes: 0, 
        musicUrl: safeMusicUrl as string | undefined,
        unlockDate: isTimeCapsule && unlockDate ? unlockDate : undefined,
        coupon: couponData
    };
  };

  const handlePreview = () => {
    if (!content) {
        showToast("Please write a message first!", 'error');
        return;
    }
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
    if (!content) {
        showToast("Please write a message first!", 'error');
        return;
    }
    
    // Validation for time capsule
    if (isTimeCapsule) {
        if (!unlockDate) {
            showToast("Please select a date to unlock your Time Capsule!", 'error');
            return;
        }
        const unlockTime = new Date(unlockDate).getTime();
        if (unlockTime <= Date.now()) {
            showToast("The unlock date must be in the future!", 'error');
            return;
        }
    }
    
    setIsSaving(true);
    const data = getLetterData();
    
    try {
        const id = await saveLetterToCloud(data);
        if (id) {
            const url = `${window.location.origin}/#/${id}`;
            setGeneratedLink(url);
            fireContinuousConfetti();
            showToast("Magic Link Created! 🎉", 'success');
        }
    } catch (e: any) {
        console.error("Save failed", e);
        showToast(e.message || "Failed to save letter. Please try again.", 'error');
        setIsSaving(false);
    } finally {
        setIsSaving(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setIsCopied(true);
    showToast("Link copied to clipboard!", 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const currentTheme = THEMES[selectedTheme];

  const categories = [
    { id: ThemeCategory.HOLIDAY, label: 'Holiday 🎄' },
    { id: ThemeCategory.ROMANTIC, label: 'Romance 🌹' },
    { id: ThemeCategory.VIBES, label: 'Vibes ✨' },
    { id: ThemeCategory.CLASSIC, label: 'Classic 🖋️' }
  ];

  const filteredThemes = Object.values(THEMES).filter(t => t.category === activeCategory);

  const couponPresets = [
    { label: "Dinner Date", icon: <Utensils size={12} />, text: "Romantic Dinner Date" },
    { label: "Movie Night", icon: <Clapperboard size={12} />, text: "Movie Night Choice" },
    { label: "Massage", icon: <Sparkles size={12} />, text: "Relaxing Massage" },
    { label: "Gift Card", icon: <Gift size={12} />, text: "Amazon Gift Card" },
  ];

  return (
    <div className={`min-h-screen relative flex items-center justify-center p-4 pt-20 sm:p-4 transition-colors duration-700 ${currentTheme.bgGradient}`}>
      <AnimatedBackground theme={selectedTheme} />
      
      {/* Navigation to Feed */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
          {deferredPrompt && (
              <button 
                onClick={handleInstallClick}
                className="flex items-center gap-2 px-3 py-2 bg-pink-500 hover:bg-pink-600 rounded-full text-white font-bold transition-all text-xs sm:text-sm shadow-lg animate-pulse"
              >
                  <Download size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Install App</span>
              </button>
          )}

          <a href="/#/feed" className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white font-bold transition-all text-xs sm:text-sm border border-white/20 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95">
              <Globe size={14} className="sm:w-4 sm:h-4" /> 
              <span className="inline sm:hidden">Feed</span>
              <span className="hidden sm:inline">Community Feed</span>
          </a>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-3xl bg-black/20 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="bg-white/10 p-6 md:p-8 border-b border-white/10">
            <h1 className="text-3xl font-cinematic text-white text-center tracking-widest mb-2 text-shadow-sm">LoveNotes</h1>
            <p className="text-white/60 text-center text-sm">Create a timeless memory</p>
        </div>

        <div className="p-6 md:p-8 space-y-8">
            {/* Input Section */}
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

            {/* Gift/Coupon Section */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 transition-all">
                 <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                         <Gift size={16} className="text-yellow-400" />
                         <span className="text-sm font-bold text-white">Attach a Gift</span>
                     </div>
                     <button 
                        onClick={() => setHasCoupon(!hasCoupon)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${hasCoupon ? 'bg-green-500' : 'bg-gray-600'}`}
                     >
                         <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${hasCoupon ? 'translate-x-5' : 'translate-x-0'}`} />
                     </button>
                 </div>
                 
                 <AnimatePresence>
                    {hasCoupon && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-4 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/70 uppercase tracking-wider ml-1">Select Coupon Style</label>
                                    <div className="flex gap-2">
                                        {[
                                            { id: 'GOLD', color: 'bg-yellow-400' },
                                            { id: 'SILVER', color: 'bg-gray-300' },
                                            { id: 'ROSE', color: 'bg-rose-400' },
                                            { id: 'BLUE', color: 'bg-blue-400' }
                                        ].map((s) => (
                                            <button
                                                key={s.id}
                                                onClick={() => setCouponStyle(s.id as CouponStyle)}
                                                className={`w-8 h-8 rounded-full border-2 ${s.color} ${couponStyle === s.id ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/70 uppercase tracking-wider ml-1">What are you offering?</label>
                                    <input 
                                        value={couponTitle}
                                        onChange={(e) => setCouponTitle(e.target.value)}
                                        placeholder="e.g., A Free Massage, Amazon Gift Card"
                                        className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/30"
                                    />
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {couponPresets.map((preset) => (
                                            <button
                                                key={preset.label}
                                                onClick={() => setCouponTitle(preset.text)}
                                                className="px-2 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-[10px] text-white/80 transition-colors flex items-center gap-1.5"
                                            >
                                                {preset.icon} {preset.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-white/70 uppercase tracking-wider ml-1">Redemption Method</label>
                                    <div className="flex bg-black/20 p-1 rounded-lg">
                                        <button 
                                            onClick={() => setRedemptionMethod('WHATSAPP')}
                                            className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${redemptionMethod === 'WHATSAPP' ? 'bg-green-500/80 text-white shadow' : 'text-white/50 hover:text-white/80'}`}
                                        >
                                            <MessageCircle size={12} /> WhatsApp
                                        </button>
                                        <button 
                                            onClick={() => setRedemptionMethod('EMAIL')}
                                            className={`flex-1 py-1.5 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${redemptionMethod === 'EMAIL' ? 'bg-blue-500/80 text-white shadow' : 'text-white/50 hover:text-white/80'}`}
                                        >
                                            <Mail size={12} /> Email
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     {redemptionMethod === 'WHATSAPP' ? (
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-white/70 uppercase tracking-wider ml-1 flex items-center gap-1">
                                                <MessageCircle size={10} /> WhatsApp Number
                                            </label>
                                            <div className="flex gap-2">
                                                <select 
                                                    value={countryCode}
                                                    onChange={(e) => setCountryCode(e.target.value)}
                                                    className="bg-black/20 border border-white/20 rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/30 max-w-[120px]"
                                                >
                                                    {COUNTRY_CODES.map(c => (
                                                        <option key={c.code} value={c.code} className="bg-gray-800 text-white">{c.label}</option>
                                                    ))}
                                                </select>
                                                <input 
                                                    value={phoneNumber}
                                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                                    placeholder="812 345 6789"
                                                    className="flex-1 bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/30"
                                                />
                                            </div>
                                            <p className="text-[10px] text-white/40">For direct redemption messages.</p>
                                        </div>
                                     ) : (
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-white/70 uppercase tracking-wider ml-1 flex items-center gap-1">
                                                <Mail size={10} /> Email Address
                                            </label>
                                            <input 
                                                value={senderEmail}
                                                onChange={(e) => setSenderEmail(e.target.value)}
                                                placeholder="you@example.com"
                                                className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/30"
                                            />
                                        </div>
                                     )}

                                     <div className="space-y-2">
                                        <label className="text-xs font-bold text-white/70 uppercase tracking-wider ml-1 flex items-center gap-1">
                                            <Key size={10} /> Secret Gift Code/Link
                                        </label>
                                        <input 
                                            value={secretCode}
                                            onChange={(e) => setSecretCode(e.target.value)}
                                            placeholder="e.g. ABCD-1234-XYZ"
                                            className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-white/30"
                                        />
                                        <p className="text-[10px] text-white/40">Hidden until the coupon is torn!</p>
                                     </div>
                                </div>
                                
                                {/* Preview */}
                                <div className={`
                                    mt-4 p-4 rounded-lg border-2 border-dashed relative flex items-center gap-4
                                    ${couponStyle === 'GOLD' ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-400 text-yellow-900' : ''}
                                    ${couponStyle === 'SILVER' ? 'bg-gradient-to-r from-gray-100 to-gray-50 border-gray-400 text-gray-800' : ''}
                                    ${couponStyle === 'ROSE' ? 'bg-gradient-to-r from-rose-100 to-rose-50 border-rose-400 text-rose-900' : ''}
                                    ${couponStyle === 'BLUE' ? 'bg-gradient-to-r from-blue-100 to-blue-50 border-blue-400 text-blue-900' : ''}
                                `}>
                                    <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center shrink-0 opacity-50">
                                        <Ticket size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest font-bold opacity-60">Coupon Valid For</p>
                                        <p className="font-serif font-bold text-lg leading-tight">{couponTitle || 'Your Special Gift'}</p>
                                        <p className="text-[10px] mt-1 opacity-70">No Expiration</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                 </AnimatePresence>
            </div>

            {/* Theme Selector - Redesigned */}
            <div className="space-y-4">
                <label className="text-xs font-bold text-white/70 uppercase tracking-wider ml-1">Choose Stationery</label>
                
                {/* Category Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`
                                shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all border
                                ${activeCategory === cat.id 
                                    ? 'bg-white text-black border-white shadow-md' 
                                    : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'}
                            `}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Theme Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {filteredThemes.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setSelectedTheme(t.id)}
                            className={`
                                group relative h-20 rounded-xl border-2 transition-all duration-300 overflow-hidden text-left p-3 flex flex-col justify-end
                                ${selectedTheme === t.id ? 'border-white scale-105 shadow-xl ring-2 ring-white/20' : 'border-transparent hover:scale-102 opacity-80 hover:opacity-100'}
                            `}
                            style={{ background: t.previewColor }}
                        >
                            <span className={`text-[10px] font-bold text-white/90 z-10 relative drop-shadow-md ${t.fontFamily}`}>{t.name}</span>
                            {selectedTheme === t.id && (
                                <div className="absolute top-2 right-2">
                                    <Check size={14} className="text-white drop-shadow-md" />
                                </div>
                            )}
                            {/* Decorative element */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between border-t border-white/10 pt-6">
                <div className="flex flex-col gap-4 min-w-[200px]">
                    {/* Public Toggle */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-white/70 uppercase tracking-wider ml-1">Settings</label>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setIsPublic(!isPublic)}
                                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all ${isPublic ? 'bg-green-500/20 border-green-500/50 text-green-100' : 'bg-white/5 border-white/10 text-white/60'}`}
                                title={isPublic ? "Visible on Community Feed" : "Private Note"}
                            >
                                {isPublic ? <Globe size={14} /> : <Lock size={14} />}
                                <span className="text-xs font-bold">{isPublic ? 'Public' : 'Private'}</span>
                            </button>
                            
                            <button 
                                onClick={() => setIsTimeCapsule(!isTimeCapsule)}
                                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all ${isTimeCapsule ? 'bg-blue-500/20 border-blue-500/50 text-blue-100' : 'bg-white/5 border-white/10 text-white/60'}`}
                                title="Schedule Delivery"
                            >
                                <Calendar size={14} />
                                <span className="text-xs font-bold">Schedule</span>
                            </button>
                        </div>
                    </div>

                    {/* Time Capsule Date Picker */}
                    <AnimatePresence>
                        {isTimeCapsule && (
                             <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                             >
                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mt-2">
                                    <div className="flex items-center gap-2 text-blue-200 text-xs font-bold mb-2">
                                        <Clock size={12} /> Unlock Date
                                    </div>
                                    <input 
                                        type="datetime-local"
                                        value={unlockDate}
                                        onChange={(e) => setUnlockDate(e.target.value)}
                                        className="w-full bg-black/20 border border-white/20 rounded-md px-2 py-1.5 text-xs text-white color-scheme-dark"
                                    />
                                </div>
                             </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex flex-col gap-3 flex-1">
                     {!generatedLink ? (
                        <div className="flex gap-3">
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
                        </div>
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
                                    message={isTimeCapsule 
                                        ? `I sent you a special Time Capsule 🎁⏳ It unlocks on ${new Date(unlockDate).toLocaleDateString()}. Tap to wait:`
                                        : "I wrote a special secret note for you 💌✨ Tap to reveal:"
                                    }
                                 />
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
      </motion.div>
    </div>
  );
};

export default CreateLetter;
