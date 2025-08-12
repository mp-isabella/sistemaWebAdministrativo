"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Pen, RotateCcw, Check, X } from 'lucide-react'

interface DigitalSignatureProps {
  jobId: string
  existingSignature?: string | null
  onSignatureSaved: (signature: string) => void
  disabled?: boolean
  onCancel?: () => void // ✅ agrega esto
}

export default function DigitalSignature({ 
  jobId, 
  existingSignature, 
  onSignatureSaved, 
  disabled = false 
}: DigitalSignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(!!existingSignature)
  const [signatureData, setSignatureData] = useState<string | null>(existingSignature || null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Configurar canvas
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Si hay firma existente, cargarla
    if (existingSignature) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      }
      img.src = existingSignature
    }
  }, [existingSignature])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (disabled) return
    
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let x, y
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let x, y
    if ('touches' in e) {
      e.preventDefault()
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    setHasSignature(true)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
    setSignatureData(null)
  }

  const saveSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Verificar que hay contenido en el canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const hasContent = imageData.data.some((channel, index) => {
      // Verificar canales RGB (ignorar alpha)
      return index % 4 !== 3 && channel !== 0
    })

    if (!hasContent) {
      alert('Por favor, dibuje su firma antes de guardar')
      return
    }

    const signature = canvas.toDataURL('image/png')
    setSignatureData(signature)
    onSignatureSaved(signature)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Pen className="h-5 w-5" />
          <span>Firma Digital</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {disabled && signatureData ? (
          // Mostrar firma existente (solo lectura)
          <div className="border rounded-lg p-4 bg-gray-50">
            <img 
              src={signatureData || "/placeholder.svg"} 
              alt="Firma digital" 
              className="max-w-full h-auto"
            />
          </div>
        ) : (
          <>
            {/* Canvas para dibujar */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white">
              <canvas
                ref={canvasRef}
                width={400}
                height={200}
                className="w-full h-48 cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              <div className="text-center text-sm text-gray-500 mt-2">
                {disabled ? 'Firma guardada' : 'Dibuje su firma aquí'}
              </div>
            </div>

            {/* Botones de control */}
            {!disabled && (
              <div className="flex justify-between space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearSignature}
                  disabled={!hasSignature}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Limpiar
                </Button>
                
                <Button
                  type="button"
                  onClick={saveSignature}
                  disabled={!hasSignature}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Guardar Firma
                </Button>
              </div>
            )}

            {/* Instrucciones */}
            {!disabled && (
              <Alert>
                <AlertDescription>
                  Dibuje su firma en el área de arriba. Use el mouse o toque la pantalla para firmar.
                  La firma es requerida para completar el trabajo.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
