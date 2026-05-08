"use client"

import Image from "next/image"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"

export default function Footer() {
  const { t, locale } = useLanguage()
  const isRTL = locale === "ar"

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col gap-4">
            <Image
              src="/logo.jpeg"
              alt="نذيرة - Nathirah"
              width={100}
              height={40}
              className="h-12 w-auto rounded brightness-150"
            />
            <p className="text-primary-foreground/70 text-sm leading-relaxed max-w-xs">
              {t("footer.desc")}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-lg mb-2">{t("footer.links")}</h3>
            <Link href="/home" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
              {t("nav.home")}
            </Link>
            <Link href="/scanner" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
              {t("footer.scanner")}
            </Link>
            <Link href="/home#how-it-works" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
              {t("nav.howItWorks")}
            </Link>
            <Link href="/home#features" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
              {t("nav.features")}
            </Link>
            <Link href="/history" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
              {t("nav.history")}
            </Link>
            <Link href="/account" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
              {t("nav.account")}
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-lg mb-2">{t("footer.contact")}</h3>
            <p className="text-primary-foreground/70 text-sm">info@nathirah.com</p>
            <p className="text-primary-foreground/70 text-sm">{t("footer.country")}</p>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-10 pt-6 text-center">
          <p className="text-primary-foreground/50 text-xs">
            {t("footer.rights")} &copy; {new Date().getFullYear()} {"نذيرة - Nathirah"}
          </p>
        </div>
      </div>
    </footer>
  )
}
