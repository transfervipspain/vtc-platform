import { prisma } from "@/lib/prisma";
import DriverForm from "./DriverForm";
import ToggleDriverActiveButton from "./ToggleDriverActiveButton";
import EditDriverForm from "./EditDriverForm";

export const dynamic = "force-dynamic";

export default async function ConductoresPage() {
const company = await prisma.company.findFirst({
  where: {
    isActive: true,
    NOT: { id: "" },
  },
  orderBy: { createdAt: "asc" },
});

  const drivers = await prisma.driver.findMany({
    where: company ? { companyId: company.id } : undefined,
    orderBy: [{ isActive: "desc" }, { fullName: "asc" }],
    include: {
      defaultVehicle: true,
    },
  });

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Conductores</h1>

      {!company ? (
        <p style={{ color: "#666" }}>
          No hay ninguna empresa activa creada todavía.
        </p>
      ) : (
        <DriverForm companyId={company.id} />
      )}

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
              <th style={{ padding: "10px 12px" }}>Vehículo habitual</th>
              <th style={{ padding: "10px 12px" }}>Estado</th>
              <th style={{ padding: "10px 12px" }}>% Comisión</th>
              <th style={{ padding: "10px 12px" }}>Modo</th>
              <th style={{ padding: "10px 12px" }}>Umbral</th>
              <th style={{ padding: "10px 12px" }}>Sueldo fijo</th>
              <th style={{ padding: "10px 12px" }}>Comisión activa</th>
              <th style={{ padding: "10px 12px" }}>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {drivers.map((driver) => (
              <tr key={driver.id} style={{ borderTop: "1px solid #e5e5e5" }}>
                <td style={{ padding: "10px 12px", fontWeight: "bold" }}>
                  {driver.fullName}
                </td>

                <td style={{ padding: "10px 12px" }}>{driver.phone ?? "-"}</td>

                <td style={{ padding: "10px 12px" }}>
                  {driver.defaultVehicle
                    ? `${driver.defaultVehicle.plateNumber}`
                    : "No asignado"}
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
                  {driver.commissionPercentage?.toFixed(0) ?? 0}%
                </td>

                <td style={{ padding: "10px 12px" }}>
                  {driver.commissionMode === "monthly" ? "Mensual" : "Semanal"}
                </td>

                <td style={{ padding: "10px 12px" }}>
                  {(driver.commissionThreshold ?? 0).toFixed(2)} €
                </td>

                <td style={{ padding: "10px 12px" }}>
                  {(driver.fixedSalaryMonthly ?? 0).toFixed(2)} €
                </td>

                <td style={{ padding: "10px 12px" }}>
                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: "bold",
                      color: "white",
                      background: driver.commissionEnabled
                        ? "#27ae60"
                        : "#c0392b",
                    }}
                  >
                    {driver.commissionEnabled ? "ACTIVA" : "OFF"}
                  </span>
                </td>

                <td style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <ToggleDriverActiveButton
                      driverId={driver.id}
                      isActive={driver.isActive}
                    />

                    <EditDriverForm
                      driverId={driver.id}
                      initialPhone={driver.phone}
                      initialEmail={driver.email}
                      initialLicensePoints={driver.licensePoints}
                      initialCommission={driver.commissionPercentage}
                      initialFixedSalaryMonthly={driver.fixedSalaryMonthly}
                      initialCommissionMode={driver.commissionMode}
                      initialCommissionThreshold={driver.commissionThreshold}
                      initialCommissionEnabled={driver.commissionEnabled}
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