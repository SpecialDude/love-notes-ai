import LZString from 'lz-string';
import { LetterData } from '../types';

export const encodeLetterData = (data: LetterData): string => {
  try {
    const json = JSON.stringify(data);
    // Use LZString to compress the JSON string for shorter URLs
    return LZString.compressToEncodedURIComponent(json);
  } catch (e) {
    console.error("Failed to encode data", e);
    return "";
  }
};

export const decodeLetterData = (encoded: string): LetterData | null => {
  try {
    // Decompress the data from the URL safe string
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    return JSON.parse(json) as LetterData;
  } catch (e) {
    console.error("Failed to decode data", e);
    return null;
  }
};