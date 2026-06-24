'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function NewsletterUnsubscribePage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Der Abmelde-Link ist ungültig.')
      return
    }

    fetch(`/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || 'Abmeldung fehlgeschlagen')
        }
        setStatus('success')
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err instanceof Error ? err.message : 'Abmeldung fehlgeschlagen')
      })
  }, [token])

  return (
    <div className="min-h-screen bg-sage-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-sage-900">Newsletter abbestellen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && <p className="text-sage-600">Abmeldung wird verarbeitet …</p>}
          {status === 'success' && (
            <p className="text-sage-700">
              Du wurdest erfolgreich vom Newsletter abgemeldet. Du erhältst keine weiteren Newsletter von tierisch gut betreut.
            </p>
          )}
          {status === 'error' && <p className="text-red-700">{message}</p>}
          <Button asChild variant="outline">
            <Link href="/">Zur Startseite</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
