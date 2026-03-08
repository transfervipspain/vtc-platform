import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const trip = await prisma.privateTrip.update({
      where: {
        id: body.tripId
      },
      data: {
        driverId: body.driverId,
        status: "assigned"
      }
    });

    return NextResponse.json(trip);

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Error asignando servicio" },
      { status: 500 }
    );

  }

}