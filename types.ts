
export enum ThemeType {
  // Christmas / Holiday
  WINTER = 'WINTER',      // Deep Blue (Silent Night)
  HOLLY = 'HOLLY',        // Red & Green (Classic)
  GINGERBREAD = 'GINGERBREAD', // Warm Amber (Cozy)
  FROST = 'FROST',        // Icy White/Cyan (Magical)

  // Romantic
  VELVET = 'VELVET',      // Classic Romantic
  SUNSET = 'SUNSET',      // Warm/Energetic
  
  // Vibes
  MIDNIGHT = 'MIDNIGHT',  // Cosmic/Deep
  OCEAN = 'OCEAN',        // Calm/Deep Blue
  PASTEL = 'PASTEL',      // Cute/Playful
  
  // Classic
  EARTH = 'EARTH',        // Family/Grounded
  NOIR = 'NOIR',          // Modern/Bro/Friend
  VINTAGE = 'VINTAGE',    // Old School/Typewriter
}

export enum ThemeCategory {
  HOLIDAY = 'HOLIDAY',
  ROMANTIC = 'ROMANTIC',
  VIBES = 'VIBES',
  CLASSIC = 'CLASSIC'
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
  category: ThemeCategory; // New field for grouping
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

export type CouponStyle = 'GOLD' | 'SILVER' | 'ROSE' | 'BLUE';

export interface CouponData {
  title: string;
  style: CouponStyle;
  redemptionMethod?: 'WHATSAPP' | 'EMAIL'; // New field
  senderWhatsApp?: string; // For direct message redemption (Full number with country code)
  senderEmail?: string;    // For email redemption
  secretCode?: string;     // For Amazon codes, gift card links, etc.
  redemptionLink?: string; // Optional direct link
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
  likes: number; 
  musicUrl?: string;
  unlockDate?: string; // ISO String for Time Capsule
  coupon?: CouponData; // Optional Love Coupon
}

export interface GeminiResponse {
  enhancedText?: string;
  suggestedTheme?: ThemeType;
}
