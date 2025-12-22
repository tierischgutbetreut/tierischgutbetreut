import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }

    const petId = params.id
    const updates = await request.json()

    // Prüfe ob Pet zum User gehört
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

    const { data, error } = await supabase
      .from('pets')
      .update(updates)
      .eq('id', petId)
      .eq('customer_id', customer.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Tier nicht gefunden' },
        { status: 404 }
      )
    }

    return NextResponse.json({ pet: data })
  } catch (error: any) {
    console.error('Error updating pet:', error)
    return NextResponse.json(
      { error: error.message || 'Fehler beim Aktualisieren des Tieres' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }

    const petId = params.id

    // Prüfe ob Pet zum User gehört
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

    const { error } = await supabase
      .from('pets')
      .delete()
      .eq('id', petId)
      .eq('customer_id', customer.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting pet:', error)
    return NextResponse.json(
      { error: error.message || 'Fehler beim Löschen des Tieres' },
      { status: 500 }
    )
  }
}


