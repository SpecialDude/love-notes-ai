
import { ThemeConfig, ThemeType, ThemeCategory } from './types';

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
  VELVET: getMusicEnv('VELVET', "https://ia800305.us.archive.org/3/items/LisztLiebestraumNo3/Liszt_Liebestraum_No3.mp3"), 
  PASTEL: getMusicEnv('PASTEL', "https://ia800504.us.archive.org/13/items/ErikSatieGymnopedieNo1/Erik%20Satie%20-%20Gymnopedie%20No%201.mp3"), 
  MIDNIGHT: getMusicEnv('MIDNIGHT', "https://ia802807.us.archive.org/2/items/BeethovenMoonlightSonata/Beethoven-MoonlightSonata.mp3"), 
  EARTH: getMusicEnv('EARTH', "https://ia600500.us.archive.org/3/items/BachAirOnTheGString/Bach%20-%20Air%20on%20the%20G%20String.mp3"), 
  NOIR: getMusicEnv('NOIR', "https://ia800303.us.archive.org/34/items/ScottJoplinTheEntertainer1902/Scott%20Joplin%20-%20The%20Entertainer%20%281902%29.mp3"), 
  VINTAGE: getMusicEnv('VINTAGE', "https://ia800300.us.archive.org/8/items/ErikSatieGnossienneNo1/Erik%20Satie%20-%20Gnossienne%20No%201.mp3"), 
  OCEAN: getMusicEnv('OCEAN', "https://ia800302.us.archive.org/27/items/DebussyClairDeLune/Debussy%20-%20Clair%20de%20lune.mp3"), 
  SUNSET: getMusicEnv('SUNSET', "https://ia800302.us.archive.org/27/items/DebussyClairDeLune/Debussy%20-%20Clair%20de%20lune.mp3"),
  // Holiday Music (Silent Night / Jingle Bells style lo-fi)
  HOLIDAY: getMusicEnv('HOLIDAY', "https://ia800105.us.archive.org/9/items/SilentNightPiano_201303/SilentNight.mp3"),
  GINGERBREAD: getMusicEnv('GINGERBREAD', "https://ia801407.us.archive.org/27/items/we-wish-you-a-merry-christmas-instrumental/We%20Wish%20You%20A%20Merry%20Christmas%20%28Instrumental%29.mp3"),
};

export const THEMES: Record<ThemeType, ThemeConfig> = {
  // --- HOLIDAY ---
  [ThemeType.WINTER]: {
    id: ThemeType.WINTER,
    category: ThemeCategory.HOLIDAY,
    name: "Winter",
    description: "Silent Night",
    textColor: "text-slate-100",
    accentColor: "bg-blue-300",
    fontFamily: "font-serif",
    bgGradient: "bg-gradient-to-b from-slate-900 via-blue-900 to-black",
    paperColor: "bg-slate-800",
    envelopeColor: "bg-blue-950",
    musicUrl: MUSIC_URLS.HOLIDAY,
    previewColor: "#172554"
  },
  [ThemeType.HOLLY]: {
    id: ThemeType.HOLLY,
    category: ThemeCategory.HOLIDAY,
    name: "Holly",
    description: "Classic Xmas",
    textColor: "text-red-950",
    accentColor: "bg-red-600",
    fontFamily: "font-elegant",
    bgGradient: "bg-gradient-to-br from-green-950 via-green-900 to-red-950",
    paperColor: "bg-[#fff0f0]",
    envelopeColor: "bg-green-900",
    musicUrl: MUSIC_URLS.HOLIDAY,
    previewColor: "#14532d"
  },
  [ThemeType.GINGERBREAD]: {
    id: ThemeType.GINGERBREAD,
    category: ThemeCategory.HOLIDAY,
    name: "Ginger",
    description: "Warm & Cozy",
    textColor: "text-amber-950",
    accentColor: "bg-amber-600",
    fontFamily: "font-casual",
    bgGradient: "bg-gradient-to-br from-amber-900 via-orange-900 to-amber-950",
    paperColor: "bg-[#fff8e1]",
    envelopeColor: "bg-[#8B4513]", // SaddleBrown
    musicUrl: MUSIC_URLS.GINGERBREAD,
    previewColor: "#92400e"
  },
  [ThemeType.FROST]: {
    id: ThemeType.FROST,
    category: ThemeCategory.HOLIDAY,
    name: "Frost",
    description: "Icy Magic",
    textColor: "text-cyan-900",
    accentColor: "bg-cyan-400",
    fontFamily: "font-fancy",
    bgGradient: "bg-gradient-to-t from-cyan-100 via-white to-cyan-50",
    paperColor: "bg-white",
    envelopeColor: "bg-cyan-200",
    musicUrl: MUSIC_URLS.HOLIDAY,
    previewColor: "#a5f3fc"
  },

  // --- ROMANCE ---
  [ThemeType.VELVET]: {
    id: ThemeType.VELVET,
    category: ThemeCategory.ROMANCE,
    name: "Velvet",
    description: "Deep romance",
    textColor: "text-rose-950",
    accentColor: "bg-rose-600",
    fontFamily: "font-elegant",
    bgGradient: "bg-gradient-to-br from-rose-950 via-red-900 to-black",
    paperColor: "bg-[#fff0f0]",
    envelopeColor: "bg-rose-900",
    musicUrl: MUSIC_URLS.VELVET,
    previewColor: "#881337"
  },
  [ThemeType.PASTEL]: {
    id: ThemeType.PASTEL,
    category: ThemeCategory.ROMANCE,
    name: "Candy",
    description: "Sweet & Playful",
    textColor: "text-slate-700",
    accentColor: "bg-pink-400",
    fontFamily: "font-casual",
    bgGradient: "bg-gradient-to-tr from-pink-200 via-purple-100 to-blue-100",
    paperColor: "bg-white",
    envelopeColor: "bg-pink-300",
    musicUrl: MUSIC_URLS.PASTEL,
    previewColor: "#f472b6"
  },
  [ThemeType.SUNSET]: {
    id: ThemeType.SUNSET,
    category: ThemeCategory.ROMANCE,
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
  },

  // --- VIBES ---
  [ThemeType.MIDNIGHT]: {
    id: ThemeType.MIDNIGHT,
    category: ThemeCategory.VIBES,
    name: "Night",
    description: "Cosmic & Deep",
    textColor: "text-indigo-100",
    accentColor: "bg-indigo-500",
    fontFamily: "font-serif",
    bgGradient: "bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-indigo-950 to-black",
    paperColor: "bg-indigo-950",
    envelopeColor: "bg-slate-900",
    musicUrl: MUSIC_URLS.MIDNIGHT,
    previewColor: "#1e1b4b"
  },
  [ThemeType.OCEAN]: {
    id: ThemeType.OCEAN,
    category: ThemeCategory.VIBES,
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

  // --- CLASSIC ---
  [ThemeType.EARTH]: {
    id: ThemeType.EARTH,
    category: ThemeCategory.CLASSIC,
    name: "Earth",
    description: "Grounded",
    textColor: "text-stone-900",
    accentColor: "bg-emerald-700",
    fontFamily: "font-elegant",
    bgGradient: "bg-gradient-to-br from-stone-800 via-emerald-900 to-stone-900",
    paperColor: "bg-[#f3f4f1]",
    envelopeColor: "bg-stone-700",
    musicUrl: MUSIC_URLS.EARTH,
    previewColor: "#064e3b"
  },
  [ThemeType.NOIR]: {
    id: ThemeType.NOIR,
    category: ThemeCategory.CLASSIC,
    name: "Noir",
    description: "Minimalist",
    textColor: "text-black",
    accentColor: "bg-gray-800",
    fontFamily: "font-modern",
    bgGradient: "bg-gradient-to-b from-gray-300 to-gray-500",
    paperColor: "bg-white",
    envelopeColor: "bg-gray-900",
    musicUrl: MUSIC_URLS.NOIR,
    previewColor: "#111827"
  },
  [ThemeType.VINTAGE]: {
    id: ThemeType.VINTAGE,
    category: ThemeCategory.CLASSIC,
    name: "Vintage",
    description: "Old School",
    textColor: "text-stone-800",
    accentColor: "bg-amber-700",
    fontFamily: "font-vintage",
    bgGradient: "bg-gradient-to-br from-amber-100 to-orange-100",
    paperColor: "bg-[#fffbef]",
    envelopeColor: "bg-[#8c6b4a]",
    musicUrl: MUSIC_URLS.VINTAGE,
    previewColor: "#92400e"
  },
};
