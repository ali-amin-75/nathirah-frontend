import React from "react"
import type { Metadata, Viewport } from "next"
import { LanguageProvider } from "@/lib/language-context"
import { AuthProvider } from "@/lib/auth-context"
import LayoutWrapper from "@/components/layout-wrapper"

import "./globals.css"

export const metadata: Metadata = {
  title: "نذيرة | Nathirah - التنبؤ بعودة سرطان الثدي",
  description:
    "نذيرة - خدمة ذكية للتنبؤ بعودة مرض سرطان الثدي من خلال مسح صور أشعة الثدي باستخدام الذكاء الاصطناعي",
}

export const viewport: Viewport = {
  themeColor: "#5B1A3A",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-sans antialiased">
        <LanguageProvider>
          <AuthProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
