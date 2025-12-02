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
      // 1. Hash Routing Support (/#/ID) - The Preferred, Robust Strategy
      const hash = window.location.hash;
      
      // If hash looks like #/abc12345 (Firestore ID)
      if (hash.startsWith('#/') && hash.length > 3) {
        const id = hash.substring(2); // Remove #/
        if (id) {
           setIsLoading(true);
           const cloudData = await getLetterFromCloud(id);
           if (cloudData) {
               setViewData(cloudData);
           } else {
               console.warn("Letter not found for ID:", id);
           }
           setIsLoading(false);
           return;
        }
      }

      // 2. Legacy Hash Support (#view?data=...) - Backward compatibility
      if (hash.startsWith('#view')) {
        const hashParams = new URLSearchParams(hash.split('?')[1]);
        const dataString = hashParams.get('data');
        if (dataString) {
          const decoded = decodeLetterData(dataString);
          setViewData(decoded);
        }
        setIsLoading(false);
        return;
      }

      // 3. Fallback: Check Path (for local dev with rewrites active)
      // Only if no hash is present
      const pathId = window.location.pathname.substring(1);
      if (pathId && pathId.length > 5 && !pathId.includes('.') && pathId !== 'index.html' && !hash) {
        // Attempt to load from path, but this often fails on static hosts (404)
        const cloudData = await getLetterFromCloud(pathId);
        if (cloudData) {
          setViewData(cloudData);
          setIsLoading(false);
          return;
        }
      }

      // Default: Creator Mode (Home)
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