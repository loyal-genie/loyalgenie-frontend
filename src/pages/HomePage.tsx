import { Navbar } from '@/components/landing/Navbar'
import { HeroSection } from '@/components/landing/HeroSection'
import { StatsBar } from '@/components/landing/StatsBar'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { MechanicsSection } from '@/components/landing/MechanicsSection'
import { ForBusinesses } from '@/components/landing/ForBusinesses'
import { AppPreview } from '@/components/landing/AppPreview'
import { RiskFreeSection } from '@/components/landing/RiskFreeSection'
import { CTASection } from '@/components/landing/CTASection'
import { Footer } from '@/components/landing/Footer'

export function HomePage() {
  return (
    <div className="bg-bg-deep text-white min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <StatsBar />
        <HowItWorks />
        <MechanicsSection />
        <ForBusinesses />
        <AppPreview />
        <RiskFreeSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
