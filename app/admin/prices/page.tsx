'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

interface Price {
  id: string
  category: 'kennenlernen' | 'grundpreise' | 'zusatzleistungen' | 'rabatte' | 'langzeit' | 'zeiten' | 'hinweis'
  name: string
  description: string | null
  price: number | null
  price_type: 'fixed' | 'percentage' | 'per_unit' | 'text'
  unit: string | null
  note: string | null
  sort_order: number
}

const categoryLabels: Record<string, string> = {
  kennenlernen: 'Kennenlernen',
  grundpreise: 'Grundpreise pro Kalendertag',
  zusatzleistungen: 'Zusatzleistungen',
  rabatte: 'Rabatte',
  langzeit: 'Langzeit-Betreuung',
  zeiten: 'Bring- und Holzeiten',
  hinweis: 'Wichtiger Hinweis',
}

export default function PricesPage() {
  const [prices, setPrices] = useState<Price[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadPrices()
  }, [])

  async function loadPrices() {
    try {
      const response = await fetch('/api/admin/prices')
      const data = await response.json()
      setPrices(data.prices || [])
    } catch (error) {
      console.error('Error loading prices:', error)
      toast({
        title: 'Fehler',
        description: 'Fehler beim Laden der Preise',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/prices', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prices }),
      })

      if (response.ok) {
        toast({
          title: 'Erfolg',
          description: 'Preise erfolgreich gespeichert!',
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
      console.error('Error saving prices:', error)
      toast({
        title: 'Fehler',
        description: 'Fehler beim Speichern',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  function updatePrice(id: string, field: keyof Price, value: any) {
    setPrices(prices.map(price => 
      price.id === id ? { ...price, [field]: value } : price
    ))
  }

  function formatPrice(price: Price): string {
    if (price.price_type === 'text') {
      return price.description || ''
    }
    
    if (price.price === null) return ''
    
    if (price.price_type === 'percentage') {
      return `+${price.price}%${price.unit ? ` ${price.unit}` : ''}`
    }
    
    if (price.price_type === 'per_unit') {
      return `${price.price.toFixed(2).replace('.', ',')}€${price.unit ? ` ${price.unit}` : ''}`
    }
    
    return `${price.price.toFixed(2).replace('.', ',')}€${price.unit ? ` ${price.unit}` : ''}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600"></div>
      </div>
    )
  }

  const pricesByCategory = prices.reduce((acc, price) => {
    if (!acc[price.category]) {
      acc[price.category] = []
    }
    acc[price.category].push(price)
    return acc
  }, {} as Record<string, Price[]>)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-sage-900">Preise verwalten</h1>
          <p className="mt-2 text-sage-600">
            Verwalten Sie die Preise für die Hundebetreuung
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-sage-600 hover:bg-sage-700"
        >
          {saving ? 'Wird gespeichert...' : 'Alle Preise speichern'}
        </Button>
      </div>

      {Object.entries(pricesByCategory).map(([category, categoryPrices]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{categoryLabels[category]}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryPrices.map((price) => (
                <div key={price.id} className="p-4 border border-sage-200 rounded-lg space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`name-${price.id}`}>Name</Label>
                      <Input
                        id={`name-${price.id}`}
                        value={price.name}
                        onChange={(e) => updatePrice(price.id, 'name', e.target.value)}
                      />
                    </div>
                    {price.price_type !== 'text' && (
                      <div>
                        <Label htmlFor={`price-${price.id}`}>Preis</Label>
                        <Input
                          id={`price-${price.id}`}
                          type="number"
                          step="0.01"
                          value={price.price || ''}
                          onChange={(e) => updatePrice(price.id, 'price', e.target.value ? parseFloat(e.target.value) : null)}
                        />
                      </div>
                    )}
                  </div>
                  
                  {price.description !== null && (
                    <div>
                      <Label htmlFor={`description-${price.id}`}>Beschreibung</Label>
                      <Textarea
                        id={`description-${price.id}`}
                        value={price.description || ''}
                        onChange={(e) => updatePrice(price.id, 'description', e.target.value)}
                        rows={2}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor={`price_type-${price.id}`}>Preis-Typ</Label>
                      <Select
                        value={price.price_type}
                        onValueChange={(value) => updatePrice(price.id, 'price_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Festpreis</SelectItem>
                          <SelectItem value="percentage">Prozent</SelectItem>
                          <SelectItem value="per_unit">Pro Einheit</SelectItem>
                          <SelectItem value="text">Nur Text</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {price.price_type !== 'text' && (
                      <div>
                        <Label htmlFor={`unit-${price.id}`}>Einheit</Label>
                        <Input
                          id={`unit-${price.id}`}
                          value={price.unit || ''}
                          onChange={(e) => updatePrice(price.id, 'unit', e.target.value)}
                          placeholder="z.B. pro Nacht, pro Gabe"
                        />
                      </div>
                    )}
                    <div>
                      <Label htmlFor={`sort_order-${price.id}`}>Sortierung</Label>
                      <Input
                        id={`sort_order-${price.id}`}
                        type="number"
                        value={price.sort_order}
                        onChange={(e) => updatePrice(price.id, 'sort_order', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  {price.note && (
                    <div>
                      <Label htmlFor={`note-${price.id}`}>Hinweis</Label>
                      <Input
                        id={`note-${price.id}`}
                        value={price.note || ''}
                        onChange={(e) => updatePrice(price.id, 'note', e.target.value)}
                      />
                    </div>
                  )}

                  <div className="text-sm text-sage-600 pt-2 border-t">
                    <strong>Vorschau:</strong> {formatPrice(price)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

