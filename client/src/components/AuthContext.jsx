import { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, githubProvider } from '../firebase';
import { signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext(null);

const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u || null));
    return unsub;
  }, []);

  // Check redirect result on load (for mobile)
  useEffect(() => {
    getRedirectResult(auth).catch(() => {});
  }, []);

  const loginGoogle = () => {
    if (isMobile()) return signInWithRedirect(auth, googleProvider);
    return signInWithPopup(auth, googleProvider);
  };

  const loginGithub = () => {
    if (isMobile()) return signInWithRedirect(auth, githubProvider);
    return signInWithPopup(auth, githubProvider);
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loginGoogle, loginGithub, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
