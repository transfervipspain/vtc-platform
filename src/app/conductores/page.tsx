import { prisma } from "@/lib/prisma";
import DriverForm from "./DriverForm";
import ToggleDriverActiveButton from "./ToggleDriverActiveButton";
import EditDriverForm from "./EditDriverForm";
import NewDriverModal from "./NewDriverModal";

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
    <main
      style={{
        padding: 20,
        maxWidth: 1200,
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, marginBottom: 8 }}>Conductores</h1>
        <p style={{ color: "#6b7280", margin: 0 }}>
          Gestión de conductores, estado y configuración de comisión.
        </p>
      </div>

           {!company ? (
        <div
          style={{
            border: "1px dashed #d1d5db",
            borderRadius: 14,
            padding: 20,
            background: "#fafafa",
            color: "#6b7280",
          }}
        >
          No hay ninguna empresa activa creada todavía.
        </div>
      ) : (
        <NewDriverModal>
          <DriverForm companyId={company.id} />
        </NewDriverModal>
      )}

      {drivers.length === 0 ? (
        <div
          style={{
            border: "1px dashed #d1d5db",
            borderRadius: 14,
            padding: 20,
            background: "#fafafa",
            marginTop: 20,
            color: "#6b7280",
          }}
        >
          No hay conductores todavía.
        </div>
      ) : (
        <>
          <style>{`
            @media (max-width: 768px) {
              .drivers-desktop {
                display: none !important;
              }
              .drivers-mobile {
                display: grid !important;
              }
            }

            @media (min-width: 769px) {
              .drivers-desktop {
                display: block !important;
              }
              .drivers-mobile {
                display: none !important;
              }
            }
          `}</style>

          <div className="drivers-desktop" style={{ display: "block" }}>
            <div
              style={{
                overflowX: "auto",
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                background: "white",
                boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
                marginTop: 20,
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 14,
                  minWidth: 1100,
                }}
              >
                <thead>
                  <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                    <th style={thStyle}>Nombre</th>
                    <th style={thStyle}>Teléfono</th>
                    <th style={thStyle}>Vehículo habitual</th>
                    <th style={thStyle}>Estado</th>
                    <th style={thStyle}>% Comisión</th>
                    <th style={thStyle}>Modo</th>
                    <th style={thStyle}>Umbral</th>
                    <th style={thStyle}>Sueldo fijo</th>
                    <th style={thStyle}>Comisión activa</th>
                    <th style={thStyle}>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {drivers.map((driver) => (
                    <tr key={driver.id} style={{ borderTop: "1px solid #eef2f7" }}>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>
                        {driver.fullName}
                      </td>

                      <td style={tdStyle}>{driver.phone ?? "-"}</td>

                      <td style={tdStyle}>
                        {driver.defaultVehicle
                          ? driver.defaultVehicle.plateNumber
                          : "No asignado"}
                      </td>

                      <td style={tdStyle}>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: "bold",
                            color: "white",
                            background: driver.isActive ? "#16a34a" : "#dc2626",
                          }}
                        >
                          {driver.isActive ? "ACTIVO" : "INACTIVO"}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        {driver.commissionPercentage?.toFixed(0) ?? 0}%
                      </td>

                      <td style={tdStyle}>
                        {driver.commissionMode === "monthly" ? "Mensual" : "Semanal"}
                      </td>

                      <td style={tdStyle}>
                        {(driver.commissionThreshold ?? 0).toFixed(2)} €
                      </td>

                      <td style={tdStyle}>
                        {(driver.fixedSalaryMonthly ?? 0).toFixed(2)} €
                      </td>

                      <td style={tdStyle}>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: "bold",
                            color: "white",
                            background: driver.commissionEnabled ? "#16a34a" : "#64748b",
                          }}
                        >
                          {driver.commissionEnabled ? "ACTIVA" : "OFF"}
                        </span>
                      </td>

                      <td style={tdStyle}>
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
          </div>

          <div className="drivers-mobile" style={{ display: "none", marginTop: 20 }}>
            <div
              style={{
                display: "grid",
                gap: 12,
              }}
            >
              {drivers.map((driver) => (
                <div
                  key={driver.id}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 16,
                    background: "white",
                    boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
                    padding: 16,
                    display: "grid",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 12,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 17,
                          fontWeight: 700,
                          color: "#111827",
                          marginBottom: 4,
                        }}
                      >
                        {driver.fullName}
                      </div>

                      <div style={{ fontSize: 13, color: "#6b7280" }}>
                        {driver.phone ?? "Sin teléfono"}
                      </div>
                    </div>

                    <span
                      style={{
                        padding: "5px 10px",
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: "bold",
                        color: "white",
                        background: driver.isActive ? "#16a34a" : "#dc2626",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {driver.isActive ? "ACTIVO" : "INACTIVO"}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    <InfoItem
                      label="Vehículo"
                      value={
                        driver.defaultVehicle
                          ? driver.defaultVehicle.plateNumber
                          : "No asignado"
                      }
                    />
                    <InfoItem
                      label="% Comisión"
                      value={`${driver.commissionPercentage?.toFixed(0) ?? 0}%`}
                    />
                    <InfoItem
                      label="Modo"
                      value={
                        driver.commissionMode === "monthly" ? "Mensual" : "Semanal"
                      }
                    />
                    <InfoItem
                      label="Umbral"
                      value={`${(driver.commissionThreshold ?? 0).toFixed(2)} €`}
                    />
                    <InfoItem
                      label="Sueldo fijo"
                      value={`${(driver.fixedSalaryMonthly ?? 0).toFixed(2)} €`}
                    />
                    <InfoItem
                      label="Comisión"
                      value={driver.commissionEnabled ? "Activa" : "Off"}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      paddingTop: 4,
                    }}
                  >
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
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </main>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: "10px 12px",
      }}
    >
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
        {value}
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "10px 12px",
  color: "#475569",
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 12px",
  color: "#111827",
  verticalAlign: "top",
};