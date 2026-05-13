import { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, githubProvider, db } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u || null));
    return unsub;
  }, []);

  // Save referral code from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) localStorage.setItem('referrer', ref);
  }, []);

  const handlePostLogin = async (result) => {
    if (!result.user) return;
    const uid = result.user.uid;

    // Check if first time login (new user)
    const userDoc = await getDoc(doc(db, 'users', uid, 'profile', 'meta'));
    if (!userDoc.exists()) {
      // New user — save meta
      await setDoc(doc(db, 'users', uid, 'profile', 'meta'), { joinedAt: Date.now() });

      // Process referral
      const referrer = localStorage.getItem('referrer');
      if (referrer && referrer !== uid) {
        // Save referral record
        await setDoc(doc(db, 'users', uid, 'profile', 'referral'), { referredBy: referrer });
        // Give XP bonus to referrer
        const referrerRef = doc(db, 'users', referrer, 'profile', 'referralStats');
        const referrerSnap = await getDoc(referrerRef);
        if (referrerSnap.exists()) {
          await updateDoc(referrerRef, { count: increment(1), xpBonus: increment(100) });
        } else {
          await setDoc(referrerRef, { count: 1, xpBonus: 100 });
        }
        localStorage.removeItem('referrer');
        toast.success('Referral bonus applied! 🎉');
      }
    }
    toast.success('Welcome! 🚀');
  };

  const loginGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await handlePostLogin(result);
    } catch (e) {
      console.error('Login error:', e.code, e.message);
      if (e.code === 'auth/popup-blocked' || e.code === 'auth/popup-closed-by-user') {
        toast.error('Popup blocked — please allow popups for this site');
      } else if (e.code !== 'auth/cancelled-popup-request') {
        toast.error('Login failed: ' + (e.code || e.message));
      }
    }
  };

  const loginGithub = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      await handlePostLogin(result);
    } catch (e) {
      console.error('Login error:', e.code, e.message);
      if (e.code === 'auth/popup-blocked' || e.code === 'auth/popup-closed-by-user') {
        toast.error('Popup blocked — please allow popups for this site');
      } else if (e.code !== 'auth/cancelled-popup-request') {
        toast.error('Login failed: ' + (e.code || e.message));
      }
    }
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loginGoogle, loginGithub, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
