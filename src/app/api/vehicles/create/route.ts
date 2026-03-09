import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.companyId || !body.plateNumber) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        companyId: body.companyId,
        plateNumber: body.plateNumber,
        brand: body.brand || null,
        model: body.model || null,
        energyType: body.energyType || "electric",
        isActive: true,
      },
    });

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}