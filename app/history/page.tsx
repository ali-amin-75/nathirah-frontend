"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useLanguage } from "@/lib/language-context"
import { useAuth } from "@/lib/auth-context"
import {
  getScanHistory,
  deleteScan,
  type ScanRecord,
  type RiskLevel,
} from "@/lib/scan-history"
import {
  History,
  ScanLine,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Calendar,
  RefreshCw,
  Trash2,
  BarChart2,
  Database,
  ImageIcon,
  Target,
  User,
} from "lucide-react"

const riskConfig: Record<
  RiskLevel,
  {
    label_ar: string
    label_en: string
    color: string
    bgColor: string
    borderColor: string
    barColor: string
    icon: typeof ShieldCheck
  }
> = {
  low: {
    label_ar: "منخفض",
    label_en: "Low",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    barColor: "bg-emerald-500",
    icon: ShieldCheck,
  },
  medium: {
    label_ar: "متوسط",
    label_en: "Medium",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    barColor: "bg-amber-500",
    icon: AlertTriangle,
  },
  high: {
    label_ar: "مرتفع",
    label_en: "High",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    barColor: "bg-red-500",
    icon: XCircle,
  },
}

export default function HistoryPage() {
  const { t, locale } = useLanguage()
  const { user } = useAuth()
  const isRTL = locale === "ar"
  const dateLocale = locale === "ar" ? "ar-SA" : "en-US"

  const [scans, setScans]       = useState<ScanRecord[]>([])
  const [loading, setLoading]   = useState(true)

  const loadScans = useCallback(async () => {
    setLoading(true)
    const data = await getScanHistory(user?.email || "")
    setScans(data)
    setLoading(false)
  }, [user?.email])

  useEffect(() => { loadScans() }, [loadScans])

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteScan(id)
      setScans((prev) => prev.filter((s) => s.id !== id))
    },
    []
  )

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(dateLocale, {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    })

  return (
    <main>
      <Navbar />
      <section className="min-h-screen py-24 bg-background">
        <div className="max-w-5xl mx-auto px-6">

          {/* ── Header ─────────────────────────────────────── */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-secondary text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <History className="w-4 h-4" />
              <span>{t("history.badge")}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {t("history.title")}
            </h1>
            <p className="mt-3 text-foreground/60 text-sm">
              {t("history.subtitle")}
            </p>
          </div>

          {/* ── Loading ─────────────────────────────────────── */}
          {loading && (
            <div className="flex justify-center py-20">
              <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}

          {/* ── Empty ───────────────────────────────────────── */}
          {!loading && scans.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <History className="w-9 h-9 text-primary" />
              </div>
              <p className="text-foreground font-semibold text-lg mb-2">
                {t("history.empty")}
              </p>
              <p className="text-foreground/50 text-sm mb-6">
                {t("history.emptyDesc")}
              </p>
              <Link
                href="/scanner"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                <ScanLine className="w-4 h-4" />
                {t("history.newScan")}
              </Link>
            </div>
          )}

          {/* ── Scan List ───────────────────────────────────── */}
          {!loading && scans.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-foreground/60">
                  {scans.length} {locale === "ar" ? "فحص مسجّل" : "recorded scans"}
                </p>
                <Link
                  href="/scanner"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  <ScanLine className="w-4 h-4" />
                  {t("history.newScan")}
                </Link>
              </div>

              <div className="space-y-4">
                {scans.map((scan) => {
                  const cfg      = riskConfig[scan.risk] ?? riskConfig.low
                  const RiskIcon = cfg.icon
                  const label    = locale === "ar" ? cfg.label_ar : cfg.label_en

                  return (
                    <div
                      key={scan.id}
                      className="bg-card rounded-2xl border border-border overflow-hidden"
                    >
                      {/* Top bar */}
                      <div className={`h-1 ${cfg.barColor}`} />

                      <div className="p-6">
                        <div className={`flex flex-col md:flex-row gap-5 ${isRTL ? "md:flex-row-reverse" : ""}`}>

                          {/* Risk icon */}
                          <div className={`w-16 h-16 rounded-full ${cfg.bgColor} border-2 ${cfg.borderColor} flex items-center justify-center shrink-0`}>
                            <RiskIcon className={`w-8 h-8 ${cfg.color}`} />
                          </div>

                          {/* Main info */}
                          <div className="flex-1 min-w-0">
                            <div className={`flex flex-wrap items-center gap-3 mb-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                              <span className={`text-lg font-bold ${cfg.color}`}>{label}</span>
                              <span className="text-2xl font-bold text-primary">{scan.score}%</span>
                              {scan.patientId && (
                                <span className="inline-flex items-center gap-1 text-xs bg-secondary text-foreground/70 px-2 py-1 rounded-full">
                                  <User className="w-3 h-3" />
                                  {scan.patientId}
                                </span>
                              )}
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-muted rounded-full h-2 mb-4">
                              <div
                                className={`h-2 rounded-full ${cfg.barColor}`}
                                style={{ width: `${scan.score}%` }}
                              />
                            </div>

                            {/* Meta grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div className="flex items-center gap-2 text-xs text-foreground/60">
                                <Calendar className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{formatDate(scan.date)}</span>
                              </div>
                              {scan.confidence && (
                                <div className="flex items-center gap-2 text-xs text-foreground/60">
                                  <BarChart2 className="w-3.5 h-3.5 shrink-0" />
                                  <span className="truncate">{scan.confidence}</span>
                                </div>
                              )}
                              {scan.dataSource && (
                                <div className="flex items-center gap-2 text-xs text-foreground/60">
                                  <Database className="w-3.5 h-3.5 shrink-0" />
                                  <span className="truncate">{scan.dataSource}</span>
                                </div>
                              )}
                              {scan.imagesUsed && (
                                <div className="flex items-center gap-2 text-xs text-foreground/60">
                                  <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                                  <span>{scan.imagesUsed} {locale === "ar" ? "صور" : "images"}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className={`flex md:flex-col gap-2 shrink-0 ${isRTL ? "items-end" : "items-end md:items-end"}`}>
                            <Link
                              href={`/results?risk=${scan.risk}&score=${scan.score}&date=${encodeURIComponent(scan.date)}&confidence=${encodeURIComponent(scan.confidence || "")}&dataSource=${encodeURIComponent(scan.dataSource || "")}&imagesUsed=${encodeURIComponent(scan.imagesUsed || "")}&threshold=${encodeURIComponent(scan.threshold || "")}`}
                              className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              {t("history.viewDetails")}
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDelete(scan.id)}
                              className="inline-flex items-center gap-1.5 border border-border text-foreground/60 px-4 py-2 rounded-lg text-xs font-semibold hover:border-red-300 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              {locale === "ar" ? "حذف" : "Delete"}
                            </button>
                          </div>

                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

        </div>
      </section>
      <Footer />
    </main>
  )
}
