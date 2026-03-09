import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const vehicle = await prisma.vehicle.update({
      where: { id: body.vehicleId },
      data: {
        brand: body.brand || null,
        model: body.model || null,
        energyType: body.energyType,
      },
    });

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Error actualizando vehículo" },
      { status: 500 }
    );
  }
}