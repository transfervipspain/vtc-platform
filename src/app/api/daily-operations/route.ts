import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      companyId,
      driverId,
      vehicleId,
      operationDate,
      weekdayLabel,
      bolt,
      uber,
      cabify,
      privado,
      propinas,
      efectivo,
      kilometers,
      energyCost,
      energyQuantity,
      notes,
    } = body;

    if (!companyId || !driverId || !vehicleId || !operationDate) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehículo no encontrado" },
        { status: 404 }
      );
    }

    const boltPlatform = await prisma.platform.findFirst({
      where: {
        companyId,
        code: "BOLT",
      },
    });

    const uberPlatform = await prisma.platform.findFirst({
      where: {
        companyId,
        code: "UBER",
      },
    });

    const cabifyPlatform = await prisma.platform.findFirst({
      where: {
        companyId,
        code: "CABIFY",
      },
    });

    const operation = await prisma.dailyOperation.create({
      data: {
        companyId,
        driverId,
        vehicleId,
        operationDate: new Date(operationDate),
        weekdayLabel,
        notes,
      },
    });

    if (boltPlatform && Number(bolt) > 0) {
      await prisma.dailyPlatformIncome.create({
        data: {
          dailyOperationId: operation.id,
          platformId: boltPlatform.id,
          grossAmount: Number(bolt),
          tipsAmount: Number(propinas || 0),
          cashAmount: Number(efectivo || 0),
        },
      });
    }

    if (uberPlatform && Number(uber) > 0) {
      await prisma.dailyPlatformIncome.create({
        data: {
          dailyOperationId: operation.id,
          platformId: uberPlatform.id,
          grossAmount: Number(uber),
          tipsAmount: 0,
          cashAmount: 0,
        },
      });
    }

    if (cabifyPlatform && Number(cabify) > 0) {
      await prisma.dailyPlatformIncome.create({
        data: {
          dailyOperationId: operation.id,
          platformId: cabifyPlatform.id,
          grossAmount: Number(cabify),
          tipsAmount: 0,
          cashAmount: 0,
        },
      });
    }

    if (Number(privado) > 0) {
      await prisma.dailyPrivateIncomeSummary.create({
        data: {
          dailyOperationId: operation.id,
          grossAmount: Number(privado),
          tipsAmount: 0,
          cashAmount: 0,
        },
      });
    }

    await prisma.vehicleEnergyLog.create({
      data: {
        dailyOperationId: operation.id,
        energyType: vehicle.energyType,
        kilometers: Number(kilometers || 0),
        fuelCost: vehicle.energyType === "electric" ? null : Number(energyCost || 0),
        fuelLiters:
          vehicle.energyType === "electric" ? null : Number(energyQuantity || 0),
        electricCost:
          vehicle.energyType === "electric" ? Number(energyCost || 0) : null,
        electricKwh:
          vehicle.energyType === "electric" ? Number(energyQuantity || 0) : null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}