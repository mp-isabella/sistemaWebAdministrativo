"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, Upload, X, Eye } from 'lucide-react'
import Image from "next/image"

interface ImageUploadProps {
  jobId: string
  existingImages?: string[]
  onImagesUploaded: (images: string[]) => void
  disabled?: boolean
  maxImages?: number
  onCancel?: () => void // <-- aquí
}

export default function ImageUpload({ 
  jobId, 
  existingImages = [], 
  onImagesUploaded, 
  disabled = false,
  maxImages = 10 
}: ImageUploadProps) {
  const [images, setImages] = useState<string[]>(existingImages)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    if (images.length + files.length > maxImages) {
      setError(`Máximo ${maxImages} imágenes permitidas`)
      return
    }

    setUploading(true)
    setError("")

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} no es una imagen válida`)
        }

        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} es muy grande (máximo 5MB)`)
        }

        const formData = new FormData()
        formData.append('file', file)
        formData.append('jobId', jobId)

        const response = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al subir imagen')
        }

        const data = await response.json()
        return data.imageUrl
      })

      const uploadedImages = await Promise.all(uploadPromises)
      const newImages = [...images, ...uploadedImages]
      
      setImages(newImages)
      onImagesUploaded(uploadedImages)
    } catch (error) {
      console.error('Error uploading images:', error)
      setError(error instanceof Error ? error.message : 'Error al subir imágenes')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
    // Aquí podrías llamar a una API para eliminar la imagen del servidor
  }

  const openCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment')
      fileInputRef.current.click()
    }
  }

  const openGallery = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture')
      fileInputRef.current.click()
    }
  }

  return (
    <div className="space-y-4">
      {/* Botones de carga */}
      {!disabled && images.length < maxImages && (
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={openCamera}
            disabled={uploading}
            className="flex-1"
          >
            <Camera className="mr-2 h-4 w-4" />
            Tomar Foto
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={openGallery}
            disabled={uploading}
            className="flex-1"
          >
            <Upload className="mr-2 h-4 w-4" />
            Subir Imagen
          </Button>
        </div>
      )}

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Estado de carga */}
      {uploading && (
        <Alert>
          <AlertDescription>Subiendo imágenes...</AlertDescription>
        </Alert>
      )}

      {/* Errores */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Grid de imágenes */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((imageUrl, index) => (
            <Card key={index} className="relative group">
              <CardContent className="p-2">
                <div className="relative aspect-square">
                  <Image
                    src={imageUrl || "/placeholder.svg"}
                    alt={`Imagen ${index + 1}`}
                    fill
                    className="object-cover rounded"
                  />
                  
                  {/* Overlay con botones */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedImage(imageUrl)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {!disabled && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Contador */}
      <div className="text-sm text-gray-500 text-center">
        {images.length} de {maxImages} imágenes
      </div>

      {/* Modal de imagen ampliada */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 z-10"
            >
              <X className="h-4 w-4" />
            </Button>
            <Image
              src={selectedImage || "/placeholder.svg"}
              alt="Imagen ampliada"
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}
