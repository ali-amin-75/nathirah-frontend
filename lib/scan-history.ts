"use client"

import supabase from "@/lib/supabaseClient"

export type RiskLevel = "low" | "medium" | "high"

export interface ScanRecord {
  id: string
  date: string
  risk: RiskLevel
  score: string
  imageData: string
  fileName?: string
  userId?: string
  confidence?: string
  dataSource?: string
  imagesUsed?: string
  threshold?: string
  patientId?: string
}

const LOCAL_HISTORY_KEY = "nathirah-scan-history"
const MAX_LOCAL_RECORDS  = 50

// ── localStorage helpers ─────────────────────────────────────────────────────

function getLocalScans(): ScanRecord[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(LOCAL_HISTORY_KEY)
    return raw ? (JSON.parse(raw) as ScanRecord[]) : []
  } catch {
    return []
  }
}

export function saveScanLocally(record: Omit<ScanRecord, "id">): ScanRecord {
  const full: ScanRecord = { ...record, id: Date.now().toString() }
  const existing = getLocalScans()
  localStorage.setItem(
    LOCAL_HISTORY_KEY,
    JSON.stringify([full, ...existing].slice(0, MAX_LOCAL_RECORDS))
  )
  return full
}

export function deleteLocalScan(id: string): void {
  const updated = getLocalScans().filter((s) => s.id !== id)
  localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(updated))
}

export function getLocalScanHistory(): ScanRecord[] {
  return getLocalScans()
}

// ── Supabase helpers ─────────────────────────────────────────────────────────

export async function getScanHistory(userEmail: string): Promise<ScanRecord[]> {
  // Local records always (works without login)
  const local = getLocalScans()

  // Merge Supabase records if logged in
  if (userEmail) {
    try {
      const { data, error } = await supabase
        .from("medical_records")
        .select("*")
        .eq("user_id", userEmail)
        .order("created_at", { ascending: false })

      if (!error && data?.length) {
        const remote: ScanRecord[] = data.map((item: any) => ({
          id:          `remote-${item.id}`,
          date:        item.created_at ?? new Date().toISOString(),
          risk:        item.diagnosis   as RiskLevel,
          score:       item.test_results,
          imageData:   item.image_url ?? "",
          userId:      item.user_id,
          confidence:  item.confidence  ?? "",
          dataSource:  item.data_source ?? "",
          imagesUsed:  item.images_used ?? "",
          threshold:   item.threshold   ?? "",
          patientId:   item.patient_id  ?? "",
        }))

        // Merge: de-duplicate by score+date proximity, prefer local
        const localIds = new Set(local.map((s) => s.date.slice(0, 16)))
        const newRemote = remote.filter(
          (r) => !localIds.has(r.date.slice(0, 16))
        )
        return [...local, ...newRemote].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      }
    } catch {
      // Supabase unavailable — fall back to local only
    }
  }

  return local
}

// ── Save to Supabase (optional, best-effort) ─────────────────────────────────

export async function saveScanToSupabase(
  record: ScanRecord,
  userEmail: string
): Promise<void> {
  try {
    await supabase.from("medical_records").insert([
      {
        user_id:      userEmail,
        image_url:    "",               // base64 too large — skip
        diagnosis:    record.risk,
        test_results: record.score,
        confidence:   record.confidence  ?? null,
        data_source:  record.dataSource  ?? null,
        images_used:  record.imagesUsed  ?? null,
        threshold:    record.threshold   ?? null,
        patient_id:   record.patientId   ?? null,
      },
    ])
  } catch {
    // Supabase save is best-effort; local storage is the source of truth
  }
}

// ── Delete ───────────────────────────────────────────────────────────────────

export async function deleteScan(id: string): Promise<void> {
  // Remove from local
  deleteLocalScan(id)

  // Remove from Supabase if it's a remote record
  if (id.startsWith("remote-")) {
    const numericId = id.replace("remote-", "")
    try {
      await supabase.from("medical_records").delete().eq("id", numericId)
    } catch {
      // best-effort
    }
  }
}
