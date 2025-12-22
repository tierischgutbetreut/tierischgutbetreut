import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

import type { Testimonial } from './types'

// Functions for testimonials
export const getPublishedTestimonials = async (): Promise<Testimonial[]> => {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_published', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching testimonials:', error)
    return []
  }

  return data || []
}

export const getAllTestimonials = async (): Promise<Testimonial[]> => {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching all testimonials:', error)
    return []
  }

  return data || []
}

export const createTestimonial = async (testimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>): Promise<Testimonial | null> => {
  const { data, error } = await supabase
    .from('testimonials')
    .insert(testimonial)
    .select()
    .single()

  if (error) {
    console.error('Error creating testimonial:', error)
    return null
  }

  return data
}

export const updateTestimonial = async (id: string, updates: Partial<Testimonial>): Promise<Testimonial | null> => {
  const { data, error } = await supabase
    .from('testimonials')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating testimonial:', error)
    return null
  }

  return data
}

export const deleteTestimonial = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('testimonials')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting testimonial:', error)
    return false
  }

  return true
} 