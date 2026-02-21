import { HealthCheck } from '@/components/health-check'
import { StorageCheck } from '@/components/storage-check'
import { Header } from '@/app/main/_components/Header'

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <Header />
      <main className="min-h-screen p-8 pt-20">
        <div className="flex gap-4 flex-wrap">
          <p className="text-head0_sb_52">head0_sb_52</p>
          <p className="text-caption4_r_12">caption4_r_12</p>
          <HealthCheck />
          <StorageCheck />
        </div>
      </main>
    </div>
  )
}

// import { Header } from './main/_components/Header'

// export default function Page() {
//   return (
//     <div className = "min-h-screen">
//       <Header />
//       <main></main>
//     </div>
//   )
// }
