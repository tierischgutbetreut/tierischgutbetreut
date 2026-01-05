import { NextResponse } from 'next/server'
import { fetchGoogleReviews, isGoogleReviewsConfigured } from '@/lib/google-reviews'

/**
 * GET /api/reviews/google
 * 
 * Holt Google Bewertungen über die Places API
 * Nutzt serverseitigen Cache um API-Aufrufe zu reduzieren
 */
export async function GET() {
  try {
    // Prüfe ob API konfiguriert ist
    if (!isGoogleReviewsConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Google Reviews API nicht konfiguriert',
          configured: false
        },
        { status: 503 }
      )
    }

    const result = await fetchGoogleReviews()

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          configured: true
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      cached: result.cached,
      lastUpdated: result.lastUpdated,
      configured: true
    })

  } catch (error) {
    console.error('Error in Google Reviews API:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Interner Serverfehler',
        configured: true
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/reviews/google/refresh
 * 
 * Erzwingt Cache-Aktualisierung (nur für Admins)
 */
export async function POST(request: Request) {
  try {
    // Hier könnte Admin-Authentifizierung hinzugefügt werden
    const { clearGoogleReviewsCache } = await import('@/lib/google-reviews')
    clearGoogleReviewsCache()
    
    const result = await fetchGoogleReviews()
    
    return NextResponse.json({
      success: result.success,
      message: 'Cache wurde aktualisiert',
      data: result.data,
      lastUpdated: result.lastUpdated
    })

  } catch (error) {
    console.error('Error refreshing Google Reviews:', error)
    return NextResponse.json(
      { success: false, error: 'Fehler beim Aktualisieren des Caches' },
      { status: 500 }
    )
  }
}




