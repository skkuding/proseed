import { HealthCheck } from '@/components/health-check'

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Proseed</h1>
      <HealthCheck />
    </main>
  )
}
