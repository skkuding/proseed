import HeroSection from './mainpage/_components/HeroSection'
import RecentProjectsSection from './mainpage/_components/RecentProjectsSection'
import FeedbackSection from './mainpage/_components/FeedbackSection'
import GrowthRecordSection from './mainpage/_components/GrowthRecordSection'

export default function HomePage() {
  return (
    <main className="w-full bg-[##F4F4F6]">
      <div className="mx-auto flex w-full max-w-[1200px] px-1 flex-col">
        <HeroSection />

        <div className="mb-30 mt-11 flex flex-col gap-30">
          <RecentProjectsSection />
          <FeedbackSection />
          <GrowthRecordSection />
        </div>
      </div>
    </main>
  )
}
