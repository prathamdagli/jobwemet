import { createContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '../firebase/firebase'
import {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  logout,
  resetPassword,
} from '../services/auth.service'

interface AuthContextValue {
  user: User | null
  loading: boolean
  registerWithEmail: (
    email: string,
    password: string,
  ) => ReturnType<typeof registerWithEmail>
  loginWithEmail: (
    email: string,
    password: string,
  ) => ReturnType<typeof loginWithEmail>
  loginWithGoogle: () => ReturnType<typeof loginWithGoogle>
  logout: () => ReturnType<typeof logout>
  resetPassword: (email: string) => ReturnType<typeof resetPassword>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const value: AuthContextValue = {
    user,
    loading,
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    logout,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }
