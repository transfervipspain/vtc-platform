import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.vehicleId) {
      return NextResponse.json(
        { error: "Falta vehicleId" },
        { status: 400 }
      );
    }

    const operationsCount = await prisma.dailyOperation.count({
      where: { vehicleId: body.vehicleId },
    });

    const tripsCount = await prisma.privateTrip.count({
      where: { vehicleId: body.vehicleId },
    });

    const defaultDriversCount = await prisma.driver.count({
      where: { defaultVehicleId: body.vehicleId },
    });

    if (operationsCount > 0 || tripsCount > 0 || defaultDriversCount > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar el vehículo porque tiene historial o está asignado a algún conductor. Desactívalo en su lugar.",
        },
        { status: 400 }
      );
    }

    await prisma.vehicle.delete({
      where: { id: body.vehicleId },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error eliminando vehículo" },
      { status: 500 }
    );
  }
}
