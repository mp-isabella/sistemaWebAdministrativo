'use client';

import {RoleRedirect} from '@/components/auth/role-redirect';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, ClipboardList } from 'lucide-react';

export default function WorkersPage() {
  return (
    <RoleRedirect>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trabajadores</h1>
          <p className="text-gray-600">
            Gestión y control de todos los trabajadores de la empresa.
          </p>
        </div>

        {/* Tarjetas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Trabajadores
                  </p>
                  <p className="text-2xl font-bold text-gray-900">25</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserPlus className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Nuevos este mes
                  </p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ClipboardList className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Tareas pendientes
                  </p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel de información */}
        <Card>
          <CardHeader>
            <CardTitle>Panel de Trabajadores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Aquí podrás ver, editar y administrar la información de todos los trabajadores.
            </p>
          </CardContent>
        </Card>
      </div>
    </RoleRedirect>
  );
}
