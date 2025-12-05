
import { ThemeConfig, ThemeType } from './types';

// Helper to safely get music env vars
const getMusicEnv = (key: string, defaultUrl: string): string => {
  const viteKey = `VITE_MUSIC_${key}`;
  const reactKey = `REACT_APP_MUSIC_${key}`;
  
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[viteKey]) {
    // @ts-ignore
    return import.meta.env[viteKey];
  }
  
  if (typeof process !== 'undefined' && process.env) {
    return process.env[reactKey] || process.env[`MUSIC_${key}`] || defaultUrl;
  }
  
  return defaultUrl;
};

const MUSIC_URLS = {
  // Configurable via VITE_MUSIC_VELVET, VITE_MUSIC_PASTEL, etc.
  VELVET: getMusicEnv('VELVET', "https://ia800305.us.archive.org/3/items/LisztLiebestraumNo3/Liszt_Liebestraum_No3.mp3"), // Liebestraum - Liszt
  PASTEL: getMusicEnv('PASTEL', "https://ia800504.us.archive.org/13/items/ErikSatieGymnopedieNo1/Erik%20Satie%20-%20Gymnopedie%20No%201.mp3"), // Gymnopédie No. 1 - Satie
  MIDNIGHT: getMusicEnv('MIDNIGHT', "https://ia802807.us.archive.org/2/items/BeethovenMoonlightSonata/Beethoven-MoonlightSonata.mp3"), // Moonlight Sonata - Beethoven
  EARTH: getMusicEnv('EARTH', "https://ia600500.us.archive.org/3/items/BachAirOnTheGString/Bach%20-%20Air%20on%20the%20G%20String.mp3"), // Air on the G String - Bach
  NOIR: getMusicEnv('NOIR', "https://ia800303.us.archive.org/34/items/ScottJoplinTheEntertainer1902/Scott%20Joplin%20-%20The%20Entertainer%20%281902%29.mp3"), // The Entertainer
  VINTAGE: getMusicEnv('VINTAGE', "https://ia800300.us.archive.org/8/items/ErikSatieGnossienneNo1/Erik%20Satie%20-%20Gnossienne%20No%201.mp3"), // Gnossienne No. 1
  OCEAN: getMusicEnv('OCEAN', "https://ia800302.us.archive.org/27/items/DebussyClairDeLune/Debussy%20-%20Clair%20de%20lune.mp3"), // Clair de Lune
  SUNSET: getMusicEnv('SUNSET', "https://ia800302.us.archive.org/27/items/DebussyClairDeLune/Debussy%20-%20Clair%20de%20lune.mp3") // Default to Clair de Lune, but configurable separately
};

export const THEMES: Record<ThemeType, ThemeConfig> = {
  [ThemeType.VELVET]: {
    id: ThemeType.VELVET,
    name: "Velvet",
    description: "Deep romance",
    textColor: "text-rose-950",
    accentColor: "bg-rose-600",
    fontFamily: "font-elegant", // Cormorant
    bgGradient: "bg-gradient-to-br from-rose-950 via-red-900 to-black",
    paperColor: "bg-[#fff0f0]",
    envelopeColor: "bg-rose-900",
    musicUrl: MUSIC_URLS.VELVET,
    previewColor: "#881337"
  },
  [ThemeType.PASTEL]: {
    id: ThemeType.PASTEL,
    name: "Candy",
    description: "Sweet & Playful",
    textColor: "text-slate-700",
    accentColor: "bg-pink-400",
    fontFamily: "font-casual", // Patrick Hand
    bgGradient: "bg-gradient-to-tr from-pink-200 via-purple-100 to-blue-100",
    paperColor: "bg-white",
    envelopeColor: "bg-pink-300",
    musicUrl: MUSIC_URLS.PASTEL,
    previewColor: "#f472b6"
  },
  [ThemeType.MIDNIGHT]: {
    id: ThemeType.MIDNIGHT,
    name: "Night",
    description: "Cosmic & Deep",
    textColor: "text-indigo-100",
    accentColor: "bg-indigo-500",
    fontFamily: "font-serif", // Playfair
    bgGradient: "bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-indigo-950 to-black",
    paperColor: "bg-indigo-950",
    envelopeColor: "bg-slate-900",
    musicUrl: MUSIC_URLS.MIDNIGHT,
    previewColor: "#1e1b4b"
  },
  [ThemeType.EARTH]: {
    id: ThemeType.EARTH,
    name: "Earth",
    description: "Grounded & Sincere",
    textColor: "text-stone-900",
    accentColor: "bg-emerald-700",
    fontFamily: "font-elegant", // Cormorant
    bgGradient: "bg-gradient-to-br from-stone-800 via-emerald-900 to-stone-900",
    paperColor: "bg-[#f3f4f1]",
    envelopeColor: "bg-stone-700",
    musicUrl: MUSIC_URLS.EARTH,
    previewColor: "#064e3b"
  },
  [ThemeType.NOIR]: {
    id: ThemeType.NOIR,
    name: "Noir",
    description: "Minimalist",
    textColor: "text-black",
    accentColor: "bg-gray-800",
    fontFamily: "font-modern", // Montserrat
    bgGradient: "bg-gradient-to-b from-gray-300 to-gray-500",
    paperColor: "bg-white",
    envelopeColor: "bg-gray-900",
    musicUrl: MUSIC_URLS.NOIR,
    previewColor: "#111827"
  },
  [ThemeType.VINTAGE]: {
    id: ThemeType.VINTAGE,
    name: "Vintage",
    description: "Old School",
    textColor: "text-stone-800",
    accentColor: "bg-amber-700",
    fontFamily: "font-vintage", // Special Elite
    bgGradient: "bg-gradient-to-br from-amber-100 to-orange-100",
    paperColor: "bg-[#fffbef]",
    envelopeColor: "bg-[#8c6b4a]",
    musicUrl: MUSIC_URLS.VINTAGE,
    previewColor: "#92400e"
  },
  [ThemeType.OCEAN]: {
    id: ThemeType.OCEAN,
    name: "Ocean",
    description: "Calm & Blue",
    textColor: "text-cyan-950",
    accentColor: "bg-cyan-600",
    fontFamily: "font-serif",
    bgGradient: "bg-gradient-to-b from-cyan-800 to-blue-950",
    paperColor: "bg-cyan-50",
    envelopeColor: "bg-cyan-900",
    musicUrl: MUSIC_URLS.OCEAN,
    previewColor: "#0e7490"
  },
  [ThemeType.SUNSET]: {
    id: ThemeType.SUNSET,
    name: "Sunset",
    description: "Warm & Hopeful",
    textColor: "text-orange-950",
    accentColor: "bg-orange-500",
    fontFamily: "font-handwriting",
    bgGradient: "bg-gradient-to-br from-orange-400 via-rose-400 to-purple-500",
    paperColor: "bg-orange-50",
    envelopeColor: "bg-orange-600",
    musicUrl: MUSIC_URLS.SUNSET,
    previewColor: "#f97316"
  }
};
