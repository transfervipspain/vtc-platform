import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const driver = await prisma.driver.update({
      where: {
        id: body.driverId,
      },
      data: {
        defaultVehicleId: body.vehicleId,
      },
    });

    return NextResponse.json(driver);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Error actualizando vehículo habitual" },
      { status: 500 }
    );
  }
}