import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import type { Database } from '@/types/database'

type UserFile = Database['public']['Tables']['user_files']['Row']

export function useUserFiles() {
  const { user } = useAuth()
  const [files, setFiles] = useState<UserFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchFiles()
    } else {
      setFiles([])
      setLoading(false)
    }
  }, [user])

  const fetchFiles = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)
      
      console.log('Fetching files for user:', user.id)
      
      const { data, error } = await supabase
        .from('user_files')
        .select('*')
        .eq('user_id', user.id)
        .order('upload_date', { ascending: false })

      if (error) {
        console.error('Error fetching files:', error)
        throw error
      }

      console.log('Files fetched successfully:', data?.length || 0, 'files')
      setFiles(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      console.error('Fetch files error:', errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const updateFileDescription = async (fileId: string, description: string) => {
    if (!user) throw new Error('User not authenticated')

    try {
      console.log('Updating file description:', { fileId, description })
      
      const { data, error } = await supabase
        .from('user_files')
        .update({ description })
        .eq('id', fileId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating file description:', error)
        throw error
      }

      console.log('File description updated successfully')
      
      setFiles(prev => prev.map(file => 
        file.id === fileId ? data : file
      ))

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update description'
      console.error('Update file description error:', errorMessage)
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const getFilesByCategory = (category: UserFile['category']) => {
    return files.filter(file => file.category === category)
  }

  const getTotalFileSize = () => {
    return files.reduce((total, file) => total + file.file_size, 0)
  }

  const getFileCount = () => {
    return files.length
  }

  return {
    files,
    loading,
    error,
    fetchFiles,
    updateFileDescription,
    getFilesByCategory,
    getTotalFileSize,
    getFileCount,
    refetch: fetchFiles
  }
}