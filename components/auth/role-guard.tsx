'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDefaultRoute, hasPermission } from '@/lib/roles';
import { AlertTriangle, Loader2, Shield } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { memo, useEffect, useMemo, useState } from 'react';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredPermission: keyof import('@/lib/roles').RolePermissions;
  fallback?: React.ReactNode;
  _redirectTo?: string;
}

// Componente memoizado para el estado de carga
const LoadingState = memo(() => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
      <p className="text-gray-600">Verificando permisos...</p>
      <p className="text-sm text-gray-500 mt-2">Por favor espera</p>
    </div>
  </div>
));

LoadingState.displayName = 'LoadingState';

// Componente memoizado para el estado de error
const UnauthorizedState = memo(({
  userRole,
  pathname,
  onGoToDashboard,
  onGoBack
}: {
  userRole: string;
  pathname: string;
  onGoToDashboard: () => void;
  onGoBack: () => void;
}) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <Shield className="h-6 w-6 text-red-600" />
        </div>
        <CardTitle className="text-xl font-semibold text-gray-900">
          Acceso Denegado
        </CardTitle>
        <CardDescription className="text-gray-600">
          No tienes permisos para acceder a esta sección del sistema.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-yellow-50 p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Información del Usuario
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p><strong>Rol:</strong> {userRole}</p>
                <p><strong>Sección solicitada:</strong> {pathname}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          <Button onClick={onGoToDashboard} className="w-full">
            Ir a mi Dashboard
          </Button>
          <Button variant="outline" onClick={onGoBack} className="w-full">
            Volver Atrás
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
));

UnauthorizedState.displayName = 'UnauthorizedState';

export const RoleGuard = memo(function RoleGuard({
  children,
  requiredPermission,
  fallback,
  _redirectTo // Intentionally unused - reserved for future redirect functionality
}: RoleGuardProps) {
  // _redirectTo is intentionally unused - reserved for future redirect functionality
  void _redirectTo
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Memoizar el rol del usuario para evitar recálculos
  const userRole = useMemo(() =>
    (session?.user as any)?.role?.toLowerCase() || '',
    [session?.user]
  );

  // Memoizar la verificación de permisos
  const hasRequiredPermission = useMemo(() =>
    hasPermission(userRole, requiredPermission),
    [userRole, requiredPermission]
  );

  // Memoizar las funciones de callback
  const handleGoToDashboard = useMemo(() => {
    const defaultRoute = getDefaultRoute(userRole);
    return () => router.push(defaultRoute);
  }, [userRole, router]);

  const handleGoBack = useMemo(() => () => router.back(), [router]);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.replace('/login');
      return;
    }

    if (status === 'authenticated' && session) {
      if (!hasRequiredPermission) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }
      setIsAuthorized(true);
      setIsLoading(false);
    }
  }, [status, session, userRole, hasRequiredPermission, router]);

  // Mostrar estado de carga
  if (status === 'loading' || isLoading) {
    return <LoadingState />;
  }

  // Mostrar error de autorización
  if (!isAuthorized) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <UnauthorizedState
        userRole={userRole}
        pathname={pathname}
        onGoToDashboard={handleGoToDashboard}
        onGoBack={handleGoBack}
      />
    );
  }

  return <>{children}</>;
});

/**
 * Hook para verificar permisos en componentes
 */
export function useRolePermission(permission: keyof import('@/lib/roles').RolePermissions) {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role?.toLowerCase() || '';

  return hasPermission(userRole, permission);
}

/**
 * Componente para mostrar contenido condicionalmente basado en permisos
 */
interface ConditionalRenderProps {
  permission: keyof import('@/lib/roles').RolePermissions;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ConditionalRender({ permission, children, fallback }: ConditionalRenderProps) {
  const hasRequiredPermission = useRolePermission(permission);

  if (!hasRequiredPermission) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}
