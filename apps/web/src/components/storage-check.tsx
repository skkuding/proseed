'use client'

import { useState } from 'react'

type StorageStatus = {
  bucket: string
  status: string
  objectCount: number
  responseTime?: number
} | null

export function StorageCheck() {
  const [status, setStatus] = useState<StorageStatus>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkStorage = async () => {
    setLoading(true)
    setError(null)
    setStatus(null)

    const startTime = Date.now()

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
      const response = await fetch(`${apiUrl}/storage/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const responseTime = Date.now() - startTime

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      setStatus({ ...data, responseTime })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded-lg max-w-md">
      <h2 className="text-lg font-semibold mb-4">S3 Storage Check</h2>

      <button
        onClick={checkStorage}
        disabled={loading}
        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
      >
        {loading ? 'Checking...' : 'Check S3 Storage'}
      </button>

      {status && (
        <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded">
          <p className="text-green-800">
            Status: <strong>{status.status}</strong>
          </p>
          <p className="text-green-700 text-sm">Bucket: {status.bucket}</p>
          <p className="text-green-700 text-sm">Objects: {status.objectCount}</p>
          {status.responseTime !== undefined && (
            <p className="text-green-700 text-sm">Response time: {status.responseTime}ms</p>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded">
          <p className="text-red-800">
            Error: <strong>{error}</strong>
          </p>
        </div>
      )}
    </div>
  )
}
