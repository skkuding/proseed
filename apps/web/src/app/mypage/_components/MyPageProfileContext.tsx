'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

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
}

const MyPageProfileContext = createContext<MyPageProfileContextValue | undefined>(undefined)

export function MyPageProfileProvider({ children }: { children: ReactNode }) {
  const [currentJob, setCurrentJob] = useState('')
  const [provider, setProvider] = useState('')
  const [user, setUser] = useState<MyPageUser>({ name: '', email: '', image: '' })

  return (
    <MyPageProfileContext.Provider
      value={{ currentJob, setCurrentJob, provider, setProvider, user, setUser }}
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
