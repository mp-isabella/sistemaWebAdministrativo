'use client';

import React from 'react';

export default function SimpleDashboard() {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Dashboard Administrativo
        </h1>
        <p className="text-gray-600 mb-6">
          Sistema funcionando correctamente
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900">Trabajos</h3>
            <p className="text-2xl font-bold text-blue-600">24</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900">Clientes</h3>
            <p className="text-2xl font-bold text-green-600">156</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-900">Técnicos</h3>
            <p className="text-2xl font-bold text-purple-600">12</p>
          </div>
        </div>
      </div>
    </div>
  );
}
