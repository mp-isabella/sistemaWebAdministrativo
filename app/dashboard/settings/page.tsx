import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function SettingsPage() {
  return (
    <div className="p-6">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Configuración</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nombre</label>
            <Input placeholder="Usuario Demo" />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input placeholder="usuario@demo.com" type="email" />
          </div>
          <Button className="w-full">Guardar Cambios</Button>
        </CardContent>
      </Card>
    </div>
  )
}
