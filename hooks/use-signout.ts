import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export const useSignOut = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // Limpiar localStorage antes del cierre de sesión
      if (typeof window !== 'undefined') {
        localStorage.removeItem('notifications');
        localStorage.removeItem('jobNotifications');
        localStorage.removeItem('calendar-selected-date');
        // Limpiar cualquier otro dato de sesión
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('auth') || key.includes('session') || key.includes('user'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }

      // Intentar cerrar sesión con NextAuth
      await signOut({ 
        callbackUrl: '/login',
        redirect: false // No redirigir automáticamente para manejar errores
      });

      // Si llegamos aquí, el cierre de sesión fue exitoso
      // Redirigir manualmente
      router.push('/login');
      
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      
      // Fallback: limpiar localStorage y redirigir manualmente
      if (typeof window !== 'undefined') {
        localStorage.removeItem('notifications');
        localStorage.removeItem('jobNotifications');
        localStorage.removeItem('calendar-selected-date');
        localStorage.clear(); // Limpiar todo el localStorage
        window.location.href = '/login';
      }
    }
  };

  return { handleSignOut };
};
