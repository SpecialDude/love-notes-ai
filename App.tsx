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
      // 1. Get Path Variable (myapp.com/ID_HERE)
      // Remove leading slash
      const pathId = window.location.pathname.substring(1);

      // Simple validation to ensure it's likely an ID and not a file request (like favicon.ico or index.html)
      // Firestore IDs are alphanumeric and don't contain dots.
      if (pathId && pathId.length > 5 && !pathId.includes('.') && pathId !== 'index.html') {
        setIsLoading(true);
        const cloudData = await getLetterFromCloud(pathId);
        if (cloudData) {
          setViewData(cloudData);
        } else {
          // If 404, maybe redirect to home or show error, but here we just alert
          console.warn("Letter not found for ID:", pathId);
          // Optional: history.pushState(null, '', '/'); to reset URL if invalid
        }
        setIsLoading(false);
        return;
      }

      // 2. Legacy Support (Query Param ?id=...)
      const urlParams = new URLSearchParams(window.location.search);
      const queryId = urlParams.get('id');
      if (queryId) {
         setIsLoading(true);
         const cloudData = await getLetterFromCloud(queryId);
         if (cloudData) {
             setViewData(cloudData);
             // Optional: Clean URL to path format
             window.history.replaceState(null, '', `/${queryId}`);
         }
         setIsLoading(false);
         return;
      }

      // 3. Legacy Hash Support (#view?data=...)
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