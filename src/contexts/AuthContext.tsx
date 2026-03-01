import React, { createContext, useContext, useEffect, useState } from "react";
import {
  auth,
  firebaseConfigured,
  googleProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  type User,
} from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  firebaseReady: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // If Firebase isn't configured, skip loading state entirely — treat as logged-out
  const [loading, setLoading] = useState(firebaseConfigured);

  useEffect(() => {
    if (!firebaseConfigured) return;
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    if (!firebaseConfigured) throw new Error("Firebase not configured");
    const { user: u } = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) await updateProfile(u, { displayName });
    setUser({ ...u, displayName } as User);
  };

  const signIn = async (email: string, password: string) => {
    if (!firebaseConfigured) throw new Error("Firebase not configured");
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    if (!firebaseConfigured) throw new Error("Firebase not configured");
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    if (!firebaseConfigured) return;
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    if (!firebaseConfigured) throw new Error("Firebase not configured");
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider value={{
      user, loading, firebaseReady: firebaseConfigured,
      signUp, signIn, signInWithGoogle, logout, resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
