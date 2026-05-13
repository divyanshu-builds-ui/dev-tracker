import { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, githubProvider } from '../firebase';
import { signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u || null));
    return unsub;
  }, []);

  // Handle redirect result when page loads back
  useEffect(() => {
    getRedirectResult(auth).catch(() => {});
  }, []);

  const loginGoogle = () => signInWithRedirect(auth, googleProvider);
  const loginGithub = () => signInWithRedirect(auth, githubProvider);
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loginGoogle, loginGithub, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
