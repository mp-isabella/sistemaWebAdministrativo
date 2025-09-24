import { useEffect, useRef, useState } from 'react'

interface UseSignatureCanvasProps {
  width?: number
  height?: number
  lineWidth?: number
  strokeStyle?: string
}

export function useSignatureCanvas({
  lineWidth = 2,
  strokeStyle = '#000'
}: UseSignatureCanvasProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Configurar el canvas
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = strokeStyle
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    let isDrawing = false
    let lastX = 0
    let lastY = 0

    const startDrawing = (e: MouseEvent | TouchEvent) => {
      isDrawing = true
      setIsDrawing(true)
      const pos = getPosition(e)
      lastX = pos.x
      lastY = pos.y
    }

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing) return
      e.preventDefault()

      const pos = getPosition(e)
      ctx.beginPath()
      ctx.moveTo(lastX, lastY)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
      lastX = pos.x
      lastY = pos.y
      setHasSignature(true)
    }

    const stopDrawing = () => {
      isDrawing = false
      setIsDrawing(false)
    }

    const getPosition = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect()
      if (e instanceof MouseEvent) {
        return {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        }
      } else {
        const touch = e.touches[0];
        if (!touch) return { x: 0, y: 0 };
        return {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top
        }
      }
    }

    // Event listeners para mouse
    canvas.addEventListener('mousedown', startDrawing)
    canvas.addEventListener('mousemove', draw)
    canvas.addEventListener('mouseup', stopDrawing)
    canvas.addEventListener('mouseout', stopDrawing)

    // Event listeners para touch
    canvas.addEventListener('touchstart', startDrawing, { passive: false })
    canvas.addEventListener('touchmove', draw, { passive: false })
    canvas.addEventListener('touchend', stopDrawing)

    return () => {
      canvas.removeEventListener('mousedown', startDrawing)
      canvas.removeEventListener('mousemove', draw)
      canvas.removeEventListener('mouseup', stopDrawing)
      canvas.removeEventListener('mouseout', stopDrawing)
      canvas.removeEventListener('touchstart', startDrawing)
      canvas.removeEventListener('touchmove', draw)
      canvas.removeEventListener('touchend', stopDrawing)
    }
  }, [lineWidth, strokeStyle])

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  const getSignatureData = () => {
    const canvas = canvasRef.current
    if (!canvas) return null

    return canvas.toDataURL()
  }

  const setSignatureData = (dataUrl: string) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const img = new Image()
    img.onload = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      setHasSignature(true)
    }
    img.src = dataUrl
  }

  return {
    canvasRef,
    isDrawing,
    hasSignature,
    clearCanvas,
    getSignatureData,
    setSignatureData
  }
}
