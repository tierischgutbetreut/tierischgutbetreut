/**
 * Google Places API Integration für Bewertungen
 * 
 * Benötigte Umgebungsvariablen:
 * - GOOGLE_PLACES_API_KEY: API-Schlüssel aus Google Cloud Console
 * - GOOGLE_PLACE_ID: Place ID des Geschäfts (findbar über Google Maps)
 * 
 * Setup:
 * 1. Google Cloud Console: https://console.cloud.google.com/
 * 2. Places API aktivieren
 * 3. API-Schlüssel erstellen und einschränken
 * 4. Place ID finden: https://developers.google.com/maps/documentation/places/web-service/place-id
 */

import type { GooglePlaceDetails, GoogleReview, GoogleReviewsResponse } from './types'

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY
const GOOGLE_PLACE_ID = process.env.GOOGLE_PLACE_ID

// Cache für Reviews (um API-Aufrufe zu reduzieren)
let cachedReviews: GooglePlaceDetails | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 1000 * 60 * 60 // 1 Stunde Cache

/**
 * Prüft ob die Google Places API konfiguriert ist
 */
export function isGoogleReviewsConfigured(): boolean {
  return !!(GOOGLE_PLACES_API_KEY && GOOGLE_PLACE_ID)
}

/**
 * Holt Bewertungen von Google Places API
 */
export async function fetchGoogleReviews(): Promise<GoogleReviewsResponse> {
  // Prüfe ob API konfiguriert ist
  if (!GOOGLE_PLACES_API_KEY || !GOOGLE_PLACE_ID) {
    return {
      success: false,
      error: 'Google Places API nicht konfiguriert. Bitte GOOGLE_PLACES_API_KEY und GOOGLE_PLACE_ID setzen.'
    }
  }

  // Prüfe Cache
  const now = Date.now()
  if (cachedReviews && (now - cacheTimestamp) < CACHE_DURATION) {
    return {
      success: true,
      data: cachedReviews,
      cached: true,
      lastUpdated: new Date(cacheTimestamp).toISOString()
    }
  }

  try {
    // Google Places API - Place Details Endpoint
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json')
    url.searchParams.set('place_id', GOOGLE_PLACE_ID)
    url.searchParams.set('fields', 'place_id,name,rating,user_ratings_total,reviews,url')
    url.searchParams.set('key', GOOGLE_PLACES_API_KEY)
    url.searchParams.set('language', 'de') // Deutsche Bewertungen bevorzugen
    url.searchParams.set('reviews_sort', 'newest') // Neueste zuerst

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      // Cache für 1 Stunde
      next: { revalidate: 3600 }
    })

    if (!response.ok) {
      throw new Error(`Google API responded with status ${response.status}`)
    }

    const data = await response.json()

    if (data.status !== 'OK') {
      throw new Error(`Google Places API error: ${data.status} - ${data.error_message || 'Unknown error'}`)
    }

    const placeDetails: GooglePlaceDetails = {
      place_id: data.result.place_id,
      name: data.result.name,
      rating: data.result.rating || 0,
      user_ratings_total: data.result.user_ratings_total || 0,
      reviews: (data.result.reviews || []).map((review: any): GoogleReview => ({
        author_name: review.author_name,
        author_url: review.author_url,
        profile_photo_url: review.profile_photo_url,
        rating: review.rating,
        relative_time_description: review.relative_time_description,
        text: review.text,
        time: review.time
      })),
      url: data.result.url
    }

    // Update Cache
    cachedReviews = placeDetails
    cacheTimestamp = now

    return {
      success: true,
      data: placeDetails,
      cached: false,
      lastUpdated: new Date(now).toISOString()
    }

  } catch (error) {
    console.error('Error fetching Google reviews:', error)
    
    // Falls Cache existiert, nutze alten Cache
    if (cachedReviews) {
      return {
        success: true,
        data: cachedReviews,
        cached: true,
        lastUpdated: new Date(cacheTimestamp).toISOString(),
        error: 'Verwendung des Caches aufgrund eines API-Fehlers'
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unbekannter Fehler beim Abrufen der Google Bewertungen'
    }
  }
}

/**
 * Konvertiert Unix-Timestamp zu deutschem Datumsformat
 */
export function formatGoogleReviewDate(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

/**
 * Cache manuell leeren (z.B. für Admin-Bereich)
 */
export function clearGoogleReviewsCache(): void {
  cachedReviews = null
  cacheTimestamp = 0
}




