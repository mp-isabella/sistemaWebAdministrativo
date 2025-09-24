'use client'

import Image from 'next/image'
import { useState } from 'react'

interface CompanyLogoProps {
  logo: string
  companyName: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  className?: string
}

export default function CompanyLogo({
  logo,
  companyName,
  size = 'md',
  className = ''
}: CompanyLogoProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-40',
    xxl: 'w-56 h-48'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
    xxl: 'text-xl'
  }

  // Función para obtener el logo correcto basado en el nombre
  const getLogoByCompany = (companyName: string) => {
    const name = companyName.toUpperCase()
    // Usar rutas absolutas para evitar problemas de Next.js
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

    // Lista de logos disponibles con fallbacks
    const logoOptions = []

    if (name.includes('AMESTICA')) {
      logoOptions.push(`${baseUrl}/amestica.png`, `${baseUrl}/amestica.webp`)
    } else if (name.includes('MULTIFUGAS')) {
      logoOptions.push(`${baseUrl}/multifugas.png`, `${baseUrl}/multifugas.webp`)
    } else if (name.includes('SERVIFUGAS')) {
      logoOptions.push(`${baseUrl}/servifugas.png`, `${baseUrl}/servifugas.webp`)
    } else {
      // Fallback por defecto
      logoOptions.push(`${baseUrl}/amestica.png`, `${baseUrl}/amestica.webp`)
    }

    return logoOptions[0] // Retornar el primer logo (PNG)
  }

  // Usar el logo proporcionado o el logo por defecto
  const finalLogo = logo || getLogoByCompany(companyName)

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {hasError ? (
        // Fallback cuando el logo falla
        <div className="w-full h-full flex items-center justify-center bg-gray-100 border-2 border-gray-300 rounded-lg">
          <div className="text-center p-2">
            <div className={`font-bold text-gray-700 ${textSizeClasses[size]}`}>
              Logo {companyName}
            </div>
          </div>
        </div>
      ) : (
        <Image
          src={finalLogo || '/logos/amestica-logo.webp'}
          alt={`Logo ${companyName}`}
          width={200}
          height={100}
          className="w-full h-full object-contain"
          onError={() => {

            setIsLoading(false)
            setHasError(true)
          }}
          onLoad={() => {

            setIsLoading(false)
          }}
        />
      )}
    </div>
  )
}
