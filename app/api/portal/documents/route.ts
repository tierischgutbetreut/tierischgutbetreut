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
      return NextResponse.json({ documents: [] })
    }

    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ documents: data || [] })
  } catch (error: any) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: error.message || 'Fehler beim Laden der Dokumente' },
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

    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentType = formData.get('document_type') as string
    const petId = formData.get('pet_id') as string | null

    if (!file || !documentType) {
      return NextResponse.json(
        { error: 'Datei und Dokumenttyp sind erforderlich' },
        { status: 400 }
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

    // Upload zu Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${customer.id}/${documentType}/${Date.now()}.${fileExt}`
    const filePath = `customer-documents/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('customer-documents')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    // Erstelle Datenbank-Eintrag
    const { data, error: dbError } = await supabase
      .from('documents')
      .insert({
        customer_id: customer.id,
        pet_id: petId || null,
        document_type: documentType,
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
      })
      .select()
      .single()

    if (dbError) {
      throw dbError
    }

    return NextResponse.json({ document: data })
  } catch (error: any) {
    console.error('Error uploading document:', error)
    return NextResponse.json(
      { error: error.message || 'Fehler beim Hochladen des Dokuments' },
      { status: 500 }
    )
  }
}


