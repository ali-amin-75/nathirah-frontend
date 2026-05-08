"use client"

import { Upload, Cpu, FileText } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export default function HowItWorks() {
  const { t, locale } = useLanguage()
  const isRTL = locale === "ar"

  const steps = [
    {
      icon: Upload,
      number: "01",
      title: t("hiw.step1.title"),
      description: t("hiw.step1.desc"),
    },
    {
      icon: Cpu,
      number: "02",
      title: t("hiw.step2.title"),
      description: t("hiw.step2.desc"),
    },
    {
      icon: FileText,
      number: "03",
      title: t("hiw.step3.title"),
      description: t("hiw.step3.desc"),
    },
  ]

  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-primary font-semibold text-sm tracking-wide">{t("hiw.badge")}</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-foreground text-balance">
            {t("hiw.title")}
          </h2>
          <p className="mt-4 text-foreground/60 max-w-2xl mx-auto leading-relaxed">
            {t("hiw.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-8">
                  <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center">
                    <step.icon className="w-10 h-10 text-primary" />
                  </div>
                  <span className={`absolute -top-2 ${isRTL ? "-right-2" : "-left-2"} w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold`}>
                    {step.number}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                <p className="text-foreground/60 leading-relaxed max-w-sm">{step.description}</p>
              </div>

              {index < steps.length - 1 && (
                <div className={`hidden md:block absolute top-12 ${isRTL ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2"} w-full h-[2px]`}>
                  <div className="w-full h-full border-t-2 border-dashed border-primary/20" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
