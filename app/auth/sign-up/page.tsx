"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, ArrowRight, ArrowLeft, Shield, Globe } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { useAuth } from "@/lib/auth-context"
import supabase from "@/lib/supabaseClient" // استيراد سكربت Supabase

export default function SignUpPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { t, locale, toggleLocale } = useLanguage()
  const { signUp } = useAuth()
  const isRTL = locale === "ar"
  const Arrow = isRTL ? ArrowLeft : ArrowRight
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // التحقق من صحة كلمة المرور
    if (password.length < 6) {
      setError(t("auth.passwordTooShort"))
      return
    }
    if (password !== confirmPassword) {
      setError(t("auth.passwordMismatch"))
      return
    }

    setIsLoading(true)

    // إضافة بيانات المستخدم إلى Supabase
    const { data, error: insertError } = await supabase
      .from("Users")  // تأكد من أن هذا هو اسم الجدول في Supabase
      .insert([
        {
          name: fullName,
          email: email,
          password: password, // تأكد من أنك تحفظ كلمة المرور بأمان
        },
      ])

    if (insertError) {
      setError("Error saving data to database")
      console.error(insertError)
    } else {
      console.log("User added successfully:", data)
    }

    setIsLoading(false)
    router.push("/home")
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
          <Image
            src="/logo.jpeg"
            alt="Nathirah"
            width={160}
            height={64}
            className="mx-auto mb-8 rounded-xl shadow-lg"
          />
          <h2 className="text-3xl font-bold text-primary-foreground mb-4 text-balance">
            {t("auth.joinNathirah")}
          </h2>
          <p className="text-primary-foreground/80 text-lg leading-relaxed max-w-md mx-auto">
            {t("auth.signUpSubtitle")}
          </p>
          <div className="mt-10 flex items-center justify-center gap-2 text-primary-foreground/60">
            <Shield className="w-4 h-4" />
            <span className="text-sm">{t("hero.privacy")}</span>
          </div>
        </div>
      </div>

      {/* Right / form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-background relative">
        {/* Language toggle */}
        <button
          type="button"
          onClick={toggleLocale}
          className={`absolute top-6 flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background text-foreground/80 hover:text-primary hover:border-primary/40 transition-colors text-sm font-medium ${isRTL ? "left-6" : "right-6"}`}
          aria-label={t("lang.switch")}
        >
          <Globe className="w-4 h-4" />
          {t("lang.switch")}
        </button>

        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Image
              src="/logo.jpeg"
              alt="Nathirah"
              width={120}
              height={48}
              className="rounded-lg"
            />
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {t("auth.signUpTitle")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t("auth.signUpDesc")}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="fullName" className="text-sm font-medium text-foreground">
                {t("auth.fullName")}
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t("auth.fullNamePlaceholder")}
                required
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors text-sm"
              />
            </div>

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
                  aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                {t("auth.repeatPassword")}
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors ${isRTL ? "left-3" : "right-3"}`}
                  aria-label={showConfirmPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <span>{t("auth.creatingAccount")}</span>
              ) : (
                <>
                  <span>{t("auth.signUp")}</span>
                  <Arrow className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {t("auth.hasAccount")}{" "}
            <Link
              href="/"
              className="text-primary font-semibold hover:underline"
            >
              {t("auth.loginLink")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
