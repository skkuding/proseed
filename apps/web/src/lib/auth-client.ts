import { createAuthClient } from 'better-auth/react'

// NEXT_PUBLIC_API_URL includes /api (e.g. http://localhost:4000/api)
// better-auth client appends /api/auth itself, so strip the /api suffix
const baseURL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/api$/, '')

export const authClient = createAuthClient({ baseURL })
