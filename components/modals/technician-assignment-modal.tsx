"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle, Users, X } from "lucide-react"
import { useState } from "react"

interface Technician {
    id: string
    name: string
}

interface TechnicianAssignmentModalProps {
    isOpen: boolean
    onClose: () => void
    jobTitle: string
    technicians: Technician[]
    onAssign: (technicianId: string, technicianName: string) => void
    isAssigning?: boolean
}

export default function TechnicianAssignmentModal({
    isOpen,
    onClose,
    jobTitle,
    technicians,
    onAssign,
    isAssigning = false
}: TechnicianAssignmentModalProps) {
    const [selectedTechnician, setSelectedTechnician] = useState<string | null>(null)

    if (!isOpen) return null

    const handleAssign = () => {
        if (selectedTechnician) {
            const technician = technicians.find(t => t.id === selectedTechnician)
            if (technician) {
                onAssign(technician.id, technician.name)
                setSelectedTechnician(null)
            }
        }
    }

    const handleClose = () => {
        setSelectedTechnician(null)
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 rounded-lg p-2">
                            <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Asignar Técnico</h3>
                            <p className="text-sm text-slate-600">Selecciona un técnico para el trabajo</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                        disabled={isAssigning}
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="mb-4">
                        <p className="text-slate-700 text-sm mb-2">Trabajo:</p>
                        <p className="font-semibold text-slate-800 bg-slate-50 p-3 rounded-lg border">
                            {jobTitle}
                        </p>
                    </div>

                    <div className="space-y-2 mb-6">
                        <p className="text-sm font-medium text-slate-700 mb-3">Selecciona un técnico:</p>
                        {technicians.length === 0 ? (
                            <div className="text-center py-8">
                                <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500">No hay técnicos disponibles</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {technicians.map((technician) => (
                                    <button
                                        key={technician.id}
                                        onClick={() => setSelectedTechnician(technician.id)}
                                        disabled={isAssigning}
                                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${selectedTechnician === technician.id
                                            ? 'border-blue-500 bg-blue-50 shadow-md'
                                            : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                                            } ${isAssigning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${selectedTechnician === technician.id ? 'bg-blue-500' : 'bg-slate-300'
                                                    }`} />
                                                <span className="font-medium text-slate-800">{technician.name}</span>
                                            </div>
                                            {selectedTechnician === technician.id && (
                                                <CheckCircle className="h-5 w-5 text-blue-600" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={isAssigning}
                            className="flex-1 h-11 border-slate-300 text-slate-700 hover:bg-slate-50"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleAssign}
                            disabled={!selectedTechnician || isAssigning}
                            className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isAssigning ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Asignando...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span>Asignar Técnico</span>
                                </div>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
