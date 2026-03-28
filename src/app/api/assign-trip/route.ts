import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tripId, driverId } = body ?? {};

    if (!tripId || !driverId) {
      return NextResponse.json(
        { error: "tripId y driverId son obligatorios" },
        { status: 400 }
      );
    }

    const existingTrip = await prisma.privateTrip.findUnique({
      where: { id: tripId },
      select: {
        id: true,
        status: true,
      },
    });

    if (!existingTrip) {
      return NextResponse.json(
        { error: "Viaje no encontrado" },
        { status: 404 }
      );
    }

    const updatedTrip = await prisma.privateTrip.update({
      where: { id: tripId },
      data: {
        driverId,
        status: existingTrip.status === "pending" ? "assigned" : existingTrip.status,
      },
      include: {
        driver: true,
        vehicle: true,
      },
    });

    return NextResponse.json(updatedTrip);
  } catch (error) {
    console.error("POST /api/assign-trip error:", error);

    return NextResponse.json(
      { error: "No se pudo asignar el conductor" },
      { status: 500 }
    );
  }
}