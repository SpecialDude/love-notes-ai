import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import CreateLetter from './pages/CreateLetter';
import ViewLetter from './pages/ViewLetter';
import Feed from './pages/Feed';
import { LetterData } from './types';
import { decodeLetterData } from './utils/encoding';
import { getLetterFromCloud } from './services/firebase';

const App: React.FC = () => {
  const [draftData, setDraftData] = useState<LetterData | undefined>(undefined);
  const [viewData, setViewData] = useState<LetterData | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  // Listen for hash changes to handle navigation (e.g., clicking Feed button)
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Router Logic
  useEffect(() => {
    const handleRoute = async () => {
      setIsLoading(true);
      const hash = currentHash;
      
      // 1. Feed Route
      if (hash === '#/feed') {
          setViewData(null); // Clear any view data
          setIsLoading(false);
          return;
      }

      // 2. Hash Routing Support (/#/ID) - The Preferred, Robust Strategy
      if (hash.startsWith('#/') && hash.length > 3) {
        const id = hash.substring(2); // Remove #/
        if (id) {
           const cloudData = await getLetterFromCloud(id);
           if (cloudData) {
               setViewData(cloudData);
           } else {
               console.warn("Letter not found for ID:", id);
               // Optionally handle 404 state here
           }
        }
      } 
      // 3. Legacy Hash Support (#view?data=...) - Backward compatibility
      else if (hash.startsWith('#view')) {
        const hashParams = new URLSearchParams(hash.split('?')[1]);
        const dataString = hashParams.get('data');
        if (dataString) {
          const decoded = decodeLetterData(dataString);
          setViewData(decoded);
        }
      } 
      else {
        // Home/Create Route
        setViewData(null);
      }
      
      setIsLoading(false);
    };

    handleRoute();
  }, [currentHash]);

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

  // 1. Public Feed
  if (currentHash === '#/feed') {
      return <Feed />;
  }

  // 2. Viewing a fetched letter (from Cloud or Link)
  if (viewData) {
    return <ViewLetter data={viewData} />;
  }

  // 3. Previewing a local draft
  if (isPreviewing && draftData) {
      return (
          <ViewLetter 
            data={draftData} 
            onBack={handleBackToEditor} 
          />
      );
  }

  // 4. Creating a new letter
  return (
    <CreateLetter 
      initialData={draftData} 
      onPreview={handlePreview} 
    />
  );
};

export default App;