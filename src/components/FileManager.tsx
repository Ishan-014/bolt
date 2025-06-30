import React, { useState } from 'react'
import { useUserFiles } from '@/hooks/useUserFiles'
import { useFileUpload } from '@/hooks/useFileUpload'
import { 
  File, 
  Image, 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Trash2, 
  Edit3,
  Calendar,
  HardDrive,
  Search,
  Filter,
  MoreVertical,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getFileIcon = (fileType: string, className?: string) => {
  const iconClass = cn("size-5", className)
  
  if (fileType.startsWith('image/')) return <Image className={iconClass} />
  if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType.includes('csv')) 
    return <FileSpreadsheet className={iconClass} />
  if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('text')) 
    return <FileText className={iconClass} />
  return <File className={iconClass} />
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'image': return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
    case 'document': return 'text-green-400 bg-green-400/10 border-green-400/20'
    case 'spreadsheet': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
    default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
  }
}

interface FileManagerProps {
  className?: string
}

export const FileManager: React.FC<FileManagerProps> = ({ className }) => {
  const { files, loading, error, updateFileDescription, refetch } = useUserFiles()
  const { deleteFile, getFileUrl } = useFileUpload()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [editingFile, setEditingFile] = useState<string | null>(null)
  const [editDescription, setEditDescription] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (file.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refetch()
    } catch (error) {
      console.error('Failed to refresh files:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleDownload = async (file: any) => {
    try {
      console.log('Downloading file:', file.file_name)
      const url = await getFileUrl(file.storage_path)
      const link = document.createElement('a')
      link.href = url
      link.download = file.file_name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      console.log('Download initiated successfully')
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download file. Please try again.')
    }
  }

  const handleDelete = async (file: any) => {
    if (confirm(`Are you sure you want to delete "${file.file_name}"?`)) {
      try {
        console.log('Deleting file:', file.file_name)
        await deleteFile(file.id, file.storage_path)
        // Refresh the files list
        await refetch()
        console.log('File deleted successfully')
      } catch (error) {
        console.error('Delete failed:', error)
        alert('Failed to delete file. Please try again.')
      }
    }
  }

  const handleEditDescription = (file: any) => {
    setEditingFile(file.id)
    setEditDescription(file.description || '')
  }

  const handleSaveDescription = async (fileId: string) => {
    try {
      await updateFileDescription(fileId, editDescription)
      setEditingFile(null)
      setEditDescription('')
    } catch (error) {
      console.error('Failed to update description:', error)
      alert('Failed to update description. Please try again.')
    }
  }

  const handleCancelEdit = () => {
    setEditingFile(null)
    setEditDescription('')
  }

  if (loading) {
    return (
      <div className={cn("p-6", className)}>
        <div className="flex items-center justify-center py-12">
          <div className="text-white/60">Loading files...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("p-6", className)}>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-red-400 mb-4">Error loading files: {error}</div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="size-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const totalSize = files.reduce((sum, file) => sum + file.file_size, 0)
  const categories = ['all', 'document', 'image', 'spreadsheet', 'other']

  return (
    <div className={cn("p-6", className)}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white">File Manager</h2>
          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            disabled={isRefreshing}
            className="text-white/60 hover:text-white"
          >
            <RefreshCw className={cn("size-4", isRefreshing && "animate-spin")} />
          </Button>
        </div>
        <div className="flex items-center gap-4 text-sm text-white/60">
          <div className="flex items-center gap-1">
            <File className="size-4" />
            <span>{files.length} files</span>
          </div>
          <div className="flex items-center gap-1">
            <HardDrive className="size-4" />
            <span>{formatFileSize(totalSize)} used</span>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 size-4" />
          <Input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-black/20 border-white/10 text-white placeholder-white/40"
          />
        </div>
        
        <div className="flex gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              onClick={() => setSelectedCategory(category)}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              className={cn(
                "capitalize",
                selectedCategory === category 
                  ? "bg-primary text-white" 
                  : "bg-black/20 border-white/10 text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Files List */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <File className="size-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-lg mb-2">
            {searchTerm || selectedCategory !== 'all' ? 'No files match your search' : 'No files uploaded yet'}
          </p>
          <p className="text-white/30 text-sm">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'Upload your first file to get started'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFiles.map((file) => (
            <div key={file.id} className="bg-black/20 border border-white/10 rounded-lg p-4 hover:bg-black/30 transition-all duration-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 p-2 bg-white/5 rounded-lg">
                  {getFileIcon(file.file_type, "text-primary")}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate">{file.file_name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-white/60">
                        <span className={`px-2 py-1 rounded-full border ${getCategoryColor(file.category)}`}>
                          {file.category}
                        </span>
                        <span>{formatFileSize(file.file_size)}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {formatDate(file.upload_date)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-4">
                      <Button
                        onClick={() => handleDownload(file)}
                        variant="ghost"
                        size="sm"
                        className="text-white/60 hover:text-white p-2"
                        title="Download file"
                      >
                        <Download className="size-4" />
                      </Button>
                      <Button
                        onClick={() => handleEditDescription(file)}
                        variant="ghost"
                        size="sm"
                        className="text-white/60 hover:text-white p-2"
                        title="Edit description"
                      >
                        <Edit3 className="size-4" />
                      </Button>
                      <Button
                        onClick={() => handleDelete(file)}
                        variant="ghost"
                        size="sm"
                        className="text-white/60 hover:text-red-400 p-2"
                        title="Delete file"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {editingFile === file.id ? (
                    <div className="mt-3">
                      <Input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Add a description..."
                        className="mb-2 bg-black/20 border-white/10 text-white placeholder-white/40"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSaveDescription(file.id)}
                          size="sm"
                          className="bg-primary hover:bg-primary/80"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          variant="outline"
                          size="sm"
                          className="border-white/20 text-white/60 hover:text-white"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : file.description ? (
                    <p className="text-sm text-white/70 mt-2">{file.description}</p>
                  ) : (
                    <p className="text-sm text-white/40 mt-2 italic">No description</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}