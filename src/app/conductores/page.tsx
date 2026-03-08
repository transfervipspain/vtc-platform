import { prisma } from "@/lib/prisma";
import DefaultVehicleSelect from "./DefaultVehicleSelect";

export const dynamic = "force-dynamic";

export default async function ConductoresPage() {
  const drivers = await prisma.driver.findMany({
    orderBy: { fullName: "asc" },
    include: {
      defaultVehicle: true,
    },
  });

  const vehicles = await prisma.vehicle.findMany({
    orderBy: { plateNumber: "asc" },
  });

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Conductores</h1>

      {drivers.map((driver) => (
        <div
          key={driver.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 10,
            padding: 16,
            marginBottom: 12,
          }}
        >
          <strong>{driver.fullName}</strong>

          <div>Teléfono: {driver.phone ?? "-"}</div>

          <div>
            Vehículo habitual:{" "}
            {driver.defaultVehicle?.plateNumber ?? "No asignado"}
          </div>

          <div>Estado: {driver.isActive ? "Activo" : "Inactivo"}</div>

          <DefaultVehicleSelect
            driverId={driver.id}
            currentVehicleId={driver.defaultVehicleId ?? null}
            vehicles={vehicles}
          />
        </div>
      ))}
    </main>
  );
}