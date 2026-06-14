import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/sections/HeroSection'
import StatsBar from '@/components/sections/StatsBar'
import HowItWorks from '@/components/sections/HowItWorks'
import MechanicsSection from '@/components/sections/MechanicsSection'
import ForBusinesses from '@/components/sections/ForBusinesses'
import AppPreview from '@/components/sections/AppPreview'
import RiskFreeSection from '@/components/sections/RiskFreeSection'
import CTASection from '@/components/sections/CTASection'

export default function Home() {
  return (
    <>
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
    </>
  )
}
