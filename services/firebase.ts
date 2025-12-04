
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  getDocs,
  updateDoc,
  increment,
  DocumentSnapshot 
} from "firebase/firestore";
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
 * Throws errors so UI can handle them with Toasts.
 */
export const saveLetterToCloud = async (data: LetterData): Promise<string> => {
  try {
    // Sanitize data: Firestore throws if a field is explicitly 'undefined'.
    const sanitizedData = Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, v === undefined ? null : v])
    );

    const docRef = await addDoc(collection(db, "letters"), {
      ...sanitizedData,
      views: 0, // Initialize views
      createdAt: new Date().toISOString() // Ensure server timestamp logic
    });
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (e: any) {
    console.error("🔥 Error adding document: ", e);
    
    // Map Firebase errors to user-friendly messages
    if (e.code === 'permission-denied') {
        throw new Error("Permission Denied: Please update Firebase Rules to 'allow read, write: if true;'");
    } else if (e.code === 'unavailable') {
        throw new Error("Network Error: Check your internet connection.");
    } else if (e.message.includes('undefined')) {
        throw new Error("Data Error: Invalid data structure.");
    } else {
        throw new Error(`Could not save: ${e.message}`);
    }
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
      return { id: docSnap.id, ...docSnap.data() } as LetterData;
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (e) {
    console.error("Error getting document:", e);
    return null;
  }
};

/**
 * Increment view count for a letter
 */
export const incrementViewCount = async (id: string) => {
  try {
    const docRef = doc(db, "letters", id);
    await updateDoc(docRef, {
      views: increment(1)
    });
  } catch (e) {
    console.error("Failed to increment views", e);
  }
};

/**
 * Fetch Public Feed (Paginated)
 */
export const getPublicFeed = async (lastDoc?: DocumentSnapshot) => {
  try {
    let q = query(
      collection(db, "letters"),
      where("isPublic", "==", true),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    if (lastDoc) {
      q = query(
        collection(db, "letters"),
        where("isPublic", "==", true),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(5)
      );
    }

    const snapshot = await getDocs(q);
    const letters: LetterData[] = [];
    snapshot.forEach((doc) => {
      letters.push({ id: doc.id, ...doc.data() } as LetterData);
    });

    return { 
      letters, 
      lastDoc: snapshot.docs[snapshot.docs.length - 1] 
    };
  } catch (e: any) {
    console.error("Error fetching feed:", e);
    // Propagate error for UI handling
    if (e.code === 'failed-precondition' && e.message.includes('index')) {
        throw new Error("MISSING_INDEX");
    }
    return { letters: [], lastDoc: undefined };
  }
};
