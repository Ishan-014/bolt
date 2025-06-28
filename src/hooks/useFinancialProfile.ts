import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import type { Database } from '@/types/database'

type FinancialProfile = Database['public']['Tables']['financial_profiles']['Row']
type FinancialProfileInsert = Database['public']['Tables']['financial_profiles']['Insert']
type FinancialProfileUpdate = Database['public']['Tables']['financial_profiles']['Update']

export function useFinancialProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<FinancialProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchProfile()
    } else {
      setProfile(null)
      setLoading(false)
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('financial_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        throw error
      }

      setProfile(data || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createProfile = async (profileData: Omit<FinancialProfileInsert, 'user_id'>) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const { data, error } = await supabase
        .from('financial_profiles')
        .insert({
          ...profileData,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create profile'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const updateProfile = async (updates: FinancialProfileUpdate) => {
    if (!user || !profile) throw new Error('User not authenticated or profile not found')

    try {
      const { data, error } = await supabase
        .from('financial_profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      setProfile(data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  return {
    profile,
    loading,
    error,
    createProfile,
    updateProfile,
    refetch: fetchProfile,
  }
}