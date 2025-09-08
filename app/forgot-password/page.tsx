"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      if (!email.trim()) {
        setError("Por favor, ingresa tu dirección de email.");
        setLoading(false);
        return;
      }

      console.log("📧 Enviando solicitud de restablecimiento de contraseña...");

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("✅ Solicitud enviada exitosamente");
        setSuccess(true);
      } else {
        console.error("❌ Error al enviar solicitud:", data.error);
        setError(data.error || "Error al enviar la solicitud. Por favor, intenta nuevamente.");
      }
    } catch (error) {
      console.error("💥 Error inesperado:", error);
      setError("Error de conexión. Por favor, verifica tu conexión e intenta nuevamente.");
    } finally {
      setLoading(false);
    }
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
          <h2 className="text-3xl font-bold text-gray-900 mt-6">Restablecer Contraseña</h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa tu email para recibir instrucciones de restablecimiento
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-gray-800">
              ¿Olvidaste tu contraseña?
            </CardTitle>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    ¡Email enviado!
                  </h3>
                  <p className="text-sm text-gray-600">
                    Hemos enviado instrucciones de restablecimiento de contraseña a{" "}
                    <span className="font-medium">{email}</span>
                  </p>
                </div>
                <div className="pt-4">
                  <Link href="/login">
                    <Button className="w-full">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Volver al login
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      disabled={loading}
                    />
                    <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                >
                  {loading ? "Enviando..." : "Enviar instrucciones"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Back to Login */}
        <div className="text-center">
          <Link href="/login" className="text-sm text-blue-600 hover:text-blue-500">
            <ArrowLeft className="inline mr-1 h-4 w-4" />
            Volver al login
          </Link>
        </div>
      </div>
    </div>
  );
}
