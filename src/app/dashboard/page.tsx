import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const today = new Date();

  const startToday = new Date(today);
  startToday.setHours(0, 0, 0, 0);

  const endToday = new Date(today);
  endToday.setHours(23, 59, 59, 999);

  const startWeek = new Date(today);
  const day = startWeek.getDay();
  const diff = day === 0 ? 6 : day - 1;
  startWeek.setDate(startWeek.getDate() - diff);
  startWeek.setHours(0, 0, 0, 0);

  const endWeek = new Date(startWeek);
  endWeek.setDate(endWeek.getDate() + 6);
  endWeek.setHours(23, 59, 59, 999);

  const todayOperations = await prisma.dailyOperation.findMany({
    where: {
      operationDate: {
        gte: startToday,
        lte: endToday,
      },
    },
    include: {
      platformIncomes: true,
      privateIncomeSummary: true,
    },
  });

  const weekOperations = await prisma.dailyOperation.findMany({
    where: {
      operationDate: {
        gte: startWeek,
        lte: endWeek,
      },
    },
    include: {
      platformIncomes: true,
      privateIncomeSummary: true,
    },
  });

  const pendingTrips = await prisma.privateTrip.count({
    where: {
      status: "pending",
    },
  });

  const assignedTrips = await prisma.privateTrip.count({
    where: {
      status: "assigned",
    },
  });

  const activeDrivers = await prisma.driver.count({
    where: {
      isActive: true,
    },
  });

  const activeVehicles = await prisma.vehicle.count({
    where: {
      isActive: true,
    },
  });

  const todayIncome = todayOperations.reduce((sum, op) => {
    const platforms = op.platformIncomes.reduce(
      (acc, income) => acc + income.grossAmount,
      0
    );
    const privates = op.privateIncomeSummary?.grossAmount ?? 0;
    return sum + platforms + privates;
  }, 0);

  const weekIncome = weekOperations.reduce((sum, op) => {
    const platforms = op.platformIncomes.reduce(
      (acc, income) => acc + income.grossAmount,
      0
    );
    const privates = op.privateIncomeSummary?.grossAmount ?? 0;
    return sum + platforms + privates;
  }, 0);

  const cards = [
    { title: "Ingresos hoy", value: `${todayIncome.toFixed(2)} €` },
    { title: "Ingresos semana", value: `${weekIncome.toFixed(2)} €` },
    { title: "Privados pendientes", value: String(pendingTrips) },
    { title: "Privados asignados", value: String(assignedTrips) },
    { title: "Conductores activos", value: String(activeDrivers) },
    { title: "Vehículos activos", value: String(activeVehicles) },
  ];

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Dashboard</h1>

      <p style={{ marginBottom: 24 }}>Resumen general de la operativa.</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {cards.map((card) => (
          <div
            key={card.title}
            style={{
              border: "1px solid #ddd",
              borderRadius: 12,
              padding: 20,
              background: "#fafafa",
            }}
          >
            <div style={{ color: "#666", marginBottom: 8 }}>{card.title}</div>
            <div style={{ fontSize: 28, fontWeight: "bold" }}>{card.value}</div>
          </div>
        ))}
      </div>
    </main>
  );
}