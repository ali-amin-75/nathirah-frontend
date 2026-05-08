import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ScannerUpload from "@/components/scanner-upload"

export default function ScannerPage() {
  return (
    <main>
      <Navbar />
      <div className="pt-20">
        <ScannerUpload />
      </div>
      <Footer />
    </main>
  )
}
