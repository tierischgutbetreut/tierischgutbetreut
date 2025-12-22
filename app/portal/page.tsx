'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { Customer, Pet, Document } from '@/lib/types'

export default function PortalPage() {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [pets, setPets] = useState<Pet[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [profileRes, petsRes, docsRes] = await Promise.all([
        fetch('/api/portal/profile'),
        fetch('/api/portal/pets'),
        fetch('/api/portal/documents'),
      ])

      const [profileData, petsData, docsData] = await Promise.all([
        profileRes.json(),
        petsRes.json(),
        docsRes.json(),
      ])

      setCustomer(profileData.customer)
      setPets(petsData.pets || [])
      setDocuments(docsData.documents || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600"></div>
      </div>
    )
  }

  const isProfileComplete = customer && customer.nachname && customer.vorname && customer.datenschutz

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-sage-900">
          Willkommen{customer?.vorname ? `, ${customer.vorname}` : ''}!
        </h1>
        <p className="mt-2 text-sage-600">Ihr persönliches Kundenportal</p>
      </div>

      {/* Onboarding-Hinweis */}
      {!isProfileComplete && (
        <Card className="border-amber-300 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-800">Profil vervollständigen</CardTitle>
            <CardDescription className="text-amber-700">
              Bitte vervollständigen Sie Ihr Profil, um alle Funktionen nutzen zu können.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/portal/profile">
              <Button className="bg-amber-600 hover:bg-amber-700">
                Profil vervollständigen
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Übersicht */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mein Profil</CardTitle>
          </CardHeader>
          <CardContent>
            {customer ? (
              <div className="space-y-2 text-sm text-sage-600">
                <p>{customer.vorname} {customer.nachname}</p>
                <p>{customer.email}</p>
                {customer.telefonnummer && <p>{customer.telefonnummer}</p>}
              </div>
            ) : (
              <p className="text-sm text-sage-600">Nicht ausgefüllt</p>
            )}
            <Link href="/portal/profile" className="block mt-4">
              <Button variant="outline" size="sm">Bearbeiten</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Meine Tiere</CardTitle>
          </CardHeader>
          <CardContent>
            {pets.length > 0 ? (
              <ul className="space-y-1 text-sm text-sage-600">
                {pets.slice(0, 3).map((pet) => (
                  <li key={pet.id}>{pet.name} ({pet.tierart || 'unbekannt'})</li>
                ))}
                {pets.length > 3 && <li>+ {pets.length - 3} weitere</li>}
              </ul>
            ) : (
              <p className="text-sm text-sage-600">Keine Tiere hinzugefügt</p>
            )}
            <Link href="/portal/pets" className="block mt-4">
              <Button variant="outline" size="sm">
                {pets.length > 0 ? 'Verwalten' : 'Tier hinzufügen'}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dokumente</CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length > 0 ? (
              <div className="text-sm text-sage-600">
                <p>{documents.filter(d => d.document_type === 'vertrag').length} Vertrag/Verträge</p>
                <p>{documents.filter(d => d.document_type === 'impfpass').length} Impfpass/Impfpässe</p>
                <p>{documents.filter(d => d.document_type === 'wurmtest').length} Wurmtest(s)</p>
              </div>
            ) : (
              <p className="text-sm text-sage-600">Keine Dokumente hochgeladen</p>
            )}
            <Link href="/portal/documents" className="block mt-4">
              <Button variant="outline" size="sm">
                {documents.length > 0 ? 'Verwalten' : 'Dokument hochladen'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Checkliste */}
      <Card>
        <CardHeader>
          <CardTitle>Ihre Checkliste</CardTitle>
          <CardDescription>Diese Schritte sollten Sie abschließen</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm ${isProfileComplete ? 'bg-green-500' : 'bg-sage-300'}`}>
                {isProfileComplete ? '✓' : '1'}
              </span>
              <span className={isProfileComplete ? 'text-sage-600 line-through' : 'text-sage-900'}>
                Profil vervollständigen
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm ${pets.length > 0 ? 'bg-green-500' : 'bg-sage-300'}`}>
                {pets.length > 0 ? '✓' : '2'}
              </span>
              <span className={pets.length > 0 ? 'text-sage-600 line-through' : 'text-sage-900'}>
                Tiere hinzufügen
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm ${documents.some(d => d.document_type === 'impfpass') ? 'bg-green-500' : 'bg-sage-300'}`}>
                {documents.some(d => d.document_type === 'impfpass') ? '✓' : '3'}
              </span>
              <span className={documents.some(d => d.document_type === 'impfpass') ? 'text-sage-600 line-through' : 'text-sage-900'}>
                Impfpass hochladen
              </span>
            </li>
            <li className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-sm ${documents.some(d => d.document_type === 'vertrag') ? 'bg-green-500' : 'bg-sage-300'}`}>
                {documents.some(d => d.document_type === 'vertrag') ? '✓' : '4'}
              </span>
              <span className={documents.some(d => d.document_type === 'vertrag') ? 'text-sage-600 line-through' : 'text-sage-900'}>
                Vertrag hochladen
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

