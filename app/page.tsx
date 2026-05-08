"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"  // استيراد useAuth من AuthContext
import Link from "next/link"
import { Eye, EyeOff, ArrowRight, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export default function LoginPage() {
  const { t, locale } = useLanguage()
  const { login } = useAuth() // استخدام login من AuthContext
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const isRTL = locale === "ar"
  const Arrow = isRTL ? ArrowLeft : ArrowRight

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    
    // التحقق من المدخلات
    if (!email || !password) {
      setError(t("auth.fieldsRequired"))
      setIsLoading(false)
      return
    }

    try {
      // التحقق من البيانات في Supabase
      await login(email, password)
      setIsLoading(false)
      router.push("/home") // التوجيه إلى الصفحة الرئيسية بعد النجاح
    } catch (err) {
      setError(t("Account not found"))
      setIsLoading(false)
    }
  }

  return (
    <div className={`min-h-screen flex ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
      {/* Left / decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 -left-10 w-72 h-72 rounded-full border border-primary-foreground/30" />
          <div className="absolute bottom-32 right-10 w-96 h-96 rounded-full border border-primary-foreground/20" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full border border-primary-foreground/20" />
        </div>
        <div className="relative z-10 px-12 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4 text-balance">
            {t("auth.welcomeBack")}
          </h2>
          <p className="text-primary-foreground/80 text-lg leading-relaxed max-w-md mx-auto">
            {t("auth.loginSubtitle")}
          </p>
        </div>
      </div>

      {/* Right / form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-background relative">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {t("auth.loginTitle")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t("auth.loginDesc")}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                {t("auth.email")}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.emailPlaceholder")}
                required
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors text-sm"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                {t("auth.password")}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors ${isRTL ? "left-3" : "right-3"}`}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <span>{t("auth.loggingIn")}</span>
              ) : (
                <>
                  <span>{t("auth.login")}</span>
                  <Arrow className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t("auth.noAccount")}{" "}
            <Link
              href="/auth/sign-up"
              className="text-primary font-semibold hover:underline"
            >
              {t("auth.signUpLink")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
