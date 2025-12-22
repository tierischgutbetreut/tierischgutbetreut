'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ContactRequest } from '@/lib/types'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    new: 0,
    contacted: 0,
    converted: 0,
    total: 0,
  })
  const [recentLeads, setRecentLeads] = useState<ContactRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        // Lade alle Leads für Statistiken
        const allResponse = await fetch('/api/admin/leads', {
          credentials: 'include',
        })
        const allData = await allResponse.json()

        if (allData.leads) {
          const allLeads = allData.leads as ContactRequest[]
          
          // Berechne Statistiken
          const newCount = allLeads.filter(l => l.status === 'new').length
          const contactedCount = allLeads.filter(l => l.status === 'contacted').length

          setStats({
            new: newCount,
            contacted: contactedCount,
            converted: 0, // Nicht mehr relevant, da Leads gelöscht werden
            total: allLeads.length,
          })
        }

        // Lade nur neue Leads für die Liste
        const newResponse = await fetch('/api/admin/leads?status=new', {
          credentials: 'include',
        })
        const newData = await newResponse.json()

        if (newData.leads) {
          const newLeads = newData.leads as ContactRequest[]
          // Zeige alle neuen Leads (oder die neuesten 10)
          setRecentLeads(newLeads.slice(0, 10))
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-sage-900">Dashboard</h1>
        <p className="mt-2 text-sage-600">Übersicht über Ihre Leads und Kunden</p>
      </div>

      {/* Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-sage-600">Neue Anfragen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-sage-900">{stats.new}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-sage-600">Kontaktiert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-sage-900">{stats.contacted}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-sage-600">Konvertiert</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-sage-900">{stats.converted}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-sage-600">Gesamt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-sage-900">{stats.total}</div>
          </CardContent>
        </Card>
      </div>

      {/* Neue Anfragen */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Neue Anfragen</CardTitle>
              <CardDescription>Alle Anfragen mit Status "Neu"</CardDescription>
            </div>
            <Link href="/admin/leads">
              <Button variant="outline" className="border-sage-300 text-sage-700 hover:bg-sage-50">
                Alle anzeigen
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentLeads.length === 0 ? (
            <p className="text-sage-600 text-center py-8">Keine Anfragen vorhanden</p>
          ) : (
            <div className="space-y-4">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex justify-between items-start p-4 border border-sage-200 rounded-lg hover:bg-sage-50"
                >
                  <div>
                    <h3 className="font-semibold text-sage-900">
                      {lead.name} {lead.vorname}
                    </h3>
                    <p className="text-sm text-sage-600">{lead.email}</p>
                    <p className="text-sm text-sage-600">{lead.phone}</p>
                    <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                      lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                      lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                      lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {lead.status === 'new' ? 'Neu' :
                       lead.status === 'contacted' ? 'Kontaktiert' :
                       lead.status === 'converted' ? 'Konvertiert' :
                       'Abgelehnt'}
                    </span>
                  </div>
                  <Link href={`/admin/leads/${lead.id}`}>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


