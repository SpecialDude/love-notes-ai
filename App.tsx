import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import CreateLetter from './pages/CreateLetter';
import ViewLetter from './pages/ViewLetter';
import { LetterData } from './types';
import { decodeLetterData } from './utils/encoding';
import { getLetterFromCloud } from './services/firebase';

const App: React.FC = () => {
  const [draftData, setDraftData] = useState<LetterData | undefined>(undefined);
  const [viewData, setViewData] = useState<LetterData | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('id');

      // Strategy 1: Firebase Short Link (?id=xyz)
      if (id) {
        setIsLoading(true);
        const cloudData = await getLetterFromCloud(id);
        if (cloudData) {
          setViewData(cloudData);
        } else {
          // Fallback or error handling
          alert("Letter not found or expired.");
        }
        setIsLoading(false);
        return;
      }

      // Strategy 2: Legacy Hash Support (#view?data=...)
      // Good for backward compatibility if you had old links
      if (window.location.hash.startsWith('#view')) {
        const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
        const dataString = hashParams.get('data');
        if (dataString) {
          const decoded = decodeLetterData(dataString);
          setViewData(decoded);
        }
        setIsLoading(false);
        return;
      }

      // Default: Creator Mode
      setIsLoading(false);
    };

    init();
  }, []);

  const handlePreview = (data: LetterData) => {
    setDraftData(data);
    setIsPreviewing(true);
  };

  const handleBackToEditor = () => {
    setIsPreviewing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white flex-col gap-4">
        <Loader2 className="animate-spin text-pink-500" size={48} />
        <p className="font-serif italic text-lg opacity-80">Fetching love letter...</p>
      </div>
    );
  }

  // 1. Viewing a fetched letter (from Cloud or Link)
  if (viewData) {
    // If we are viewing a shared letter, we don't allow "Back to Editor" 
    // unless it was just a preview (handled below).
    // But for simplicity, shared links just show the letter.
    return <ViewLetter data={viewData} />;
  }

  // 2. Previewing a local draft
  if (isPreviewing && draftData) {
      return (
          <ViewLetter 
            data={draftData} 
            onBack={handleBackToEditor} 
          />
      );
  }

  // 3. Creating a new letter
  return (
    <CreateLetter 
      initialData={draftData} 
      onPreview={handlePreview} 
    />
  );
};

export default App;