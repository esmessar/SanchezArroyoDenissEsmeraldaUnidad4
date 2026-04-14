import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, addDoc, collection, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBMczrx-ToUmmPCp6om9mBVAOGobDlD2Gg",
  authDomain: "proyecto1-dbe10.firebaseapp.com",
  projectId: "proyecto1-dbe10",
  storageBucket: "proyecto1-dbe10.firebasestorage.app",
  messagingSenderId: "1095030007068",
  appId: "1:1095030007068:web:4566da5421c3ed5345c6d9",
  measurementId: "G-S6CN0MVZZT"
};

try {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  window._fbDB = db;
  window._fbCollection = (dbRef, colName) => collection(dbRef, colName);
  window._fbAddDoc = addDoc;
  window._fbGetDocs = getDocs;
  window._fbDeleteDoc = deleteDoc;
  window._fbDoc = (dbRef, colName, id) => doc(dbRef, colName, id);
  window.firebaseReady = true;
  
  console.log('Firebase inicializado correctamente');
  window.dispatchEvent(new Event('firebaseReady'));
  window.dispatchEvent(new CustomEvent('firebaseStatus', { detail: { success: true } }));
} catch (error) {
  console.error('Error inicializando Firebase:', error);
  window.firebaseReady = false;
  window.dispatchEvent(new CustomEvent('firebaseStatus', { detail: { success: false, error: error.message } }));
}