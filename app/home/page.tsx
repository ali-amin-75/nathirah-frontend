import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import Features from "@/components/features"
import HowItWorks from "@/components/how-it-works"
import CTASection from "@/components/cta-section"
import Footer from "@/components/footer"

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <CTASection />
      <Footer />
    </main>
  )
}
