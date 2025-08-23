"use client";

import { useState, useEffect } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Timeout para evitar que se quede colgado
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (loading) {
      timeoutId = setTimeout(() => {
        console.error("⏰ Timeout en login - tomó más de 15 segundos");
        setError("Tiempo de espera agotado. Por favor, verifica tu conexión e intenta nuevamente.");
        setLoading(false);
      }, 15000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("🚀 Iniciando proceso de login...");
      console.log("📝 Credenciales:", { email: formData.email, password: formData.password });
      
      // Verificar que las credenciales no estén vacías
      if (!formData.email.trim() || !formData.password.trim()) {
        setError("Por favor, completa todos los campos.");
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email: formData.email.trim(),
        password: formData.password,
        redirect: false,
      });

      console.log("📊 Resultado del signIn:", result);

      if (result?.error) {
        console.error("❌ Error en login:", result.error);
        
        // Mensajes de error más específicos
        if (result.error.includes("CredentialsSignin")) {
          setError("Credenciales inválidas. Verifica tu email y contraseña.");
        } else if (result.error.includes("timeout")) {
          setError("Tiempo de espera agotado. Verifica tu conexión.");
        } else {
          setError(`Error de autenticación: ${result.error}`);
        }
        setLoading(false);
        return;
      }

      if (result?.ok) {
        console.log("✅ Login exitoso, obteniendo sesión...");
        
        // Intentar obtener la sesión varias veces si es necesario
        let session = null;
        let attempts = 0;
        const maxAttempts = 5;
        
        while (!session && attempts < maxAttempts) {
          try {
            session = await getSession();
            if (!session) {
              console.log(`🔄 Intento ${attempts + 1}: Sesión no disponible, esperando...`);
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } catch (error) {
            console.error(`❌ Error al obtener sesión (intento ${attempts + 1}):`, error);
          }
          attempts++;
        }
        
        console.log("📋 Sesión obtenida:", session);
        
        const role = session?.user?.role;
        console.log("👤 Rol del usuario:", role);

        if (role) {
          // Redirigir según el rol (convertir a minúsculas para comparación)
          const userRole = role.toLowerCase();
          let redirectPath = "/dashboard";
          
          if (userRole === "admin") {
            redirectPath = "/dashboard";
          } else if (userRole === "tecnico") {
            redirectPath = "/dashboard/my-jobs";
          } else if (userRole === "secretaria") {
            redirectPath = "/dashboard/billing";
          }
          
          console.log(`🔄 Redirigiendo a: ${redirectPath}`);
          router.push(redirectPath);
        } else {
          console.error("❌ No se pudo obtener el rol del usuario");
          setError("Error al obtener información del usuario. Por favor, intenta nuevamente.");
          setLoading(false);
        }
      } else {
        console.error("❌ Login falló sin error específico");
        setError("Error al iniciar sesión. Por favor, intenta nuevamente.");
        setLoading(false);
      }
    } catch (error) {
      console.error("💥 Error inesperado en login:", error);
      setError("Error inesperado. Por favor, intenta nuevamente.");
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Image
            src="/logo.png"
            alt="Logo Améstica"
            width={260}
            height={80}
            className="mx-auto object-contain"
            priority
          />
          <h2 className="text-3xl font-bold text-gray-900 mt-6">Acceso de Trabajadores</h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa tus credenciales para acceder al sistema interno
          </p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-gray-800">Iniciar Sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Email */}
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </Label>
                <div className="mt-1 relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="correo@amestica.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    disabled={loading}
                  />
                  <User className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </Label>
                <div className="mt-1 relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="Tu contraseña"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-10"
                    disabled={loading}
                  />
                  <Lock className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                  </button>
                </div>
              </div>

              {/* Recordarme y Olvidaste contraseña */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={loading}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Recordarme
                  </label>
                </div>
                <div className="text-sm">
                  <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              >
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-500">
            ← Volver al sitio principal
          </Link>
        </div>
      </div>
    </div>
  );
}
