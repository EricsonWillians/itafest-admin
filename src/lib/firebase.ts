// src/lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  type User,
  type Auth,
  connectAuthEmulator,
  browserSessionPersistence,
  setPersistence,
} from 'firebase/auth'
import {
  getFirestore,
  collection,
  connectFirestoreEmulator,
  type Firestore,
} from 'firebase/firestore'
import {
  getStorage,
  connectStorageEmulator,
  type FirebaseStorage,
} from 'firebase/storage'

// Firebase configuration object
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

let app: FirebaseApp | undefined
let auth: Auth
let firestore: Firestore
let storage: FirebaseStorage

/**
 * Initialize Firebase and all required services
 */
export function initializeFirebase() {
  try {
    // Only initialize if no apps exist
    if (!getApps().length) {
      app = initializeApp(firebaseConfig)
      console.log('🔥 Firebase initialized successfully')
    } else {
      app = getApps()[0]
    }

    // Initialize Auth
    auth = getAuth(app)
    
    // Set persistence to SESSION
    setPersistence(auth, browserSessionPersistence)
      .catch((error) => {
        console.error('Error setting auth persistence:', error)
      })

    // Initialize Firestore
    firestore = getFirestore(app)

    // Initialize Storage
    storage = getStorage(app)

    // Connect to emulators in development
    if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
      console.log('🧪 Connecting to Firebase emulators...')
      
      connectAuthEmulator(auth, 'http://localhost:9099')
      connectFirestoreEmulator(firestore, 'localhost', 8080)
      connectStorageEmulator(storage, 'localhost', 9199)
      
      console.log('✅ Connected to Firebase emulators')
    }

    return { app, auth, firestore, storage }
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error)
    throw error
  }
}

/**
 * Get Firebase instances
 * These functions will throw if called before initialization
 */
export function getFirebaseApp() {
  if (!app) throw new Error('Firebase not initialized')
  return app
}

export function getFirebaseAuth() {
  if (!auth) throw new Error('Firebase Auth not initialized')
  return auth
}

export function getFirebaseFirestore() {
  if (!firestore) throw new Error('Firestore not initialized')
  return firestore
}

export function getFirebaseStorage() {
  if (!storage) throw new Error('Firebase Storage not initialized')
  return storage
}

/**
 * Authentication helpers
 */
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider()
  const auth = getFirebaseAuth()
  return signInWithPopup(auth, provider)
}

export async function signInWithEmail(email: string, password: string) {
  const auth = getFirebaseAuth()
  return signInWithEmailAndPassword(auth, email, password)
}

export async function signOutUser() {
  const auth = getFirebaseAuth()
  return signOut(auth)
}

/**
 * Firestore collection references
 * Add your collection references here for type safety
 */
export function getUsersCollection() {
  return collection(getFirebaseFirestore(), 'users')
}

export function getBusinessesCollection() {
  return collection(getFirebaseFirestore(), 'businesses')
}

export function getEventsCollection() {
  return collection(getFirebaseFirestore(), 'events')
}

/**
 * Types
 */
export type { User as FirebaseUser }
export type { DocumentReference, DocumentData } from 'firebase/firestore'

// Re-export commonly used Firebase functions for convenience
export {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  endBefore,
  type QuerySnapshot,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'

export {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'