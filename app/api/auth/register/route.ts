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
      // Verwende Service Role Key für Updates, um RLS zu umgehen
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })

      // Finde Customer über Token
      const { data: tokenData, error: tokenError } = await supabaseAdmin
        .from('onboarding_tokens')
        .select('customer_id')
        .eq('token', token)
        .eq('used', false)
        .single()

      if (tokenError) {
        console.error('Fehler beim Laden des Tokens:', tokenError)
      }

      if (tokenData?.customer_id) {
        // Aktualisiere Customer: Setze user_id und Status auf "active"
        // onboarding_completed bleibt false bis der User sein Profil ausgefüllt hat
        const { data: updatedCustomer, error: customerError } = await supabaseAdmin
          .from('customers')
          .update({
            user_id: user.id,
            status: 'active',
            onboarding_completed: false,
          })
          .eq('id', tokenData.customer_id)
          .eq('email', email) // Sicherheitscheck: Email muss übereinstimmen
          .select()
          .single()

        if (customerError) {
          console.error('Fehler beim Verknüpfen des Customers:', customerError)
          console.error('Customer ID:', tokenData.customer_id)
          console.error('User ID:', user.id)
          console.error('Email:', email)
          // Wir werfen den Fehler nicht, damit die Registrierung trotzdem erfolgreich ist
        } else {
          console.log('Customer erfolgreich verknüpft:', updatedCustomer?.id)
        }
      } else {
        // Fallback: Finde Customer über Email
        const { data: customer, error: customerFindError } = await supabaseAdmin
          .from('customers')
          .select('id, email')
          .eq('email', email)
          .eq('status', 'pending')
          .single()

        if (customerFindError) {
          console.error('Fehler beim Finden des Customers:', customerFindError)
        }

        if (customer) {
          const { data: updatedCustomer, error: customerError } = await supabaseAdmin
            .from('customers')
            .update({
              user_id: user.id,
              status: 'active',
              onboarding_completed: false,
            })
            .eq('id', customer.id)
            .select()
            .single()

          if (customerError) {
            console.error('Fehler beim Verknüpfen des Customers (Fallback):', customerError)
            console.error('Customer ID:', customer.id)
            console.error('User ID:', user.id)
          } else {
            console.log('Customer erfolgreich verknüpft (Fallback):', updatedCustomer?.id)
          }
        } else {
          console.warn('Kein Customer gefunden für Email:', email)
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


