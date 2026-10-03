// Conexão com o projeto Firebase do CTC (plano Spark, sem custo).
// Estas chaves não são secretas: a proteção dos dados vem das regras do
// Firestore (arquivo firestore.rules) e da lista de domínios autorizados.
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBl9RFgoiI8_C2NsAc8ZEkcaKR9EmaGRrs",
  authDomain: "ctc-curso-tecnico-contabil.firebaseapp.com",
  projectId: "ctc-curso-tecnico-contabil",
  storageBucket: "ctc-curso-tecnico-contabil.firebasestorage.app",
  messagingSenderId: "762266097198",
  appId: "1:762266097198:web:e2bd6425cc1017ced631bf",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
