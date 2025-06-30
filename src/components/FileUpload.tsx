import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, Image, FileSpreadsheet, FileText, X, Plus, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { useFileUpload, UploadProgress } from '@/hooks/useFileUpload'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface FileUploadProps {
  onUploadComplete?: (files: any[]) => void
  maxFiles?: number
  maxSize?: number // in bytes
  acceptedFileTypes?: string[]
  className?: string
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const UploadProgressItem: React.FC<{ upload: UploadProgress }> = ({ upload }) => {
  return (
    <div className="flex items-center gap-3 p-3 bg-black/20 border border-white/10 rounded-lg">
      <div className="flex-shrink-0">
        {upload.status === 'uploading' || upload.status === 'processing' ? (
          <Loader2 className="size-4 animate-spin text-primary" />
        ) : upload.status === 'completed' ? (
          <CheckCircle className="size-4 text-green-400" />
        ) : (
          <AlertCircle className="size-4 text-red-400" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-white truncate">{upload.fileName}</p>
          <span className="text-xs text-white/60">
            {upload.status === 'uploading' ? `${upload.progress}%` : upload.status}
          </span>
        </div>
        
        {(upload.status === 'uploading' || upload.status === 'processing') && (
          <div className="w-full bg-white/10 rounded-full h-1.5">
            <div 
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${upload.progress}%` }}
            />
          </div>
        )}
        
        {upload.error && (
          <p className="text-xs text-red-400 mt-1">{upload.error}</p>
        )}
      </div>
    </div>
  )
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  maxFiles = 10,
  maxSize = 25 * 1024 * 1024, // 25MB default
  acceptedFileTypes = [
    'image/*',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'text/plain'
  ],
  className
}) => {
  const { uploads, isUploading, uploadMultipleFiles, clearUploads } = useFileUpload()
  const [descriptions, setDescriptions] = useState<{ [key: string]: string }>({})
  const [isOpen, setIsOpen] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    try {
      console.log('Starting upload for files:', acceptedFiles.map(f => f.name))
      
      const fileDescriptions = acceptedFiles.map(file => descriptions[file.name] || '')
      const uploadedFiles = await uploadMultipleFiles(acceptedFiles, fileDescriptions)
      
      console.log('Upload completed for files:', uploadedFiles.length)
      
      if (onUploadComplete) {
        onUploadComplete(uploadedFiles)
      }
      
      // Clear descriptions after upload
      setDescriptions({})
      
      // Close modal after successful upload
      setTimeout(() => {
        setIsOpen(false)
        clearUploads()
      }, 3000)
      
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }, [uploadMultipleFiles, descriptions, onUploadComplete, clearUploads])

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    fileRejections
  } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = []
      return acc
    }, {} as Record<string, string[]>),
    disabled: isUploading
  })

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="h-16 w-16 rounded-full bg-primary hover:bg-primary/80 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
        size="icon"
      >
        <Plus className="size-8" />
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black/90 border border-white/20 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Upload Financial Documents</h2>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="icon"
            className="text-white/60 hover:text-white"
          >
            <X className="size-5" />
          </Button>
        </div>

        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer",
            isDragActive && !isDragReject ? "border-primary bg-primary/10" : "border-white/20 hover:border-white/40",
            isDragReject ? "border-red-400 bg-red-400/10" : "",
            isUploading ? "opacity-50 cursor-not-allowed" : "",
            className
          )}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-primary/20 rounded-full">
              <Upload className="size-8 text-primary" />
            </div>
            
            {isDragActive ? (
              <div>
                <p className="text-lg font-medium text-white">
                  {isDragReject ? "Some files are not supported" : "Drop files here"}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium text-white mb-2">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-white/60 mb-4">
                  Supports bank statements, tax documents, investment portfolios, and more
                </p>
                <p className="text-xs text-white/40">
                  Maximum file size: {formatFileSize(maxSize)} • Up to {maxFiles} files
                </p>
              </div>
            )}
          </div>
        </div>

        {fileRejections.length > 0 && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
            <h3 className="text-sm font-medium text-red-200 mb-2">Some files were rejected:</h3>
            <ul className="text-xs text-red-300 space-y-1">
              {fileRejections.map(({ file, errors }) => (
                <li key={file.name}>
                  {file.name}: {errors.map(e => e.message).join(', ')}
                </li>
              ))}
            </ul>
          </div>
        )}

        {uploads.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Upload Progress</h3>
              {uploads.every(u => u.status === 'completed' || u.status === 'error') && (
                <Button
                  onClick={clearUploads}
                  variant="ghost"
                  size="sm"
                  className="text-white/60 hover:text-white"
                >
                  Clear
                </Button>
              )}
            </div>
            
            <div className="space-y-3">
              {uploads.map((upload, index) => (
                <UploadProgressItem key={`${upload.fileName}-${index}`} upload={upload} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="size-4 text-primary" />
            <span className="text-primary font-semibold text-sm">Secure Upload to Supabase</span>
          </div>
          <p className="text-white/70 text-xs">
            Your files are encrypted and stored securely in Supabase. Only you can access your financial documents.
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            onClick={() => setIsOpen(false)}
            variant="outline"
            disabled={isUploading}
            className="border-white/20 text-white hover:bg-white/10"
          >
            {isUploading ? 'Uploading...' : 'Close'}
          </Button>
        </div>
      </div>
    </div>
  )
}