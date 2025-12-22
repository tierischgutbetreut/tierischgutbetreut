import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }

    // Hole Customer-ID
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!customer) {
      return NextResponse.json({ pets: [] })
    }

    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ pets: data || [] })
  } catch (error: any) {
    console.error('Error fetching pets:', error)
    return NextResponse.json(
      { error: error.message || 'Fehler beim Laden der Tiere' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }

    // Hole Customer-ID
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!customer) {
      return NextResponse.json(
        { error: 'Kundenprofil nicht gefunden' },
        { status: 404 }
      )
    }

    const petData = await request.json()

    const { data, error } = await supabase
      .from('pets')
      .insert({
        customer_id: customer.id,
        ...petData,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ pet: data })
  } catch (error: any) {
    console.error('Error creating pet:', error)
    return NextResponse.json(
      { error: error.message || 'Fehler beim Erstellen des Tieres' },
      { status: 500 }
    )
  }
}


