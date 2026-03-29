import { prisma } from "@/lib/prisma";
import VehicleForm from "./VehicleForm";
import ToggleVehicleActiveButton from "./ToggleVehicleActiveButton";
import EditVehicleForm from "./EditVehicleForm";
import NewVehicleModal from "./NewVehicleModal";

export const dynamic = "force-dynamic";

export default async function VehiculosPage() {
  const company = await prisma.company.findFirst({
    where: {
      isActive: true,
      NOT: { id: "" },
    },
    orderBy: { createdAt: "asc" },
  });

  const vehicles = await prisma.vehicle.findMany({
    where: company ? { companyId: company.id } : undefined,
    orderBy: [{ isActive: "desc" }, { plateNumber: "asc" }],
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
        <h1 style={{ margin: 0, marginBottom: 8 }}>Vehículos</h1>
        <p style={{ color: "#6b7280", margin: 0 }}>
          Gestión de vehículos, energía y estado de actividad.
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
        <NewVehicleModal>
          <VehicleForm companyId={company.id} />
        </NewVehicleModal>
      )}

      {vehicles.length === 0 ? (
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
          No hay vehículos todavía.
        </div>
      ) : (
        <>
          <style>{`
            @media (max-width: 768px) {
              .vehicles-desktop {
                display: none !important;
              }
              .vehicles-mobile {
                display: grid !important;
              }
            }

            @media (min-width: 769px) {
              .vehicles-desktop {
                display: block !important;
              }
              .vehicles-mobile {
                display: none !important;
              }
            }
          `}</style>

          <div className="vehicles-desktop" style={{ display: "block" }}>
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
                  minWidth: 900,
                }}
              >
                <thead>
                  <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                    <th style={thStyle}>Matrícula</th>
                    <th style={thStyle}>Marca</th>
                    <th style={thStyle}>Modelo</th>
                    <th style={thStyle}>Energía</th>
                    <th style={thStyle}>Estado</th>
                    <th style={thStyle}>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle.id} style={{ borderTop: "1px solid #eef2f7" }}>
                      <td style={{ ...tdStyle, fontWeight: 700 }}>
                        {vehicle.plateNumber}
                      </td>

                      <td style={tdStyle}>{vehicle.brand ?? "-"}</td>
                      <td style={tdStyle}>{vehicle.model ?? "-"}</td>
                      <td style={tdStyle}>{formatEnergyType(vehicle.energyType)}</td>

                      <td style={tdStyle}>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: "bold",
                            color: "white",
                            background: vehicle.isActive ? "#16a34a" : "#dc2626",
                          }}
                        >
                          {vehicle.isActive ? "ACTIVO" : "INACTIVO"}
                        </span>
                      </td>

                      <td style={tdStyle}>
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
          </div>

          <div className="vehicles-mobile" style={{ display: "none", marginTop: 20 }}>
            <div style={{ display: "grid", gap: 12 }}>
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
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
                        {vehicle.plateNumber}
                      </div>

                      <div style={{ fontSize: 13, color: "#6b7280" }}>
                        {(vehicle.brand ?? "-") + " " + (vehicle.model ?? "-")}
                      </div>
                    </div>

                    <span
                      style={{
                        padding: "5px 10px",
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: "bold",
                        color: "white",
                        background: vehicle.isActive ? "#16a34a" : "#dc2626",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {vehicle.isActive ? "ACTIVO" : "INACTIVO"}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                    }}
                  >
                    <InfoItem label="Marca" value={vehicle.brand ?? "-"} />
                    <InfoItem label="Modelo" value={vehicle.model ?? "-"} />
                    <InfoItem
                      label="Energía"
                      value={formatEnergyType(vehicle.energyType)}
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

function formatEnergyType(energyType: string) {
  switch (energyType) {
    case "electric":
      return "Eléctrico";
    case "hybrid":
      return "Híbrido";
    case "gasoline":
      return "Gasolina";
    case "diesel":
      return "Diésel";
    default:
      return energyType;
  }
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