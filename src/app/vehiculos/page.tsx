import { prisma } from "@/lib/prisma";
import VehicleForm from "./VehicleForm";
import ToggleVehicleActiveButton from "./ToggleVehicleActiveButton";
import EditVehicleForm from "./EditVehicleForm";

export const dynamic = "force-dynamic";

export default async function VehiculosPage() {
  const company = await prisma.company.findFirst();

const vehicles = await prisma.vehicle.findMany({
  orderBy: [
    { isActive: "desc" },
    { plateNumber: "asc" }
  ],
});

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Vehículos</h1>

      {company && <VehicleForm companyId={company.id} />}

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 10,
          overflow: "hidden",
          background: "#fafafa",
          marginTop: 20,
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 14,
          }}
        >
          <thead>
            <tr style={{ background: "#f0f0f0", textAlign: "left" }}>
              <th style={{ padding: "10px 12px" }}>Matrícula</th>
              <th style={{ padding: "10px 12px" }}>Marca</th>
              <th style={{ padding: "10px 12px" }}>Modelo</th>
              <th style={{ padding: "10px 12px" }}>Energía</th>
              <th style={{ padding: "10px 12px" }}>Estado</th>
              <th style={{ padding: "10px 12px" }}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id} style={{ borderTop: "1px solid #e5e5e5" }}>
                <td style={{ padding: "10px 12px", fontWeight: "bold" }}>
                  {vehicle.plateNumber}
                </td>

                <td style={{ padding: "10px 12px" }}>
                  {vehicle.brand ?? "-"}
                </td>

                <td style={{ padding: "10px 12px" }}>
                  {vehicle.model ?? "-"}
                </td>

                <td style={{ padding: "10px 12px" }}>
                  {vehicle.energyType}
                </td>

                <td style={{ padding: "10px 12px" }}>
                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: "bold",
                      color: "white",
                      background: vehicle.isActive ? "#27ae60" : "#c0392b",
                    }}
                  >
                    {vehicle.isActive ? "ACTIVO" : "INACTIVO"}
                  </span>
                </td>

                <td style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <ToggleVehicleActiveButton
                      vehicleId={vehicle.id}
                      isActive={vehicle.isActive}
                    />

                    <EditVehicleForm
                      vehicleId={vehicle.id}
                      initialBrand={vehicle.brand}
                      initialModel={vehicle.model}
                      initialEnergyType={vehicle.energyType}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}