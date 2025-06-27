import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import type { Database } from '@/types/database'

type Conversation = Database['public']['Tables']['conversations']['Row']
type ConversationInsert = Database['public']['Tables']['conversations']['Insert']
type ConversationUpdate = Database['public']['Tables']['conversations']['Update']
type ConversationMessage = Database['public']['Tables']['conversation_messages']['Row']
type ConversationMessageInsert = Database['public']['Tables']['conversation_messages']['Insert']

export function useConversations() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchConversations()
    } else {
      setConversations([])
      setLoading(false)
    }
  }, [user])

  const fetchConversations = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setConversations(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createConversation = async (conversationData: Omit<ConversationInsert, 'user_id'>) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          ...conversationData,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error

      setConversations(prev => [data, ...prev])
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create conversation'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const updateConversation = async (id: string, updates: ConversationUpdate) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const { data, error } = await supabase
        .from('conversations')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      setConversations(prev => 
        prev.map(conv => conv.id === id ? data : conv)
      )
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update conversation'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const addMessage = async (conversationId: string, messageData: Omit<ConversationMessageInsert, 'conversation_id'>) => {
    try {
      const { data, error } = await supabase
        .from('conversation_messages')
        .insert({
          ...messageData,
          conversation_id: conversationId,
        })
        .select()
        .single()

      if (error) throw error

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add message'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const getConversationMessages = async (conversationId: string): Promise<ConversationMessage[]> => {
    try {
      const { data, error } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true })

      if (error) throw error

      return data || []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch messages'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  return {
    conversations,
    loading,
    error,
    createConversation,
    updateConversation,
    addMessage,
    getConversationMessages,
    refetch: fetchConversations,
  }
}