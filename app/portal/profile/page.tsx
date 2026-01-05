'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Plus, Trash2 } from 'lucide-react'
import type { Customer, Pet } from '@/lib/types'

function ProfileContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const isOnboarding = searchParams.get('onboarding') === 'true'
  const stepParam = searchParams.get('step')
  
  // Schritt 1 = Persönliche Daten, Schritt 2 = Tier/e + Tierinformationen
  const [step, setStep] = useState<1 | 2>(stepParam === '2' ? 2 : 1)
  
  // Debug: Log onboarding status
  useEffect(() => {
    console.log('Onboarding status:', { isOnboarding, stepParam, step })
  }, [isOnboarding, stepParam, step])
  
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  
  // Schritt 1: Persönliche Daten
  const [personalData, setPersonalData] = useState({
    email: '',
    nachname: '',
    vorname: '',
    telefonnummer: '',
    telefon_2: '',
    notfall_kontakt_name: '',
    notfallnummer: '',
    datenschutz: false,
  })
  
  // Schritt 2: Tiere
  const [pets, setPets] = useState<Pet[]>([])
  const [petFormData, setPetFormData] = useState({
    name: '',
    tierart: '',
    geschlecht: '',
    letzte_impfung: '',
    futtermenge: '',
    medikamente: '',
    besonderheiten: '',
    intervall_impfung: '',
    intervall_entwurmung: '',
  })
  const [showPetForm, setShowPetForm] = useState(false)
  const [editingPetId, setEditingPetId] = useState<string | null>(null)
  const [uploadingDocuments, setUploadingDocuments] = useState(false)
  const [impfpassFile, setImpfpassFile] = useState<File | null>(null)
  const [wurmtestFile, setWurmtestFile] = useState<File | null>(null)

  useEffect(() => {
    console.log('Component mounted, loading profile...')
    loadProfile()
  }, [])
  
  // Debug: Log personalData changes
  useEffect(() => {
    console.log('Personal data changed:', personalData)
  }, [personalData])

  useEffect(() => {
    if (step === 2 && customer) {
      loadPets()
    }
  }, [step, customer])

  async function loadProfile() {
    try {
      const response = await fetch('/api/portal/profile')
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
      
      const data = await response.json()
      
      console.log('Profile API response:', data)
      
      if (data.customer) {
        console.log('Customer data received from API:', {
          id: data.customer.id,
          nachname: data.customer.nachname,
          vorname: data.customer.vorname,
          telefonnummer: data.customer.telefonnummer,
          email: data.customer.email,
          telefon_2: data.customer.telefon_2,
          notfall_kontakt_name: data.customer.notfall_kontakt_name,
          notfallnummer: data.customer.notfallnummer,
          datenschutz: data.customer.datenschutz,
        })
        
        setCustomer(data.customer)
        
        // Persönliche Daten vorausfüllen (auch wenn leer, werden aus DB geladen)
        const loadedPersonalData = {
          email: data.customer.email || '',
          nachname: data.customer.nachname || '',
          vorname: data.customer.vorname || '',
          telefonnummer: data.customer.telefonnummer || '',
          telefon_2: data.customer.telefon_2 || '',
          notfall_kontakt_name: data.customer.notfall_kontakt_name || '',
          notfallnummer: data.customer.notfallnummer || '',
          datenschutz: data.customer.datenschutz || false,
        }
        
        console.log('Setting personal data state:', loadedPersonalData)
        setPersonalData(loadedPersonalData)
        
        // Debug: Prüfe nach 100ms ob die Daten gesetzt wurden
        setTimeout(() => {
          console.log('Personal data after setState:', personalData)
        }, 100)
        // Tierinformationen werden jetzt pro Tier gespeichert, nicht mehr auf Customer-Ebene
      } else {
        console.warn('No customer data found in response')
        // Setze Customer auf null, damit die Form trotzdem angezeigt wird
        setCustomer(null)
      }
    } catch (error: any) {
      console.error('Error loading profile:', error)
      toast({
        title: 'Fehler',
        description: error.message || 'Profil konnte nicht geladen werden',
        variant: 'destructive',
      })
      setCustomer(null)
    } finally {
      setLoading(false)
    }
  }

  async function loadPets() {
    try {
      const response = await fetch('/api/portal/pets')
      const data = await response.json()
      setPets(data.pets || [])
    } catch (error) {
      console.error('Error loading pets:', error)
    }
  }

  async function handleSaveStep1() {
    setSaving(true)
    try {
      const response = await fetch('/api/portal/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personalData),
      })

      if (response.ok) {
        const data = await response.json()
        setCustomer(data.customer)
        toast({
          title: 'Persönliche Daten gespeichert',
          description: 'Bitte fahre mit Schritt 2 fort.',
        })
        // Weiter zu Schritt 2
        setStep(2)
        router.push('/portal/profile?onboarding=true&step=2')
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

  async function handleSavePet() {
    try {
      setUploadingDocuments(true)
      
      const url = editingPetId 
        ? `/api/portal/pets/${editingPetId}`
        : '/api/portal/pets'
      const method = editingPetId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(petFormData),
      })

      if (!response.ok) {
        const error = await response.json()
        toast({
          title: 'Fehler',
          description: error.error || 'Fehler beim Speichern',
          variant: 'destructive',
        })
        setUploadingDocuments(false)
        return
      }

      const petData = await response.json()
      const savedPetId = petData.pet?.id || editingPetId

      // Lade Dokumente hoch, falls vorhanden
      if (savedPetId) {
        const uploadPromises = []
        
        if (impfpassFile) {
          const formData = new FormData()
          formData.append('file', impfpassFile)
          formData.append('document_type', 'impfpass')
          formData.append('pet_id', savedPetId)
          
          uploadPromises.push(
            fetch('/api/portal/documents', {
              method: 'POST',
              body: formData,
            }).catch(err => {
              console.error('Error uploading impfpass:', err)
              toast({
                title: 'Warnung',
                description: 'Impfpass konnte nicht hochgeladen werden',
                variant: 'destructive',
              })
            })
          )
        }

        if (wurmtestFile) {
          const formData = new FormData()
          formData.append('file', wurmtestFile)
          formData.append('document_type', 'wurmtest')
          formData.append('pet_id', savedPetId)
          
          uploadPromises.push(
            fetch('/api/portal/documents', {
              method: 'POST',
              body: formData,
            }).catch(err => {
              console.error('Error uploading wurmtest:', err)
              toast({
                title: 'Warnung',
                description: 'Wurmtest konnte nicht hochgeladen werden',
                variant: 'destructive',
              })
            })
          )
        }

        await Promise.all(uploadPromises)
      }

      await loadPets()
      setPetFormData({
        name: '',
        tierart: '',
        geschlecht: '',
        letzte_impfung: '',
        futtermenge: '',
        medikamente: '',
        besonderheiten: '',
        intervall_impfung: '',
        intervall_entwurmung: '',
      })
      setImpfpassFile(null)
      setWurmtestFile(null)
      setShowPetForm(false)
      setEditingPetId(null)
      toast({
        title: 'Erfolg',
        description: editingPetId ? 'Tier erfolgreich aktualisiert' : 'Tier erfolgreich hinzugefügt',
      })
    } catch (error) {
      console.error('Error saving pet:', error)
      toast({
        title: 'Fehler',
        description: 'Fehler beim Speichern',
        variant: 'destructive',
      })
    } finally {
      setUploadingDocuments(false)
    }
  }

  function openPetForm(pet?: Pet) {
    if (pet) {
      setEditingPetId(pet.id)
      setPetFormData({
        name: pet.name,
        tierart: pet.tierart || '',
        geschlecht: pet.geschlecht || '',
        letzte_impfung: pet.letzte_impfung || '',
        futtermenge: pet.futtermenge || '',
        medikamente: pet.medikamente || '',
        besonderheiten: pet.besonderheiten || '',
        intervall_impfung: pet.intervall_impfung || '',
        intervall_entwurmung: pet.intervall_entwurmung || '',
      })
    } else {
      setEditingPetId(null)
      setPetFormData({
        name: '',
        tierart: '',
        geschlecht: '',
        letzte_impfung: '',
        futtermenge: '',
        medikamente: '',
        besonderheiten: '',
        intervall_impfung: '',
        intervall_entwurmung: '',
      })
    }
    // Dateien zurücksetzen beim Öffnen des Formulars
    setImpfpassFile(null)
    setWurmtestFile(null)
    setShowPetForm(true)
  }

  async function handleDeletePet(petId: string) {
    try {
      const response = await fetch(`/api/portal/pets/${petId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadPets()
        toast({
          title: 'Erfolg',
          description: 'Tier erfolgreich gelöscht',
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Fehler',
          description: error.error || 'Fehler beim Löschen',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error deleting pet:', error)
      toast({
        title: 'Fehler',
        description: 'Fehler beim Löschen',
        variant: 'destructive',
      })
    }
  }

  async function handleSaveStep2() {
    setSaving(true)
    try {
      // Markiere Onboarding als abgeschlossen (Tierinformationen sind jetzt pro Tier gespeichert)
      const response = await fetch('/api/portal/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          onboarding_completed: true,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCustomer(data.customer)
        toast({
          title: 'Onboarding abgeschlossen!',
          description: 'Willkommen bei Tierisch Gut Betreut!',
        })
        // Nach dem Onboarding zum Portal weiterleiten
        router.push('/portal')
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

  async function handleSave() {
    // Normales Speichern (nicht im Onboarding)
    // Tierinformationen werden jetzt pro Tier gespeichert, nicht mehr auf Customer-Ebene
    setSaving(true)
    try {
      const response = await fetch('/api/portal/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personalData),
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
      {/* Schritt-Indikator */}
      {isOnboarding && (
        <Card className="bg-white border-sage-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-4 md:gap-8">
              {/* Schritt 1 */}
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step === 1 
                    ? 'bg-sage-600 text-white ring-4 ring-sage-200' 
                    : step > 1
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > 1 ? '✓' : '1'}
                </div>
                <div className="text-center">
                  <p className={`text-sm font-semibold ${step >= 1 ? 'text-sage-900' : 'text-gray-400'}`}>
                    Persönliche Daten
                  </p>
                  {step === 1 && (
                    <p className="text-xs text-sage-600 mt-1">Aktueller Schritt</p>
                  )}
                </div>
              </div>
              
              {/* Verbindungslinie */}
              <div className={`flex-1 h-1 transition-all ${
                step >= 2 ? 'bg-green-600' : 'bg-gray-200'
              }`} />
              
              {/* Schritt 2 */}
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step === 2 
                    ? 'bg-sage-600 text-white ring-4 ring-sage-200' 
                    : step > 2
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > 2 ? '✓' : '2'}
                </div>
                <div className="text-center">
                  <p className={`text-sm font-semibold ${step >= 2 ? 'text-sage-900' : 'text-gray-400'}`}>
                    Tier/e & Informationen
                  </p>
                  {step === 2 && (
                    <p className="text-xs text-sage-600 mt-1">Aktueller Schritt</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h1 className="text-3xl font-bold text-sage-900">
          {isOnboarding 
            ? (step === 1 ? 'Schritt 1: Persönliche Daten' : 'Schritt 2: Tier/e & Informationen')
            : 'Mein Profil'}
        </h1>
        <p className="mt-2 text-sage-600">
          {isOnboarding 
            ? (step === 1 
                ? 'Bitte fülle deine persönlichen Daten aus.'
                : 'Lege deine Tier/e an und ergänze die Tierinformationen.')
            : 'Verwalte deine persönlichen Daten'}
        </p>
      </div>

      {/* Schritt 1: Persönliche Daten */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>{isOnboarding ? 'Schritt 1: Persönliche Daten' : 'Persönliche Daten'}</CardTitle>
            <CardDescription>
              Deine Daten wurden bereits aus unserem System geladen. Bitte überprüfe und vervollständige diese.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vorname">Vorname *</Label>
                <Input
                  id="vorname"
                  value={personalData.vorname}
                  onChange={(e) => setPersonalData({ ...personalData, vorname: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="nachname">Nachname *</Label>
                <Input
                  id="nachname"
                  value={personalData.nachname}
                  onChange={(e) => setPersonalData({ ...personalData, nachname: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">E-Mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={personalData.email}
                  onChange={(e) => setPersonalData({ ...personalData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="telefonnummer">Telefonnummer *</Label>
                <Input
                  id="telefonnummer"
                  type="tel"
                  value={personalData.telefonnummer}
                  onChange={(e) => setPersonalData({ ...personalData, telefonnummer: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="telefon_2">2. Telefonnummer</Label>
                <Input
                  id="telefon_2"
                  value={personalData.telefon_2}
                  onChange={(e) => setPersonalData({ ...personalData, telefon_2: e.target.value })}
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
                    value={personalData.notfall_kontakt_name}
                    onChange={(e) => setPersonalData({ ...personalData, notfall_kontakt_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="notfallnummer">Notfallnummer</Label>
                  <Input
                    id="notfallnummer"
                    value={personalData.notfallnummer}
                    onChange={(e) => setPersonalData({ ...personalData, notfallnummer: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="datenschutz"
                checked={personalData.datenschutz}
                onChange={(e) => setPersonalData({ ...personalData, datenschutz: e.target.checked })}
                className="rounded border-sage-300"
              />
              <Label htmlFor="datenschutz">Ich stimme der Datenschutzerklärung zu *</Label>
            </div>

            <div className="flex gap-4">
              {isOnboarding ? (
                <Button
                  onClick={handleSaveStep1}
                  disabled={saving || !personalData.datenschutz || !personalData.nachname || !personalData.vorname || !personalData.email || !personalData.telefonnummer}
                  className="flex-1 bg-sage-600 hover:bg-sage-700 text-lg py-6"
                >
                  {saving ? 'Wird gespeichert...' : 'Weiter zu Schritt 2 →'}
                </Button>
              ) : (
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-sage-600 hover:bg-sage-700"
                >
                  {saving ? 'Wird gespeichert...' : 'Speichern'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schritt 2: Tier/e & Tierinformationen */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Tier/e anlegen */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle>{isOnboarding ? 'Schritt 2: Deine Tier/e' : 'Deine Tier/e'}</CardTitle>
                  <CardDescription className="mt-1">
                    Lege mindestens ein Tier an und ergänze die Tier-Informationen (Futter, Medikamente, Intervalle) für jedes Tier.
                  </CardDescription>
                </div>
                <Button
                  onClick={() => openPetForm()}
                  className="bg-sage-600 hover:bg-sage-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tier hinzufügen
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showPetForm && (
                <div className="p-4 border border-sage-200 rounded-lg bg-sage-50 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pet-name">Name *</Label>
                      <Input
                        id="pet-name"
                        value={petFormData.name}
                        onChange={(e) => setPetFormData({ ...petFormData, name: e.target.value })}
                        placeholder="Name des Tieres"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="pet-tierart">Tierart</Label>
                      <Select
                        value={petFormData.tierart}
                        onValueChange={(value) => setPetFormData({ ...petFormData, tierart: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tierart wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Hund">Hund</SelectItem>
                          <SelectItem value="Katze">Katze</SelectItem>
                          <SelectItem value="Andere">Andere</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="pet-geschlecht">Geschlecht</Label>
                      <Select
                        value={petFormData.geschlecht}
                        onValueChange={(value) => setPetFormData({ ...petFormData, geschlecht: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Geschlecht wählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hündin">Hündin</SelectItem>
                          <SelectItem value="rüde">Rüde</SelectItem>
                          <SelectItem value="rüde_kastriert">Rüde - kastiert</SelectItem>
                          <SelectItem value="rüde_kastriert_gechipt">Rüde - kastiert - gechipt</SelectItem>
                          <SelectItem value="hündin_kastriert">Hündin - kastriert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="pet-impfung">Letzte Impfung</Label>
                      <Input
                        id="pet-impfung"
                        type="date"
                        value={petFormData.letzte_impfung}
                        onChange={(e) => setPetFormData({ ...petFormData, letzte_impfung: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Tier-Informationen */}
                  <div className="border-t pt-4 space-y-4">
                    <h3 className="font-semibold text-sage-900">Tier-Informationen</h3>
                    <div>
                      <Label htmlFor="pet-futtermenge">Futtermenge</Label>
                      <Textarea
                        id="pet-futtermenge"
                        value={petFormData.futtermenge}
                        onChange={(e) => setPetFormData({ ...petFormData, futtermenge: e.target.value })}
                        rows={3}
                        placeholder="z.B. 200g Trockenfutter morgens, 150g abends"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pet-medikamente">Medikamente</Label>
                      <Textarea
                        id="pet-medikamente"
                        value={petFormData.medikamente}
                        onChange={(e) => setPetFormData({ ...petFormData, medikamente: e.target.value })}
                        rows={3}
                        placeholder="z.B. Tabletten gegen Arthrose, täglich morgens"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pet-besonderheiten">Besonderheiten</Label>
                      <Textarea
                        id="pet-besonderheiten"
                        value={petFormData.besonderheiten}
                        onChange={(e) => setPetFormData({ ...petFormData, besonderheiten: e.target.value })}
                        rows={3}
                        placeholder="z.B. Allergien, Verhaltensbesonderheiten, etc."
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Intervalle</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="pet-intervall-impfung">Intervall Impfung</Label>
                          <Select
                            value={petFormData.intervall_impfung || ''}
                            onValueChange={(value) => setPetFormData({ ...petFormData, intervall_impfung: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Intervall wählen" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monatlich">Monatlich</SelectItem>
                              <SelectItem value="vierteljährlich">Vierteljährlich</SelectItem>
                              <SelectItem value="halbjährlich">Halbjährlich</SelectItem>
                              <SelectItem value="jährlich">Jährlich</SelectItem>
                              <SelectItem value="alle_2_jahre">Alle 2 Jahre</SelectItem>
                              <SelectItem value="alle_3_jahre">Alle 3 Jahre</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="pet-intervall-entwurmung">Intervall Entwurmung/Testung</Label>
                          <Select
                            value={petFormData.intervall_entwurmung || ''}
                            onValueChange={(value) => setPetFormData({ ...petFormData, intervall_entwurmung: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Intervall wählen" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monatlich">Monatlich</SelectItem>
                              <SelectItem value="vierteljährlich">Vierteljährlich</SelectItem>
                              <SelectItem value="halbjährlich">Halbjährlich</SelectItem>
                              <SelectItem value="jährlich">Jährlich</SelectItem>
                              <SelectItem value="alle_2_jahre">Alle 2 Jahre</SelectItem>
                              <SelectItem value="alle_3_jahre">Alle 3 Jahre</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dokumente-Upload */}
                  <div className="border-t pt-4 space-y-4">
                    <h3 className="font-semibold text-sage-900">Dokumente</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pet-impfpass">Impfpass (Bild)</Label>
                        <Input
                          id="pet-impfpass"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            setImpfpassFile(file || null)
                          }}
                        />
                        {impfpassFile && (
                          <p className="text-sm text-sage-600 mt-1">
                            Ausgewählt: {impfpassFile.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="pet-wurmtest">Wurmtest (Bild)</Label>
                        <Input
                          id="pet-wurmtest"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            setWurmtestFile(file || null)
                          }}
                        />
                        {wurmtestFile && (
                          <p className="text-sm text-sage-600 mt-1">
                            Ausgewählt: {wurmtestFile.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleSavePet}
                      disabled={!petFormData.name || uploadingDocuments}
                      className="bg-sage-600 hover:bg-sage-700"
                    >
                      {uploadingDocuments 
                        ? 'Wird gespeichert...' 
                        : editingPetId 
                        ? 'Tier aktualisieren' 
                        : 'Tier speichern'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowPetForm(false)
                        setEditingPetId(null)
                        setPetFormData({
                          name: '',
                          tierart: '',
                          geschlecht: '',
                          letzte_impfung: '',
                          futtermenge: '',
                          medikamente: '',
                          besonderheiten: '',
                          intervall_impfung: '',
                          intervall_entwurmung: '',
                        })
                        setImpfpassFile(null)
                        setWurmtestFile(null)
                      }}
                    >
                      Abbrechen
                    </Button>
                  </div>
                </div>
              )}

              {pets.length === 0 ? (
                <p className="text-sage-600 text-center py-8">
                  Noch keine Tier/e angelegt. Bitte füge mindestens ein Tier hinzu.
                </p>
              ) : (
                <div className="space-y-4">
                  {pets.map((pet) => (
                    <div key={pet.id} className="p-4 border border-sage-200 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-lg">{pet.name}</p>
                          <p className="text-sm text-sage-600">
                            {pet.tierart && `${pet.tierart} • `}
                            {pet.geschlecht && pet.geschlecht}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPetForm(pet)}
                            className="border-sage-300 text-sage-700 hover:bg-sage-50"
                          >
                            Bearbeiten
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePet(pet.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {(pet.futtermenge || pet.medikamente || pet.besonderheiten || pet.intervall_impfung || pet.intervall_entwurmung) && (
                        <div className="mt-3 pt-3 border-t border-sage-200 space-y-2">
                          {pet.futtermenge && (
                            <div>
                              <p className="text-xs font-semibold text-sage-600">Futtermenge:</p>
                              <p className="text-sm text-sage-700">{pet.futtermenge}</p>
                            </div>
                          )}
                          {pet.medikamente && (
                            <div>
                              <p className="text-xs font-semibold text-sage-600">Medikamente:</p>
                              <p className="text-sm text-sage-700">{pet.medikamente}</p>
                            </div>
                          )}
                          {pet.besonderheiten && (
                            <div>
                              <p className="text-xs font-semibold text-sage-600">Besonderheiten:</p>
                              <p className="text-sm text-sage-700">{pet.besonderheiten}</p>
                            </div>
                          )}
                          {(pet.intervall_impfung || pet.intervall_entwurmung) && (
                            <div className="grid grid-cols-2 gap-2">
                              {pet.intervall_impfung && (
                                <div>
                                  <p className="text-xs font-semibold text-sage-600">Impfung:</p>
                                  <p className="text-sm text-sage-700">{pet.intervall_impfung}</p>
                                </div>
                              )}
                              {pet.intervall_entwurmung && (
                                <div>
                                  <p className="text-xs font-semibold text-sage-600">Entwurmung:</p>
                                  <p className="text-sm text-sage-700">{pet.intervall_entwurmung}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Abschluss-Button für Onboarding */}
          {isOnboarding && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStep(1)
                      router.push('/portal/profile?onboarding=true&step=1')
                    }}
                    className="border-sage-300 text-sage-700 hover:bg-sage-50"
                  >
                    ← Zurück zu Schritt 1
                  </Button>
                  <Button
                    onClick={handleSaveStep2}
                    disabled={saving || pets.length === 0}
                    className="flex-1 bg-sage-600 hover:bg-sage-700 text-lg py-6"
                  >
                    {saving ? 'Wird gespeichert...' : '✓ Onboarding abschließen & zum Portal'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600"></div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  )
}
