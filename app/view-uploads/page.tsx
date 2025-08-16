"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface UploadedFile {
  name: string
  id: string
  created_at: string
  publicUrl?: string
  fullPath?: string
  metadata?: {
    size?: number
    mimetype?: string
  }
}

export default function ViewUploadsPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUploads()
  }, [])

  const fetchUploads = async () => {
    try {
      setLoading(true)
      
      // Fetch uploads via API route
      const response = await fetch('/api/uploads')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch uploads')
      }

      // Get folders first
      const folders = result.files.filter((f: any) => f.name && !f.name.includes('.'))
      const allFiles: UploadedFile[] = []

      // For each folder, fetch its contents
      for (const folder of folders) {
        if (folder.name) {
          const folderResponse = await fetch(`/api/uploads?path=uploads/${folder.name}`)
          const folderResult = await folderResponse.json()
          
          if (folderResult.success && folderResult.files) {
            folderResult.files.forEach((file: any) => {
              if (file.name && !file.name.endsWith('/') && file.name.includes('.')) {
                allFiles.push({
                  ...file,
                  name: file.fullPath || `uploads/${folder.name}/${file.name}`,
                  publicUrl: file.publicUrl
                })
              }
            })
          }
        }
      }

      setFiles(allFiles)
    } catch (err) {
      console.error('Error fetching uploads:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch uploads')
    } finally {
      setLoading(false)
    }
  }

  const getPublicUrl = (file: UploadedFile) => {
    // Use the publicUrl from the API response if available
    if (file.publicUrl) return file.publicUrl
    
    // Fallback to constructing the URL
    const baseUrl = 'https://emfkmevuacunuqqvijlf.supabase.co/storage/v1/object/public/custom-uploads/'
    return baseUrl + file.name
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cyber-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-cyber-cyan animate-spin mx-auto mb-4" />
          <p className="text-white">Loading uploads...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cyber-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <Button onClick={fetchUploads} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cyber-black p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Uploaded Images</h1>
        
        {files.length === 0 ? (
          <Card className="bg-cyber-dark/60 border-cyber-cyan/30">
            <CardContent className="p-8 text-center">
              <p className="text-gray-400">No uploads found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {files.map((file) => (
              <Card key={file.id || file.name} className="bg-cyber-dark/60 border-cyber-cyan/30 overflow-hidden">
                <CardHeader className="p-4">
                  <CardTitle className="text-sm text-white truncate">
                    {file.name.split('/').pop()}
                  </CardTitle>
                  <p className="text-xs text-gray-400">
                    {new Date(file.created_at).toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="bg-cyber-dark rounded-lg overflow-hidden">
                    <img
                      src={getPublicUrl(file)}
                      alt={file.name}
                      className="w-full h-auto"
                      loading="lazy"
                    />
                  </div>
                  <div className="mt-2 space-y-1">
                    <a
                      href={getPublicUrl(file)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-cyber-cyan hover:text-cyber-pink transition-colors block truncate"
                    >
                      View Full Size →
                    </a>
                    {file.metadata?.size && (
                      <p className="text-xs text-gray-500">
                        Size: {(file.metadata.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        <div className="mt-8 text-center">
          <Button
            onClick={fetchUploads}
            variant="outline"
            className="border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/10"
          >
            Refresh
          </Button>
        </div>
      </div>
    </div>
  )
}