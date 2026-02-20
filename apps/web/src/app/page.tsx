import { HealthCheck } from '@/components/health-check'
import { StorageCheck } from '@/components/storage-check'

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Proseed</h1>
      <div className="flex gap-4 flex-wrap">
        <p className="head0_sb_52">Hello</p>
        <HealthCheck />
        <StorageCheck />
      </div>
    </main>
  )
}
