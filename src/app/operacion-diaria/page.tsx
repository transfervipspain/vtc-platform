import { prisma } from "@/lib/prisma";
import DailyOperationForm from "./DailyOperationForm";

export default async function OperacionDiariaPage() {
  const company = await prisma.company.findFirst({
    include: {
      drivers: {
        orderBy: { fullName: "asc" },
      },
      vehicles: {
        orderBy: { plateNumber: "asc" },
      },
      dailyOperations: {
        orderBy: { operationDate: "desc" },
        take: 20,
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
      },
    },
  });

  if (!company) {
    return (
      <main style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
        <h1>Operación diaria</h1>
        <p>No hay empresa cargada todavía.</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ marginBottom: 10 }}>Operación diaria</h1>
      <p style={{ color: "#555", marginBottom: 30 }}>
        Registro diario por conductor y vehículo.
      </p>

      <DailyOperationForm
        companyId={company.id}
        drivers={company.drivers}
        vehicles={company.vehicles}
      />

      <section style={{ marginTop: 40 }}>
        <h2 style={{ marginBottom: 20 }}>Últimos registros</h2>

        {company.dailyOperations.length === 0 ? (
          <p>No hay registros todavía.</p>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            {company.dailyOperations.map((op) => {
              const bolt =
                op.platformIncomes.find((p) => p.platform.code === "BOLT")?.grossAmount ?? 0;
              const uber =
                op.platformIncomes.find((p) => p.platform.code === "UBER")?.grossAmount ?? 0;
              const cabify =
                op.platformIncomes.find((p) => p.platform.code === "CABIFY")?.grossAmount ?? 0;
              const privado = op.privateIncomeSummary?.grossAmount ?? 0;
              const total = bolt + uber + cabify + privado;

              return (
                <div
                  key={op.id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: 12,
                    padding: 16,
                    background: "#fafafa",
                  }}
                >
                  <div style={{ fontWeight: "bold", marginBottom: 8 }}>
                    {new Date(op.operationDate).toLocaleDateString("es-ES")} ·{" "}
                    {op.driver.fullName} · {op.vehicle.plateNumber}
                  </div>

                  <div style={{ display: "grid", gap: 6 }}>
                    <div>Bolt: {bolt} €</div>
                    <div>Uber: {uber} €</div>
                    <div>Cabify: {cabify} €</div>
                    <div>Privado: {privado} €</div>
                    <div>Total: {total} €</div>
                    <div>
                      Km: {op.vehicleEnergyLog?.kilometers ?? 0} · Coste energía:{" "}
                      {op.vehicleEnergyLog?.electricCost ??
                        op.vehicleEnergyLog?.fuelCost ??
                        0}{" "}
                      €
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}