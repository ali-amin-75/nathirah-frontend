import { Suspense } from "react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ResultsContent from "@/components/results-content"

export default function ResultsPage() {
  return (
    <main>
      <Navbar />
      <div className="pt-20">
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          }
        >
          <ResultsContent />
        </Suspense>
      </div>
      <Footer />
    </main>
  )
}
