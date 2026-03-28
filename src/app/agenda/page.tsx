import NewTripModal from "./NewTripModal";
import TripActions from "../dashboard/TripActions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getStatusColor(status: string) {
  switch (status) {
    case "pending":
      return "#6b7280";
    case "assigned":
      return "#2563eb";
    case "in_progress":
      return "#f59e0b";
    case "completed":
      return "#16a34a";
    case "cancelled":
      return "#dc2626";
    default:
      return "#9ca3af";
  }
}

export default async function AgendaPage() {
  const today = new Date();

  const startToday = new Date(today);
  startToday.setHours(0, 0, 0, 0);

  const endToday = new Date(today);
  endToday.setHours(23, 59, 59, 999);

  const todayTrips = await prisma.privateTrip.findMany({
    where: {
      serviceDate: {
        gte: startToday,
        lte: endToday,
      },
    },
    orderBy: [{ serviceTime: "asc" }],
    include: {
      driver: true,
      vehicle: true,
    },
  });

  return (
    <main
      style={{
        padding: 32,
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      <h1 style={{ marginBottom: 8 }}>Agenda diaria</h1>
<div style={{ marginBottom: 20 }}>
  <NewTripModal />
</div>
<div style={{ marginBottom: 20 }}>
  <a
    href="/privados"
    style={{
      padding: "8px 14px",
      borderRadius: 8,
      background: "#111827",
      color: "white",
      textDecoration: "none",
      fontSize: 14,
      fontWeight: 500,
    }}
  >
    + Nuevo servicio
  </a>
</div>
      <p style={{ marginBottom: 24, color: "#666" }}>
        Timeline de servicios del día
      </p>

{todayTrips.length === 0 ? (
  <div
    style={{
      marginTop: 40,
      padding: 40,
      textAlign: "center",
      border: "2px dashed #e5e7eb",
      borderRadius: 12,
      background: "#fafafa",
    }}
  >
    <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>
      No hay servicios hoy
    </div>

    <div style={{ color: "#6b7280", marginBottom: 20 }}>
      Empieza creando un nuevo servicio privado
    </div>

    <a
      href="/privados"
      style={{
        display: "inline-block",
        padding: "10px 16px",
        borderRadius: 8,
        background: "#2563eb",
        color: "white",
        textDecoration: "none",
        fontWeight: 600,
      }}
    >
      + Crear servicio
    </a>
  </div>
) : (
        <div style={{ position: "relative" }}>
          {/* Línea timeline */}
          <div
            style={{
              position: "absolute",
              left: 20,
              top: 0,
              bottom: 0,
              width: 2,
              background: "#e5e7eb",
            }}
          />

          {todayTrips.map((trip) => (
            <div
              key={trip.id}
              style={{
                display: "flex",
                marginBottom: 20,
              }}
            >
              {/* Punto timeline */}
              <div
                style={{
                  width: 40,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: getStatusColor(trip.status),
                    marginTop: 8,
                  }}
                />
              </div>

              {/* Card */}
              <div
                style={{
                  flex: 1,
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 14,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontWeight: 700 }}>
                    {trip.serviceTime || "--:--"}
                  </div>

                  <div
                    style={{
                      fontWeight: 700,
                      color: "#111827",
                    }}
                  >
                    {trip.amount.toFixed(2)} €
                  </div>
                </div>

                {/* Ruta */}
                <div style={{ marginTop: 6, fontSize: 14 }}>
                  {trip.origin || "-"}{" "}
                  <span style={{ color: "#9ca3af" }}>→</span>{" "}
                  {trip.destination || "-"}
                </div>

                {/* Info */}
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 13,
                    color: "#6b7280",
                  }}
                >
                  {trip.driver?.fullName ?? "Sin conductor"} ·{" "}
                  {trip.vehicle?.plateNumber ?? "Sin vehículo"}
                </div>

                {/* Estado + acciones */}
                <div
                  style={{
                    marginTop: 10,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "white",
                      background: getStatusColor(trip.status),
                    }}
                  >
                    {trip.status}
                  </span>

                  <TripActions tripId={trip.id} status={trip.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}