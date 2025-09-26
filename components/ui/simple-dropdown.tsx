"use client"

import { ChevronDown } from "lucide-react"
import * as React from "react"

interface SimpleDropdownProps {
    value: string
    onValueChange: (value: string) => void
    placeholder?: string
    options: { value: string; label: string }[]
    disabled?: boolean
}

export function SimpleDropdown({
    value,
    onValueChange,
    placeholder = "Seleccionar...",
    options,
    disabled = false,
}: SimpleDropdownProps) {
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
        <div ref={containerRef} className="relative" style={{ width: '100%' }}>
            <button
                type="button"
                role="combobox"
                aria-expanded={open}
                onClick={() => setOpen(!open)}
                disabled={disabled}
                style={{
                    width: '100%',
                    height: '3.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    fontSize: '1rem',
                    fontWeight: '500',
                    border: '2px solid #d1d5db',
                    borderRadius: '0.75rem',
                    backgroundColor: 'white',
                    background: 'white',
                    color: selectedOption ? '#111827' : '#6b7280',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    textAlign: 'left',
                    margin: 0,
                    boxSizing: 'border-box',
                    opacity: disabled ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                    if (!disabled) {
                        e.currentTarget.style.borderColor = '#9ca3af'
                    }
                }}
                onMouseLeave={(e) => {
                    if (!disabled) {
                        e.currentTarget.style.borderColor = '#d1d5db'
                    }
                }}
                onFocus={(e) => {
                    if (!disabled) {
                        e.currentTarget.style.borderColor = '#3b82f6'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                    }
                }}
                onBlur={(e) => {
                    if (!disabled) {
                        e.currentTarget.style.borderColor = '#d1d5db'
                        e.currentTarget.style.boxShadow = 'none'
                    }
                }}
            >
                <span style={{
                    flex: 1,
                    textAlign: 'left',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown style={{
                    marginLeft: '0.5rem',
                    width: '1rem',
                    height: '1rem',
                    flexShrink: 0,
                    opacity: 0.5
                }} />
            </button>

            {open && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        width: '100%',
                        zIndex: 10001,
                        marginTop: '0.25rem',
                        backgroundColor: 'white',
                        background: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '0.75rem',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        maxHeight: '200px',
                        overflowY: 'auto'
                    }}
                >
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => {
                                onValueChange(option.value)
                                setOpen(false)
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0.75rem 1rem',
                                fontSize: '0.875rem',
                                color: '#111827',
                                backgroundColor: 'white',
                                background: 'white',
                                cursor: 'pointer',
                                transition: 'background-color 0.15s ease',
                                borderRadius: '0.5rem',
                                margin: '0.125rem'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f3f4f6'
                                e.currentTarget.style.background = '#f3f4f6'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'white'
                                e.currentTarget.style.background = 'white'
                            }}
                        >
                            <span style={{
                                flex: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {option.label}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
