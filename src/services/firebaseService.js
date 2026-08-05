/**
 * Firebase Firestore & User Authentication Integration Service
 * Configured for sign-language-pwa project
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  query,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

// User's Live Firebase Project Configuration (sign-language-pwa)
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBuzsEQ7d_6tI3GzltusY2upJBc0HV5ptY",
  authDomain: "sign-language-pwa.firebaseapp.com",
  projectId: "sign-language-pwa",
  storageBucket: "sign-language-pwa.firebasestorage.app",
  messagingSenderId: "28882127886",
  appId: "1:28882127886:web:518faf991a605e8986805f",
  measurementId: "G-E83XF7CN98"
};

export function getFirebaseConfig() {
  const stored = localStorage.getItem('app_firebase_config');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // If stored config contains old demo key, reset to live config
      if (parsed.apiKey && !parsed.apiKey.includes('DemoKey')) {
        return parsed;
      }
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
    this.currentUser = null;
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

      // Auth Listener
      onAuthStateChanged(this.auth, (user) => {
        if (user) {
          this.currentUser = user;
          this.isOnline = true;
          this.trackUserLogin(user);
        } else {
          this.currentUser = null;
          // Fallback to anonymous auth
          signInAnonymously(this.auth).then(() => {
            this.isOnline = true;
          }).catch(e => {
            console.log("Local fallback mode:", e.message);
            this.isOnline = false;
          });
        }
      });
    } catch (e) {
      console.warn("Firebase initialization notice:", e.message);
      this.isConfigured = false;
      this.isOnline = false;
    }
  }

  // 1. USER AUTHENTICATION METHODS
  async registerUser(email, password, displayName = 'Sign User') {
    if (!this.auth) return { error: 'Firebase Auth not initialized' };
    try {
      const cred = await createUserWithEmailAndPassword(this.auth, email, password);
      await this.trackUserLogin(cred.user, displayName);
      return { user: cred.user };
    } catch (err) {
      return { error: err.message };
    }
  }

  async loginUser(email, password) {
    if (!this.auth) return { error: 'Firebase Auth not initialized' };
    try {
      const cred = await signInWithEmailAndPassword(this.auth, email, password);
      await this.trackUserLogin(cred.user);
      return { user: cred.user };
    } catch (err) {
      return { error: err.message };
    }
  }

  async logoutUser() {
    if (this.auth) {
      await signOut(this.auth);
    }
  }

  // 2. TRACK USER & USAGE TELEMETRY IN FIRESTORE
  async trackUserLogin(user, displayName = null) {
    if (!this.db || !user) return;
    const userRef = doc(this.db, 'users', user.uid);
    try {
      const snap = await getDoc(userRef);
      const nowStr = new Date().toISOString();

      if (snap.exists()) {
        await setDoc(userRef, {
          lastLoginAt: nowStr,
          loginCount: (snap.data().loginCount || 1) + 1,
          updatedAt: serverTimestamp ? serverTimestamp() : nowStr
        }, { merge: true });
      } else {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email || 'Anonymous Guest',
          isAnonymous: user.isAnonymous,
          displayName: displayName || (user.isAnonymous ? 'Guest User' : user.email.split('@')[0]),
          createdAt: nowStr,
          lastLoginAt: nowStr,
          loginCount: 1,
          deviceOS: navigator.platform || 'Unknown'
        });
      }

      await this.logActivity('USER_LOGIN', { uid: user.uid, isAnonymous: user.isAnonymous });
    } catch (e) {
      console.warn("Firestore user tracking notice:", e.message);
    }
  }

  async logActivity(action, details = {}) {
    if (!this.db) return;
    try {
      await addDoc(collection(this.db, 'app_activity_logs'), {
        action,
        uid: this.currentUser?.uid || 'anon',
        userEmail: this.currentUser?.email || 'Guest',
        details,
        timestamp: new Date().toISOString()
      });
    } catch (e) {}
  }

  // 3. HISTORY TRANSLATION LOGGING
  async saveHistoryRecord(sentence, gestureCount, primaryGesture, mode = 'text') {
    const record = {
      uid: this.currentUser?.uid || 'anon',
      userEmail: this.currentUser?.email || 'Guest User',
      sentence,
      gestureCount: gestureCount || 1,
      primaryGesture: primaryGesture || 'Mixed',
      mode: mode || 'text',
      timestamp: new Date().toISOString(),
      createdAt: serverTimestamp ? serverTimestamp() : new Date().toISOString()
    };

    if (this.isConfigured && this.isOnline) {
      try {
        const docRef = await addDoc(collection(this.db, 'sign_language_history'), record);
        await this.logActivity('SENTENCE_TRANSLATED', { sentence, mode });
        return { id: docRef.id, ...record };
      } catch (err) {
        console.warn("Firestore write failed, using local fallback:", err.message);
      }
    }

    const localHistory = JSON.parse(localStorage.getItem('local_sign_history') || '[]');
    const localRecord = { id: 'local_' + Date.now(), ...record };
    localHistory.unshift(localRecord);
    localStorage.setItem('local_sign_history', JSON.stringify(localHistory.slice(0, 50)));
    return localRecord;
  }

  async fetchHistoryRecords() {
    if (this.isConfigured && this.isOnline) {
      try {
        const q = query(
          collection(this.db, 'sign_language_history'),
          orderBy('createdAt', 'desc'),
          limit(40)
        );
        const querySnapshot = await getDocs(q);
        const docs = [];
        querySnapshot.forEach(doc => {
          docs.push({ id: doc.id, ...doc.data() });
        });
        if (docs.length > 0) return docs;
      } catch (err) {
        console.warn("Firestore fetch notice:", err.message);
      }
    }

    const localHistory = JSON.parse(localStorage.getItem('local_sign_history') || '[]');
    return localHistory;
  }

  async deleteHistoryRecord(id) {
    if (this.isConfigured && this.isOnline && !id.startsWith('local_')) {
      try {
        await deleteDoc(doc(this.db, 'sign_language_history', id));
      } catch (e) {
        console.warn("Firestore delete notice:", e.message);
      }
    }

    const localHistory = JSON.parse(localStorage.getItem('local_sign_history') || '[]');
    const filtered = localHistory.filter(item => item.id !== id);
    localStorage.setItem('local_sign_history', JSON.stringify(filtered));
  }

  async clearAllHistory() {
    localStorage.removeItem('local_sign_history');
  }

  async saveCustomGesture(name, landmarkData) {
    const record = {
      uid: this.currentUser?.uid || 'anon',
      name,
      landmarks: landmarkData,
      timestamp: new Date().toISOString()
    };

    if (this.isConfigured && this.isOnline) {
      try {
        await addDoc(collection(this.db, 'custom_gestures'), record);
      } catch (e) {}
    }

    const localCustom = JSON.parse(localStorage.getItem('local_custom_gestures') || '[]');
    localCustom.unshift({ id: 'custom_' + Date.now(), ...record });
    localStorage.setItem('local_custom_gestures', JSON.stringify(localCustom));
  }

  async fetchCustomGestures() {
    const localCustom = JSON.parse(localStorage.getItem('local_custom_gestures') || '[]');
    return localCustom;
  }
}

export const firebaseService = new FirebaseService();
