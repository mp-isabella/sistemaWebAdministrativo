import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProfilePage() {
  return (
    <div className="p-6">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Mi Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p><strong>Nombre:</strong> Usuario Demo</p>
          <p><strong>Email:</strong> usuario@demo.com</p>
          <p><strong>Rol:</strong> Administrador</p>
        </CardContent>
      </Card>
    </div>
  )
}
