'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { MyProfile } from '@/lib/api'

type MyPageUser = {
  name: string
  email: string
  image: string
}

type MyPageProfileContextValue = {
  currentJob: string
  setCurrentJob: (job: string) => void
  provider: string
  setProvider: (provider: string) => void
  user: MyPageUser
  setUser: (user: MyPageUser) => void
  profile: MyProfile | null
  setProfile: (profile: MyProfile) => void
}

const MyPageProfileContext = createContext<MyPageProfileContextValue | undefined>(undefined)

export function MyPageProfileProvider({ children }: { children: ReactNode }) {
  const [currentJob, setCurrentJob] = useState('')
  const [provider, setProvider] = useState('')
  const [user, setUser] = useState<MyPageUser>({ name: '', email: '', image: '' })
  const [profile, setProfile] = useState<MyProfile | null>(null)

  return (
    <MyPageProfileContext.Provider
      value={{
        currentJob,
        setCurrentJob,
        provider,
        setProvider,
        user,
        setUser,
        profile,
        setProfile,
      }}
    >
      {children}
    </MyPageProfileContext.Provider>
  )
}

export function useMyPageProfile() {
  const context = useContext(MyPageProfileContext)
  if (!context) {
    throw new Error('useMyPageProfile must be used within MyPageProfileProvider')
  }
  return context
}
