import { prisma } from "@/lib/prisma";
import DefaultVehicleSelect from "./DefaultVehicleSelect";
import DriverForm from "./DriverForm";
import ToggleDriverActiveButton from "./ToggleDriverActiveButton";
import EditDriverForm from "./EditDriverForm";

export const dynamic = "force-dynamic";

export default async function ConductoresPage() {
const company = await prisma.company.findFirst();
const drivers = await prisma.driver.findMany({
  orderBy: [
    { isActive: "desc" },
    { fullName: "asc" }
  ],
  include: {
    defaultVehicle: true
  }
});
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { plateNumber: "asc" },
  });

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>



{company && <DriverForm companyId={company.id} />}

      <h1>Conductores</h1>

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
    <th style={{ padding: "10px 12px" }}>Nombre</th>
    <th style={{ padding: "10px 12px" }}>Teléfono</th>
    <th style={{ padding: "10px 12px" }}>Email</th>
    <th style={{ padding: "10px 12px" }}>Puntos</th>
    <th style={{ padding: "10px 12px" }}>Vehículo habitual</th>
    <th style={{ padding: "10px 12px" }}>Estado</th>
    <th style={{ padding: "10px 12px" }}>Acciones</th>
  </tr>
</thead>

    <tbody>
      {drivers.map((driver) => (
        <tr key={driver.id} style={{ borderTop: "1px solid #e5e5e5" }}>
          <td style={{ padding: "10px 12px", fontWeight: "bold" }}>
            {driver.fullName}
          </td>

          <td style={{ padding: "10px 12px" }}>
            {driver.phone ?? "-"}
          </td>
	  <td style={{ padding: "10px 12px" }}>
  {driver.email ?? "-"}
</td>

<td style={{ padding: "10px 12px", fontWeight: "bold" }}>
  {driver.licensePoints ?? "-"}
</td>

          <td style={{ padding: "10px 12px" }}>
            {driver.defaultVehicle?.plateNumber ?? "No asignado"}
          </td>

          <td style={{ padding: "10px 12px" }}>
            <span
              style={{
                padding: "3px 8px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: "bold",
                color: "white",
                background: driver.isActive ? "#27ae60" : "#c0392b",
              }}
            >
              {driver.isActive ? "ACTIVO" : "INACTIVO"}
            </span>
          </td>

          <td style={{ padding: "10px 12px" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <ToggleDriverActiveButton
                driverId={driver.id}
                isActive={driver.isActive}
              />

             <EditDriverForm
  driverId={driver.id}
  initialPhone={driver.phone}
  initialEmail={driver.email}
  initialLicensePoints={driver.licensePoints}
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