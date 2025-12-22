import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Hole aktive Einstellungen
    const { data: settings, error: settingsError } = await supabase
      .from('newsbar_settings')
      .select('*')
      .eq('is_active', true)
      .single()

    if (settingsError || !settings) {
      return NextResponse.json({ settings: null, vacationDates: [] })
    }

    // Hole Ferienzeiten
    const { data: vacationDates, error: datesError } = await supabase
      .from('newsbar_vacation_dates')
      .select('*')
      .eq('settings_id', settings.id)
      .order('sort_order', { ascending: true })

    if (datesError) {
      console.error('Error fetching vacation dates:', datesError)
    }

    return NextResponse.json({
      settings,
      vacationDates: vacationDates || [],
    })
  } catch (error: any) {
    console.error('Error fetching newsbar:', error)
    return NextResponse.json(
      { error: error.message || 'Fehler beim Laden der NewsBar' },
      { status: 500 }
    )
  }
}

