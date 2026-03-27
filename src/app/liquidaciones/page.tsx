import Form from "next/form";
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

function isDateInRange(date: Date, start: Date, end: Date) {
  return date >= start && date <= end;
}

export default async function LiquidacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const selectedDate = params.date ? new Date(params.date) : new Date();

  const prevDate = new Date(selectedDate);
  prevDate.setDate(prevDate.getDate() - 7);

  const nextDate = new Date(selectedDate);
  nextDate.setDate(nextDate.getDate() + 7);

  const globalStart = getStartOfWeek(
    getStartOfMonth(selectedDate) < getStartOfWeek(selectedDate)
      ? getStartOfMonth(selectedDate)
      : getStartOfWeek(selectedDate)
  );

  const globalEnd = getEndOfMonth(selectedDate) > getEndOfWeek(getStartOfWeek(selectedDate))
    ? getEndOfMonth(selectedDate)
    : getEndOfWeek(getStartOfWeek(selectedDate));

  const drivers = await prisma.driver.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      fullName: "asc",
    },
  });

  const operations = await prisma.dailyOperation.findMany({
    where: {
      operationDate: {
        gte: globalStart,
        lte: globalEnd,
      },
    },
    include: {
      driver: true,
      vehicleEnergyLog: true,
      platformIncomes: true,
      privateIncomeSummary: true,
    },
    orderBy: {
      operationDate: "asc",
    },
  });

  const rows = drivers.map((driver) => {
    const periodStart =
      driver.commissionMode === "monthly"
        ? getStartOfMonth(selectedDate)
        : getStartOfWeek(selectedDate);

    const periodEnd =
      driver.commissionMode === "monthly"
        ? getEndOfMonth(selectedDate)
        : getEndOfWeek(periodStart);

    const driverOperations = operations.filter(
      (op) =>
        op.driverId === driver.id &&
        isDateInRange(op.operationDate, periodStart, periodEnd)
    );

    const platformIncome = driverOperations.reduce((sum, op) => {
      return (
        sum +
        op.platformIncomes.reduce(
          (platformSum, income) => platformSum + income.grossAmount,
          0
        )
      );
    }, 0);

    const privateIncome = driverOperations.reduce((sum, op) => {
      return sum + (op.privateIncomeSummary?.grossAmount ?? 0);
    }, 0);

    const energyCost = driverOperations.reduce((sum, op) => {
      return (
        sum +
        (op.vehicleEnergyLog?.electricCost ??
          op.vehicleEnergyLog?.fuelCost ??
          0)
      );
    }, 0);

    const totalGenerated = platformIncome + privateIncome;
    const threshold = driver.commissionEnabled
      ? driver.commissionThreshold
      : 0;
    const excess = driver.commissionEnabled
      ? Math.max(0, totalGenerated - threshold)
      : 0;
    const commissionRate = driver.commissionPercentage / 100;
    const variableCommission = driver.commissionEnabled
      ? excess * commissionRate
      : 0;
    const fixedSalaryMonthly = driver.fixedSalaryMonthly ?? 0;
    const totalDriverCost = fixedSalaryMonthly + variableCommission;
    const companyMargin = totalGenerated - totalDriverCost;

    return {
      driverId: driver.id,
      driverName: driver.fullName,
      commissionMode: driver.commissionMode,
      commissionPercentage: driver.commissionPercentage,
      threshold,
      platformIncome,
      privateIncome,
      totalGenerated,
      energyCost,
      excess,
      variableCommission,
      fixedSalaryMonthly,
      totalDriverCost,
      companyMargin,
      periodStart,
      periodEnd,
    };
  });

  const totals = rows.reduce(
    (acc, row) => {
      acc.totalGenerated += row.totalGenerated;
      acc.energyCost += row.energyCost;
      acc.variableCommission += row.variableCommission;
      acc.fixedSalaryMonthly += row.fixedSalaryMonthly;
      acc.totalDriverCost += row.totalDriverCost;
      acc.companyMargin += row.companyMargin;
      return acc;
    },
    {
      totalGenerated: 0,
      energyCost: 0,
      variableCommission: 0,
      fixedSalaryMonthly: 0,
      totalDriverCost: 0,
      companyMargin: 0,
    }
  );

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
      <h1 style={{ marginBottom: 8 }}>Liquidaciones</h1>

      <div style={{ marginBottom: 20, display: "flex", gap: 10 }}>
        <a
          href={`/liquidaciones?date=${formatDate(prevDate)}`}
          style={{
            padding: "6px 12px",
            background: "#eee",
            borderRadius: 6,
            textDecoration: "none",
            color: "#333",
          }}
        >
          ⬅ Fecha anterior
        </a>

        <a
          href={`/liquidaciones?date=${formatDate(nextDate)}`}
          style={{
            padding: "6px 12px",
            background: "#eee",
            borderRadius: 6,
            textDecoration: "none",
            color: "#333",
          }}
        >
          Fecha siguiente ➡
        </a>
      </div>

      <Form action="" style={{ marginBottom: 20 }}>
        <label style={{ marginRight: 10 }}>Seleccionar fecha:</label>

        <input
          type="date"
          name="date"
          defaultValue={params.date ?? formatDate(selectedDate)}
          style={{
            padding: 6,
            border: "1px solid #ccc",
            borderRadius: 6,
          }}
        />

        <button
          type="submit"
          style={{
            marginLeft: 10,
            padding: "6px 12px",
            background: "#111",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Ver periodo
        </button>
      </Form>

      <p style={{ marginBottom: 24, color: "#555" }}>
        Fecha de referencia: {selectedDate.toLocaleDateString("es-ES")}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div style={cardStyle}>
          <div style={cardTitle}>Facturación total</div>
          <div style={cardValue}>{totals.totalGenerated.toFixed(2)} €</div>
        </div>

        <div style={cardStyle}>
          <div style={cardTitle}>Coste energía</div>
          <div style={cardValue}>{totals.energyCost.toFixed(2)} €</div>
        </div>

        <div style={cardStyle}>
          <div style={cardTitle}>Comisión variable</div>
          <div style={{ ...cardValue, color: "#27ae60" }}>
            {totals.variableCommission.toFixed(2)} €
          </div>
        </div>

        <div style={cardStyle}>
          <div style={cardTitle}>Sueldos fijos mensuales</div>
          <div style={cardValue}>{totals.fixedSalaryMonthly.toFixed(2)} €</div>
        </div>

        <div style={cardStyle}>
          <div style={cardTitle}>Coste total conductores</div>
          <div style={{ ...cardValue, color: "#8e44ad" }}>
            {totals.totalDriverCost.toFixed(2)} €
          </div>
        </div>

        <div style={cardStyle}>
          <div style={cardTitle}>Margen empresa</div>
          <div style={{ ...cardValue, color: "#2980b9" }}>
            {totals.companyMargin.toFixed(2)} €
          </div>
        </div>
      </div>

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
              <th style={{ padding: "10px 12px" }}>Conductor</th>
              <th style={{ padding: "10px 12px" }}>Modo</th>
              <th style={{ padding: "10px 12px" }}>Periodo</th>
              <th style={{ padding: "10px 12px" }}>% comisión</th>
              <th style={{ padding: "10px 12px" }}>Umbral</th>
              <th style={{ padding: "10px 12px" }}>Facturación</th>
              <th style={{ padding: "10px 12px" }}>Energía</th>
              <th style={{ padding: "10px 12px" }}>Exceso</th>
              <th style={{ padding: "10px 12px" }}>Comisión variable</th>
              <th style={{ padding: "10px 12px" }}>Sueldo fijo mensual</th>
              <th style={{ padding: "10px 12px" }}>Coste total conductor</th>
              <th style={{ padding: "10px 12px" }}>Margen empresa</th>
              <th style={{ padding: "10px 12px" }}>Detalle</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.driverId} style={{ borderTop: "1px solid #e5e5e5" }}>
                <td style={{ padding: "10px 12px", fontWeight: "bold" }}>
                  {row.driverName}
                </td>
                <td style={{ padding: "10px 12px" }}>
                  {row.commissionMode === "monthly" ? "Mensual" : "Semanal"}
                </td>
                <td style={{ padding: "10px 12px" }}>
                  {row.periodStart.toLocaleDateString("es-ES")} -{" "}
                  {row.periodEnd.toLocaleDateString("es-ES")}
                </td>
                <td style={{ padding: "10px 12px" }}>
                  {row.commissionPercentage.toFixed(0)}%
                </td>
                <td style={{ padding: "10px 12px" }}>
                  {row.threshold.toFixed(2)} €
                </td>
                <td style={{ padding: "10px 12px" }}>
                  {row.totalGenerated.toFixed(2)} €
                </td>
                <td style={{ padding: "10px 12px" }}>
                  {row.energyCost.toFixed(2)} €
                </td>
                <td style={{ padding: "10px 12px" }}>
                  {row.excess.toFixed(2)} €
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    color: "#27ae60",
                    fontWeight: "bold",
                  }}
                >
                  {row.variableCommission.toFixed(2)} €
                </td>
                <td style={{ padding: "10px 12px" }}>
                  {row.fixedSalaryMonthly.toFixed(2)} €
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    color: "#8e44ad",
                    fontWeight: "bold",
                  }}
                >
                  {row.totalDriverCost.toFixed(2)} €
                </td>
                <td
                  style={{
                    padding: "10px 12px",
                    color: "#2980b9",
                    fontWeight: "bold",
                  }}
                >
                  {row.companyMargin.toFixed(2)} €
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <Link
                    href={`/liquidaciones/${row.driverId}?date=${params.date ?? formatDate(selectedDate)}`}
                    style={{
                      display: "inline-block",
                      padding: "6px 10px",
                      borderRadius: 6,
                      background: "#111",
                      color: "white",
                      textDecoration: "none",
                    }}
                  >
                    Ver detalle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}