import { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, githubProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading, null = not logged in

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u || null));
    return unsub;
  }, []);

  const loginGoogle = () => signInWithPopup(auth, googleProvider);
  const loginGithub = () => signInWithPopup(auth, githubProvider);
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loginGoogle, loginGithub, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
