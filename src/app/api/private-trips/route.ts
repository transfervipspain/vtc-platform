import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const trip = await prisma.privateTrip.create({
      data: {
        companyId: body.companyId,
        serviceDate: new Date(body.serviceDate),
        serviceTime: body.serviceTime,
        amount: body.amount,
        origin: body.origin,
        stops: body.stops,
        destination: body.destination,
        intermediary: body.intermediary,
        communicator: body.communicator,
        notes: body.notes,
        status: body.status,
      },
    });

    return NextResponse.json(trip);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}