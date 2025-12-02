import { ThemeConfig, ThemeType } from './types';

const MUSIC_URLS = {
  // Stable Wikimedia Commons links (Classical/Public Domain)
  PIANO: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Liszt_-_Liebestraum_No_3.ogg", // Liebestraum - Liszt
  ACOUSTIC: "https://upload.wikimedia.org/wikipedia/commons/3/35/Gymnopedie_No_1.ogg", // Gymnopédie No. 1 - Satie
  AMBIENT: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Ludwig_van_Beethoven_-_Sonata_No._14%2C_Op._27_No._2_%28%22Moonlight%22%29_-_I._Adagio_sostenuto.ogg", // Moonlight Sonata - Beethoven
  CINEMATIC: "https://upload.wikimedia.org/wikipedia/commons/2/26/Johann_Sebastian_Bach_-_Air_on_the_G_String.ogg", // Air on the G String - Bach
  JAZZ: "https://upload.wikimedia.org/wikipedia/commons/5/52/Scott_Joplin_-_The_Entertainer_%281902%29.ogg", // The Entertainer (Ragtime/Noir vibe)
  LOFI: "https://upload.wikimedia.org/wikipedia/commons/8/87/Erik_Satie_-_Gnossienne_1.ogg", // Gnossienne No. 1 (Melancholic/Vintage)
  WAVES: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Debussy_-_Clair_de_lune.ogg" // Clair de Lune - Debussy
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
    musicUrl: MUSIC_URLS.PIANO,
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
    musicUrl: MUSIC_URLS.ACOUSTIC,
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
    musicUrl: MUSIC_URLS.AMBIENT,
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
    musicUrl: MUSIC_URLS.CINEMATIC,
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
    musicUrl: MUSIC_URLS.JAZZ,
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
    musicUrl: MUSIC_URLS.LOFI,
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
    musicUrl: MUSIC_URLS.WAVES,
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
    musicUrl: MUSIC_URLS.WAVES, // Clair de Lune fits sunset too
    previewColor: "#f97316"
  }
};