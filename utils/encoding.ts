import { LetterData } from '../types';

export const encodeLetterData = (data: LetterData): string => {
  try {
    const json = JSON.stringify(data);
    // Simple Base64 encoding. For production, LZString is better for compression.
    // We replace characters that might be problematic in URLs just in case, though hash is usually safe.
    return btoa(unescape(encodeURIComponent(json)));
  } catch (e) {
    console.error("Failed to encode data", e);
    return "";
  }
};

export const decodeLetterData = (encoded: string): LetterData | null => {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(json) as LetterData;
  } catch (e) {
    console.error("Failed to decode data", e);
    return null;
  }
};