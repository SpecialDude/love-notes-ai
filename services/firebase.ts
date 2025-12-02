import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, doc, getDoc } from "firebase/firestore";
import { LetterData } from "../types";

// --------------------------------------------------------
// TODO: PASTE YOUR FIREBASE CONFIG HERE
// Go to Firebase Console -> Project Settings -> General -> Your apps -> Config
// --------------------------------------------------------
const firebaseConfig = {
  // Replace these with your actual config values from Firebase Console
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

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
  } catch (e) {
    console.error("Error adding document: ", e);
    alert("Could not save letter. Check your Firebase Config in services/firebase.ts");
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
