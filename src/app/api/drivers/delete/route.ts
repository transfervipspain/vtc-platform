import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.driverId) {
      return NextResponse.json(
        { error: "Falta driverId" },
        { status: 400 }
      );
    }

    const operationsCount = await prisma.dailyOperation.count({
      where: { driverId: body.driverId },
    });

    const tripsCount = await prisma.privateTrip.count({
      where: { driverId: body.driverId },
    });

    if (operationsCount > 0 || tripsCount > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar el conductor porque tiene operaciones o viajes asociados. Desactívalo en su lugar.",
        },
        { status: 400 }
      );
    }

    await prisma.driver.delete({
      where: { id: body.driverId },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error eliminando conductor" },
      { status: 500 }
    );
  }
}