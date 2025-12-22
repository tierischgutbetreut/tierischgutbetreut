'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import type { User } from '@/lib/types'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'customer'
  redirectTo?: string
}

export function AuthGuard({ children, requiredRole, redirectTo = '/login' }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser = await getCurrentUser()
        
        if (!currentUser) {
          router.push(redirectTo)
          return
        }

        if (requiredRole && currentUser.role !== requiredRole) {
          // Redirect basierend auf Rolle
          if (currentUser.role === 'admin') {
            router.push('/admin/dashboard')
          } else {
            router.push('/portal')
          }
          return
        }

        setUser(currentUser)
      } catch (error) {
        console.error('Auth check error:', error)
        router.push(redirectTo)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [requiredRole, redirectTo, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}


