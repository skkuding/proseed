import HeroSection from './mainpage/_components/HeroSection'
import RecentProjectsSection from './mainpage/_components/RecentProjectsSection'
import FeedbackSection from './mainpage/_components/FeedbackSection'
import GrowthRecordSection from './mainpage/_components/GrowthRecordSection'

export default function HomePage() {
  return (
    <main className="w-full bg-[#F5F5F5]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-12 px-6 py-8">
        <HeroSection />
        <RecentProjectsSection />
        <FeedbackSection />
        <GrowthRecordSection />
      </div>
    </main>
  )
}
