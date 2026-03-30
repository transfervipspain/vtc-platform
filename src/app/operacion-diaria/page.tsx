export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import DailyOperationForm from "./DailyOperationForm";
import NewDailyOperationModal from "./NewDailyOperationModal";

type PageProps = {
  searchParams?: Promise<{
    driverId?: string;
    vehicleId?: string;
    date?: string;
  }>;
};

function formatCurrency(value: number) {
  return `${value.toFixed(2)} €`;
}

function formatDate(value: Date) {
  return new Date(value).toLocaleDateString("es-ES");
}

export default async function OperacionDiariaPage({
  searchParams,
}: PageProps) {
  const filters = (await searchParams) ?? {};

  

  if (!company) {
    return (
      <main
  style={{
    padding: 20,
    maxWidth: 1200,
    margin: "0 auto",
    fontFamily: "Arial, sans-serif",
  }}
>
  <div
    style={{
      marginBottom: 24,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 12,
      flexWrap: "wrap",
    }}
  >
    <div>
      <h1 style={{ margin: 0, marginBottom: 6 }}>
        Operación diaria
      </h1>
      <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
        Control de ingresos, kilómetros y costes por conductor.
      </p>
    </div>

    {companyId ? (
  <NewDailyOperationModal>
    <DailyOperationForm
      companyId={companyId}
      drivers={drivers}
      vehicles={vehicles}
    />
  </NewDailyOperationModal>
) : null}
  </div>
        <p>No hay empresa cargada.</p>
      </main>
    );
  }

  const where: {
    companyId: string;
    driverId?: string;
    vehicleId?: string;
    operationDate?: {
      gte: Date;
      lte: Date;
    };
  } = {
    companyId: company.id,
  };

  if (filters.driverId) {
    where.driverId = filters.driverId;
  }

  if (filters.vehicleId) {
    where.vehicleId = filters.vehicleId;
  }

  if (filters.date) {
    const start = new Date(filters.date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(filters.date);
    end.setHours(23, 59, 59, 999);

    where.operationDate = {
      gte: start,
      lte: end,
    };
  }

  const operations = await prisma.dailyOperation.findMany({
    where,
    orderBy: { operationDate: "desc" },
    take: 50,
    include: {
      driver: true,
      vehicle: true,
      platformIncomes: {
        include: {
          platform: true,
        },
      },
      privateIncomeSummary: true,
      vehicleEnergyLog: true,
    },
  });

  const totals = operations.reduce(
    (acc, op) => {
      const bolt =
        op.platformIncomes.find((p) => p.platform.code === "BOLT")
          ?.grossAmount ?? 0;

      const uber =
        op.platformIncomes.find((p) => p.platform.code === "UBER")
          ?.grossAmount ?? 0;

      const cabify =
        op.platformIncomes.find((p) => p.platform.code === "CABIFY")
          ?.grossAmount ?? 0;

      const privado = op.privateIncomeSummary?.grossAmount ?? 0;

      const total = bolt + uber + cabify + privado;

      const energy =
        op.vehicleEnergyLog?.electricCost ??
        op.vehicleEnergyLog?.fuelCost ??
        0;

      const km = op.vehicleEnergyLog?.kilometers ?? 0;

      acc.income += total;
      acc.energy += energy;
      acc.km += km;

      return acc;
    },
    {
      income: 0,
      energy: 0,
      km: 0,
    }
  );

  const avg = operations.length > 0 ? totals.income / operations.length : 0;
const company = await prisma.company.findFirst({
  where: {
    isActive: true,
    NOT: { id: "" },
  },
  include: {
    drivers: {
      where: { isActive: true },
      orderBy: { fullName: "asc" },
    },
    vehicles: {
      where: { isActive: true },
      orderBy: { plateNumber: "asc" },
    },
  },
  orderBy: { createdAt: "asc" },
});

const drivers = company?.drivers ?? [];
const vehicles = company?.vehicles ?? [];
const companyId = company?.id ?? null;
  return (
    <main
      style={{
        padding: 24,
        maxWidth: 1320,
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, marginBottom: 8 }}>Operación diaria</h1>
        <p style={{ color: "#6b7280", margin: 0 }}>
          Registro diario por conductor y vehículo.
        </p>
      </div>

      <NewDailyOperationModal>
        <DailyOperationForm
          companyId={company.id}
          drivers={company.drivers}
          vehicles={company.vehicles}
        />
      </NewDailyOperationModal>

      <section style={{ marginTop: 32 }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ margin: 0, marginBottom: 6 }}>Últimos registros</h2>
          <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
            Últimas 50 operaciones registradas.
          </p>
        </div>

        <form
          style={{
            marginBottom: 20,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
            alignItems: "end",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: 16,
            boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
          }}
        >
          <div>
            <label style={labelStyle}>Conductor</label>
            <select
              name="driverId"
              defaultValue={filters.driverId || ""}
              style={inputStyle}
            >
              <option value="">Todos</option>
              {company.drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Vehículo</label>
            <select
              name="vehicleId"
              defaultValue={filters.vehicleId || ""}
              style={inputStyle}
            >
              <option value="">Todos</option>
              {company.vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plateNumber}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Fecha</label>
            <input
              type="date"
              name="date"
              defaultValue={filters.date || ""}
              style={inputStyle}
            />
          </div>

          <button type="submit" style={primaryButtonStyle}>
            Filtrar
          </button>

          <a href="/operacion-diaria" style={secondaryButtonStyle}>
            Limpiar
          </a>
        </form>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <Kpi
            title="Ingresos"
            value={formatCurrency(totals.income)}
            color="#2563eb"
            background="#eff6ff"
            borderColor="#bfdbfe"
          />
          <Kpi
            title="Km totales"
            value={totals.km.toFixed(0)}
            color="#16a34a"
            background="#f0fdf4"
            borderColor="#bbf7d0"
          />
          <Kpi
            title="Energía"
            value={formatCurrency(totals.energy)}
            color="#f59e0b"
            background="#fffbeb"
            borderColor="#fde68a"
          />
          <Kpi
            title="Media / operación"
            value={formatCurrency(avg)}
            color="#7c3aed"
            background="#faf5ff"
            borderColor="#e9d5ff"
          />
        </div>

             {operations.length === 0 ? (
          <div
            style={{
              border: "1px dashed #d1d5db",
              borderRadius: 14,
              padding: 24,
              background: "#fafafa",
              color: "#6b7280",
            }}
          >
            No hay registros con esos filtros.
          </div>
        ) : (
          <>
            <style>{`
              .daily-ops-desktop {
                display: block;
              }

              .daily-ops-mobile {
                display: none;
              }

              @media (max-width: 900px) {
                .daily-ops-desktop {
                  display: none !important;
                }

                .daily-ops-mobile {
                  display: flex !important;
                  flex-direction: column;
                  gap: 12px;
                }
              }
            `}</style>

            <div className="daily-ops-desktop">
              <div
                style={{
                  overflowX: "auto",
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  background: "#fff",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
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
                    <tr
                      style={{
                        background: "#f8fafc",
                        textAlign: "left",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <th style={thStyle}>Fecha</th>
                      <th style={thStyle}>Conductor</th>
                      <th style={thStyle}>Vehículo</th>
                      <th style={thStyle}>Bolt</th>
                      <th style={thStyle}>Uber</th>
                      <th style={thStyle}>Cabify</th>
                      <th style={thStyle}>Privado</th>
                      <th style={thStyle}>Total</th>
                      <th style={thStyle}>Km</th>
                      <th style={thStyle}>Energía</th>
                      <th style={thStyle}>Notas</th>
                    </tr>
                  </thead>

                  <tbody>
                    {operations.map((op) => {
                      const bolt =
                        op.platformIncomes.find((p) => p.platform.code === "BOLT")
                          ?.grossAmount ?? 0;

                      const uber =
                        op.platformIncomes.find((p) => p.platform.code === "UBER")
                          ?.grossAmount ?? 0;

                      const cabify =
                        op.platformIncomes.find((p) => p.platform.code === "CABIFY")
                          ?.grossAmount ?? 0;

                      const privado = op.privateIncomeSummary?.grossAmount ?? 0;
                      const total = bolt + uber + cabify + privado;

                      const energy =
                        op.vehicleEnergyLog?.electricCost ??
                        op.vehicleEnergyLog?.fuelCost ??
                        0;

                      const kilometers = op.vehicleEnergyLog?.kilometers ?? 0;

                      return (
                        <tr
                          key={op.id}
                          style={{
                            borderBottom: "1px solid #f1f5f9",
                          }}
                        >
                          <td style={tdStyle}>{formatDate(op.operationDate)}</td>
                          <td style={tdStyle}>
                            <span style={{ fontWeight: 600 }}>
                              {op.driver.fullName}
                            </span>
                          </td>
                          <td style={tdStyle}>{op.vehicle.plateNumber}</td>
                          <td style={tdStyle}>{formatCurrency(bolt)}</td>
                          <td style={tdStyle}>{formatCurrency(uber)}</td>
                          <td style={tdStyle}>{formatCurrency(cabify)}</td>
                          <td style={tdStyle}>{formatCurrency(privado)}</td>
                          <td style={{ ...tdStyle, fontWeight: 700 }}>
                            {formatCurrency(total)}
                          </td>
                          <td style={tdStyle}>{kilometers}</td>
                          <td style={tdStyle}>{formatCurrency(energy)}</td>
                          <td style={tdStyle}>{op.notes?.trim() || "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="daily-ops-mobile">
              {operations.map((op) => {
                const bolt =
                  op.platformIncomes.find((p) => p.platform.code === "BOLT")
                    ?.grossAmount ?? 0;

                const uber =
                  op.platformIncomes.find((p) => p.platform.code === "UBER")
                    ?.grossAmount ?? 0;

                const cabify =
                  op.platformIncomes.find((p) => p.platform.code === "CABIFY")
                    ?.grossAmount ?? 0;

                const privado = op.privateIncomeSummary?.grossAmount ?? 0;
                const total = bolt + uber + cabify + privado;

                const energy =
                  op.vehicleEnergyLog?.electricCost ??
                  op.vehicleEnergyLog?.fuelCost ??
                  0;

                const kilometers = op.vehicleEnergyLog?.kilometers ?? 0;

                return (
                  <div
                    key={op.id}
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
                            fontSize: 16,
                            fontWeight: 700,
                            color: "#111827",
                            marginBottom: 4,
                          }}
                        >
                          {op.driver.fullName}
                        </div>

                        <div style={{ fontSize: 13, color: "#6b7280" }}>
                          {formatDate(op.operationDate)} · {op.vehicle.plateNumber}
                        </div>
                      </div>

                      <span
                        style={{
                          padding: "5px 10px",
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#1d4ed8",
                          background: "#dbeafe",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatCurrency(total)}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 10,
                      }}
                    >
                      <InfoItem label="Bolt" value={formatCurrency(bolt)} />
                      <InfoItem label="Uber" value={formatCurrency(uber)} />
                      <InfoItem label="Cabify" value={formatCurrency(cabify)} />
                      <InfoItem label="Privado" value={formatCurrency(privado)} />
                      <InfoItem label="Km" value={String(kilometers)} />
                      <InfoItem label="Energía" value={formatCurrency(energy)} />
                    </div>

                    {op.notes?.trim() ? (
                      <div
                        style={{
                          fontSize: 13,
                          color: "#6b7280",
                          background: "#f8fafc",
                          border: "1px solid #e5e7eb",
                          borderRadius: 12,
                          padding: "10px 12px",
                        }}
                      >
                        <strong style={{ color: "#374151" }}>Notas:</strong>{" "}
                        {op.notes.trim()}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>
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
function Kpi({
  title,
  value,
  color,
  background,
  borderColor,
}: {
  title: string;
  value: string;
  color: string;
  background: string;
  borderColor: string;
}) {
  return (
    <div
      style={{
        background,
        border: `1px solid ${borderColor}`,
        borderRadius: 14,
        padding: 16,
        boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ fontSize: 13, color: "#6b7280" }}>{title}</div>

      <div
        style={{
          fontSize: 22,
          fontWeight: 700,
          color,
          marginTop: 4,
        }}
      >
        {value}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 14,
  fontWeight: 600,
  color: "#374151",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  fontSize: 14,
  background: "#fff",
  boxSizing: "border-box",
};

const primaryButtonStyle: React.CSSProperties = {
  background: "#2563eb",
  color: "white",
  padding: "10px 14px",
  borderRadius: 10,
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
  minHeight: 42,
};

const secondaryButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#e5e7eb",
  color: "#111827",
  padding: "10px 14px",
  borderRadius: 10,
  textDecoration: "none",
  fontWeight: 600,
  fontSize: 14,
  minHeight: 42,
  boxSizing: "border-box",
};

const thStyle: React.CSSProperties = {
  padding: "12px 14px",
  fontWeight: 700,
  color: "#475569",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 14px",
  color: "#111827",
  verticalAlign: "top",
};