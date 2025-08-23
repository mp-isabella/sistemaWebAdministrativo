import { NextRequest, NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";

  if (!query) return NextResponse.json([]);

  const rawClientes = await prisma.client.findMany({
    where: {
      name: {
        contains: query,
      },
    },
    take: 5,
  });

  const clientes = rawClientes.map((c) => ({
    id: typeof c.id === "string" ? parseInt(c.id, 10) : c.id,
    nombre: c.name,
  }));

  const rawTrabajos = await prisma.job.findMany({
    where: {
      title: {
        contains: query,
      },
    },
    take: 5,
  });

  const trabajos = rawTrabajos.map((t) => ({
    id: typeof t.id === "string" ? parseInt(t.id, 10) : t.id,
    titulo: t.title,
  }));

  const resultados = [
    ...clientes.map((c) => ({ id: c.id, tipo: "cliente", nombre: c.nombre })),
    ...trabajos.map((t) => ({ id: t.id, tipo: "trabajo", nombre: t.titulo })),
  ];

  return NextResponse.json(resultados);
}
