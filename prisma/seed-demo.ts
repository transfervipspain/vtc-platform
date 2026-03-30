import "dotenv/config";
import { prisma } from "../src/lib/prisma";

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}

function pickOne<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function chance(probability: number) {
  return Math.random() < probability;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function formatWeekLabel(date: Date) {
  const year = date.getFullYear();
  const firstDay = new Date(year, 0, 1);
  const diffDays = Math.floor(
    (new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() -
      new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate()).getTime()) /
      86400000
  );
  const week = Math.ceil((diffDays + firstDay.getDay() + 1) / 7);
  return `Semana ${week}`;
}

function weekdayLabel(date: Date) {
  const weekdays = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];
  return weekdays[date.getDay()];
}

function dateOnly(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function timeString(hour: number, minute: number) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

async function main() {
  const company = await prisma.company.findFirst({
    where: {
      isActive: true,
      NOT: { id: "" },
    },
    orderBy: { createdAt: "asc" },
  });

  if (!company) {
    throw new Error("No hay empresa activa.");
  }

  const drivers = await prisma.driver.findMany({
    where: {
      companyId: company.id,
      isActive: true,
    },
    orderBy: { fullName: "asc" },
  });

  const vehicles = await prisma.vehicle.findMany({
    where: {
      companyId: company.id,
      isActive: true,
    },
    orderBy: { plateNumber: "asc" },
  });

  if (drivers.length === 0) {
    throw new Error("No hay conductores activos.");
  }

  if (vehicles.length === 0) {
    throw new Error("No hay vehículos activos.");
  }

  const platformData = [
    { code: "BOLT", name: "Bolt" },
    { code: "UBER", name: "Uber" },
    { code: "CABIFY", name: "Cabify" },
  ];

  for (const p of platformData) {
    await prisma.platform.upsert({
      where: {
        companyId_code: {
          companyId: company.id,
          code: p.code,
        },
      },
      update: {
        name: p.name,
        isActive: true,
      },
      create: {
        companyId: company.id,
        code: p.code,
        name: p.name,
        isActive: true,
      },
    });
  }

  const platforms = await prisma.platform.findMany({
    where: { companyId: company.id },
  });

  const platformByCode = new Map(platforms.map((p) => [p.code, p]));

  const demoTripNotesPrefix = "[DEMO]";
  const demoOpNotePrefix = "[DEMO]";
  const from = new Date();
  from.setDate(from.getDate() - 30);

  console.log("Limpiando datos demo anteriores...");

  const oldDemoOps = await prisma.dailyOperation.findMany({
    where: {
      companyId: company.id,
      notes: {
        startsWith: demoOpNotePrefix,
      },
    },
    select: { id: true },
  });

  const oldDemoOpIds = oldDemoOps.map((o) => o.id);

  if (oldDemoOpIds.length > 0) {
    await prisma.dailyPlatformIncome.deleteMany({
      where: {
        dailyOperationId: { in: oldDemoOpIds },
      },
    });

    await prisma.dailyPrivateIncomeSummary.deleteMany({
      where: {
        dailyOperationId: { in: oldDemoOpIds },
      },
    });

    await prisma.vehicleEnergyLog.deleteMany({
      where: {
        dailyOperationId: { in: oldDemoOpIds },
      },
    });

    await prisma.dailyOperation.deleteMany({
      where: {
        id: { in: oldDemoOpIds },
      },
    });
  }

  await prisma.privateTrip.deleteMany({
    where: {
      companyId: company.id,
      notes: {
        startsWith: demoTripNotesPrefix,
      },
    },
  });

  console.log("Creando operaciones diarias demo...");

  const today = dateOnly(new Date());
  const dates: Date[] = [];

  for (let i = 30; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d);
  }

  for (const day of dates) {
    const weekday = day.getDay();
    const opsCount =
      weekday === 0 ? randInt(0, 1) : weekday === 5 || weekday === 6 ? randInt(1, 2) : randInt(1, 2);

    const usedDrivers = new Set<string>();
    const usedVehicles = new Set<string>();

    for (let i = 0; i < opsCount; i++) {
      const availableDrivers = drivers.filter((d) => !usedDrivers.has(d.id));
      const availableVehicles = vehicles.filter((v) => !usedVehicles.has(v.id));

      if (availableDrivers.length === 0 || availableVehicles.length === 0) break;

      const driver = pickOne(availableDrivers);
      const vehicle = pickOne(availableVehicles);

      usedDrivers.add(driver.id);
      usedVehicles.add(vehicle.id);

      const boltGross = chance(0.9) ? round2(rand(50, 170)) : 0;
      const uberGross = chance(0.55) ? round2(rand(20, 120)) : 0;
      const cabifyGross = chance(0.3) ? round2(rand(10, 80)) : 0;
      const privateDailyGross = chance(0.25) ? round2(rand(20, 90)) : 0;

      const km = round2(rand(70, 260));

      let electricCost: number | null = null;
      let electricKwh: number | null = null;
      let fuelCost: number | null = null;
      let fuelLiters: number | null = null;

      if (vehicle.energyType === "electric") {
        electricKwh = round2(rand(12, 48));
        electricCost = round2(electricKwh * rand(0.18, 0.32));
      } else {
        fuelLiters = round2(rand(6, 18));
        fuelCost = round2(fuelLiters * rand(1.45, 1.8));
      }

      const op = await prisma.dailyOperation.create({
        data: {
          companyId: company.id,
          driverId: driver.id,
          vehicleId: vehicle.id,
          operationDate: day,
          weekdayLabel: weekdayLabel(day),
          notes: `${demoOpNotePrefix} Operación simulada`,
        },
      });

      const platformCreates = [
        { code: "BOLT", grossAmount: boltGross },
        { code: "UBER", grossAmount: uberGross },
        { code: "CABIFY", grossAmount: cabifyGross },
      ].filter((p) => p.grossAmount > 0);

      for (const p of platformCreates) {
        const platform = platformByCode.get(p.code);
        if (!platform) continue;

        await prisma.dailyPlatformIncome.create({
          data: {
            dailyOperationId: op.id,
            platformId: platform.id,
            grossAmount: p.grossAmount,
            tipsAmount: round2(rand(0, 12)),
            cashAmount: chance(0.25) ? round2(rand(0, 20)) : 0,
          },
        });
      }

      if (privateDailyGross > 0) {
        await prisma.dailyPrivateIncomeSummary.create({
          data: {
            dailyOperationId: op.id,
            grossAmount: privateDailyGross,
            tipsAmount: chance(0.2) ? round2(rand(0, 8)) : 0,
            cashAmount: chance(0.35) ? round2(rand(0, 20)) : 0,
          },
        });
      }

      await prisma.vehicleEnergyLog.create({
        data: {
          dailyOperationId: op.id,
          energyType: vehicle.energyType,
          fuelCost,
          fuelLiters,
          electricCost,
          electricKwh,
          kilometers: km,
        },
      });
    }
  }

  console.log("Creando viajes privados demo...");

  const origins = [
    "Toledo estación AVE",
    "Toledo centro",
    "Hotel Beatriz Toledo",
    "Aeropuerto Adolfo Suárez Madrid-Barajas",
    "Hospital Nacional de Parapléjicos",
    "Plaza de Zocodover",
    "Puy du Fou Toledo",
  ];

  const destinations = [
    "Madrid centro",
    "Atocha",
    "Barajas T4",
    "Illescas",
    "Talavera de la Reina",
    "Toledo centro",
    "Hotel Cigarral",
  ];

  const intermediaries = ["Directo", "Hotel", "Agencia", "Recepción", "Empresa"];
  const communicators = ["WhatsApp", "Teléfono", "Recepción", "Email"];
  const statuses = ["pending", "assigned", "completed", "cancelled"] as const;

  const privateTripsToCreate = randInt(18, 32);

  for (let i = 0; i < privateTripsToCreate; i++) {
    const day = pickOne(dates);
    const hour = randInt(6, 22);
    const minute = pickOne([0, 15, 30, 45]);
    const selectedStatus = pickOne(statuses);

    const assignDriver = selectedStatus !== "pending" && chance(0.8);
    const driver = assignDriver ? pickOne(drivers) : null;
    const vehicle = assignDriver ? pickOne(vehicles) : null;

    const origin = pickOne(origins);
    const destination = pickOne(destinations);
    const hasStops = chance(0.25);

    await prisma.privateTrip.create({
      data: {
        companyId: company.id,
        driverId: driver?.id ?? null,
        vehicleId: vehicle?.id ?? null,
        weekLabel: formatWeekLabel(day),
        serviceDate: day,
        serviceTime: timeString(hour, minute),
        amount: round2(rand(35, 180)),
        sourcePlatform: chance(0.2) ? "luxucar" : null,
        isLuxucar: chance(0.15),
        isCash: chance(0.35),
        isCard: chance(0.65),
        origin,
        stops: hasStops ? "Parada intermedia demo" : null,
        destination,
        intermediary: pickOne(intermediaries),
        communicator: pickOne(communicators),
        status: selectedStatus,
        notes: `${demoTripNotesPrefix} Viaje privado simulado`,
      },
    });
  }

  console.log("Datos demo creados correctamente.");
}

main()
  .catch((e) => {
    console.error("Error en seed demo:", e);
    process.exit(1);
  })
  .finally(async () => {
    
  });