/**
 * Firebase Firestore & Database Integration Service
 * Stores sign language recognition history logs, saved sentences, and custom gesture datasets.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Default / User Firebase Configuration
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDemoKey_SignLanguageApp_2026",
  authDomain: "sign-language-ai-demo.firebaseapp.com",
  projectId: "sign-language-ai-demo",
  storageBucket: "sign-language-ai-demo.appspot.com",
  messagingSenderId: "109876543210",
  appId: "1:109876543210:web:abcdef123456789"
};

export function getFirebaseConfig() {
  const stored = localStorage.getItem('app_firebase_config');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.warn("Could not parse saved Firebase config, using default.");
    }
  }
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveFirebaseConfig(config) {
  localStorage.setItem('app_firebase_config', JSON.stringify(config));
  window.location.reload();
}

class FirebaseService {
  constructor() {
    this.app = null;
    this.db = null;
    this.auth = null;
    this.isConfigured = false;
    this.isOnline = false;
    this.initFirebase();
  }

  initFirebase() {
    try {
      const config = getFirebaseConfig();
      if (!getApps().length) {
        this.app = initializeApp(config);
      } else {
        this.app = getApp();
      }

      this.db = getFirestore(this.app);
      this.auth = getAuth(this.app);
      this.isConfigured = true;

      // Attempt anonymous sign-in
      signInAnonymously(this.auth)
        .then(() => {
          this.isOnline = true;
          console.log("Firebase Auth & Firestore Connected Successfully.");
        })
        .catch(err => {
          console.log("Firebase running in Local Demo Mode:", err.message);
          this.isOnline = false;
        });
    } catch (e) {
      console.warn("Firebase initialization notice:", e.message);
      this.isConfigured = false;
      this.isOnline = false;
    }
  }

  // Save a recognized sentence / history entry to Firestore (or localStorage fallback)
  async saveHistoryRecord(sentence, gestureCount, primaryGesture) {
    const record = {
      sentence,
      gestureCount: gestureCount || 1,
      primaryGesture: primaryGesture || 'Mixed',
      timestamp: new Date().toISOString(),
      createdAt: serverTimestamp ? serverTimestamp() : new Date().toISOString()
    };

    if (this.isConfigured && this.isOnline) {
      try {
        const docRef = await addDoc(collection(this.db, 'sign_language_history'), record);
        return { id: docRef.id, ...record };
      } catch (err) {
        console.warn("Firestore write failed, falling back to local storage:", err.message);
      }
    }

    // Local Storage Fallback
    const localHistory = JSON.parse(localStorage.getItem('local_sign_history') || '[]');
    const localRecord = { id: 'local_' + Date.now(), ...record };
    localHistory.unshift(localRecord);
    localStorage.setItem('local_sign_history', JSON.stringify(localHistory.slice(0, 50)));
    return localRecord;
  }

  // Load history records from Firestore (or localStorage)
  async fetchHistoryRecords() {
    if (this.isConfigured && this.isOnline) {
      try {
        const q = query(
          collection(this.db, 'sign_language_history'),
          orderBy('createdAt', 'desc'),
          limit(30)
        );
        const querySnapshot = await getDocs(q);
        const docs = [];
        querySnapshot.forEach(doc => {
          docs.push({ id: doc.id, ...doc.data() });
        });
        if (docs.length > 0) return docs;
      } catch (err) {
        console.warn("Firestore fetch error, reading local fallback:", err.message);
      }
    }

    // Local Storage Fallback
    const localHistory = JSON.parse(localStorage.getItem('local_sign_history') || '[]');
    return localHistory;
  }

  // Delete history item
  async deleteHistoryRecord(id) {
    if (this.isConfigured && this.isOnline && !id.startsWith('local_')) {
      try {
        await deleteDoc(doc(this.db, 'sign_language_history', id));
      } catch (e) {
        console.warn("Firestore delete failed:", e.message);
      }
    }

    const localHistory = JSON.parse(localStorage.getItem('local_sign_history') || '[]');
    const filtered = localHistory.filter(item => item.id !== id);
    localStorage.setItem('local_sign_history', JSON.stringify(filtered));
  }

  // Clear all history
  async clearAllHistory() {
    localStorage.removeItem('local_sign_history');
  }

  // Save Custom Gesture Landmark Dataset
  async saveCustomGesture(name, landmarkData) {
    const record = {
      name,
      landmarks: landmarkData,
      timestamp: new Date().toISOString()
    };

    if (this.isConfigured && this.isOnline) {
      try {
        await addDoc(collection(this.db, 'custom_gestures'), record);
      } catch (e) {
        console.warn("Firestore custom gesture save failed:", e.message);
      }
    }

    const localCustom = JSON.parse(localStorage.getItem('local_custom_gestures') || '[]');
    localCustom.unshift({ id: 'custom_' + Date.now(), ...record });
    localStorage.setItem('local_custom_gestures', JSON.stringify(localCustom));
  }

  // Fetch Custom Gestures
  async fetchCustomGestures() {
    const localCustom = JSON.parse(localStorage.getItem('local_custom_gestures') || '[]');
    return localCustom;
  }
}

export const firebaseService = new FirebaseService();
