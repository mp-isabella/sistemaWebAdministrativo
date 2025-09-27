"use client"

import { cn } from "@/lib/utils"
import { Check, ChevronDown } from "lucide-react"
import * as React from "react"

interface SelectDropdownFixProps {
    value: string
    onValueChange: (value: string) => void
    placeholder?: string
    options: { value: string; label: string }[]
    className?: string
    disabled?: boolean
}

export function SelectDropdownFix({
    value,
    onValueChange,
    placeholder = "Seleccionar...",
    options,
    className,
    disabled = false,
}: SelectDropdownFixProps) {
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
            <button
                type="button"
                role="combobox"
                aria-expanded={open}
                aria-controls="select-listbox"
                onClick={() => setOpen(!open)}
                className={cn(
                    "select-dropdown-trigger w-full justify-between text-left font-normal h-14 text-base border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 shadow-sm font-medium",
                    "bg-white hover:bg-white text-gray-900 border-gray-300",
                    !selectedOption && "text-gray-500",
                    disabled && "opacity-50 cursor-not-allowed",
                    className
                )}
                style={{
                    backgroundColor: 'white !important',
                    background: 'white !important',
                    color: selectedOption ? '#111827' : '#6b7280',
                    borderColor: '#d1d5db',
                    border: '2px solid #d1d5db',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    width: '100%',
                    height: '3.5rem',
                    fontSize: '1rem',
                    fontWeight: '500',
                    borderRadius: '0.75rem',
                    outline: 'none',
                    textAlign: 'left'
                }}
                disabled={disabled}
            >
                <span className="truncate">
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </button>

            {open && (
                <div
                    className="select-dropdown-content absolute top-full left-0 right-0 w-full bg-white border border-gray-300 rounded-xl shadow-xl z-[10001] mt-1 max-h-[200px] overflow-y-auto"
                    style={{
                        display: 'block',
                        position: 'absolute',
                        zIndex: 10001,
                        backgroundColor: 'white !important',
                        border: '1px solid #d1d5db',
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
                            className="select-dropdown-option cursor-pointer px-3 py-2 text-sm hover:bg-gray-50 rounded-lg mx-1 my-0.5 flex items-center bg-white text-gray-900"
                            style={{
                                backgroundColor: 'white !important',
                                color: '#111827'
                            }}
                        >
                            <Check
                                className={cn(
                                    "select-dropdown-check mr-2 h-4 w-4",
                                    value === option.value ? "opacity-100" : "opacity-0"
                                )}
                            />
                            <span className="select-dropdown-text truncate">{option.label}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
