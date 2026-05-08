"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight, ShieldCheck, Brain } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export default function Hero() {
  const { t, locale } = useLanguage()
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight
  const isRTL = locale === "ar"

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-medical.jpg"
          alt="Medical clinic"
          fill
          className="object-cover"
          priority
        />
        <div className={`absolute inset-0 ${isRTL ? "bg-gradient-to-l from-background via-background/95 to-background/70" : "bg-gradient-to-r from-background via-background/95 to-background/70"}`} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 w-full">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-6">
            <span className="inline-block w-12 h-[2px] bg-primary" />
            <span className="text-primary font-semibold text-sm tracking-wide">
              {t("hero.badge")}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-balance text-foreground">
            {t("hero.title1")}
            <br />
            <span className="text-primary">{t("hero.title2")}</span>
          </h1>

          <p className="mt-6 text-foreground/70 text-lg leading-relaxed max-w-lg">
            {t("hero.description")}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              href="/scanner"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold text-base hover:opacity-90 transition-opacity"
            >
              {t("hero.cta")}
              <Arrow className="w-5 h-5" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 border-2 border-primary text-primary px-8 py-4 rounded-lg font-semibold text-base hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {t("hero.secondary")}
            </Link>
          </div>

          <div className="mt-12 flex items-center gap-8">
            <div className="flex items-center gap-2 text-foreground/60">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <span className="text-sm">{t("hero.privacy")}</span>
            </div>
            <div className="flex items-center gap-2 text-foreground/60">
              <Brain className="w-5 h-5 text-primary" />
              <span className="text-sm">{t("hero.ai")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
