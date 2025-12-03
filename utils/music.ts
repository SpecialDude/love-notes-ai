
export const getRandomMusicUrl = (): string | null => {
  let envVal = '';
  
  // 1. Vite Environment
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_MUSIC_URLS) {
    // @ts-ignore
    envVal = import.meta.env.VITE_MUSIC_URLS;
  }
  
  // 2. Standard Node / Create React App Environment
  if (typeof process !== 'undefined' && process.env) {
    envVal = process.env.REACT_APP_MUSIC_URLS || process.env.MUSIC_URLS || '';
  }

  if (envVal) {
    const urls = envVal.split(',').map(u => u.trim()).filter(Boolean);
    if (urls.length > 0) {
      return urls[Math.floor(Math.random() * urls.length)];
    }
  }
  return null;
};
