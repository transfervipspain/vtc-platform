import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function toDateWithOptionalTime(dateStr: string, timeStr?: string | null) {
  if (!timeStr) {
    return new Date(dateStr);
  }

  return new Date(`${dateStr}T${timeStr}:00`);
}

export async function GET() {
  try {
    const trips = await prisma.privateTrip.findMany({
      orderBy: [{ serviceDate: "desc" }, { serviceTime: "asc" }],
      include: {
        driver: true,
        vehicle: true,
      },
    });

    return NextResponse.json(trips);
  } catch (error) {
    console.error("GET /api/private-trips error:", error);

    return NextResponse.json(
      { error: "No se pudieron cargar los viajes privados" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    let {
      companyId,
      driverId,
      vehicleId,
      serviceDate,
      serviceTime,
      amount,
      origin,
      destination,
      stops,
      sourcePlatform,
      intermediary,
      communicator,
      notes,
      status,
      isLuxucar,
      isCash,
      isCard,
    } = body ?? {};

    if (!companyId) {
      const firstCompany = await prisma.company.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
        select: { id: true },
      });

      if (!firstCompany) {
        return NextResponse.json(
          { error: "No hay empresa activa disponible" },
          { status: 400 }
        );
      }

      companyId = firstCompany.id;
    }

    if (!serviceDate) {
      return NextResponse.json(
        { error: "La fecha del servicio es obligatoria" },
        { status: 400 }
      );
    }

    if (amount === undefined || amount === null || Number.isNaN(Number(amount))) {
      return NextResponse.json(
        { error: "El importe es obligatorio" },
        { status: 400 }
      );
    }

    const createdTrip = await prisma.privateTrip.create({
      data: {
        companyId,
        driverId: driverId || null,
        vehicleId: vehicleId || null,
        serviceDate: toDateWithOptionalTime(serviceDate, serviceTime),
        serviceTime: serviceTime || null,
        amount: Number(amount),
        origin: origin || null,
        destination: destination || null,
        stops: stops || null,
        sourcePlatform: sourcePlatform || null,
        intermediary: intermediary || null,
        communicator: communicator || null,
        notes: notes || null,
        status: status || "pending",
        isLuxucar: Boolean(isLuxucar),
        isCash: Boolean(isCash),
        isCard: Boolean(isCard),
      },
      include: {
        driver: true,
        vehicle: true,
      },
    });

    return NextResponse.json(createdTrip, { status: 201 });
  } catch (error) {
    console.error("POST /api/private-trips error:", error);

    return NextResponse.json(
      { error: "No se pudo crear el viaje privado" },
      { status: 500 }
    );
  }
}