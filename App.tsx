import React, { useState, useEffect } from 'react';
import CreateLetter from './pages/CreateLetter';
import ViewLetter from './pages/ViewLetter';
import { LetterData } from './types';

const App: React.FC = () => {
  const [currentHash, setCurrentHash] = useState(window.location.hash);
  const [draftData, setDraftData] = useState<LetterData | undefined>(undefined);
  const [isPreviewing, setIsPreviewing] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
      // If we navigate via hash (e.g. back button), exit preview
      if (window.location.hash !== '') {
          setIsPreviewing(false);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handlePreview = (data: LetterData) => {
    setDraftData(data);
    setIsPreviewing(true);
  };

  const handleBackToEditor = () => {
    setIsPreviewing(false);
  };

  // Priority 1: Preview Mode (Local Draft)
  if (isPreviewing && draftData) {
      return (
          <ViewLetter 
            previewData={draftData} 
            onBack={handleBackToEditor} 
          />
      );
  }

  // Priority 2: Hash Routing (Shared Link)
  if (currentHash.startsWith('#view')) {
    const params = new URLSearchParams(currentHash.split('?')[1]);
    const dataString = params.get('data');
    if (dataString) {
      return <ViewLetter dataString={dataString} />;
    }
  }

  // Default: Create Letter Page (Pass draftData to restore state)
  return (
    <CreateLetter 
      initialData={draftData} 
      onPreview={handlePreview} 
    />
  );
};

export default App;