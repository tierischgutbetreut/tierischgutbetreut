'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import type { Pet } from '@/lib/types'

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPet, setEditingPet] = useState<Pet | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    tierart: '',
    geschlecht: '',
    letzte_impfung: '',
    letzte_impfung_zusatz: '',
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [petToDelete, setPetToDelete] = useState<Pet | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadPets()
  }, [])

  async function loadPets() {
    try {
      const response = await fetch('/api/portal/pets')
      const data = await response.json()
      setPets(data.pets || [])
    } catch (error) {
      console.error('Error loading pets:', error)
    } finally {
      setLoading(false)
    }
  }

  function openDialog(pet?: Pet) {
    if (pet) {
      setEditingPet(pet)
      setFormData({
        name: pet.name,
        tierart: pet.tierart || '',
        geschlecht: pet.geschlecht || '',
        letzte_impfung: pet.letzte_impfung || '',
        letzte_impfung_zusatz: pet.letzte_impfung_zusatz || '',
      })
    } else {
      setEditingPet(null)
      setFormData({
        name: '',
        tierart: '',
        geschlecht: '',
        letzte_impfung: '',
        letzte_impfung_zusatz: '',
      })
    }
    setDialogOpen(true)
  }

  async function handleSave() {
    try {
      if (editingPet) {
        // Update
        const response = await fetch(`/api/portal/pets/${editingPet.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          loadPets()
          setDialogOpen(false)
        } else {
          const error = await response.json()
          toast({
            title: 'Fehler',
            description: error.error || 'Fehler beim Aktualisieren',
            variant: 'destructive',
          })
        }
      } else {
        // Create
        const response = await fetch('/api/portal/pets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          loadPets()
          setDialogOpen(false)
          toast({
            title: 'Erfolg',
            description: 'Tier erfolgreich hinzugefügt',
          })
        } else {
          const error = await response.json()
          toast({
            title: 'Fehler',
            description: error.error || 'Fehler beim Erstellen',
            variant: 'destructive',
          })
        }
      }
    } catch (error) {
      console.error('Error saving pet:', error)
      toast({
        title: 'Fehler',
        description: 'Fehler beim Speichern',
        variant: 'destructive',
      })
    }
  }

  function openDeleteDialog(pet: Pet) {
    setPetToDelete(pet)
    setDeleteDialogOpen(true)
  }

  async function handleDelete() {
    if (!petToDelete) return

    try {
      const response = await fetch(`/api/portal/pets/${petId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        loadPets()
        setDeleteDialogOpen(false)
        setPetToDelete(null)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-sage-900">Meine Tiere</h1>
          <p className="mt-2 text-sage-600">Verwalten Sie Ihre Tiere</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()} className="bg-sage-600 hover:bg-sage-700">
              Neues Tier hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPet ? 'Tier bearbeiten' : 'Neues Tier hinzufügen'}
              </DialogTitle>
              <DialogDescription>
                Geben Sie die Informationen zu Ihrem Tier ein
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="tierart">Tierart</Label>
                <Input
                  id="tierart"
                  value={formData.tierart}
                  onChange={(e) => setFormData({ ...formData, tierart: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="geschlecht">Geschlecht</Label>
                <Input
                  id="geschlecht"
                  value={formData.geschlecht}
                  onChange={(e) => setFormData({ ...formData, geschlecht: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="letzte_impfung">Letzte Impfung</Label>
                <Input
                  id="letzte_impfung"
                  type="date"
                  value={formData.letzte_impfung}
                  onChange={(e) => setFormData({ ...formData, letzte_impfung: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="letzte_impfung_zusatz">Letzte Impfung (Zusatz)</Label>
                <Input
                  id="letzte_impfung_zusatz"
                  type="date"
                  value={formData.letzte_impfung_zusatz}
                  onChange={(e) => setFormData({ ...formData, letzte_impfung_zusatz: e.target.value })}
                />
              </div>
              <Button onClick={handleSave} className="w-full bg-sage-600 hover:bg-sage-700">
                Speichern
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {pets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sage-600">Noch keine Tiere hinzugefügt</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <Card key={pet.id}>
              <CardHeader>
                <CardTitle>{pet.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {pet.tierart && <p className="text-sm text-sage-600">Tierart: {pet.tierart}</p>}
                {pet.geschlecht && <p className="text-sm text-sage-600">Geschlecht: {pet.geschlecht}</p>}
                {pet.letzte_impfung && (
                  <p className="text-sm text-sage-600">
                    Letzte Impfung: {new Date(pet.letzte_impfung).toLocaleDateString('de-DE')}
                  </p>
                )}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDialog(pet)}
                  >
                    Bearbeiten
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeleteDialog(pet)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Löschen
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tier löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie "{petToDelete?.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}



