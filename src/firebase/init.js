// Import the functions you need from the SDKs you need
// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDHmKJiRngA4W8q4xoI4MGbls5DOrlxKE0',
  authDomain: 'a3-80d88.firebaseapp.com',
  projectId: 'a3-80d88',
  storageBucket: 'a3-80d88.firebasestorage.app',
  messagingSenderId: '1018569235023',
  appId: '1:1018569235023:web:76b58928bd52b1518aa83a',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)

const functions = getFunctions(app)
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === '1') {
  try {
    connectFunctionsEmulator(functions, 'localhost', 5001)
  } catch {}
}

export { app, functions }
