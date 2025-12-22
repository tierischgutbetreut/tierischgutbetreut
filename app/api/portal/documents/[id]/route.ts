import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

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

    const documentId = params.id

    // Hole Document-Daten
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select('*, customer:customers!inner(user_id)')
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Dokument nicht gefunden' },
        { status: 404 }
      )
    }

    // Prüfe ob Dokument zum User gehört
    if (document.customer.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 403 }
      )
    }

    // Lösche aus Storage
    const { error: storageError } = await supabase.storage
      .from('customer-documents')
      .remove([document.file_path])

    if (storageError) {
      console.error('Storage delete error:', storageError)
      // Weiter mit DB-Löschung auch wenn Storage-Fehler
    }

    // Lösche aus Datenbank
    const { error: dbError } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)

    if (dbError) {
      throw dbError
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: error.message || 'Fehler beim Löschen des Dokuments' },
      { status: 500 }
    )
  }
}


