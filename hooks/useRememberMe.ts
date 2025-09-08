import { useState, useEffect } from 'react';

interface RememberMeData {
  email: string;
  rememberMe: boolean;
}

export const useRememberMe = () => {
  const [rememberMeData, setRememberMeData] = useState<RememberMeData>({
    email: '',
    rememberMe: false,
  });

  // Cargar datos guardados al inicializar
  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    
    if (savedEmail && savedRememberMe) {
      setRememberMeData({
        email: savedEmail,
        rememberMe: true,
      });
    }
  }, []);

  // Función para guardar la preferencia de recordar sesión
  const saveRememberMe = (email: string, rememberMe: boolean) => {
    if (rememberMe) {
      localStorage.setItem('userEmail', email);
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('userEmail');
      localStorage.removeItem('rememberMe');
    }
    
    setRememberMeData({ email, rememberMe });
  };

  // Función para limpiar los datos guardados
  const clearRememberMe = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('rememberMe');
    setRememberMeData({ email: '', rememberMe: false });
  };

  // Función para verificar si hay una sesión recordada
  const hasRememberedSession = () => {
    return localStorage.getItem('rememberMe') === 'true' && 
           localStorage.getItem('userEmail') !== null;
  };

  // Función para obtener el email guardado
  const getRememberedEmail = () => {
    return localStorage.getItem('userEmail') || '';
  };

  return {
    rememberMeData,
    saveRememberMe,
    clearRememberMe,
    hasRememberedSession,
    getRememberedEmail,
  };
};
