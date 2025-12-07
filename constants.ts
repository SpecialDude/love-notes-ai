
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

// WhatsApp Country Codes
export const COUNTRY_CODES = [
  { code: '234', label: '🇳🇬 Nigeria (+234)' },
  { code: '1', label: '🇺🇸/🇨🇦 US/Canada (+1)' },
  { code: '44', label: '🇬🇧 UK (+44)' },
  { code: '233', label: '🇬🇭 Ghana (+233)' },
  { code: '27', label: '🇿🇦 South Africa (+27)' },
  { code: '91', label: '🇮🇳 India (+91)' },
  { code: '254', label: '🇰🇪 Kenya (+254)' },
  { code: '61', label: '🇦🇺 Australia (+61)' },
  { code: '49', label: '🇩🇪 Germany (+49)' },
  { code: '33', label: '🇫🇷 France (+33)' },
  { code: '971', label: '🇦🇪 UAE (+971)' },
  { code: '0', label: '🌍 Other (Enter full)' }
];

// Default Music Links (Internet Archive MP3s)
const CLASSIC_PIANO = "https://ia800305.us.archive.org/3/items/LisztLiebestraumNo3/Liszt_Liebestraum_No3.mp3";
const JAZZ = "https://ia800303.us.archive.org/34/items/ScottJoplinTheEntertainer1902/Scott%20Joplin%20-%20The%20Entertainer%20%281902%29.mp3";
const SILENT_NIGHT = "https://ia800503.us.archive.org/10/items/SilentNight_601/SilentNight.mp3";
const GYMNOPEDIE = "https://ia800504.us.archive.org/13/items/ErikSatieGymnopedieNo1/Erik%20Satie%20-%20Gymnopedie%20No%201.mp3";
const CLAIR_DE_LUNE = "https://ia800302.us.archive.org/27/items/DebussyClairDeLune/Debussy%20-%20Clair%20de%20lune.mp3";

const MUSIC_URLS = {
  VELVET: getMusicEnv('VELVET', CLASSIC_PIANO),
  PASTEL: getMusicEnv('PASTEL', GYMNOPEDIE),
  MIDNIGHT: getMusicEnv('MIDNIGHT', "https://ia802807.us.archive.org/2/items/BeethovenMoonlightSonata/Beethoven-MoonlightSonata.mp3"),
  EARTH: getMusicEnv('EARTH', "https://ia600500.us.archive.org/3/items/BachAirOnTheGString/Bach%20-%20Air%20on%20the%20G%20String.mp3"),
  NOIR: getMusicEnv('NOIR', JAZZ),
  VINTAGE: getMusicEnv('VINTAGE', "https://ia800300.us.archive.org/8/items/ErikSatieGnossienneNo1/Erik%20Satie%20-%20Gnossienne%20No%201.mp3"),
  OCEAN: getMusicEnv('OCEAN', CLAIR_DE_LUNE),
  SUNSET: getMusicEnv('SUNSET', CLAIR_DE_LUNE),
  
  // Holiday Music
  WINTER: getMusicEnv('WINTER', SILENT_NIGHT),
  HOLLY: getMusicEnv('HOLLY', "https://ia902606.us.archive.org/14/items/jingle-bells-mp-3-music/Jingle%20Bells%20%28mp3music.io%29.mp3"), // Jingle Bells or similar
  GINGERBREAD: getMusicEnv('GINGERBREAD', "https://ia800303.us.archive.org/15/items/WeWishYouAMerryChristmas_584/WeWishYouAMerryChristmas.mp3"), // We Wish You A Merry Christmas
  FROST: getMusicEnv('FROST', "https://ia801407.us.archive.org/33/items/DanceOfTheSugarPlumFairy_220/DanceOfTheSugarPlumFairy.mp3"), // Sugar Plum Fairy
};

export const THEMES: Record<ThemeType, ThemeConfig> = {
  // --- HOLIDAY ---
  [ThemeType.WINTER]: {
    id: ThemeType.WINTER,
    name: "Silent Night",
    category: ThemeCategory.HOLIDAY,
    description: "Deep Blue & Holy",
    textColor: "text-slate-900",
    accentColor: "bg-blue-600",
    fontFamily: "font-elegant",
    bgGradient: "bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900",
    paperColor: "bg-slate-50",
    envelopeColor: "bg-blue-900",
    musicUrl: MUSIC_URLS.WINTER,
    previewColor: "#1e3a8a"
  },
  [ThemeType.HOLLY]: {
    id: ThemeType.HOLLY,
    name: "Holly",
    category: ThemeCategory.HOLIDAY,
    description: "Classic Christmas",
    textColor: "text-red-950",
    accentColor: "bg-red-600",
    fontFamily: "font-serif",
    bgGradient: "bg-gradient-to-br from-green-900 via-green-800 to-red-950",
    paperColor: "bg-[#f0fdf4]", // Very light green
    envelopeColor: "bg-red-800",
    musicUrl: MUSIC_URLS.HOLLY,
    previewColor: "#14532d" // Dark Green
  },
  [ThemeType.GINGERBREAD]: {
    id: ThemeType.GINGERBREAD,
    name: "Gingerbread",
    category: ThemeCategory.HOLIDAY,
    description: "Warm & Cozy",
    textColor: "text-amber-950",
    accentColor: "bg-amber-600",
    fontFamily: "font-casual",
    bgGradient: "bg-gradient-to-br from-amber-900 via-orange-900 to-brown-900",
    paperColor: "bg-[#fff8e1]", // Creamy
    envelopeColor: "bg-[#8B4513]", // SaddleBrown
    musicUrl: MUSIC_URLS.GINGERBREAD,
    previewColor: "#92400e" // Amber
  },
  [ThemeType.FROST]: {
    id: ThemeType.FROST,
    name: "Frost",
    category: ThemeCategory.HOLIDAY,
    description: "Icy Magic",
    textColor: "text-slate-600",
    accentColor: "bg-cyan-400",
    fontFamily: "font-cinematic",
    bgGradient: "bg-gradient-to-tr from-cyan-100 via-white to-blue-100",
    paperColor: "bg-white",
    envelopeColor: "bg-cyan-200",
    musicUrl: MUSIC_URLS.FROST,
    previewColor: "#a5f3fc" // Light Cyan
  },

  // --- ROMANTIC ---
  [ThemeType.VELVET]: {
    id: ThemeType.VELVET,
    name: "Velvet",
    category: ThemeCategory.ROMANTIC,
    description: "Deep Romance",
    textColor: "text-rose-950",
    accentColor: "bg-rose-600",
    fontFamily: "font-elegant",
    bgGradient: "bg-gradient-to-br from-rose-950 via-red-900 to-black",
    paperColor: "bg-[#fff0f0]",
    envelopeColor: "bg-rose-900",
    musicUrl: MUSIC_URLS.VELVET,
    previewColor: "#881337"
  },
  [ThemeType.SUNSET]: {
    id: ThemeType.SUNSET,
    name: "Sunset",
    category: ThemeCategory.ROMANTIC,
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
    name: "Midnight",
    category: ThemeCategory.VIBES,
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
    name: "Ocean",
    category: ThemeCategory.VIBES,
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
  [ThemeType.PASTEL]: {
    id: ThemeType.PASTEL,
    name: "Candy",
    category: ThemeCategory.VIBES,
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

  // --- CLASSIC ---
  [ThemeType.EARTH]: {
    id: ThemeType.EARTH,
    name: "Earth",
    category: ThemeCategory.CLASSIC,
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
    name: "Noir",
    category: ThemeCategory.CLASSIC,
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
    name: "Vintage",
    category: ThemeCategory.CLASSIC,
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
