"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  FileText,
  Calendar,
  Activity,
  Stethoscope,
  Heart,
  BarChart2,
  Database,
  ImageIcon,
  Target,
} from "lucide-react"
import { useLanguage } from "@/lib/language-context"

type RiskLevel = "low" | "medium" | "high"

export default function ResultsContent() {
  const searchParams = useSearchParams()
  const { t, locale } = useLanguage()

  const rawRisk = searchParams.get("risk")
  const risk: RiskLevel =
    rawRisk === "low" || rawRisk === "medium" || rawRisk === "high" ? rawRisk : "low"
  const score      = searchParams.get("score")      || "0"
  const dateStr    = searchParams.get("date")        || new Date().toISOString()
  const confidence = searchParams.get("confidence")  || ""
  const dataSource = searchParams.get("dataSource")  || ""
  const imagesUsed = searchParams.get("imagesUsed")  || ""
  const threshold  = searchParams.get("threshold")   || ""

  const riskConfig: Record<
    RiskLevel,
    {
      label: string
      color: string
      bgColor: string
      borderColor: string
      barColor: string
      icon: typeof ShieldCheck
      message: string
      recommendation: string
    }
  > = {
    low: {
      label: t("res.low"),
      color: "text-emerald-700",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      barColor: "bg-emerald-500",
      icon: ShieldCheck,
      message: t("res.low.msg"),
      recommendation: t("res.low.rec"),
    },
    medium: {
      label: t("res.medium"),
      color: "text-amber-700",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      barColor: "bg-amber-500",
      icon: AlertTriangle,
      message: t("res.medium.msg"),
      recommendation: t("res.medium.rec"),
    },
    high: {
      label: t("res.high"),
      color: "text-red-700",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      barColor: "bg-red-500",
      icon: XCircle,
      message: t("res.high.msg"),
      recommendation: t("res.high.rec"),
    },
  }

  const config = riskConfig[risk]
  const RiskIcon = config.icon
  const dateLocale = locale === "ar" ? "ar-SA" : "en-US"
  const formattedDate = new Date(dateStr).toLocaleDateString(dateLocale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const BackArrow = locale === "ar" ? ArrowRight : ArrowLeft
  const isRTL = locale === "ar"

  const modelMetrics = [
    confidence  && { icon: BarChart2,  label: t("res.confidence"), value: confidence },
    dataSource  && { icon: Database,   label: t("res.dataSource"),  value: dataSource },
    imagesUsed  && { icon: ImageIcon,  label: t("res.imagesUsed"),  value: imagesUsed },
    threshold   && { icon: Target,     label: t("res.threshold"),   value: threshold  },
  ].filter(Boolean) as { icon: typeof BarChart2; label: string; value: string }[]

  return (
    <section className="min-h-screen py-16 bg-background">
      <div className="max-w-4xl mx-auto px-6">

        {/* ── Header ─────────────────────────────────────── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-secondary text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <FileText className="w-4 h-4" />
            <span>{t("res.badge")}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            {t("res.title")}
          </h1>
        </div>

        {/* ── Risk banner ────────────────────────────────── */}
        <div className={`rounded-2xl border-2 ${config.borderColor} ${config.bgColor} p-8 mb-8`}>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div
              className={`w-24 h-24 rounded-full ${config.bgColor} border-2 ${config.borderColor} flex items-center justify-center shrink-0`}
            >
              <RiskIcon className={`w-12 h-12 ${config.color}`} />
            </div>
            <div className={`flex-1 text-center ${isRTL ? "md:text-right" : "md:text-left"}`}>
              <div
                className={`flex items-center justify-center ${isRTL ? "md:justify-end" : "md:justify-start"} gap-3 mb-2`}
              >
                <h2 className="text-2xl font-bold text-foreground">{t("res.riskLevel")}</h2>
                <span className={`text-2xl font-bold ${config.color}`}>{config.label}</span>
              </div>
              <p className="text-foreground/70 leading-relaxed">{config.message}</p>
            </div>
          </div>
        </div>

        {/* ── Probability + Date ─────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{t("res.probability")}</h3>
            </div>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-4xl font-bold text-primary">{score}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full ${config.barColor} transition-all duration-1000`}
                style={{ width: `${score}%` }}
              />
            </div>
            {threshold && (
              <p className="mt-2 text-xs text-foreground/50">
                {t("res.threshold")}: {threshold}
              </p>
            )}
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{t("res.date")}</h3>
            </div>
            <p className="text-xl font-semibold text-foreground">{formattedDate}</p>
            <p className="text-foreground/50 text-sm mt-2">{t("res.analyzedBy")}</p>
          </div>
        </div>

        {/* ── Model details ──────────────────────────────── */}
        {modelMetrics.length > 0 && (
          <div className="bg-card rounded-2xl border border-border p-6 mb-6">
            <h3 className="font-semibold text-foreground mb-4">{t("res.modelDetails")}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {modelMetrics.map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-muted/50 rounded-xl p-4 text-center">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center mx-auto mb-2">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-foreground break-words">{value}</p>
                  <p className="text-xs text-foreground/50 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Recommendations ────────────────────────────── */}
        <div className="bg-card rounded-2xl border border-border p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">{t("res.recommendations")}</h3>
          </div>
          <p className="text-foreground/70 leading-relaxed mb-6">{config.recommendation}</p>
          <div className="bg-muted/50 rounded-xl p-4 flex items-start gap-3">
            <Heart className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <p className="text-foreground/60 text-sm leading-relaxed">{t("res.reminder")}</p>
          </div>
        </div>

        {/* ── Actions ────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/scanner"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="w-4 h-4" />
            {t("res.newScan")}
          </Link>
          <Link
            href="/home"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-primary text-primary px-8 py-3.5 rounded-lg font-semibold text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            {t("res.backHome")}
            <BackArrow className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  )
}
