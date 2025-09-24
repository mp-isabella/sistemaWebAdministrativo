import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        // Solo admin y secretaria pueden exportar PDFs
        if (!["admin", "secretaria"].includes((session.user as any).role.toLowerCase())) {
            return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
        }

        const workOrder = await prisma.job.findUnique({
            where: { id: params.id },
            include: {
                client: true,
                service: true,
                technician: true,
                createdBy: true,
                company: true,
                // items: true // No existe en el modelo Job
            }
        })

        if (!workOrder) {
            return NextResponse.json({ error: "Orden de trabajo no encontrada" }, { status: 404 })
        }

        // Generar HTML para el PDF
        const html = generateWorkOrderHTML(workOrder)

        return new NextResponse(html, {
            headers: {
                'Content-Type': 'text/html',
                'Content-Disposition': `inline; filename="orden-trabajo-${workOrder.id}.html"`
            }
        })
    } catch (error) {
        
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}

function generateWorkOrderHTML(workOrder: any) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const formatDate = (date: string | Date) => {
        return format(new Date(date), 'dd/MM/yyyy', { locale: es })
    }

    const getCompanyColors = (companyType: string) => {
        switch (companyType) {
            case 'AMESTICA':
                return {
                    primary: '#1e40af',
                    secondary: '#3b82f6',
                    accent: '#dbeafe'
                }
            case 'MULTIFUGAS':
                return {
                    primary: '#059669',
                    secondary: '#10b981',
                    accent: '#d1fae5'
                }
            case 'SERVIFUGAS':
                return {
                    primary: '#dc2626',
                    secondary: '#ef4444',
                    accent: '#fee2e2'
                }
            default:
                return {
                    primary: '#1e40af',
                    secondary: '#3b82f6',
                    accent: '#dbeafe'
                }
        }
    }

    const colors = getCompanyColors(workOrder.company?.type || 'AMESTICA')

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orden de Trabajo - ${workOrder.workOrderNumber}</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            border-bottom: 3px solid ${colors.primary};
            padding-bottom: 20px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo-section {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .logo {
            width: 80px;
            height: 80px;
            background: ${colors.primary};
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 24px;
        }
        
        .company-info h1 {
            color: ${colors.primary};
            font-size: 28px;
            margin-bottom: 5px;
        }
        
        .company-info p {
            color: #666;
            font-size: 14px;
        }
        
        .document-title {
            text-align: right;
        }
        
        .document-title h2 {
            color: ${colors.primary};
            font-size: 24px;
            margin-bottom: 5px;
        }
        
        .document-title .number {
            font-size: 18px;
            color: #666;
            font-weight: bold;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }
        
        .info-section {
            background: ${colors.accent};
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid ${colors.primary};
        }
        
        .info-section h3 {
            color: ${colors.primary};
            margin-bottom: 15px;
            font-size: 16px;
            text-transform: uppercase;
        }
        
        .info-item {
            margin-bottom: 8px;
        }
        
        .info-label {
            font-weight: bold;
            color: #555;
            font-size: 14px;
        }
        
        .info-value {
            color: #333;
            font-size: 14px;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .items-table th {
            background: ${colors.primary};
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
        }
        
        .items-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #eee;
        }
        
        .items-table tr:nth-child(even) {
            background: #f9f9f9;
        }
        
        .total-section {
            background: ${colors.accent};
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 16px;
        }
        
        .total-row.final {
            font-size: 20px;
            font-weight: bold;
            color: ${colors.primary};
            border-top: 2px solid ${colors.primary};
            padding-top: 10px;
            margin-top: 10px;
        }
        
        .notes-section {
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid ${colors.secondary};
        }
        
        .notes-section h3 {
            color: ${colors.primary};
            margin-bottom: 10px;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #eee;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .status-draft { background: #fef3c7; color: #92400e; }
        .status-in_progress { background: #dbeafe; color: #1e40af; }
        .status-completed { background: #d1fae5; color: #059669; }
        .status-cancelled { background: #fee2e2; color: #dc2626; }
        .status-billed { background: #e0e7ff; color: #3730a3; }
        
        .priority-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .priority-low { background: #d1fae5; color: #059669; }
        .priority-medium { background: #fef3c7; color: #92400e; }
        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-urgent { background: #fecaca; color: #991b1b; }

        .page-break {
            page-break-before: always;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="company-info">
                <h1>${workOrder.company?.name || 'Améstica Servicios Técnicos'}</h1>
                <p class="company-details">
                    ${workOrder.company?.address || 'Dirección de la empresa'}<br>
                    Tel: ${workOrder.company?.phone || 'Teléfono'} | Email: ${workOrder.company?.email || 'email@empresa.com'}
                </p>
            </div>
            <div class="document-info">
                <h2>ORDEN DE TRABAJO</h2>
                <p class="document-number">N° ${workOrder.id}</p>
                <p class="document-date">Fecha: ${formatDate(workOrder.createdAt)}</p>
            </div>
        </div>

        <div class="content">
            <div class="section">
                <h3>Información del Cliente</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <strong>Nombre:</strong> ${workOrder.client?.name || 'N/A'}
                    </div>
                    <div class="info-item">
                        <strong>Email:</strong> ${workOrder.client?.email || 'N/A'}
                    </div>
                    <div class="info-item">
                        <strong>Teléfono:</strong> ${workOrder.client?.phone || 'N/A'}
                    </div>
                    <div class="info-item">
                        <strong>Dirección:</strong> ${workOrder.client?.address || 'N/A'}
                    </div>
                </div>
            </div>

            <div class="section">
                <h3>Detalles del Servicio</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <strong>Servicio:</strong> ${workOrder.service?.name || 'N/A'}
                    </div>
                    <div class="info-item">
                        <strong>Técnico Asignado:</strong> ${workOrder.technician?.name || 'Sin asignar'}
                    </div>
                    <div class="info-item">
                        <strong>Estado:</strong> ${workOrder.status}
                    </div>
                    <div class="info-item">
                        <strong>Fecha Programada:</strong> ${workOrder.scheduledAt ? formatDate(workOrder.scheduledAt) : 'No programada'}
                    </div>
                </div>
            </div>

            ${workOrder.description ? `
                <div class="section">
                    <h3>Descripción del Trabajo</h3>
                    <p>${workOrder.description}</p>
                </div>
            ` : ''}

            ${workOrder.items && workOrder.items.length > 0 ? `
                <div class="section">
                    <h3>Items del Servicio</h3>
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Descripción</th>
                                <th>Cantidad</th>
                                <th>Precio Unitario</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${workOrder.items.map((item: any) => `
                                <tr>
                                    <td>${item.description}</td>
                                    <td>${item.quantity}</td>
                                    <td>${formatCurrency(item.unitPrice)}</td>
                                    <td>${formatCurrency(item.quantity * item.unitPrice)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : ''}

            <div class="section">
                <h3>Información Adicional</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <strong>Creado por:</strong> ${workOrder.createdBy?.name || 'N/A'}
                    </div>
                    <div class="info-item">
                        <strong>Fecha de creación:</strong> ${formatDate(workOrder.createdAt)}
                    </div>
                    ${workOrder.updatedAt ? `
                        <div class="info-item">
                            <strong>Última actualización:</strong> ${formatDate(workOrder.updatedAt)}
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    </div>
</body>
</html>
    `
}
