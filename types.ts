export enum ThemeType {
  VELVET = 'VELVET',      // Classic Romantic
  MIDNIGHT = 'MIDNIGHT',  // Cosmic/Deep
  EARTH = 'EARTH',        // Family/Grounded
  NOIR = 'NOIR',          // Modern/Bro/Friend
  PASTEL = 'PASTEL',      // Cute/Playful
  VINTAGE = 'VINTAGE',    // Old School/Typewriter
  OCEAN = 'OCEAN',        // Calm/Deep Blue
  SUNSET = 'SUNSET'       // Warm/Energetic
}

export enum RelationshipType {
  PARTNER = 'PARTNER',
  SPOUSE = 'SPOUSE',
  CRUSH = 'CRUSH',
  FRIEND = 'FRIEND',
  SIBLING = 'SIBLING',
  PARENT = 'PARENT',
  SELF = 'SELF',
  OTHER = 'OTHER'
}

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  description: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  bgGradient: string;
  paperColor: string;
  envelopeColor: string;
  musicUrl: string;
  previewColor: string; // For the color swatch in selector
}

export interface LetterData {
  id?: string;
  senderName: string;
  recipientName: string;
  relationship: RelationshipType;
  content: string;
  theme: ThemeType;
  date: string;
  isPublic: boolean;
  views: number;
}

export interface GeminiResponse {
  enhancedText?: string;
  suggestedTheme?: ThemeType;
}