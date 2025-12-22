'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { Customer, Pet, Document } from '@/lib/types'
import { PropertyEditor } from '@/components/admin/property-editor'
import { useToast } from '@/hooks/use-toast'

interface Note {
  id: string
  note: string
  created_at: string
  created_by?: {
    email: string
    role: string
  }
}

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params.id as string
  const { toast } = useToast()

  const [customer, setCustomer] = useState<(Customer & { pets?: Pet[], documents?: Document[] }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')

  useEffect(() => {
    if (customerId) {
      loadCustomer()
      loadNotes()
    }
  }, [customerId])

  async function loadCustomer() {
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`, {
        credentials: 'include',
      })
      const data = await response.json()

      if (data.customer) {
        setCustomer(data.customer)
      } else {
        router.push('/admin/customers')
      }
    } catch (error) {
      console.error('Error loading customer:', error)
    } finally {
      setLoading(false)
    }
  }

  async function loadNotes() {
    try {
      const response = await fetch(`/api/admin/customers/${customerId}/notes`, {
        credentials: 'include',
      })
      const data = await response.json()

      if (data.notes) {
        setNotes(data.notes)
      }
    } catch (error) {
      console.error('Error loading notes:', error)
    }
  }

  async function addNote() {
    if (!newNote.trim()) return

    try {
      const response = await fetch(`/api/admin/customers/${customerId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: newNote }),
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setNotes([data.note, ...notes])
        setNewNote('')
        toast({
          title: 'Erfolg',
          description: 'Notiz hinzugefügt',
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Fehler',
          description: error.error || 'Fehler beim Hinzufügen der Notiz',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error adding note:', error)
      toast({
        title: 'Fehler',
        description: 'Fehler beim Hinzufügen der Notiz',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600"></div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-sage-600">Kunde nicht gefunden</p>
        <Link href="/admin/customers">
          <Button variant="outline" className="mt-4">
            Zurück zur Übersicht
          </Button>
        </Link>
      </div>
    )
  }

  function getDocumentTypeLabel(type: string) {
    switch (type) {
      case 'vertrag':
        return 'Vertrag'
      case 'impfpass':
        return 'Impfpass'
      case 'wurmtest':
        return 'Wurmtest'
      default:
        return type
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/customers">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-sage-900">
            {customer.vorname} {customer.nachname}
          </h1>
          <p className="mt-2 text-sage-600">Kundendetails</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Persönliche Daten */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Persönliche Daten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-sage-500">Kundennummer</p>
                <p className="font-medium">{customer.kundennummer || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-sage-500">E-Mail</p>
                <p className="font-medium">{customer.email}</p>
              </div>
              <div>
                <p className="text-sm text-sage-500">Telefon</p>
                <p className="font-medium">{customer.telefonnummer || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-sage-500">2. Telefon</p>
                <p className="font-medium">{customer.telefon_2 || '-'}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Notfallkontakt</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-sage-500">Name</p>
                  <p className="font-medium">{customer.notfall_kontakt_name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-sage-500">Nummer</p>
                  <p className="font-medium">{customer.notfallnummer || '-'}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Tier-Informationen</h3>
              {customer.futtermenge && (
                <div className="mb-2">
                  <p className="text-sm text-sage-500">Futtermenge</p>
                  <p className="font-medium">{customer.futtermenge}</p>
                </div>
              )}
              {customer.medikamente && (
                <div className="mb-2">
                  <p className="text-sm text-sage-500">Medikamente</p>
                  <p className="font-medium">{customer.medikamente}</p>
                </div>
              )}
              {customer.besonderheiten && (
                <div>
                  <p className="text-sm text-sage-500">Besonderheiten</p>
                  <p className="font-medium">{customer.besonderheiten}</p>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Intervalle</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-sage-500">Intervall Impfung</p>
                  <p className="font-medium">{customer.intervall_impfung || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-sage-500">Intervall Entwurmung</p>
                  <p className="font-medium">{customer.intervall_entwurmung || '-'}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-sage-500">Onboarding Status</p>
                  <Badge
                    variant={customer.onboarding_completed ? 'default' : 'secondary'}
                    className="mt-1"
                  >
                    {customer.onboarding_completed ? 'Vollständig' : 'In Bearbeitung'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-sage-500">Datenschutz</p>
                  <Badge
                    variant={customer.datenschutz ? 'default' : 'outline'}
                    className="mt-1"
                  >
                    {customer.datenschutz ? 'Zugestimmt' : 'Nicht zugestimmt'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 text-xs text-sage-500">
              <p>Erstellt: {new Date(customer.created_at).toLocaleString('de-DE')}</p>
              <p>Aktualisiert: {new Date(customer.updated_at).toLocaleString('de-DE')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Notizen & Tiere & Dokumente */}
        <div className="space-y-6">
          {/* Notizen */}
          <Card>
            <CardHeader>
              <CardTitle>Notizen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {notes.map((note) => (
                  <div key={note.id} className="p-3 bg-sage-50 rounded text-sm">
                    <p className="whitespace-pre-wrap">{note.note}</p>
                    <p className="text-xs text-sage-600 mt-1">
                      {new Date(note.created_at).toLocaleString('de-DE')}
                      {note.created_by && ` • ${note.created_by.email}`}
                    </p>
                  </div>
                ))}
                {notes.length === 0 && (
                  <p className="text-sage-600 text-center py-4 text-sm">Keine Notizen vorhanden</p>
                )}
              </div>
              <div className="space-y-2">
                <Textarea
                  placeholder="Neue Notiz hinzufügen..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
                <Button onClick={addNote} size="sm" className="w-full">
                  Notiz hinzufügen
                </Button>
              </div>
            </CardContent>
          </Card>
          {/* Tiere */}
          <Card>
            <CardHeader>
              <CardTitle>Tiere ({customer.pets?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {customer.pets && customer.pets.length > 0 ? (
                <div className="space-y-4">
                  {customer.pets.map((pet) => (
                    <div key={pet.id} className="p-4 border border-sage-200 rounded-lg">
                      <h3 className="font-semibold text-lg mb-2">{pet.name}</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {pet.tierart && (
                          <div>
                            <span className="text-sage-500">Tierart:</span> {pet.tierart}
                          </div>
                        )}
                        {pet.geschlecht && (
                          <div>
                            <span className="text-sage-500">Geschlecht:</span> {pet.geschlecht}
                          </div>
                        )}
                        {pet.letzte_impfung && (
                          <div>
                            <span className="text-sage-500">Letzte Impfung:</span>{' '}
                            {new Date(pet.letzte_impfung).toLocaleDateString('de-DE')}
                          </div>
                        )}
                        {pet.letzte_impfung_zusatz && (
                          <div>
                            <span className="text-sage-500">Letzte Impfung (Zusatz):</span>{' '}
                            {new Date(pet.letzte_impfung_zusatz).toLocaleDateString('de-DE')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sage-600 text-center py-4">Keine Tiere registriert</p>
              )}
            </CardContent>
          </Card>

          {/* Dokumente */}
          <Card>
            <CardHeader>
              <CardTitle>Dokumente ({customer.documents?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {customer.documents && customer.documents.length > 0 ? (
                <div className="space-y-2">
                  {customer.documents.map((doc) => (
                    <div key={doc.id} className="p-3 border border-sage-200 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-medium">{doc.file_name}</p>
                        <p className="text-sm text-sage-600">
                          {getDocumentTypeLabel(doc.document_type)}
                        </p>
                        <p className="text-xs text-sage-500">
                          {new Date(doc.uploaded_at).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sage-600 text-center py-4">Keine Dokumente hochgeladen</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Eigenschaften */}
      <div className="mt-6">
        <PropertyEditor entityType="customer" entityId={customerId} />
      </div>
    </div>
  )
}

