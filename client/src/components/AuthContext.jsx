import { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, githubProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u || null));
    return unsub;
  }, []);

  const loginGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) toast.success('Welcome! 🚀');
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
      if (result.user) toast.success('Welcome! 🚀');
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
