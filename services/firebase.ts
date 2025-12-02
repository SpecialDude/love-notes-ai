import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, doc, getDoc } from "firebase/firestore";
import { LetterData } from "../types";

// Helper to safely get env vars for Vite or Standard React App
const getEnv = (key: string): string => {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[`VITE_${key}`]) {
    // @ts-ignore
    return import.meta.env[`VITE_${key}`];
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[`REACT_APP_${key}`] || process.env[key] || '';
  }
  return '';
};

const firebaseConfig = {
  apiKey: getEnv('FIREBASE_API_KEY'),
  authDomain: getEnv('FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('FIREBASE_APP_ID')
};

// Debug: Check if config is loaded
if (!firebaseConfig.apiKey) {
  console.error("🔥 Firebase Config Error: API Key is missing. Check your .env file and ensure keys start with VITE_ or REACT_APP_");
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Saves a letter to Firestore and returns the Document ID (Short Link ID).
 */
export const saveLetterToCloud = async (data: LetterData): Promise<string | null> => {
  try {
    const docRef = await addDoc(collection(db, "letters"), {
      ...data,
      createdAt: new Date().toISOString()
    });
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e: any) {
    console.error("🔥 Error adding document: ", e);
    
    // Specific error handling for common issues
    if (e.code === 'permission-denied') {
        alert("Firebase Permission Error: Please go to Firebase Console > Firestore > Rules and change them to 'allow read, write: if true;'");
    } else if (e.code === 'unavailable') {
        alert("Firebase Network Error: Check your internet connection or Firewall.");
    } else {
        alert(`Could not save letter. Error: ${e.message}`);
    }
    
    return null;
  }
};

/**
 * Retrieves a letter from Firestore by its ID.
 */
export const getLetterFromCloud = async (id: string): Promise<LetterData | null> => {
  try {
    const docRef = doc(db, "letters", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as LetterData;
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (e) {
    console.error("Error getting document:", e);
    return null;
  }
};