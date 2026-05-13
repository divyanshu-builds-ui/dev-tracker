import { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, githubProvider } from '../firebase';
import { signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from 'firebase/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u || null));
    return unsub;
  }, []);

  // Handle redirect result (mobile)
  useEffect(() => {
    if (isMobile) {
      getRedirectResult(auth).then((result) => {
        if (result?.user) toast.success('Welcome! 🚀');
      }).catch((e) => {
        if (e.code && e.code !== 'auth/redirect-cancelled-by-user') {
          toast.error(e.message || 'Login failed');
        }
      });
    }
  }, []);

  const loginGoogle = async () => {
    try {
      if (isMobile) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        await signInWithPopup(auth, googleProvider);
        toast.success('Welcome! 🚀');
      }
    } catch (e) {
      console.error('Google login error:', e);
      toast.error(e.message || 'Login failed');
    }
  };

  const loginGithub = async () => {
    try {
      if (isMobile) {
        await signInWithRedirect(auth, githubProvider);
      } else {
        await signInWithPopup(auth, githubProvider);
        toast.success('Welcome! 🚀');
      }
    } catch (e) {
      console.error('GitHub login error:', e);
      toast.error(e.message || 'Login failed');
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
