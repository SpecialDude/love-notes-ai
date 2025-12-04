
export const getDeviceId = (): string => {
  const STORAGE_KEY = 'lovenotes_device_id';
  let deviceId = localStorage.getItem(STORAGE_KEY);
  
  if (!deviceId) {
    // Generate a simple UUID if none exists
    deviceId = crypto.randomUUID ? crypto.randomUUID() : `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(STORAGE_KEY, deviceId);
  }
  
  return deviceId;
};

// Local Cache for Liked Letter IDs
// This prevents us from querying the DB for every single card in the feed
const LIKES_CACHE_KEY = 'lovenotes_user_likes';

export const getLocalLikedIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(LIKES_CACHE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch (e) {
    return new Set();
  }
};

export const addLocalLike = (letterId: string) => {
  const current = getLocalLikedIds();
  current.add(letterId);
  localStorage.setItem(LIKES_CACHE_KEY, JSON.stringify(Array.from(current)));
};

export const removeLocalLike = (letterId: string) => {
  const current = getLocalLikedIds();
  current.delete(letterId);
  localStorage.setItem(LIKES_CACHE_KEY, JSON.stringify(Array.from(current)));
};
