"use client"

import React, { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  Upload, X, ScanLine, ImageIcon, AlertCircle,
  Search, ChevronDown, ChevronUp, User,
} from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { useAuth } from "@/lib/auth-context"
import supabase from "@/lib/supabaseClient"
import { saveScanLocally, saveScanToSupabase, type RiskLevel } from "@/lib/scan-history"

const FLASK_URL = process.env.NEXT_PUBLIC_FLASK_URL || "http://localhost:5000"

interface ClinicalData {
  er: number
  pr: number
  her2: number
  mol_subtype: number
  t_stage: number
  n_stage: number
  grade: number
  menopause: number
  meta: number
}

const DEFAULT_CLINICAL: ClinicalData = {
  er: 1, pr: 1, her2: 0, mol_subtype: 0,
  t_stage: 1, n_stage: 0, grade: 2, menopause: 1, meta: 0,
}

export default function ScannerUpload() {
  const router = useRouter()
  const { t, locale } = useLanguage()
  const { user } = useAuth()
  const isRTL = locale === "ar"

  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState("")

  const [patientId, setPatientId] = useState("")
  const [lookupStatus, setLookupStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [lookupMessage, setLookupMessage] = useState("")
  const [dataFromExcel, setDataFromExcel] = useState(false)

  const [showClinical, setShowClinical] = useState(false)
  const [clinical, setClinical] = useState<ClinicalData>(DEFAULT_CLINICAL)

  // ── Image handling ──────────────────────────────────────
  const addFiles = useCallback((incoming: File[]) => {
    const images = incoming.filter((f) => f.type.startsWith("image/"))
    if (!images.length) return
    setFiles((prev) => [...prev, ...images].slice(0, 15))
    images.forEach((f) => {
      const reader = new FileReader()
      reader.onload = (e) =>
        setPreviews((prev) => [...prev, e.target?.result as string].slice(0, 15))
      reader.readAsDataURL(f)
    })
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      addFiles(Array.from(e.dataTransfer.files))
    },
    [addFiles]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) addFiles(Array.from(e.target.files))
    },
    [addFiles]
  )

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }, [])

  // ── Patient lookup ──────────────────────────────────────
  const handleLookup = useCallback(async () => {
    const pid = patientId.trim()
    if (!pid) return
    setLookupStatus("loading")
    setLookupMessage("")
    try {
      const res = await fetch(`${FLASK_URL}/get_patient?id=${encodeURIComponent(pid)}`)
      const data = await res.json()
      if (data.error) {
        setLookupStatus("error")
        setLookupMessage(data.error)
        return
      }
      setClinical({
        er:          data.er          ?? 1,
        pr:          data.pr          ?? 1,
        her2:        data.her2        ?? 0,
        mol_subtype: data.mol_subtype ?? 0,
        t_stage:     data.t_stage     ?? 1,
        n_stage:     data.n_stage     ?? 0,
        grade:       data.grade       ?? 2,
        menopause:   data.menopause   ?? 1,
        meta:        data.metastatic  ?? 0,
      })
      setDataFromExcel(true)
      setLookupStatus("success")
      setLookupMessage(pid)
      setShowClinical(true)
    } catch {
      setLookupStatus("error")
      setLookupMessage(t("scan.lookupError"))
    }
  }, [patientId, t])

  // ── Analysis ────────────────────────────────────────────
  const handleAnalyze = useCallback(async () => {
    if (!files.length) {
      setError(t("scan.noImages"))
      return
    }
    setError("")
    setIsAnalyzing(true)

    try {
      const fd = new FormData()
      files.forEach((f) => fd.append("images", f))
      const pid = patientId.trim()
      if (pid) fd.append("patient_id", pid)
      fd.append("clinical", JSON.stringify(clinical))

      const res = await fetch(`${FLASK_URL}/predict`, { method: "POST", body: fd })
      const data = await res.json()

      if (data.error) {
        setError(data.error)
        return
      }

      const prob = data.probability as number
      const prediction = data.prediction as number
      const riskLevel: RiskLevel =
        prediction === 1 ? (prob >= 0.85 ? "high" : "medium") : "low"
      const scoreStr   = (prob * 100).toFixed(1)
      const confidence = data.confidence  || ""
      const dataSource = data.data_source || ""
      const imagesUsed = String(data.images_used ?? files.length)
      const threshold  = String(data.threshold   ?? 0.770)

      // ── Save to localStorage (always, no login required) ──
      const saved = saveScanLocally({
        date:        new Date().toISOString(),
        risk:        riskLevel,
        score:       scoreStr,
        imageData:   previews[0] || "",
        fileName:    files[0]?.name || "",
        userId:      user?.email || "",
        confidence,
        dataSource,
        imagesUsed,
        threshold,
        patientId:   patientId.trim() || "",
      })

      // ── Save to Supabase (best-effort, when logged in) ──
      if (user?.email) {
        saveScanToSupabase(saved, user.email)
      }

      const params = new URLSearchParams({
        risk:        riskLevel,
        score:       scoreStr,
        date:        saved.date,
        confidence,
        dataSource,
        imagesUsed,
        threshold,
        prediction:  String(prediction),
      })
      router.push(`/results?${params.toString()}`)
    } catch {
      setError(t("scan.apiError"))
    } finally {
      setIsAnalyzing(false)
    }
  }, [files, patientId, clinical, previews, user, router, t])

  // ── Field helper ────────────────────────────────────────
  const fieldClass = `w-full bg-background border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors ${
    dataFromExcel ? "border-emerald-400" : "border-border"
  }`

  const setField = <K extends keyof ClinicalData>(key: K) =>
    (e: React.ChangeEvent<HTMLSelectElement>) =>
      setClinical((v) => ({ ...v, [key]: +e.target.value }))

  return (
    <section className="min-h-screen py-16 bg-background">
      <div className="max-w-5xl mx-auto px-6 space-y-6">

        {/* ── Header ─────────────────────────────────────── */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 bg-secondary text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <ScanLine className="w-4 h-4" />
            <span>{t("scan.badge")}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            {t("scan.title")}
          </h1>
          <p className="mt-4 text-foreground/60 max-w-xl mx-auto leading-relaxed">
            {t("scan.desc")}
          </p>
        </div>

        {/* ── Patient ID Lookup ──────────────────────────── */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-semibold text-foreground">{t("scan.patientLookup")}</h2>
          </div>

          <div className={`flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
            <input
              type="text"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              placeholder={t("scan.patientIdPlaceholder")}
              className={`flex-1 bg-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary ${isRTL ? "text-right" : ""}`}
            />
            <button
              type="button"
              onClick={handleLookup}
              disabled={lookupStatus === "loading" || !patientId.trim()}
              className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 shrink-0"
            >
              <Search className="w-4 h-4" />
              {lookupStatus === "loading" ? t("scan.searching") : t("scan.loadData")}
            </button>
          </div>

          {lookupMessage && (
            <p className={`mt-2 text-sm font-medium ${
              lookupStatus === "success" ? "text-emerald-600" : "text-red-600"
            }`}>
              {lookupStatus === "success"
                ? `✓ ${lookupMessage} — ${t("scan.autoFilled")}`
                : `✗ ${lookupMessage}`}
            </p>
          )}
          <p className="mt-2 text-xs text-foreground/40">{t("scan.lookupHint")}</p>
        </div>

        {/* ── MRI Images Upload ──────────────────────────── */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-primary" />
              </div>
              <h2 className="font-semibold text-foreground">{t("scan.mriImages")}</h2>
            </div>

            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }}
              className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer ${
                isDragging
                  ? "border-primary bg-secondary"
                  : "border-border hover:border-primary/40 hover:bg-secondary/50"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label={t("scan.upload")}
              />
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                  <Upload className="w-7 h-7 text-primary" />
                </div>
                <p className="text-foreground font-semibold">{t("scan.dragDrop")}</p>
                <p className="text-foreground/50 text-sm">{t("scan.formats")}</p>
                <p className="text-foreground/40 text-xs">{t("scan.slicesHint")}</p>
              </div>
            </div>

            {previews.length > 0 && (
              <div className="mt-5">
                <p className="text-sm font-semibold text-primary mb-3">
                  {previews.length} {t("scan.imagesSelected")}
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {previews.map((src, i) => (
                    <div
                      key={i}
                      className="relative aspect-square rounded-xl overflow-hidden border border-border bg-muted"
                    >
                      <Image
                        src={src}
                        alt={`slice-${i + 1}`}
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-foreground/80 text-background flex items-center justify-center hover:bg-foreground transition-colors"
                        aria-label={t("scan.remove")}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Clinical Data (collapsible) ────────────────── */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <button
            type="button"
            onClick={() => setShowClinical((v) => !v)}
            className="w-full p-6 flex items-center justify-between hover:bg-muted/30 transition-colors"
          >
            <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <ScanLine className="w-5 h-5 text-primary" />
              </div>
              <div className={isRTL ? "text-right" : "text-left"}>
                <p className="font-semibold text-foreground">{t("scan.clinicalData")}</p>
                {dataFromExcel && (
                  <p className="text-xs text-emerald-600 mt-0.5">{t("scan.autoFilled")}</p>
                )}
              </div>
            </div>
            {showClinical
              ? <ChevronUp className="w-5 h-5 text-foreground/60 shrink-0" />
              : <ChevronDown className="w-5 h-5 text-foreground/60 shrink-0" />}
          </button>

          {showClinical && (
            <div className="px-6 pb-6 border-t border-border pt-5">
              {!dataFromExcel && (
                <div className="mb-5 p-3 bg-primary/5 border border-primary/20 rounded-xl text-sm text-primary/80">
                  {t("scan.manualClinicalHint")}
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* ER */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">
                    {t("scan.er")}
                  </label>
                  <select value={clinical.er} onChange={setField("er")} className={fieldClass}>
                    <option value={1}>{t("scan.positive")}</option>
                    <option value={0}>{t("scan.negative")}</option>
                  </select>
                </div>

                {/* PR */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">
                    {t("scan.pr")}
                  </label>
                  <select value={clinical.pr} onChange={setField("pr")} className={fieldClass}>
                    <option value={1}>{t("scan.positive")}</option>
                    <option value={0}>{t("scan.negative")}</option>
                  </select>
                </div>

                {/* HER2 */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">
                    {t("scan.her2")}
                  </label>
                  <select value={clinical.her2} onChange={setField("her2")} className={fieldClass}>
                    <option value={0}>{t("scan.negative")}</option>
                    <option value={1}>{t("scan.positive")}</option>
                    <option value={2}>{t("scan.borderline")}</option>
                  </select>
                </div>

                {/* Molecular Subtype */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">
                    {t("scan.molSubtype")}
                  </label>
                  <select value={clinical.mol_subtype} onChange={setField("mol_subtype")} className={fieldClass}>
                    <option value={0}>Luminal-like</option>
                    <option value={1}>ER/PR+ HER2+</option>
                    <option value={2}>HER2</option>
                    <option value={3}>Triple Negative</option>
                  </select>
                </div>

                {/* T Stage */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">
                    {t("scan.tStage")}
                  </label>
                  <select value={clinical.t_stage} onChange={setField("t_stage")} className={fieldClass}>
                    <option value={1}>T1</option>
                    <option value={2}>T2</option>
                    <option value={3}>T3</option>
                    <option value={4}>T4</option>
                  </select>
                </div>

                {/* N Stage */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">
                    {t("scan.nStage")}
                  </label>
                  <select value={clinical.n_stage} onChange={setField("n_stage")} className={fieldClass}>
                    <option value={0}>N0</option>
                    <option value={1}>N1</option>
                    <option value={2}>N2</option>
                    <option value={3}>N3</option>
                  </select>
                </div>

                {/* Grade */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">
                    {t("scan.grade")}
                  </label>
                  <select value={clinical.grade} onChange={setField("grade")} className={fieldClass}>
                    <option value={1}>Grade 1</option>
                    <option value={2}>Grade 2</option>
                    <option value={3}>Grade 3</option>
                  </select>
                </div>

                {/* Menopause */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">
                    {t("scan.menopause")}
                  </label>
                  <select value={clinical.menopause} onChange={setField("menopause")} className={fieldClass}>
                    <option value={0}>{t("scan.preMenopause")}</option>
                    <option value={1}>{t("scan.postMenopause")}</option>
                    <option value={2}>{t("scan.naMenopause")}</option>
                  </select>
                </div>

                {/* Metastatic */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">
                    {t("scan.metastatic")}
                  </label>
                  <select value={clinical.meta} onChange={setField("meta")} className={fieldClass}>
                    <option value={0}>{t("scan.no")}</option>
                    <option value={1}>{t("scan.yes")}</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Error ──────────────────────────────────────── */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* ── Analyze Button ─────────────────────────────── */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className={`flex flex-col sm:flex-row items-center gap-4 ${isRTL ? "sm:flex-row-reverse" : ""}`}>
            <div className="flex items-start gap-3 flex-1">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <p className="text-foreground/60 text-xs leading-relaxed">
                {t("scan.disclaimer")}
              </p>
            </div>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing || files.length === 0}
              className="w-full sm:w-auto bg-primary text-primary-foreground px-10 py-3.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 shrink-0"
            >
              {isAnalyzing ? (
                <>
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {t("scan.analyzing")}
                </>
              ) : (
                <>
                  <ScanLine className="w-5 h-5" />
                  {t("scan.analyze")}
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </section>
  )
}
