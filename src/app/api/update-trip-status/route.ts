import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { tripId, status } = await req.json();

    if (!tripId || !status) {
      return NextResponse.json(
        { error: "Missing data" },
        { status: 400 }
      );
    }

    const trip = await prisma.privateTrip.update({
      where: { id: tripId },
      data: { status },
    });

    return NextResponse.json(trip);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}