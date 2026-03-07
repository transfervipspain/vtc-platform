import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Crear empresa
  const company = await prisma.company.create({
    data: {
      legalName: "Transfer Vip Spain SL",
      tradeName: "Transfer Vip Spain",
      email: "info@transfervipspain.com",
      phone: "600000000",
      isActive: true,
    },
  });

  // 2. Crear conductores
  const driver1 = await prisma.driver.create({
    data: {
      companyId: company.id,
      firstName: "Juan",
      lastName: "Conductor",
      fullName: "Juan Conductor",
      phone: "611111111",
      email: "juan@transfervipspain.com",
      nationalId: "00000000A",
      drivingLicenseNumber: "LIC001",
      licensePoints: 12,
      isActive: true,
    },
  });

  const driver2 = await prisma.driver.create({
    data: {
      companyId: company.id,
      firstName: "Pedro",
      lastName: "Conductor",
      fullName: "Pedro Conductor",
      phone: "622222222",
      email: "pedro@transfervipspain.com",
      nationalId: "00000000B",
      drivingLicenseNumber: "LIC002",
      licensePoints: 10,
      isActive: true,
    },
  });

  // 3. Crear vehículos
  const vehicle1 = await prisma.vehicle.create({
    data: {
      companyId: company.id,
      plateNumber: "5288NBB",
      brand: "Toyota",
      model: "bZ4X",
      energyType: "electric",
      isActive: true,
      notes: "Vehículo eléctrico",
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      companyId: company.id,
      plateNumber: "2608NHF",
      brand: "Hyundai",
      model: "Staria",
      energyType: "diesel",
      isActive: true,
      notes: "Vehículo térmico",
    },
  });

  // 4. Crear plataformas
  const bolt = await prisma.platform.create({
    data: {
      companyId: company.id,
      code: "BOLT",
      name: "Bolt",
      isActive: true,
    },
  });

  const uber = await prisma.platform.create({
    data: {
      companyId: company.id,
      code: "UBER",
      name: "Uber",
      isActive: true,
    },
  });

  const cabify = await prisma.platform.create({
    data: {
      companyId: company.id,
      code: "CABIFY",
      name: "Cabify",
      isActive: true,
    },
  });

  // 5. Crear una operación diaria de ejemplo
  const dailyOperation = await prisma.dailyOperation.create({
    data: {
      companyId: company.id,
      driverId: driver1.id,
      vehicleId: vehicle1.id,
      operationDate: new Date("2026-03-07"),
      weekdayLabel: "Sábado",
      notes: "Cierre diario de prueba",
    },
  });

  // 6. Crear ingresos por plataforma
  await prisma.dailyPlatformIncome.createMany({
    data: [
      {
        dailyOperationId: dailyOperation.id,
        platformId: bolt.id,
        grossAmount: 140,
        tipsAmount: 6,
        cashAmount: 0,
      },
      {
        dailyOperationId: dailyOperation.id,
        platformId: uber.id,
        grossAmount: 95,
        tipsAmount: 2,
        cashAmount: 0,
      },
      {
        dailyOperationId: dailyOperation.id,
        platformId: cabify.id,
        grossAmount: 30,
        tipsAmount: 0,
        cashAmount: 0,
      },
    ],
  });

  // 7. Crear resumen de privados del día
  await prisma.dailyPrivateIncomeSummary.create({
    data: {
      dailyOperationId: dailyOperation.id,
      grossAmount: 45,
      tipsAmount: 0,
      cashAmount: 20,
    },
  });

  // 8. Crear registro energético
  await prisma.vehicleEnergyLog.create({
    data: {
      dailyOperationId: dailyOperation.id,
      energyType: "electric",
      electricCost: 18,
      electricKwh: 42,
      kilometers: 190,
    },
  });

  // 9. Crear un viaje privado de ejemplo
  await prisma.privateTrip.create({
    data: {
      companyId: company.id,
      driverId: driver2.id,
      vehicleId: vehicle2.id,
      weekLabel: "Semana 10",
      serviceDate: new Date("2026-03-08"),
      serviceTime: "06:30",
      amount: 65,
      sourcePlatform: "Web privada",
      isLuxucar: false,
      isCash: false,
      isCard: true,
      intermediary: "Directo",
      communicator: "Web",
      status: "confirmed",
      notes: "Traslado aeropuerto",
    },
  });

  console.log("Datos de prueba creados correctamente.");
}

main()
  .catch((e) => {
    console.error("Error al crear datos de prueba:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });