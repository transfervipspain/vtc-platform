import { prisma } from "@/lib/prisma";
import VehicleForm from "./VehicleForm";
import ToggleVehicleActiveButton from "./ToggleVehicleActiveButton";
import EditVehicleForm from "./EditVehicleForm";

export const dynamic = "force-dynamic";

export default async function VehiculosPage() {
  const company = await prisma.company.findFirst();

  const vehicles = await prisma.vehicle.findMany({
    orderBy: { plateNumber: "asc" },
  });

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Vehículos</h1>

      {company && <VehicleForm companyId={company.id} />}

      <div style={{ display: "grid", gap: 12 }}>
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 10,
              padding: 16,
              background: "#fafafa",
            }}
          >
            <strong>{vehicle.plateNumber}</strong>

            <div>
              {vehicle.brand} {vehicle.model}
            </div>

            <div>Tipo: {vehicle.energyType}</div>
<div style={{ marginTop: 10 }}>
  <ToggleVehicleActiveButton
    vehicleId={vehicle.id}
    isActive={vehicle.isActive}
  />
</div>

<EditVehicleForm
  vehicleId={vehicle.id}
  initialBrand={vehicle.brand}
  initialModel={vehicle.model}
  initialEnergyType={vehicle.energyType}
/>
          </div>
        ))}
      </div>
    </main>
  );
}