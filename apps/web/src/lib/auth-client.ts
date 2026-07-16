import { createAuthClient } from 'better-auth/react'
import { BASE } from './api'

// NEXT_PUBLIC_API_URL includes /api (e.g. http://localhost:4000/api)
// better-auth client appends /api/auth itself, so strip the /api suffix
export const authBaseURL = BASE.replace(/\/api$/, '')

export const authClient = createAuthClient({ baseURL: authBaseURL })
