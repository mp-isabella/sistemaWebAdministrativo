'use client'
import { SessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'


interface ClientProviderProps {
  children: React.ReactNode
  session?: Session | null
}

export default function ClientProvider({ children, session }: ClientProviderProps) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  )
}
