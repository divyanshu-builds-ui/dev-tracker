import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDfhV4xay42XrmbY7shzdDNxc_4WBJWYMQ",
  authDomain: "dev-tracker-by-dg.vercel.app",
  projectId: "dev-tracker-29ede",
  storageBucket: "dev-tracker-29ede.firebasestorage.app",
  messagingSenderId: "400255198355",
  appId: "1:400255198355:web:8fbbfc735cefa4fbaf9966",
  measurementId: "G-LD2NWNH4EL"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
