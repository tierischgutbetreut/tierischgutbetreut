"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Star, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { getAllTestimonials, createTestimonial, updateTestimonial, deleteTestimonial, type Testimonial } from "@/lib/supabase"

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [testimonialToDelete, setTestimonialToDelete] = useState<Testimonial | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    pet: '',
    rating: 5,
    text: '',
    date: new Date().toISOString().split('T')[0],
    is_published: true,
    display_order: 0
  })
  const { toast } = useToast()

  useEffect(() => {
    loadTestimonials()
  }, [])

  const loadTestimonials = async () => {
    try {
      const data = await getAllTestimonials()
      setTestimonials(data)
    } catch (error) {
      console.error('Failed to load testimonials:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingId) {
        // Update existing testimonial
        await updateTestimonial(editingId, formData)
      } else {
        // Create new testimonial
        await createTestimonial(formData)
      }
      
      // Reset form and reload data
      resetForm()
      loadTestimonials()
      toast({
        title: 'Erfolg',
        description: editingId ? 'Kundenstimme aktualisiert!' : 'Kundenstimme erstellt!',
      })
    } catch (error) {
      console.error('Error saving testimonial:', error)
      toast({
        title: 'Fehler',
        description: 'Fehler beim Speichern!',
        variant: 'destructive',
      })
    }
  }

  const handleEdit = (testimonial: Testimonial) => {
    setFormData({
      name: testimonial.name,
      pet: testimonial.pet || '',
      rating: testimonial.rating,
      text: testimonial.text,
      date: testimonial.date,
      is_published: testimonial.is_published,
      display_order: testimonial.display_order
    })
    setEditingId(testimonial.id)
    setShowForm(true)
  }

  function openDeleteDialog(testimonial: Testimonial) {
    setTestimonialToDelete(testimonial)
    setDeleteDialogOpen(true)
  }

  async function handleDelete() {
    if (!testimonialToDelete) return

    try {
      await deleteTestimonial(testimonialToDelete.id)
      loadTestimonials()
      setDeleteDialogOpen(false)
      setTestimonialToDelete(null)
      toast({
        title: 'Erfolg',
        description: 'Kundenstimme gelöscht!',
      })
    } catch (error) {
      console.error('Error deleting testimonial:', error)
      toast({
        title: 'Fehler',
        description: 'Fehler beim Löschen!',
        variant: 'destructive',
      })
    }
  }

  const togglePublished = async (testimonial: Testimonial) => {
    try {
      await updateTestimonial(testimonial.id, { is_published: !testimonial.is_published })
      loadTestimonials()
      toast({
        title: 'Erfolg',
        description: testimonial.is_published ? 'Kundenstimme ausgeblendet' : 'Kundenstimme veröffentlicht',
      })
    } catch (error) {
      console.error('Error toggling published status:', error)
      toast({
        title: 'Fehler',
        description: 'Fehler beim Aktualisieren!',
        variant: 'destructive',
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      pet: '',
      rating: 5,
      text: '',
      date: new Date().toISOString().split('T')[0],
      is_published: true,
      display_order: 0
    })
    setEditingId(null)
    setShowForm(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Kundenstimmen verwalten</h1>
          <p>Lade Kundenstimmen...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Kundenstimmen verwalten</h1>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-sage-600 hover:bg-sage-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Neue Kundenstimme
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingId ? 'Kundenstimme bearbeiten' : 'Neue Kundenstimme erstellen'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Tier</label>
                    <Input
                      value={formData.pet}
                      onChange={(e) => setFormData({ ...formData, pet: e.target.value })}
                      placeholder="z.B. Hund, Katze, Name"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Bewertung *</label>
                    <select
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    >
                      {[1, 2, 3, 4, 5].map(rating => (
                        <option key={rating} value={rating}>
                          {rating} {rating === 1 ? 'Stern' : 'Sterne'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Datum *</label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Reihenfolge</label>
                    <Input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Bewertungstext *</label>
                  <Textarea
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    rows={4}
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  />
                  <label htmlFor="is_published" className="text-sm font-medium">
                    Veröffentlicht (auf Website sichtbar)
                  </label>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="bg-sage-600 hover:bg-sage-700">
                    {editingId ? 'Aktualisieren' : 'Erstellen'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Abbrechen
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-sage-600">{testimonials.length}</div>
              <div className="text-sm text-gray-600">Gesamt</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {testimonials.filter(t => t.is_published).length}
              </div>
              <div className="text-sm text-gray-600">Veröffentlicht</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {testimonials.filter(t => !t.is_published).length}
              </div>
              <div className="text-sm text-gray-600">Unveröffentlicht</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {testimonials.length > 0 ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1) : '0'}
              </div>
              <div className="text-sm text-gray-600">Ø Bewertung</div>
            </CardContent>
          </Card>
        </div>

        {/* Testimonials List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className={`${testimonial.is_published ? 'border-green-200' : 'border-gray-200'}`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => togglePublished(testimonial)}
                      className="p-1"
                    >
                      {testimonial.is_published ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(testimonial)}
                      className="p-1"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDeleteDialog(testimonial)}
                      className="p-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <h3 className="font-semibold text-sage-900 mb-1">{testimonial.name}</h3>
                {testimonial.pet && (
                  <p className="text-sm text-sage-600 mb-2">{testimonial.pet}</p>
                )}
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {testimonial.text}
                </p>

                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{formatDate(testimonial.date)}</span>
                  <span>#{testimonial.display_order}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {testimonials.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Noch keine Kundenstimmen vorhanden.</p>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Kundenstimme löschen?</AlertDialogTitle>
              <AlertDialogDescription>
                Möchten Sie die Kundenstimme von "{testimonialToDelete?.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
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
    </div>
  )
} 