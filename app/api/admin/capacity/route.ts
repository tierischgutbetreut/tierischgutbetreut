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

    const { data: settings, error } = await supabase
      .from('capacity_settings')
      .select('*')
      .order('service_type', { ascending: true, nullsFirst: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ settings: settings || [] })
  } catch (error: any) {
    console.error('Error fetching capacity settings:', error)
    return NextResponse.json(
      { error: error.message || 'Fehler beim Laden der Kapazitäten' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { client: supabase, accessToken } = getServerClient(request)
    const authError = await checkAdminAuth(supabase, accessToken)
    
    if (authError) {
      return NextResponse.json(
        { error: authError.error },
        { status: authError.status }
      )
    }

    const { settings } = await request.json()

    if (!Array.isArray(settings)) {
      return NextResponse.json(
        { error: 'Ungültiges Format' },
        { status: 400 }
      )
    }

    // Upsert alle Settings
    const results = []
    for (const setting of settings) {
      const { service_type, default_capacity } = setting

      if (default_capacity === undefined || default_capacity < 1) {
        return NextResponse.json(
          { error: 'Ungültige Kapazität' },
          { status: 400 }
        )
      }

      const { data, error } = await supabase
        .from('capacity_settings')
        .upsert(
          {
            service_type: service_type || null,
            default_capacity,
          },
          {
            onConflict: 'service_type',
          }
        )
        .select()
        .single()

      if (error) {
        throw error
      }

      results.push(data)
    }

    return NextResponse.json({ settings: results })
  } catch (error: any) {
    console.error('Error updating capacity settings:', error)
    return NextResponse.json(
      { error: error.message || 'Fehler beim Aktualisieren der Kapazitäten' },
      { status: 500 }
    )
  }
}

