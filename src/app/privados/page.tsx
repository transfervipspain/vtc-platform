import PrivateTripForm from "./PrivateTripForm";
import { prisma } from "@/lib/prisma";


export const dynamic = "force-dynamic";

export default async function PrivadosPage() {
  const trips = await prisma.privateTrip.findMany({
    orderBy: {
      serviceDate: "desc",
    },
    take: 20,
    include: {
      driver: true,
      vehicle: true,
    },
  });

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>

<h1>Viajes privados</h1>

<PrivateTripForm />



      <p style={{ marginBottom: 20 }}>
        Registro de servicios privados.
      </p>

      {trips.length === 0 ? (
        <p>No hay viajes privados todavía.</p>
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
                {new Date(trip.serviceDate).toLocaleDateString("es-ES")} ·{" "}
                {trip.serviceTime}
              </strong>

              <div style={{ marginTop: 6 }}>
                Importe: {trip.amount} €
              </div>

              <div>
                Conductor: {trip.driver?.fullName ?? "Sin asignar"}
              </div>

              <div>
                Vehículo: {trip.vehicle?.plateNumber ?? "Sin asignar"}
              </div>

              <div>
                Intermediario: {trip.intermediary ?? "-"}
              </div>

              <div>
                Estado: {trip.status}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}