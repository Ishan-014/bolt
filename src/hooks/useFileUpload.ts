import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import type { Database } from '@/types/database'

type UserFile = Database['public']['Tables']['user_files']['Row']

export interface UploadProgress {
  fileName: string
  progress: number
  status: 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
}

export function useFileUpload() {
  const { user } = useAuth()
  const [uploads, setUploads] = useState<UploadProgress[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const getFileCategory = (fileType: string): 'document' | 'image' | 'spreadsheet' | 'other' => {
    if (fileType.startsWith('image/')) return 'image'
    if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType.includes('csv')) return 'spreadsheet'
    if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('text')) return 'document'
    return 'other'
  }

  const uploadFile = async (file: File, description?: string): Promise<UserFile> => {
    if (!user) throw new Error('User not authenticated')

    const fileName = file.name
    const fileType = file.type
    const fileSize = file.size
    const category = getFileCategory(fileType)
    
    // Create unique file path with user ID folder structure
    const timestamp = Date.now()
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const storagePath = `${user.id}/${timestamp}_${sanitizedFileName}`

    console.log('Starting file upload:', {
      fileName,
      fileType,
      fileSize,
      category,
      storagePath
    })

    // Initialize upload progress
    setUploads(prev => [...prev, {
      fileName,
      progress: 0,
      status: 'uploading'
    }])
    setIsUploading(true)

    try {
      // Update progress to 10%
      setUploads(prev => prev.map(upload => 
        upload.fileName === fileName 
          ? { ...upload, progress: 10 }
          : upload
      ))

      // Upload file to Supabase storage
      console.log('Uploading to Supabase storage...')
      const { data: storageData, error: storageError } = await supabase.storage
        .from('user-files')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (storageError) {
        console.error('Storage upload error:', storageError)
        throw new Error(`Upload failed: ${storageError.message}`)
      }

      console.log('File uploaded to storage successfully:', storageData)

      // Update progress to 70%
      setUploads(prev => prev.map(upload => 
        upload.fileName === fileName 
          ? { ...upload, progress: 70, status: 'processing' }
          : upload
      ))

      // Save file metadata to database
      console.log('Saving file metadata to database...')
      const { data: fileData, error: dbError } = await supabase
        .from('user_files')
        .insert({
          user_id: user.id,
          file_name: fileName,
          file_type: fileType,
          file_size: fileSize,
          storage_path: storagePath,
          description: description || null,
          category,
          is_processed: false
        })
        .select()
        .single()

      if (dbError) {
        console.error('Database insert error:', dbError)
        // Clean up uploaded file if database insert fails
        await supabase.storage.from('user-files').remove([storagePath])
        throw new Error(`Database error: ${dbError.message}`)
      }

      console.log('File metadata saved successfully:', fileData)

      // Update progress to completed
      setUploads(prev => prev.map(upload => 
        upload.fileName === fileName 
          ? { ...upload, progress: 100, status: 'completed' }
          : upload
      ))

      return fileData

    } catch (error) {
      console.error('Upload error:', error)
      // Update progress to error
      setUploads(prev => prev.map(upload => 
        upload.fileName === fileName 
          ? { 
              ...upload, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Upload failed' 
            }
          : upload
      ))
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const uploadMultipleFiles = async (files: File[], descriptions?: string[]): Promise<UserFile[]> => {
    const results: UserFile[] = []
    
    for (let i = 0; i < files.length; i++) {
      try {
        const result = await uploadFile(files[i], descriptions?.[i])
        results.push(result)
      } catch (error) {
        console.error(`Failed to upload ${files[i].name}:`, error)
        // Continue with other files even if one fails
      }
    }
    
    return results
  }

  const deleteFile = async (fileId: string, storagePath: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated')

    try {
      console.log('Deleting file:', { fileId, storagePath })

      // Delete from storage first
      const { error: storageError } = await supabase.storage
        .from('user-files')
        .remove([storagePath])

      if (storageError) {
        console.error('Storage deletion error:', storageError)
        // Continue with database deletion even if storage fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('user_files')
        .delete()
        .eq('id', fileId)
        .eq('user_id', user.id)

      if (dbError) {
        console.error('Database deletion error:', dbError)
        throw new Error(`Failed to delete file record: ${dbError.message}`)
      }

      console.log('File deleted successfully')

    } catch (error) {
      console.error('Delete file error:', error)
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const getFileUrl = async (storagePath: string): Promise<string> => {
    try {
      console.log('Generating signed URL for:', storagePath)
      
      const { data, error } = await supabase.storage
        .from('user-files')
        .createSignedUrl(storagePath, 3600) // 1 hour expiry

      if (error) {
        console.error('URL generation error:', error)
        throw new Error(`Failed to generate file URL: ${error.message}`)
      }

      if (!data?.signedUrl) {
        throw new Error('No signed URL returned')
      }
      
      console.log('Signed URL generated successfully')
      return data.signedUrl
    } catch (error) {
      console.error('Get file URL error:', error)
      throw error
    }
  }

  const clearUploads = () => {
    setUploads([])
  }

  return {
    uploads,
    isUploading,
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    getFileUrl,
    clearUploads
  }
}