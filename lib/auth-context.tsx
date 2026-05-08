"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import supabase from "@/lib/supabaseClient"  // تأكد من استيراد supabaseClient

const AUTH_STORAGE_KEY = "nathirah-auth"
const USERS_REGISTRY_KEY = "nathirah-users"

export interface User {
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  isLoggedIn: boolean
  login: (email: string, password: string) => void  // إضافة كلمة المرور هنا
  signUp: (email: string, name: string) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function getStoredUser(): User | null {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored) as User
    if (parsed?.email) return parsed
    return null
  } catch {
    return null
  }
}

function getStoredUserName(email: string): string | null {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem(USERS_REGISTRY_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored) as Record<string, string>
    return parsed[email] ?? null
  } catch {
    return null
  }
}

function storeUserName(email: string, name: string): void {
  if (typeof window === "undefined") return
  try {
    const stored = localStorage.getItem(USERS_REGISTRY_KEY)
    const parsed = stored ? (JSON.parse(stored) as Record<string, string>) : {}
    parsed[email] = name
    localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(parsed))
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setUser(getStoredUser())
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY)
      }
    }
  }, [user, mounted])

  // دالة لتسجيل الدخول التي تتحقق من البيانات في Supabase
  const login = useCallback(async (email: string, password: string) => {
    // التحقق من البيانات في Supabase
    const { data, error } = await supabase
      .from("Users")  // تأكد من أن هذا هو اسم الجدول في Supabase
      .select("*")
      .eq("email", email)
      .eq("password", password)  // تحقق من كلمة المرور

    if (error || !data || data.length === 0) {
      // إذا كانت البيانات غير موجودة أو هناك خطأ
      throw new Error("Invalid credentials")
    }

    const user = data[0]
    setUser({ email: user.email, name: user.name })
  }, [])

  const signUp = useCallback((email: string, name: string) => {
    storeUserName(email, name)
    setUser({ email, name })
  }, [])

  const signOut = useCallback(() => {
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
