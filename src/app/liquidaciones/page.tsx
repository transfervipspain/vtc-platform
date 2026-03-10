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

export default async function LiquidacionesPage() {
  const today = new Date();
  const startWeek = getStartOfWeek(today);
  const endWeek = getEndOfWeek(startWeek);

  const operations = await prisma.dailyOperation.findMany({
    where: {
      operationDate: {
        gte: startWeek,
        lte: endWeek,
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

  const grouped = new Map<
    string,
    {
      driverName: string;
      platformIncome: number;
      privateIncome: number;
      energyCost: number;
    }
  >();

  for (const op of operations) {
    const driverId = op.driverId;

    const platformIncome = op.platformIncomes.reduce(
      (sum, income) => sum + income.grossAmount,
      0
    );

    const privateIncome = op.privateIncomeSummary?.grossAmount ?? 0;

    const energyCost =
      op.vehicleEnergyLog?.electricCost ??
      op.vehicleEnergyLog?.fuelCost ??
      0;

    if (!grouped.has(driverId)) {
      grouped.set(driverId, {
        driverName: op.driver.fullName,
        platformIncome: 0,
        privateIncome: 0,
        energyCost: 0,
      });
    }

    const current = grouped.get(driverId)!;
    current.platformIncome += platformIncome;
    current.privateIncome += privateIncome;
    current.energyCost += energyCost;
  }

  const rows = Array.from(grouped.entries()).map(([driverId, data]) => {
    const totalGenerated = data.platformIncome + data.privateIncome;
    const baseLiquidable = totalGenerated - data.energyCost;
    const driverPayment = baseLiquidable * 0.4;
    const companyMargin = baseLiquidable * 0.6;

    return {
      driverId,
      driverName: data.driverName,
      platformIncome: data.platformIncome,
      privateIncome: data.privateIncome,
      totalGenerated,
      energyCost: data.energyCost,
      baseLiquidable,
      driverPayment,
      companyMargin,
    };
  });

  return (
    <main
      style={{
        padding: 32,
        fontFamily: "Arial",
        maxWidth: 1280,
        margin: "0 auto",
      }}
    >
      <h1 style={{ marginBottom: 8 }}>Liquidaciones</h1>

      <p style={{ marginBottom: 24, color: "#555" }}>
        Semana actual: {startWeek.toLocaleDateString("es-ES")} -{" "}
        {endWeek.toLocaleDateString("es-ES")}
      </p>

      {rows.length === 0 ? (
        <p>No hay operaciones esta semana.</p>
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
                <th style={{ padding: "10px 12px" }}>Conductor</th>
                <th style={{ padding: "10px 12px" }}>Plataformas</th>
                <th style={{ padding: "10px 12px" }}>Privados</th>
                <th style={{ padding: "10px 12px" }}>Total generado</th>
                <th style={{ padding: "10px 12px" }}>Energía</th>
                <th style={{ padding: "10px 12px" }}>Base liquidable</th>
                <th style={{ padding: "10px 12px" }}>Pago conductor</th>
                <th style={{ padding: "10px 12px" }}>Margen empresa</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.driverId} style={{ borderTop: "1px solid #e5e5e5" }}>
                  <td style={{ padding: "10px 12px", fontWeight: "bold" }}>
                    {row.driverName}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {row.platformIncome.toFixed(2)} €
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {row.privateIncome.toFixed(2)} €
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {row.totalGenerated.toFixed(2)} €
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {row.energyCost.toFixed(2)} €
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {row.baseLiquidable.toFixed(2)} €
                  </td>
                  <td style={{ padding: "10px 12px", color: "#27ae60", fontWeight: "bold" }}>
                    {row.driverPayment.toFixed(2)} €
                  </td>
                  <td style={{ padding: "10px 12px", color: "#2980b9", fontWeight: "bold" }}>
                    {row.companyMargin.toFixed(2)} €
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