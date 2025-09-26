"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import * as React from "react"

interface ModalSelectProps {
    value: string
    onValueChange: (value: string) => void
    placeholder?: string
    options: { value: string; label: string }[]
    className?: string
    disabled?: boolean
    emptyMessage?: string
}

export function ModalSelect({
    value,
    onValueChange,
    placeholder = "Seleccionar...",
    options,
    className,
    disabled = false,
    emptyMessage = "No se encontraron resultados.",
}: ModalSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [openUpward, setOpenUpward] = React.useState(false)
    const containerRef = React.useRef<HTMLDivElement>(null)

    const selectedOption = options.find((option) => option.value === value)

    // Detectar si debe abrir hacia arriba
    React.useEffect(() => {
        if (open && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            const viewportHeight = window.innerHeight
            const spaceBelow = viewportHeight - rect.bottom
            const spaceAbove = rect.top

            // Si hay menos espacio abajo que arriba, abrir hacia arriba
            setOpenUpward(spaceBelow < 200 && spaceAbove > spaceBelow)
        }
    }, [open])

    // Cerrar dropdown cuando se hace clic fuera
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }

        if (open) {
            // Usar un pequeño delay para evitar que se cierre inmediatamente
            const timeoutId = setTimeout(() => {
                document.addEventListener('mousedown', handleClickOutside)
            }, 100)

            return () => {
                clearTimeout(timeoutId)
                document.removeEventListener('mousedown', handleClickOutside)
            }
        }

        return undefined
    }, [open])

    return (
        <div className="relative" ref={containerRef}>
            <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={cn(
                    "w-full justify-between text-left font-normal",
                    !selectedOption && "text-muted-foreground",
                    className
                )}
                disabled={disabled}
                onMouseDown={(e) => {
                    e.preventDefault()
                }}
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setOpen(!open)
                }}
                style={{
                    paddingLeft: className?.includes('pl-10') ? '2.5rem' : undefined,
                    paddingRight: '0.75rem'
                }}
            >
                {selectedOption ? selectedOption.label : placeholder}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>

            {open && (
                <div
                    className={cn(
                        "absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg",
                        openUpward ? "bottom-full mb-1" : "top-full mt-1"
                    )}
                    onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                    }}
                >
                    {/* Lista de opciones */}
                    <div className="max-h-[200px] overflow-y-auto p-1">
                        {options.length === 0 ? (
                            <div className="py-3 text-center text-sm text-gray-500">
                                {emptyMessage}
                            </div>
                        ) : (
                            options.map((option) => (
                                <div
                                    key={option.value}
                                    onMouseDown={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                    }}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        onValueChange(option.value)
                                        setOpen(false)
                                    }}
                                    className="cursor-pointer px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 rounded-md mx-1 my-0.5"
                                >
                                    <span className="truncate block">{option.label}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
