import {
	Navigation,
	HeroSection,
	StatsSection,
	FeaturesSection,
	WorkflowSection,
	ComplianceSection,
	CtaSection,
	Footer
} from '@/src/modules/landing'

export default function Home() {
  return (
		<div className="min-h-screen bg-white">
			<Navigation />
			<main>
				<HeroSection />
				<StatsSection />
				<FeaturesSection />
				<WorkflowSection />
				<ComplianceSection />
				<CtaSection />
      </main>
			<Footer />
    </div>
	)
}
