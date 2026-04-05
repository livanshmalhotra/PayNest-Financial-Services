import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup, type User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  docExists: boolean | null;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  refreshUserData: (uid?: string) => Promise<void>;
}

export interface UserData {
  displayName?: string;
  occupation?: string;
  email?: string;
  uid: string;
  username?: string;
  income?: number;
  balance?: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [docExists, setDocExists] = useState<boolean | null>(null);

  const refreshUserData = async (uid?: string) => {
    const id = uid || currentUser?.uid;
    if (!id) return;
    
    try {
      const docRef = doc(db, "users", id);
      const docSnap = await Promise.race([
        getDoc(docRef),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000))
      ]) as any;

      if (docSnap.exists()) {
        setUserData(docSnap.data() as UserData);
        setDocExists(true);
      } else {
        setUserData(null);
        setDocExists(false);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setDocExists(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        refreshUserData(user.uid);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = () => {
    return signOut(auth);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const value = {
    currentUser,
    userData,
    loading,
    docExists,
    logout,
    signInWithGoogle,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
