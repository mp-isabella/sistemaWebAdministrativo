"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Check, ChevronDown } from "lucide-react"
import * as React from "react"

interface SimpleSelectProps {
    value: string
    onValueChange: (value: string) => void
    placeholder?: string
    options: { value: string; label: string }[]
    className?: string
    disabled?: boolean
}

export function SimpleSelect({
    value,
    onValueChange,
    placeholder = "Seleccionar...",
    options,
    className,
    disabled = false,
}: SimpleSelectProps) {
    const [open, setOpen] = React.useState(false)
    const containerRef = React.useRef<HTMLDivElement>(null)

    const selectedOption = options.find((option) => option.value === value)

    // Cerrar dropdown cuando se hace clic fuera
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }

        if (open) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [open])

    return (
        <div ref={containerRef} className="relative">
            <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                onClick={() => {
                    setOpen(!open);
                }}
                className={cn(
                    "w-full justify-between text-left font-normal h-14 text-base border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 shadow-sm font-medium bg-white hover:bg-white text-gray-900",
                    !selectedOption && "text-muted-foreground",
                    className
                )}
                style={{
                    backgroundColor: 'white',
                    color: '#111827'
                }}
                disabled={disabled}
            >
                {selectedOption ? selectedOption.label : placeholder}
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>

            {open && (
                <div
                    className="absolute top-full left-0 right-0 w-full bg-white border border-gray-200 rounded-xl shadow-xl z-[10001] mt-1 max-h-[200px] overflow-y-auto"
                    style={{
                        display: 'block',
                        position: 'absolute',
                        zIndex: 10001,
                        backgroundColor: 'white !important',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        minWidth: '200px',
                        maxWidth: '100%',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        marginTop: '0.25rem'
                    }}
                >
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => {
                                onValueChange(option.value)
                                setOpen(false)
                            }}
                            className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-50 rounded-lg mx-1 my-0.5 flex items-center"
                        >
                            <Check
                                className={cn(
                                    "mr-2 h-4 w-4",
                                    value === option.value ? "opacity-100" : "opacity-0"
                                )}
                            />
                            <span className="truncate">{option.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
