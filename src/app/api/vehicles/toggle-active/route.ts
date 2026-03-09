import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const vehicle = await prisma.vehicle.update({
      where: { id: body.vehicleId },
      data: {
        isActive: body.isActive,
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