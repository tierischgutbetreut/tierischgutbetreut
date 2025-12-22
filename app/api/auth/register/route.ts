import { NextRequest, NextResponse } from 'next/server'
import { signUp } from '@/lib/auth'
import { getCurrentUser } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    const { email, password, token } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email und Passwort sind erforderlich' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Passwort muss mindestens 8 Zeichen lang sein' },
        { status: 400 }
      )
    }

    const { session, user } = await signUp(email, password)

    if (!session || !user) {
      return NextResponse.json(
        { error: 'Registrierung fehlgeschlagen' },
        { status: 400 }
      )
    }

    // Verknüpfe Customer mit User-Account (falls Onboarding-Token vorhanden)
    if (token && user) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      })

      // Finde Customer über Token
      const { data: tokenData } = await supabase
        .from('onboarding_tokens')
        .select('customer_id')
        .eq('token', token)
        .eq('used', false)
        .single()

      if (tokenData?.customer_id) {
        // Aktualisiere Customer: Setze user_id und Status auf "active"
        const { error: customerError } = await supabase
          .from('customers')
          .update({
            user_id: user.id,
            status: 'active',
            onboarding_completed: true,
          })
          .eq('id', tokenData.customer_id)
          .eq('email', email) // Sicherheitscheck: Email muss übereinstimmen

        if (customerError) {
          console.error('Fehler beim Verknüpfen des Customers:', customerError)
        }
      } else {
        // Fallback: Finde Customer über Email
        const { data: customer } = await supabase
          .from('customers')
          .select('id')
          .eq('email', email)
          .eq('status', 'pending')
          .single()

        if (customer) {
          const { error: customerError } = await supabase
            .from('customers')
            .update({
              user_id: user.id,
              status: 'active',
              onboarding_completed: true,
            })
            .eq('id', customer.id)

          if (customerError) {
            console.error('Fehler beim Verknüpfen des Customers:', customerError)
          }
        }
      }
    }

    // Hole User-Rolle
    const currentUser = await getCurrentUser()

    return NextResponse.json({
      success: true,
      user: currentUser,
      session,
    })
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: error.message || 'Fehler bei der Registrierung' },
      { status: 400 }
    )
  }
}


