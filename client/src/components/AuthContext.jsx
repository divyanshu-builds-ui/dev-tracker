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
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error('Google login error:', e);
      toast.error(e.message || 'Login failed');
    }
  };

  const loginGithub = async () => {
    try {
      await signInWithPopup(auth, githubProvider);
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
