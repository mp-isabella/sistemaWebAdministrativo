// components/responsive-example.tsx
// Ejemplo de implementación del sistema de responsividad

import React from 'react';
import { useResponsive } from '../lib/responsive-config';

export default function ResponsiveExample() {
  const { isMobile, isTablet, isDesktop, breakpoint } = useResponsive();

  return (
    <div className="dashboard-container">
      {/* Header Responsivo */}
      <header className="dashboard-header">
        <div className="flex items-center justify-between">
          <h1 className="text-responsive-2xl font-bold text-gray-900">
            Panel Administrativo
          </h1>
          
          {/* Botones que se adaptan al dispositivo */}
          <div className="flex gap-responsive-sm">
            <button className="dashboard-button bg-blue-600 text-white hover:bg-blue-700">
              {isMobile ? 'Nuevo' : 'Crear Nuevo'}
            </button>
            <button className="dashboard-button bg-gray-600 text-white hover:bg-gray-700">
              {isMobile ? '⚙️' : 'Configuración'}
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Responsivo */}
      <aside className={`dashboard-sidebar ${isMobile ? 'hidden' : ''}`}>
        <div className="p-6">
          <nav className="dashboard-nav">
            <a href="#" className="dashboard-nav-item flex items-center gap-responsive-sm p-responsive-sm rounded-lg hover:bg-gray-100">
              <span>📊</span>
              <span className={isMobile ? 'hidden' : ''}>Dashboard</span>
            </a>
            <a href="#" className="dashboard-nav-item flex items-center gap-responsive-sm p-responsive-sm rounded-lg hover:bg-gray-100">
              <span>📅</span>
              <span className={isMobile ? 'hidden' : ''}>Calendario</span>
            </a>
            <a href="#" className="dashboard-nav-item flex items-center gap-responsive-sm p-responsive-sm rounded-lg hover:bg-gray-100">
              <span>👥</span>
              <span className={isMobile ? 'hidden' : ''}>Usuarios</span>
            </a>
            <a href="#" className="dashboard-nav-item flex items-center gap-responsive-sm p-responsive-sm rounded-lg hover:bg-gray-100">
              <span>📋</span>
              <span className={isMobile ? 'hidden' : ''}>Reportes</span>
            </a>
          </nav>
        </div>
      </aside>

      {/* Contenido Principal Responsivo */}
      <main className="dashboard-main">
        <div className="p-responsive-lg">
          {/* Grid Responsivo */}
          <div className="dashboard-grid">
            {/* Card de Estadísticas */}
            <div className="dashboard-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-responsive-sm text-gray-600">Total de Usuarios</p>
                  <p className="text-responsive-3xl font-bold text-gray-900">1,234</p>
                </div>
                <div className="text-blue-600">
                  <span className="text-responsive-2xl">👥</span>
                </div>
              </div>
              <div className="mt-responsive-md">
                <span className="text-responsive-sm text-green-600">+12% desde el mes pasado</span>
              </div>
            </div>

            {/* Card de Ingresos */}
            <div className="dashboard-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-responsive-sm text-gray-600">Ingresos Mensuales</p>
                  <p className="text-responsive-3xl font-bold text-gray-900">$45,678</p>
                </div>
                <div className="text-green-600">
                  <span className="text-responsive-2xl">💰</span>
                </div>
              </div>
              <div className="mt-responsive-md">
                <span className="text-responsive-sm text-green-600">+8% desde el mes pasado</span>
              </div>
            </div>

            {/* Card de Tareas */}
            <div className="dashboard-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-responsive-sm text-gray-600">Tareas Pendientes</p>
                  <p className="text-responsive-3xl font-bold text-gray-900">56</p>
                </div>
                <div className="text-orange-600">
                  <span className="text-responsive-2xl">📋</span>
                </div>
              </div>
              <div className="mt-responsive-md">
                <span className="text-responsive-sm text-orange-600">-5% desde ayer</span>
              </div>
            </div>

            {/* Card de Proyectos */}
            <div className="dashboard-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-responsive-sm text-gray-600">Proyectos Activos</p>
                  <p className="text-responsive-3xl font-bold text-gray-900">23</p>
                </div>
                <div className="text-purple-600">
                  <span className="text-responsive-2xl">🚀</span>
                </div>
              </div>
              <div className="mt-responsive-md">
                <span className="text-responsive-sm text-purple-600">+3 nuevos esta semana</span>
              </div>
            </div>
          </div>

          {/* Sección de Formulario Responsivo */}
          <div className="mt-responsive-xl">
            <div className="dashboard-card">
              <h2 className="text-responsive-xl font-semibold text-gray-900 mb-responsive-md">
                Crear Nuevo Usuario
              </h2>
              
              <form className="dashboard-form">
                <div className="grid gap-responsive-md">
                  <div className={isMobile ? 'col-span-1' : 'col-span-2'}>
                    <label className="block text-responsive-sm font-medium text-gray-700 mb-responsive-xs">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      className="dashboard-input"
                      placeholder="Ingresa el nombre completo"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-responsive-sm font-medium text-gray-700 mb-responsive-xs">
                      Email
                    </label>
                    <input
                      type="email"
                      className="dashboard-input"
                      placeholder="usuario@ejemplo.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-responsive-sm font-medium text-gray-700 mb-responsive-xs">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      className="dashboard-input"
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  
                  <div className={isMobile ? 'col-span-1' : 'col-span-2'}>
                    <label className="block text-responsive-sm font-medium text-gray-700 mb-responsive-xs">
                      Rol
                    </label>
                    <select className="dashboard-input">
                      <option>Selecciona un rol</option>
                      <option>Administrador</option>
                      <option>Usuario</option>
                      <option>Editor</option>
                    </select>
                  </div>
                  
                  <div className={isMobile ? 'col-span-1' : 'col-span-2'}>
                    <label className="block text-responsive-sm font-medium text-gray-700 mb-responsive-xs">
                      Descripción
                    </label>
                    <textarea
                      className="dashboard-input"
                      rows={isMobile ? 3 : 4}
                      placeholder="Descripción del usuario..."
                    />
                  </div>
                </div>
                
                <div className="flex gap-responsive-md mt-responsive-lg">
                  <button
                    type="submit"
                    className="dashboard-button bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Crear Usuario
                  </button>
                  <button
                    type="button"
                    className="dashboard-button bg-gray-600 text-white hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Tabla Responsiva */}
          <div className="mt-responsive-xl">
            <div className="dashboard-card">
              <h2 className="text-responsive-xl font-semibold text-gray-900 mb-responsive-md">
                Usuarios Recientes
              </h2>
              
              <div className="overflow-x-auto">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td data-label="Nombre">Juan Pérez</td>
                      <td data-label="Email">juan@ejemplo.com</td>
                      <td data-label="Rol">Administrador</td>
                      <td data-label="Estado">
                        <span className="inline-flex items-center px-responsive-xs py-responsive-xs rounded-full text-responsive-xs font-medium bg-green-100 text-green-800">
                          Activo
                        </span>
                      </td>
                      <td data-label="Acciones">
                        <div className="flex gap-responsive-xs">
                          <button className="dashboard-button bg-blue-600 text-white text-responsive-xs p-responsive-xs">
                            Editar
                          </button>
                          <button className="dashboard-button bg-red-600 text-white text-responsive-xs p-responsive-xs">
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td data-label="Nombre">María García</td>
                      <td data-label="Email">maria@ejemplo.com</td>
                      <td data-label="Rol">Usuario</td>
                      <td data-label="Estado">
                        <span className="inline-flex items-center px-responsive-xs py-responsive-xs rounded-full text-responsive-xs font-medium bg-yellow-100 text-yellow-800">
                          Pendiente
                        </span>
                      </td>
                      <td data-label="Acciones">
                        <div className="flex gap-responsive-xs">
                          <button className="dashboard-button bg-blue-600 text-white text-responsive-xs p-responsive-xs">
                            Editar
                          </button>
                          <button className="dashboard-button bg-red-600 text-white text-responsive-xs p-responsive-xs">
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Paginación Responsiva */}
          <div className="dashboard-pagination">
            <button className="dashboard-button bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
              Anterior
            </button>
            <button className="dashboard-button bg-blue-600 text-white">1</button>
            <button className="dashboard-button bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">2</button>
            <button className="dashboard-button bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">3</button>
            <button className="dashboard-button bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
              Siguiente
            </button>
          </div>

          {/* Información del Breakpoint (Solo para desarrollo) */}
          <div className="mt-responsive-xl p-responsive-md bg-gray-100 rounded-lg">
            <h3 className="text-responsive-lg font-semibold text-gray-900 mb-responsive-sm">
              Información de Responsividad
            </h3>
            <div className="grid gap-responsive-sm text-responsive-sm text-gray-700">
              <p><strong>Breakpoint actual:</strong> {breakpoint}</p>
              <p><strong>Es móvil:</strong> {isMobile ? 'Sí' : 'No'}</p>
              <p><strong>Es tablet:</strong> {isTablet ? 'Sí' : 'No'}</p>
              <p><strong>Es desktop:</strong> {isDesktop ? 'Sí' : 'No'}</p>
              <p><strong>Ancho de pantalla:</strong> {typeof window !== 'undefined' ? window.innerWidth : 'N/A'}px</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
