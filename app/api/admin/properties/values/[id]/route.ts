import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServerClient(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const projectRef = supabaseUrl.split('//')[1]?.split('.')[0] || 'default'
  const cookieName = `sb-${projectRef}-auth-token`
  
  const authCookie = request.cookies.get(cookieName)?.value
  let accessToken: string | undefined

  if (authCookie) {
    try {
      const sessionData = JSON.parse(decodeURIComponent(authCookie))
      accessToken = sessionData.access_token
    } catch (e) {
      accessToken = authCookie
    }
  }

  if (!accessToken) {
    const authHeader = request.headers.get('authorization')
    accessToken = authHeader?.replace('Bearer ', '')
  }

  if (!accessToken) {
    accessToken = request.cookies.get('sb-access-token')?.value
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: accessToken ? {
        Authorization: `Bearer ${accessToken}`,
      } : {},
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  return { client, accessToken }
}

async function checkAdminAuth(supabase: any, accessToken: string | undefined) {
  if (!accessToken) {
    return { error: 'Nicht autorisiert - Keine Session gefunden', status: 401 }
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Nicht autorisiert', status: 401 }
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userError || !userData || userData.role !== 'admin') {
    return { error: 'Nicht autorisiert', status: 403 }
  }

  return null
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { client: supabase, accessToken } = getServerClient(request)
    const authError = await checkAdminAuth(supabase, accessToken)
    
    if (authError) {
      return NextResponse.json(
        { error: authError.error },
        { status: authError.status }
      )
    }

    const { id } = params
    const body = await request.json()
    const { value } = body

    // Hole Property Value um Feldtyp zu bestimmen
    const { data: propertyValue, error: valueError } = await supabase
      .from('property_values')
      .select(`
        *,
        property_definition:property_definitions(*)
      `)
      .eq('id', id)
      .single()

    if (valueError || !propertyValue) {
      return NextResponse.json(
        { error: 'Eigenschafts-Wert nicht gefunden' },
        { status: 404 }
      )
    }

    const definition = propertyValue.property_definition
    if (!definition) {
      return NextResponse.json(
        { error: 'Eigenschafts-Definition nicht gefunden' },
        { status: 404 }
      )
    }

    // Bereite Wert basierend auf Feldtyp vor
    const updateData: any = {}

    switch (definition.field_type) {
      case 'text':
      case 'textarea':
        updateData.value_text = value !== undefined ? value : null
        updateData.value_number = null
        updateData.value_date = null
        updateData.value_boolean = null
        break
      case 'number':
        updateData.value_number = value !== null && value !== undefined ? parseFloat(value) : null
        updateData.value_text = null
        updateData.value_date = null
        updateData.value_boolean = null
        break
      case 'date':
        updateData.value_date = value || null
        updateData.value_text = null
        updateData.value_number = null
        updateData.value_boolean = null
        break
      case 'checkbox':
        updateData.value_boolean = value === true || value === 'true' || value === 1
        updateData.value_text = null
        updateData.value_number = null
        updateData.value_date = null
        break
      case 'select':
        updateData.value_text = value || null
        updateData.value_number = null
        updateData.value_date = null
        updateData.value_boolean = null
        break
      default:
        return NextResponse.json(
          { error: 'Ungültiger Feldtyp' },
          { status: 400 }
        )
    }

    const { data, error } = await supabase
      .from('property_values')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        property_definition:property_definitions(*)
      `)
      .single()

    if (error) {
      throw error
    }

    // Parse options
    if (data.property_definition) {
      data.property_definition.options = Array.isArray(data.property_definition.options)
        ? data.property_definition.options
        : (data.property_definition.options ? JSON.parse(data.property_definition.options) : [])
    }

    return NextResponse.json({ value: data })
  } catch (error: any) {
    console.error('Error updating property value:', error)
    return NextResponse.json(
      { error: error.message || 'Fehler beim Aktualisieren des Eigenschafts-Wertes' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { client: supabase, accessToken } = getServerClient(request)
    const authError = await checkAdminAuth(supabase, accessToken)
    
    if (authError) {
      return NextResponse.json(
        { error: authError.error },
        { status: authError.status }
      )
    }

    const { id } = params

    const { error } = await supabase
      .from('property_values')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting property value:', error)
    return NextResponse.json(
      { error: error.message || 'Fehler beim Löschen des Eigenschafts-Wertes' },
      { status: 500 }
    )
  }
}

