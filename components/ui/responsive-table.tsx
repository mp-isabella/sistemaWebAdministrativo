"use client";

import { useResponsive } from '@/hooks/use-responsive';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ResponsiveTableProps {
  children: ReactNode;
  className?: string;
  stickyHeader?: boolean;
}

export default function ResponsiveTable({
  children,
  className,
  stickyHeader = false,
}: ResponsiveTableProps) {
  const { isMobile } = useResponsive();

  if (isMobile) {
    return (
      <div className={cn("overflow-x-auto", className)}>
        <div className="min-w-full inline-block align-middle">
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              {children}
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className={cn(
        "min-w-full divide-y divide-gray-200",
        stickyHeader && "sticky-header"
      )}>
        {children}
      </table>
    </div>
  );
}

// Componente para el header de la tabla
interface ResponsiveTableHeaderProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveTableHeader({
  children,
  className,
}: ResponsiveTableHeaderProps) {
  return (
    <thead className={cn("bg-gray-50", className)}>
      {children}
    </thead>
  );
}

// Componente para las filas del header
interface ResponsiveTableHeaderRowProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveTableHeaderRow({
  children,
  className,
}: ResponsiveTableHeaderRowProps) {
  return (
    <tr className={cn("", className)}>
      {children}
    </tr>
  );
}

// Componente para las celdas del header
interface ResponsiveTableHeaderCellProps {
  children: ReactNode;
  className?: string;
  sortable?: boolean;
  onClick?: () => void;
}

export function ResponsiveTableHeaderCell({
  children,
  className,
  sortable = false,
  onClick,
}: ResponsiveTableHeaderCellProps) {
  const { isMobile } = useResponsive();

  return (
    <th
      className={cn(
        "px-3 sm:px-4 lg:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider",
        sortable && "cursor-pointer hover:bg-gray-100",
        isMobile && "text-xs",
        className
      )}
      onClick={onClick}
    >
      {children}
    </th>
  );
}

// Componente para el body de la tabla
interface ResponsiveTableBodyProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveTableBody({
  children,
  className,
}: ResponsiveTableBodyProps) {
  return (
    <tbody className={cn("bg-white divide-y divide-gray-200", className)}>
      {children}
    </tbody>
  );
}

// Componente para las filas del body
interface ResponsiveTableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function ResponsiveTableRow({
  children,
  className,
  onClick,
  hover = true,
}: ResponsiveTableRowProps) {
  return (
    <tr
      className={cn(
        hover && "hover:bg-gray-50",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

// Componente para las celdas del body
interface ResponsiveTableCellProps {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  truncate?: boolean;
}

export function ResponsiveTableCell({
  children,
  className,
  align = 'left',
  truncate = false,
}: ResponsiveTableCellProps) {
  const { isMobile } = useResponsive();

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <td
      className={cn(
        "px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900",
        alignClasses[align],
        truncate && "max-w-xs truncate",
        isMobile && "text-xs py-2",
        className
      )}
    >
      {children}
    </td>
  );
}

// Componente para tablas de tarjetas en móvil
interface ResponsiveCardTableProps {
  data: Array<Record<string, any>>;
  columns: Array<{
    key: string;
    label: string;
    render?: (value: any, row: any) => ReactNode;
    className?: string;
  }>;
  className?: string;
  onRowClick?: (row: any) => void;
}

export function ResponsiveCardTable({
  data,
  columns,
  className,
  onRowClick,
}: ResponsiveCardTableProps) {
  const { isMobile } = useResponsive();

  if (!isMobile) {
    return null; // Solo se muestra en móvil
  }

  return (
    <div className={cn("space-y-3", className)}>
      {data.map((row, index) => (
        <div
          key={index}
          className={cn(
            "bg-white border border-gray-200 rounded-lg p-4 shadow-sm",
            onRowClick && "cursor-pointer hover:shadow-md transition-shadow"
          )}
          onClick={() => onRowClick?.(row)}
        >
          <div className="space-y-2">
            {columns.map((column) => (
              <div key={column.key} className="flex justify-between items-start">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {column.label}
                </span>
                <span className={cn("text-sm text-gray-900 text-right", column.className)}>
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Componente híbrido que muestra tabla en desktop y tarjetas en móvil
interface ResponsiveHybridTableProps {
  data: Array<Record<string, any>>;
  columns: Array<{
    key: string;
    label: string;
    render?: (value: any, row: any) => ReactNode;
    className?: string;
    headerClassName?: string;
  }>;
  className?: string;
  onRowClick?: (row: any) => void;
  stickyHeader?: boolean;
}

export function ResponsiveHybridTable({
  data,
  columns,
  className,
  onRowClick,
  stickyHeader = false,
}: ResponsiveHybridTableProps) {
  const { } = useResponsive();

  return (
    <div className={className}>
      {/* Vista de tarjetas para móvil */}
      <ResponsiveCardTable
        data={data}
        columns={columns}
        {...(onRowClick && { onRowClick })}
        className="mobile-only"
      />

      {/* Vista de tabla para desktop */}
      <ResponsiveTable stickyHeader={stickyHeader} className="hidden-mobile">
        <ResponsiveTableHeader>
          <ResponsiveTableHeaderRow>
            {columns.map((column) => (
              <ResponsiveTableHeaderCell
                key={column.key}
                {...(column.headerClassName && { className: column.headerClassName })}
              >
                {column.label}
              </ResponsiveTableHeaderCell>
            ))}
          </ResponsiveTableHeaderRow>
        </ResponsiveTableHeader>
        <ResponsiveTableBody>
          {data.map((row, index) => (
            <ResponsiveTableRow
              key={index}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => (
                <ResponsiveTableCell
                  key={column.key}
                  {...(column.className && { className: column.className })}
                >
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </ResponsiveTableCell>
              ))}
            </ResponsiveTableRow>
          ))}
        </ResponsiveTableBody>
      </ResponsiveTable>
    </div>
  );
}
