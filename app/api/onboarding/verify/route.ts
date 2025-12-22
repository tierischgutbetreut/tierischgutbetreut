import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { token, markAsUsed } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token ist erforderlich' },
        { status: 400 }
      )
    }

    // Hole Token-Daten mit Customer
    const { data: tokenData, error: tokenError } = await supabase
      .from('onboarding_tokens')
      .select('*, customer:customers(*)')
      .eq('token', token)
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: 'Ungültiger Token' },
        { status: 404 }
      )
    }

    // Prüfe ob Token bereits verwendet wurde
    if (tokenData.used) {
      return NextResponse.json(
        { error: 'Token wurde bereits verwendet' },
        { status: 400 }
      )
    }

    // Prüfe Ablaufdatum
    const expiresAt = new Date(tokenData.expires_at)
    const now = new Date()

    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Token ist abgelaufen' },
        { status: 400 }
      )
    }

    // Markiere Token als verwendet wenn gewünscht
    if (markAsUsed) {
      await supabase
        .from('onboarding_tokens')
        .update({
          used: true,
          used_at: new Date().toISOString(),
        })
        .eq('id', tokenData.id)
    }

    return NextResponse.json({
      valid: true,
      token: tokenData,
      customer: tokenData.customer,
      // Für Kompatibilität mit Frontend
      lead: tokenData.customer ? {
        id: tokenData.customer.id,
        name: tokenData.customer.nachname,
        vorname: tokenData.customer.vorname,
        email: tokenData.customer.email,
        phone: tokenData.customer.telefonnummer,
      } : null,
    })
  } catch (error: any) {
    console.error('Error verifying token:', error)
    return NextResponse.json(
      { error: error.message || 'Fehler bei der Token-Validierung' },
      { status: 500 }
    )
  }
}
