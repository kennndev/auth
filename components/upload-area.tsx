"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Upload, FileImage, AlertCircle, Info, CheckCircle } from "lucide-react"

interface UploadAreaProps {
  onFileUpload: (file: File) => void
  disabled?: boolean
  isUploading?: boolean
  uploadProgress?: number
  fileName?: string
  fileSize?: string
  uploadedImage?: string | null
}

export function UploadArea({ 
  onFileUpload, 
  disabled = false,
  isUploading = false,
  uploadProgress = 0,
  fileName = "",
  fileSize = "",
  uploadedImage = null
}: UploadAreaProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"]

    if (!allowedTypes.includes(file.type)) {
      return "Please upload a PNG, JPG, or WebP image file"
    }

    if (file.size > maxSize) {
      return "File size must be less than 10MB"
    }

    return null
  }

  const handleFile = useCallback(
    (file: File) => {
      if (disabled) return

      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      setError(null)
      onFileUpload(file)
    },
    [onFileUpload, disabled],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleFile(files[0])
      }
    },
    [handleFile],
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled) {
        setIsDragOver(true)
      }
    },
    [disabled],
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFile(files[0])
      }
    },
    [handleFile],
  )

  return (
    <div className="flex flex-col gap-4 h-full">
      <div
        className={`relative border-2 border-dashed rounded-lg py-8 px-6 sm:px-8 text-center transition-all duration-300 flex-1 flex items-center justify-center min-h-[160px] ${
          isDragOver
            ? "border-cyber-cyan bg-cyber-cyan/5 shadow-lg shadow-cyber-cyan/20"
            : "border-cyber-cyan/30 hover:border-cyber-cyan/50"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && document.getElementById("file-input")?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />

        <div className="space-y-4">
          <div className="w-16 h-16 bg-cyber-cyan/20 rounded-full flex items-center justify-center mx-auto">
            <Upload className="w-8 h-8 text-cyber-cyan" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-2 tracking-wider">
              {isDragOver ? "Drop your image here" : "Drag & drop your artwork"}
            </h3>
            <p className="text-gray-400 mb-4">or click to browse files</p>
          </div>

          <Button
            type="button"
            disabled={disabled}
            className="bg-cyber-dark border-2 border-cyber-pink text-cyber-pink hover:bg-cyber-pink/10 hover:shadow-lg hover:shadow-cyber-pink/20 tracking-wider"
            onClick={(e) => {
              e.stopPropagation()
              if (!disabled) {
                document.getElementById("file-input")?.click()
              }
            }}
          >
            <FileImage className="w-4 h-4 mr-2" />
            Choose File
          </Button>
        </div>
      </div>

      {/* File Requirements */}
      <div className="text-center text-xs text-gray-400">
        <p className="tracking-wide">
          <span className="whitespace-nowrap">PNG, JPG • Max: 10MB</span>
          <span className="mx-2 hidden sm:inline">•</span>
          <span className="block sm:inline">5:7 ratio works best</span>
        </p>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="text-gray-300 tracking-wide break-all">Uploading {fileName}</span>
            <span className="text-cyber-cyan tracking-wide flex-shrink-0">{uploadProgress}%</span>
          </div>
          <Progress 
            value={uploadProgress} 
            className="h-2 bg-cyber-darker [&>div]:bg-gradient-to-r [&>div]:from-cyber-cyan [&>div]:to-cyber-pink" 
          />
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <FileImage className="w-4 h-4 flex-shrink-0" />
            <span className="tracking-wide">{fileSize}</span>
          </div>
        </div>
      )}

      {/* Upload Success */}
      {uploadedImage && uploadedImage !== "/example-card_cardify.webp" && !isUploading && (
        <div className="p-4 bg-cyber-green/10 border border-cyber-green/30 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-cyber-green flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-cyber-green font-bold tracking-wide">Upload Successful!</p>
              <p className="text-sm text-gray-300 tracking-wide break-all">
                {fileName} • {fileSize}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-cyber-red/10 border border-cyber-red/30 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-cyber-red flex-shrink-0" />
            <p className="text-cyber-red font-bold tracking-wide break-all">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
