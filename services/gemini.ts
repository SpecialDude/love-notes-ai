import { GoogleGenAI } from "@google/genai";
import { ThemeType, RelationshipType } from '../types';

// Safely access process.env to avoid crashes in browser environments without polyfills
const apiKey = (typeof process !== 'undefined' && process.env?.API_KEY) || '';
const ai = new GoogleGenAI({ apiKey });

export const generateOrEnhanceMessage = async (
  input: string, 
  senderName: string, 
  recipientName: string,
  relationship: RelationshipType,
  mode: 'DRAFT' | 'POLISH'
): Promise<string> => {
  if (!apiKey) return input;

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
  if (!apiKey) return ThemeType.VELVET;

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