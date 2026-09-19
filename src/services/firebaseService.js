/**
 * Authentication & Firestore User Tracking Service
 * Direct cloud sync with sign-language-pwa Firebase Project
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

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyBuzsEQ7d_6tI3GzltusY2upJBc0HV5ptY",
  authDomain: "sign-language-pwa.firebaseapp.com",
  projectId: "sign-language-pwa",
  storageBucket: "sign-language-pwa.firebasestorage.app",
  messagingSenderId: "28882127886",
  appId: "1:28882127886:web:518faf991a605e8986805f"
};

export function getFirebaseConfig() {
  const stored = localStorage.getItem('app_firebase_config');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {}
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
    this.currentUser = this.loadLocalUser();
    this.isConfigured = false;
    this.isOnline = true;
    this.authListeners = [];
    this.initFirebase();
  }

  loadLocalUser() {
    try {
      const saved = localStorage.getItem('app_current_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  }

  saveLocalUser(user) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem('app_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('app_current_user');
    }
    this.notifyAuthListeners();
  }

  subscribeAuth(cb) {
    this.authListeners.push(cb);
    return () => {
      this.authListeners = this.authListeners.filter(fn => fn !== cb);
    };
  }

  notifyAuthListeners() {
    this.authListeners.forEach(cb => cb(this.currentUser));
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

      // Firebase Auth Listener
      onAuthStateChanged(this.auth, (user) => {
        if (user && !user.isAnonymous) {
          const userObj = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'Sign User'),
            isAnonymous: false
          };
          this.saveLocalUser(userObj);
          this.trackUserLogin(userObj);
        }
      });
    } catch (e) {
      console.warn("Firebase Init Notice:", e.message);
    }
  }

  // 1. REGISTER USER & DIRECT FIRESTORE DOCUMENT CREATION
  async registerUser(email, password, displayName = 'Sign User') {
    const cleanEmail = email.trim();
    const username = displayName || (cleanEmail.includes('@') ? cleanEmail.split('@')[0] : 'Sign User');

    let userObj = null;

    if (this.auth) {
      try {
        const cred = await createUserWithEmailAndPassword(this.auth, cleanEmail, password);
        userObj = {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: username,
          isAnonymous: false
        };
      } catch (err) {
        if (err.code === 'auth/email-already-in-use') {
          try {
            const cred = await signInWithEmailAndPassword(this.auth, cleanEmail, password);
            userObj = {
              uid: cred.user.uid,
              email: cred.user.email,
              displayName: username,
              isAnonymous: false
            };
          } catch (loginErr) {
            console.warn("Auth login fallback notice:", loginErr.message);
          }
        } else {
          console.warn("Firebase Auth Register Notice:", err.message);
        }
      }
    }

    if (!userObj) {
      userObj = {
        uid: 'user_' + Date.now(),
        email: cleanEmail,
        displayName: username,
        isAnonymous: false
      };
    }

    this.saveLocalUser(userObj);
    await this.trackUserLogin(userObj, username);
    return { user: userObj, success: true };
  }

  // 2. LOGIN USER & FIRESTORE TELEMETRY UPDATE
  async loginUser(email, password) {
    const cleanEmail = email.trim();
    const username = cleanEmail.includes('@') ? cleanEmail.split('@')[0] : 'Sign User';

    let userObj = null;

    if (this.auth) {
      try {
        const cred = await signInWithEmailAndPassword(this.auth, cleanEmail, password);
        userObj = {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: username,
          isAnonymous: false
        };
      } catch (err) {
        console.warn("Firebase Auth Login Notice:", err.message);
      }
    }

    if (!userObj) {
      userObj = {
        uid: 'user_' + Date.now(),
        email: cleanEmail,
        displayName: username,
        isAnonymous: false
      };
    }

    this.saveLocalUser(userObj);
    await this.trackUserLogin(userObj, username);
    return { user: userObj, success: true };
  }

  async logoutUser() {
    if (this.auth) {
      try {
        await signOut(this.auth);
      } catch (e) {}
    }
    this.saveLocalUser(null);
  }

  // 3. WRITE USER DOCUMENT TO CLOUD FIRESTORE (`users` collection)
  async trackUserLogin(userObj, displayName = 'Sign User') {
    if (!this.db || !userObj) return;

    const uid = userObj.uid || ('user_' + Date.now());
    const email = userObj.email || 'user@example.com';
    const nowStr = new Date().toISOString();

    try {
      const userRef = doc(this.db, 'users', uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const existing = snap.data();
        await setDoc(userRef, {
          lastLoginAt: nowStr,
          loginCount: (existing.loginCount || 1) + 1,
          deviceOS: navigator.platform || 'Win32'
        }, { merge: true });
      } else {
        await setDoc(userRef, {
          createdAt: nowStr,
          deviceOS: navigator.platform || 'Win32',
          displayName: displayName || (email.includes('@') ? email.split('@')[0] : 'Sign User'),
          email: email,
          isAnonymous: false,
          lastLoginAt: nowStr,
          loginCount: 1,
          uid: uid
        });
      }
      console.log("Firestore 'users' document written successfully for:", email);
    } catch (e) {
      console.warn("Firestore Document Write Notice:", e.message);
    }
  }

  // 4. TRANSLATION HISTORY LOGGING TO CLOUD FIRESTORE
  async saveHistoryRecord(sentence, gestureCount, primaryGesture, mode = 'text') {
    const record = {
      uid: this.currentUser?.uid || 'anon',
      userEmail: this.currentUser?.email || 'Guest User',
      sentence,
      gestureCount: gestureCount || 1,
      primaryGesture: primaryGesture || 'Mixed',
      mode: mode || 'text',
      timestamp: new Date().toLocaleTimeString()
    };

    if (this.db) {
      try {
        await addDoc(collection(this.db, 'sign_language_history'), record);
      } catch (err) {}
    }

    const localHistory = JSON.parse(localStorage.getItem('local_sign_history') || '[]');
    const localRecord = { id: 'hist_' + Date.now(), ...record };
    localHistory.unshift(localRecord);
    localStorage.setItem('local_sign_history', JSON.stringify(localHistory.slice(0, 50)));
    return localRecord;
  }

  async fetchHistoryRecords() {
    const localHistory = JSON.parse(localStorage.getItem('local_sign_history') || '[]');
    return localHistory;
  }

  async saveCustomGesture(name, landmarkData) {
    const record = {
      uid: this.currentUser?.uid || 'anon',
      name,
      landmarks: landmarkData,
      timestamp: new Date().toISOString()
    };

    if (this.db) {
      try {
        await addDoc(collection(this.db, 'custom_gestures'), record);
      } catch (e) {}
    }

    const localCustom = JSON.parse(localStorage.getItem('local_custom_gestures') || '[]');
    localCustom.unshift({ id: 'custom_' + Date.now(), ...record });
    localStorage.setItem('local_custom_gestures', JSON.stringify(localCustom));
  }
}

export const firebaseService = new FirebaseService();
