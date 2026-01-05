'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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

  useEffect(() => {
    loadPrices()
  }, [])

  async function loadPrices() {
    try {
      const response = await fetch('/api/prices')
      const data = await response.json()
      setPrices(data.prices || [])
    } catch (error) {
      console.error('Error loading prices:', error)
    } finally {
      setLoading(false)
    }
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
      <div>
        <h1 className="text-3xl font-bold text-sage-900">Unsere Preise</h1>
        <p className="mt-2 text-sage-600">Transparente Preisgestaltung für deine Hundebetreuung</p>
      </div>

      {/* Kennenlernen */}
      {pricesByCategory.kennenlernen && pricesByCategory.kennenlernen.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{categoryLabels.kennenlernen}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pricesByCategory.kennenlernen.map((price) => (
              <div key={price.id}>
                <div className="flex items-baseline gap-2">
                  {price.price !== null && (
                    <span className="text-2xl font-bold text-sage-900">
                      {price.price.toFixed(2).replace('.', ',')}€
                    </span>
                  )}
                  {price.unit && (
                    <span className="text-sage-600">({price.unit})</span>
                  )}
                </div>
                {price.description && (
                  <div className="text-sage-700 space-y-2 mt-2">
                    <p>{price.description}</p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Grundpreise */}
      {pricesByCategory.grundpreise && pricesByCategory.grundpreise.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{categoryLabels.grundpreise}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pricesByCategory.grundpreise.map((price) => (
                <div key={price.id} className="flex justify-between items-start border-b border-sage-200 pb-3 last:border-0">
                  <div>
                    <p className="font-semibold text-sage-900">{price.name}</p>
                    {price.note && (
                      <p className="text-sm text-sage-600">{price.note}</p>
                    )}
                  </div>
                  <p className="text-xl font-bold text-sage-900">{formatPrice(price)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Zusatzleistungen */}
      {pricesByCategory.zusatzleistungen && pricesByCategory.zusatzleistungen.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{categoryLabels.zusatzleistungen}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pricesByCategory.zusatzleistungen.map((price) => (
                <div key={price.id} className="flex justify-between items-start border-b border-sage-200 pb-3 last:border-0">
                  <p className="text-sage-700">{price.name}</p>
                  <p className="font-semibold text-sage-900">{formatPrice(price)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rabatte */}
      {pricesByCategory.rabatte && pricesByCategory.rabatte.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{categoryLabels.rabatte}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pricesByCategory.rabatte.map((price) => (
              <div key={price.id} className="flex justify-between items-start border-b border-sage-200 pb-3 last:border-0">
                <div>
                  <p className="font-semibold text-sage-900">{price.name}</p>
                  {price.note && (
                    <p className="text-sm text-sage-600 mt-1">{price.note}</p>
                  )}
                </div>
                <p className="font-semibold text-sage-900">{formatPrice(price)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Langzeit-Betreuung */}
      {pricesByCategory.langzeit && pricesByCategory.langzeit.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{categoryLabels.langzeit}</CardTitle>
          </CardHeader>
          <CardContent>
            {pricesByCategory.langzeit.map((price) => (
              <p key={price.id} className="text-sage-700">
                {price.description || price.name}
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Bring- und Holzeiten */}
      {pricesByCategory.zeiten && pricesByCategory.zeiten.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{categoryLabels.zeiten}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pricesByCategory.zeiten.map((price) => (
              <div key={price.id}>
                <p className="font-semibold text-sage-900 mb-2">{price.name}</p>
                <p className="text-sage-700">{price.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Wichtiger Hinweis */}
      {pricesByCategory.hinweis && pricesByCategory.hinweis.length > 0 && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="pt-6">
            {pricesByCategory.hinweis.map((price) => (
              <p key={price.id} className="text-amber-800">
                <strong>{price.name}:</strong> {price.description}
              </p>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
