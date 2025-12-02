import { GoogleGenAI } from "@google/genai";
import { ThemeType, RelationshipType } from '../types';

// Robust API Key detection for various local environments
const getApiKey = (): string => {
  // 1. Vite Environment
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_API_KEY;
  }
  
  // 2. Standard Node / Create React App Environment
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.REACT_APP_API_KEY) return process.env.REACT_APP_API_KEY;
    if (process.env.API_KEY) return process.env.API_KEY;
  }

  return '';
};

const apiKey = getApiKey();

// Initialize AI only if key exists to prevent immediate crash
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

if (!apiKey) {
  console.warn("⚠️ LoveNotes Warning: No API Key found. AI features will be disabled. Please add VITE_API_KEY to your .env file.");
}

export const generateOrEnhanceMessage = async (
  input: string, 
  senderName: string, 
  recipientName: string,
  relationship: RelationshipType,
  mode: 'DRAFT' | 'POLISH'
): Promise<string> => {
  // Safety check: Return original input if AI isn't configured
  if (!ai || !apiKey) {
    console.error("Gemini API Key is missing. Skipping AI generation.");
    return input;
  }

  try {
    let systemInstruction = '';
    
    if (mode === 'DRAFT') {
      systemInstruction = `
        You are an expert ghostwriter. The user will give you a topic or a few keywords.
        Write a complete, beautiful letter from ${senderName} to ${recipientName}.
        Relationship: ${relationship}.
        
        Style Guide based on Relationship:
        - PARTNER/SPOUSE: Romantic, deep, intimate.
        - CRUSH: Flirty but respectful, sweet.
        - FRIEND/BESTIE: Fun, appreciative, inside-joke vibes if applicable.
        - SIBLING: Caring but maybe slightly teasing (if appropriate), or deeply supportive.
        - PARENT: Respectful, grateful, loving.
        
        Keep it under 200 words. No "Subject" lines. Just the body text.
      `;
    } else {
      systemInstruction = `
        You are an expert editor. Polish the user's existing draft.
        Relationship: ${relationship}.
        Sender: ${senderName}, Recipient: ${recipientName}.
        
        Goal: Fix grammar, improve flow, and elevate the vocabulary without losing the original meaning.
        Make it sound sincere and high-quality.
        Keep it under 200 words. Return only the body text.
      `;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      config: { systemInstruction },
      contents: input,
    });

    return response.text?.trim() || input;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return input;
  }
};

export const suggestTheme = async (message: string, relationship: RelationshipType): Promise<ThemeType> => {
  if (!ai || !apiKey) return ThemeType.VELVET;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Analyze this message and relationship (${relationship}).
        Message snippet: "${message.substring(0, 100)}..."
        
        Select the best visual Theme ID:
        - VELVET: For deep romance, valentines, anniversaries.
        - PASTEL: For lighthearted, cute, friendship, cheer up.
        - MIDNIGHT: For deep spiritual connections, long distance, serious notes.
        - EARTH: For parents, family, gratitude, apology, sincerity.
        - NOIR: For brothers, male friends, professional appreciation, or minimalists.
        
        Return ONLY the Enum Value string (e.g. VELVET).
      `,
    });

    const text = response.text?.trim().toUpperCase();
    if (text && Object.values(ThemeType).includes(text as ThemeType)) {
      return text as ThemeType;
    }
    return ThemeType.VELVET;
  } catch (error) {
    return ThemeType.VELVET;
  }
};