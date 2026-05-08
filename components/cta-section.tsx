"use client"

import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export default function CTASection() {
  const { t, locale } = useLanguage()
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight
  const isRTL = locale === "ar"

  return (
    <section className="py-24 bg-primary relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className={`absolute top-10 ${isRTL ? "right-10" : "left-10"} w-72 h-72 rounded-full border-2 border-primary-foreground`} />
        <div className={`absolute bottom-10 ${isRTL ? "left-10" : "right-10"} w-48 h-48 rounded-full border-2 border-primary-foreground`} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground text-balance">
          {t("cta.title")}
        </h2>
        <p className="mt-6 text-primary-foreground/80 text-lg leading-relaxed max-w-2xl mx-auto">
          {t("cta.desc")}
        </p>
        <Link
          href="/scanner"
          className="mt-10 inline-flex items-center gap-2 bg-primary-foreground text-primary px-10 py-4 rounded-lg font-semibold text-base hover:opacity-90 transition-opacity"
        >
          {t("cta.button")}
          <Arrow className="w-5 h-5" />
        </Link>
      </div>
    </section>
  )
}
