import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getStartOfWeek(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function getEndOfWeek(start: Date) {
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

function getStartOfMonth(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getEndOfMonth(date: Date) {
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);
  return end;
}

function formatDate(date: Date) {
  return date.toISOString().split("T")[0];
}

function getAppliedFixedSalary(
  fixedSalaryMonthly: number,
  commissionMode: string
) {
  if (commissionMode === "weekly") {
    return fixedSalaryMonthly / 4.33;
  }

  return fixedSalaryMonthly;
}

export default async function LiquidacionConductorPage({
  params,
  searchParams,
}: {
  params: Promise<{ driverId: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { driverId } = await params;
  const query = await searchParams;

  const selectedDate = query.date ? new Date(query.date) : new Date();

  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
    include: {
      defaultVehicle: true,
    },
  });

  if (!driver) {
    return (
      <main style={{ padding: 32, fontFamily: "Arial" }}>
        <h1>Conductor no encontrado</h1>
      </main>
    );
  }

  const periodStart =
    driver.commissionMode === "monthly"
      ? getStartOfMonth(selectedDate)
      : getStartOfWeek(selectedDate);

  const periodEnd =
    driver.commissionMode === "monthly"
      ? getEndOfMonth(selectedDate)
      : getEndOfWeek(periodStart);

  const prevDate = new Date(selectedDate);
  if (driver.commissionMode === "monthly") {
    prevDate.setMonth(prevDate.getMonth() - 1);
  } else {
    prevDate.setDate(prevDate.getDate() - 7);
  }

  const nextDate = new Date(selectedDate);
  if (driver.commissionMode === "monthly") {
    nextDate.setMonth(nextDate.getMonth() + 1);
  } else {
    nextDate.setDate(nextDate.getDate() + 7);
  }

  const operations = await prisma.dailyOperation.findMany({
    where: {
      driverId,
      operationDate: {
        gte: periodStart,
        lte: periodEnd,
      },
    },
    include: {
      vehicle: true,
      vehicleEnergyLog: true,
      privateIncomeSummary: true,
      platformIncomes: {
        include: {
          platform: true,
        },
      },
    },
    orderBy: {
      operationDate: "asc",
    },
  });

  const rows = operations.map((op) => {
    const boltAmount =
      op.platformIncomes.find(
        (i) => i.platform?.name?.toLowerCase() === "bolt"
      )?.grossAmount ?? 0;

    const uberAmount =
      op.platformIncomes.find(
        (i) => i.platform?.name?.toLowerCase() === "uber"
      )?.grossAmount ?? 0;

    const cabifyAmount =
      op.platformIncomes.find(
        (i) => i.platform?.name?.toLowerCase() === "cabify"
      )?.grossAmount ?? 0;

    const privateAmount = op.privateIncomeSummary?.grossAmount ?? 0;

    const totalGenerated =
      boltAmount + uberAmount + cabifyAmount + privateAmount;

    const energyCost =
      op.vehicleEnergyLog?.electricCost ??
      op.vehicleEnergyLog?.fuelCost ??
      0;

    return {
      id: op.id,
      date: op.operationDate,
      vehiclePlate: op.vehicle.plateNumber,
      boltAmount,
      uberAmount,
      cabifyAmount,
      privateAmount,
      totalGenerated,
      energyCost,
    };
  });

  const totals = rows.reduce(
    (acc, row) => {
      acc.totalGenerated += row.totalGenerated;
      acc.energyCost += row.energyCost;
      return acc;
    },
    {
      totalGenerated: 0,
      energyCost: 0,
    }
  );

  const threshold = driver.commissionEnabled ? driver.commissionThreshold : 0;
  const excess = driver.commissionEnabled
    ? Math.max(0, totals.totalGenerated - threshold)
    : 0;
  const variableCommission = driver.commissionEnabled
    ? excess * (driver.commissionPercentage / 100)
    : 0;

  const fixedSalaryApplied = getAppliedFixedSalary(
    driver.fixedSalaryMonthly ?? 0,
    driver.commissionMode
  );

  const totalDriverCost = fixedSalaryApplied + variableCommission;
  const companyMargin = totals.totalGenerated - totalDriverCost;

  const cardStyle = {
    background: "white",
    border: "1px solid #ddd",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  };

  const cardTitle = {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
  };

  const cardValue = {
    fontSize: 20,
    fontWeight: "bold" as const,
  };

  return (
    <main
      style={{
        padding: 32,
        fontFamily: "Arial",
        maxWidth: 1450,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ marginBottom: 8 }}>Liquidación individual</h1>
          <p style={{ margin: 0, color: "#555" }}>
            {driver.fullName} · Comisión: {driver.commissionPercentage.toFixed(0)}%
          </p>
          <p style={{ marginTop: 8, color: "#555" }}>
            Modo: {driver.commissionMode === "monthly" ? "Mensual" : "Semanal"}
          </p>
          <p style={{ marginTop: 8, color: "#555" }}>
            Periodo: {periodStart.toLocaleDateString("es-ES")} -{" "}
            {periodEnd.toLocaleDateString("es-ES")}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <Link
            href={`/liquidaciones?date=${query.date ?? formatDate(selectedDate)}`}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              background: "#111",
              color: "white",
              textDecoration: "none",
            }}
          >
            Volver
          </Link>

          <a
            href={`/liquidaciones/${driverId}?date=${formatDate(prevDate)}`}
            style={{
              padding: "8px 12px",
              background: "#eee",
              borderRadius: 6,
              textDecoration: "none",
              color: "#333",
            }}
          >
            {driver.commissionMode === "monthly"
              ? "⬅ Mes anterior"
              : "⬅ Semana anterior"}
          </a>

          <a
            href={`/liquidaciones/${driverId}?date=${formatDate(nextDate)}`}
            style={{
              padding: "8px 12px",
              background: "#eee",
              borderRadius: 6,
              textDecoration: "none",
              color: "#333",
            }}
          >
            {driver.commissionMode === "monthly"
              ? "Mes siguiente ➡"
              : "Semana siguiente ➡"}
          </a>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginTop: 24,
          marginBottom: 24,
        }}
      >
        <div style={cardStyle}>
          <div style={cardTitle}>Facturación periodo</div>
          <div style={cardValue}>{totals.totalGenerated.toFixed(2)} €</div>
        </div>

        <div style={cardStyle}>
          <div style={cardTitle}>Coste energía</div>
          <div style={cardValue}>{totals.energyCost.toFixed(2)} €</div>
        </div>

        <div style={cardStyle}>
          <div style={cardTitle}>Umbral</div>
          <div style={cardValue}>{threshold.toFixed(2)} €</div>
        </div>

        <div style={cardStyle}>
          <div style={cardTitle}>Exceso sobre umbral</div>
          <div style={cardValue}>{excess.toFixed(2)} €</div>
        </div>

        <div style={cardStyle}>
          <div style={cardTitle}>Comisión variable</div>
          <div style={{ ...cardValue, color: "#27ae60" }}>
            {variableCommission.toFixed(2)} €
          </div>
        </div>

        <div style={cardStyle}>
          <div style={cardTitle}>Sueldo fijo mensual</div>
          <div style={cardValue}>{(driver.fixedSalaryMonthly ?? 0).toFixed(2)} €</div>
        </div>

        <div style={cardStyle}>
          <div style={cardTitle}>Sueldo fijo aplicado</div>
          <div style={cardValue}>{fixedSalaryApplied.toFixed(2)} €</div>
        </div>

        <div style={cardStyle}>
          <div style={cardTitle}>Coste total conductor</div>
          <div style={{ ...cardValue, color: "#8e44ad" }}>
            {totalDriverCost.toFixed(2)} €
          </div>
        </div>

        <div style={cardStyle}>
          <div style={cardTitle}>Margen empresa</div>
          <div style={{ ...cardValue, color: "#2980b9" }}>
            {companyMargin.toFixed(2)} €
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <p>No hay operaciones para este conductor en el periodo seleccionado.</p>
      ) : (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 10,
            overflow: "hidden",
            background: "#fafafa",
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
                <th style={{ padding: "10px 12px" }}>Fecha</th>
                <th style={{ padding: "10px 12px" }}>Vehículo</th>
                <th style={{ padding: "10px 12px" }}>Bolt</th>
                <th style={{ padding: "10px 12px" }}>Uber</th>
                <th style={{ padding: "10px 12px" }}>Cabify</th>
                <th style={{ padding: "10px 12px" }}>Privados</th>
                <th style={{ padding: "10px 12px" }}>Total generado</th>
                <th style={{ padding: "10px 12px" }}>Energía</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} style={{ borderTop: "1px solid #e5e5e5" }}>
                  <td style={{ padding: "10px 12px" }}>
                    {new Date(row.date).toLocaleDateString("es-ES")}
                  </td>
                  <td style={{ padding: "10px 12px", fontWeight: "bold" }}>
                    {row.vehiclePlate}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {row.boltAmount.toFixed(2)} €
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {row.uberAmount.toFixed(2)} €
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {row.cabifyAmount.toFixed(2)} €
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {row.privateAmount.toFixed(2)} €
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {row.totalGenerated.toFixed(2)} €
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {row.energyCost.toFixed(2)} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}