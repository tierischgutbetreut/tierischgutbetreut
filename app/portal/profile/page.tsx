'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import type { Customer } from '@/lib/types'

export default function ProfilePage() {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    nachname: '',
    vorname: '',
    telefonnummer: '',
    telefon_2: '',
    notfall_kontakt_name: '',
    notfallnummer: '',
    futtermenge: '',
    medikamente: '',
    besonderheiten: '',
    intervall_impfung: '',
    intervall_entwurmung: '',
    datenschutz: false,
  })

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const response = await fetch('/api/portal/profile')
      const data = await response.json()
      
      if (data.customer) {
        setCustomer(data.customer)
        setFormData({
          nachname: data.customer.nachname || '',
          vorname: data.customer.vorname || '',
          telefonnummer: data.customer.telefonnummer || '',
          telefon_2: data.customer.telefon_2 || '',
          notfall_kontakt_name: data.customer.notfall_kontakt_name || '',
          notfallnummer: data.customer.notfallnummer || '',
          futtermenge: data.customer.futtermenge || '',
          medikamente: data.customer.medikamente || '',
          besonderheiten: data.customer.besonderheiten || '',
          intervall_impfung: data.customer.intervall_impfung || '',
          intervall_entwurmung: data.customer.intervall_entwurmung || '',
          datenschutz: data.customer.datenschutz || false,
        })
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const response = await fetch('/api/portal/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setCustomer(data.customer)
        toast({
          title: 'Erfolg',
          description: 'Profil erfolgreich gespeichert',
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Fehler',
          description: error.error || 'Fehler beim Speichern',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: 'Fehler',
        description: 'Fehler beim Speichern',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-sage-900">Mein Profil</h1>
        <p className="mt-2 text-sage-600">Verwalten Sie Ihre persönlichen Daten</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Persönliche Daten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nachname">Nachname *</Label>
              <Input
                id="nachname"
                value={formData.nachname}
                onChange={(e) => setFormData({ ...formData, nachname: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="vorname">Vorname *</Label>
              <Input
                id="vorname"
                value={formData.vorname}
                onChange={(e) => setFormData({ ...formData, vorname: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="telefonnummer">Telefonnummer</Label>
              <Input
                id="telefonnummer"
                value={formData.telefonnummer}
                onChange={(e) => setFormData({ ...formData, telefonnummer: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="telefon_2">2. Telefonnummer</Label>
              <Input
                id="telefon_2"
                value={formData.telefon_2}
                onChange={(e) => setFormData({ ...formData, telefon_2: e.target.value })}
              />
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Notfallkontakt</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="notfall_kontakt_name">Name</Label>
                <Input
                  id="notfall_kontakt_name"
                  value={formData.notfall_kontakt_name}
                  onChange={(e) => setFormData({ ...formData, notfall_kontakt_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="notfallnummer">Notfallnummer</Label>
                <Input
                  id="notfallnummer"
                  value={formData.notfallnummer}
                  onChange={(e) => setFormData({ ...formData, notfallnummer: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Tier-Informationen</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="futtermenge">Futtermenge</Label>
                <Textarea
                  id="futtermenge"
                  value={formData.futtermenge}
                  onChange={(e) => setFormData({ ...formData, futtermenge: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="medikamente">Medikamente</Label>
                <Textarea
                  id="medikamente"
                  value={formData.medikamente}
                  onChange={(e) => setFormData({ ...formData, medikamente: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="besonderheiten">Besonderheiten</Label>
                <Textarea
                  id="besonderheiten"
                  value={formData.besonderheiten}
                  onChange={(e) => setFormData({ ...formData, besonderheiten: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Intervalle</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="intervall_impfung">Intervall Impfung</Label>
                <Input
                  id="intervall_impfung"
                  value={formData.intervall_impfung}
                  onChange={(e) => setFormData({ ...formData, intervall_impfung: e.target.value })}
                  placeholder="z.B. jährlich"
                />
              </div>
              <div>
                <Label htmlFor="intervall_entwurmung">Intervall Entwurmung/Testung</Label>
                <Input
                  id="intervall_entwurmung"
                  value={formData.intervall_entwurmung}
                  onChange={(e) => setFormData({ ...formData, intervall_entwurmung: e.target.value })}
                  placeholder="z.B. halbjährlich"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="datenschutz"
              checked={formData.datenschutz}
              onChange={(e) => setFormData({ ...formData, datenschutz: e.target.checked })}
              className="rounded border-sage-300"
            />
            <Label htmlFor="datenschutz">Ich stimme der Datenschutzerklärung zu *</Label>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-sage-600 hover:bg-sage-700"
          >
            {saving ? 'Wird gespeichert...' : 'Speichern'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}


