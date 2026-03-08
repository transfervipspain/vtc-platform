import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AgendaPage() {
  const today = new Date();
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);

  const end = new Date(today);
  end.setHours(23, 59, 59, 999);

  const trips = await prisma.privateTrip.findMany({
    where: {
      serviceDate: {
        gte: start,
        lte: end,
      },
    },
    orderBy: [
      { serviceDate: "asc" },
      { serviceTime: "asc" },
    ],
    include: {
      driver: true,
      vehicle: true,
    },
  });

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Agenda diaria</h1>

      <p style={{ marginBottom: 20 }}>
        Servicios privados del día.
      </p>

      {trips.length === 0 ? (
        <p>No hay servicios para hoy.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {trips.map((trip) => (
            <div
              key={trip.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 10,
                padding: 16,
                background: "#fafafa",
              }}
            >
              <strong>
                {trip.serviceTime || "--:--"} · {trip.amount} €
              </strong>

              <div style={{ marginTop: 6 }}>
                Origen: {trip.origin || "-"}
              </div>

              <div>
                Destino: {trip.destination || "-"}
              </div>

              <div>
                Conductor: {trip.driver?.fullName ?? "Sin asignar"}
              </div>

              <div>
                Vehículo: {trip.vehicle?.plateNumber ?? "Sin asignar"}
              </div>

              <div>
                Estado: {trip.status}
              </div>

              <div>
                Intermediario: {trip.intermediary ?? "-"}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}