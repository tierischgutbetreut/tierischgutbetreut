import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { PropertyDefinition } from '@/lib/types'

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

export async function GET(request: NextRequest) {
  try {
    const { client: supabase, accessToken } = getServerClient(request)
    const authError = await checkAdminAuth(supabase, accessToken)
    
    if (authError) {
      return NextResponse.json(
        { error: authError.error },
        { status: authError.status }
      )
    }

    const { searchParams } = new URL(request.url)
    const appliesTo = searchParams.get('applies_to')

    let query = supabase
      .from('property_definitions')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (appliesTo) {
      query = query.contains('applies_to', [appliesTo])
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    // Parse options JSONB to array
    const definitions = (data || []).map((def: any) => ({
      ...def,
      options: Array.isArray(def.options) ? def.options : (def.options ? JSON.parse(def.options) : [])
    }))

    return NextResponse.json({ definitions })
  } catch (error: any) {
    console.error('Error fetching property definitions:', error)
    return NextResponse.json(
      { error: error.message || 'Fehler beim Laden der Eigenschafts-Definitionen' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { client: supabase, accessToken } = getServerClient(request)
    const authError = await checkAdminAuth(supabase, accessToken)
    
    if (authError) {
      return NextResponse.json(
        { error: authError.error },
        { status: authError.status }
      )
    }

    const body = await request.json()
    const { name, label, field_type, options, required, applies_to, sort_order } = body

    if (!name || !label || !field_type) {
      return NextResponse.json(
        { error: 'Name, Label und Feldtyp sind erforderlich' },
        { status: 400 }
      )
    }

    // Validierung
    const validFieldTypes = ['text', 'number', 'date', 'select', 'checkbox', 'textarea']
    if (!validFieldTypes.includes(field_type)) {
      return NextResponse.json(
        { error: 'Ungültiger Feldtyp' },
        { status: 400 }
      )
    }

    // Für select-Felder müssen Optionen vorhanden sein
    if (field_type === 'select' && (!options || !Array.isArray(options) || options.length === 0)) {
      return NextResponse.json(
        { error: 'Select-Felder benötigen mindestens eine Option' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('property_definitions')
      .insert({
        name,
        label,
        field_type,
        options: options ? JSON.stringify(options) : '[]',
        required: required || false,
        applies_to: applies_to || ['lead', 'customer'],
        sort_order: sort_order || 0,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Parse options
    const definition = {
      ...data,
      options: Array.isArray(data.options) ? data.options : (data.options ? JSON.parse(data.options) : [])
    }

    return NextResponse.json({ definition })
  } catch (error: any) {
    console.error('Error creating property definition:', error)
    return NextResponse.json(
      { error: error.message || 'Fehler beim Erstellen der Eigenschafts-Definition' },
      { status: 500 }
    )
  }
}

