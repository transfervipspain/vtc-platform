import TripActions from "./TripActions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {

  const today = new Date();

  const startToday = new Date(today);
  startToday.setHours(0,0,0,0);

  const endToday = new Date(today);
  endToday.setHours(23,59,59,999);

  const startWeek = new Date(today);
  const day = startWeek.getDay();
  const diff = day === 0 ? 6 : day - 1;
  startWeek.setDate(startWeek.getDate() - diff);
  startWeek.setHours(0,0,0,0);

  const endWeek = new Date(startWeek);
  endWeek.setDate(endWeek.getDate()+6);
  endWeek.setHours(23,59,59,999);

    const todayOperations = await prisma.dailyOperation.findMany({
    where: {
      operationDate: {
        gte: startToday,
        lte: endToday,
      },
    },
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

  const weekOperations = await prisma.dailyOperation.findMany({
    where:{
      operationDate:{
        gte:startWeek,
        lte:endWeek
      }
    },
    include:{
      platformIncomes:true,
      privateIncomeSummary:true
    }
  });

  const pendingTrips = await prisma.privateTrip.count({
    where:{ status:"pending" }
  });

  const todayIncome = todayOperations.reduce((sum,op)=>{

    const platforms = op.platformIncomes.reduce(
      (acc,i)=>acc+i.grossAmount,0
    );

    const privates = op.privateIncomeSummary?.grossAmount ?? 0;

    return sum + platforms + privates;

  },0);

  const weekIncome = weekOperations.reduce((sum,op)=>{

    const platforms = op.platformIncomes.reduce(
      (acc,i)=>acc+i.grossAmount,0
    );

    const privates = op.privateIncomeSummary?.grossAmount ?? 0;

    return sum + platforms + privates;

  },0);

const energyCost = todayOperations.reduce((sum, op) => {
  const energy =
    op.vehicleEnergyLog?.electricCost ??
    op.vehicleEnergyLog?.fuelCost ??
    0;

  return sum + energy;
}, 0);

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

const recentTrips = await prisma.privateTrip.findMany({
  orderBy: {
    serviceDate: "desc",
  },
  take: 5,
  include: {
    driver: true,
    vehicle: true,
  },
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

      <h1 style={{ marginBottom: 8 }}>Dashboard VTC</h1>
<p style={{ marginBottom: 24, color: "#555" }}>
  Resumen general de la operativa.
</p>

      {/* KPI CARDS */}

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
        gap:16,
        marginTop:20,
        marginBottom:30
      }}>

        <div style={{
          background:"#e74c3c",
          color:"white",
          padding:20,
          borderRadius:10
        }}>
          <div>Facturación Hoy</div>
          <div style={{fontSize:28,fontWeight:"bold"}}>
            {todayIncome.toFixed(2)} €
          </div>
        </div>

        <div style={{
          background:"#27ae60",
          color:"white",
          padding:20,
          borderRadius:10
        }}>
          <div>Neto Semana</div>
          <div style={{fontSize:28,fontWeight:"bold"}}>
            {weekIncome.toFixed(2)} €
          </div>
        </div>

        <div style={{
          background:"#f39c12",
          color:"white",
          padding:20,
          borderRadius:10
        }}>
          <div>Coste Energía Hoy</div>
          <div style={{fontSize:28,fontWeight:"bold"}}>
            {energyCost.toFixed(2)} €
          </div>
        </div>

        <div style={{
          background:"#2980b9",
          color:"white",
          padding:20,
          borderRadius:10
        }}>
          <div>Privados Pendientes</div>
          <div style={{fontSize:28,fontWeight:"bold"}}>
            {pendingTrips}
          </div>
        </div>

      </div>

            <h2 style={{ marginBottom: 12 }}>Actividad diaria por conductores</h2>

      {todayOperations.length === 0 ? (
        <p style={{ marginBottom: 24 }}>No hay operaciones registradas hoy.</p>
      ) : (
        <div
          style={{
            overflowX: "auto",
            marginBottom: 24,
            border: "1px solid #ddd",
            borderRadius: 10,
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
                <th style={{ padding: "8px 10px" }}>Conductor</th>
                <th style={{ padding: "8px 10px" }}>Vehículo</th>
                <th style={{ padding: "8px 10px" }}>Bolt</th>
                <th style={{ padding: "8px 10px" }}>Uber</th>
                <th style={{ padding: "8px 10px" }}>Cabify</th>
                <th style={{ padding: "8px 10px" }}>Privados</th>
                <th style={{ padding: "8px 10px" }}>Km</th>
                <th style={{ padding: "8px 10px" }}>Energía</th>
                <th style={{ padding: "8px 10px" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {todayOperations.map((op) => {
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

                const energy =
                  op.vehicleEnergyLog?.electricCost ??
                  op.vehicleEnergyLog?.fuelCost ??
                  0;

                const total =
                  boltAmount + uberAmount + cabifyAmount + privateAmount;

                return (
                  <tr key={op.id} style={{ borderTop: "1px solid #e5e5e5" }}>
                    <td style={{ padding: "8px 10px" }}>{op.driver.fullName}</td>
                    <td style={{ padding: "8px 10px" }}>{op.vehicle.plateNumber}</td>
                    <td style={{ padding: "8px 10px" }}>{boltAmount.toFixed(2)} €</td>
                    <td style={{ padding: "8px 10px" }}>{uberAmount.toFixed(2)} €</td>
                    <td style={{ padding: "8px 10px" }}>{cabifyAmount.toFixed(2)} €</td>
                    <td style={{ padding: "8px 10px" }}>{privateAmount.toFixed(2)} €</td>
                    <td style={{ padding: "8px 10px" }}>
                      {op.vehicleEnergyLog?.kilometers ?? 0}
                    </td>
                    <td style={{ padding: "8px 10px" }}>{energy.toFixed(2)} €</td>
                    <td style={{ padding: "8px 10px", fontWeight: "bold" }}>
                      {total.toFixed(2)} €
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
     

      <h2 style={{ marginBottom: 12 }}>Timeline de servicios de hoy</h2>

      {todayTrips.length === 0 ? (
        <p style={{ marginBottom: 30 }}>No hay servicios privados para hoy.</p>
      ) : (
        <div style={{ display: "grid", gap: 12, marginBottom: 30 }}>
          {todayTrips.map((trip) => (
            <div
              key={trip.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: 16,
                background: "#fafafa",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <strong style={{ fontSize: 18 }}>
                  {trip.serviceTime || "--:--"} · {trip.amount} €
                </strong>

                <div
                  style={{
                    display: "inline-block",
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: "bold",
                    color: "white",
                    background:
                      trip.status === "pending"
                        ? "#7f8c8d"
                        : trip.status === "assigned"
                        ? "#2980b9"
                        : trip.status === "completed"
                        ? "#27ae60"
                        : trip.status === "cancelled"
                        ? "#c0392b"
                        : "#95a5a6",
                  }}
                >
                  {trip.status}
                </div>
              </div>

              <div style={{ marginTop: 10 }}>
                <div>
                  <strong>Origen:</strong> {trip.origin || "-"}
                </div>

                {trip.stops && (
                  <div>
                    <strong>Paradas:</strong> {trip.stops}
                  </div>
                )}

                <div>
                  <strong>Destino:</strong> {trip.destination || "-"}
                </div>
              </div>

              <div style={{ marginTop: 10 }}>
                <div>
                  <strong>Conductor:</strong> {trip.driver?.fullName ?? "Sin asignar"}
                </div>
                <div>
                  <strong>Vehículo:</strong> {trip.vehicle?.plateNumber ?? "Sin asignar"}
                </div>
                <div>
                  <strong>Intermediario:</strong> {trip.intermediary ?? "-"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIAJES PRIVADOS */}

<h2>Viajes Privados</h2>

<div
  style={{
    marginTop: 10,
    border: "1px solid #ddd",
    borderRadius: 10,
    overflow: "hidden",
    background: "#fafafa",
  }}
>
  <table style={{ width: "100%", borderCollapse: "collapse" }}>
    <thead>
      <tr style={{ background: "#f0f0f0", textAlign: "left" }}>
        <th style={{ padding: 12 }}>Fecha / Hora</th>
        <th style={{ padding: 12 }}>Importe</th>
        <th style={{ padding: 12 }}>Conductor</th>
        <th style={{ padding: 12 }}>Vehículo</th>
        <th style={{ padding: 12 }}>Estado</th>
	<th style={{ padding: 12 }}>Acción</th>
      </tr>
    </thead>
    <tbody>
      {recentTrips.map((trip) => (
        <tr key={trip.id} style={{ borderTop: "1px solid #e5e5e5" }}>
          <td style={{ padding: 12 }}>
            {new Date(trip.serviceDate).toLocaleDateString("es-ES")} · {trip.serviceTime}
          </td>
          <td style={{ padding: 12 }}>{trip.amount} €</td>
          <td style={{ padding: 12 }}>
            {trip.driver?.fullName ?? "Sin asignar"}
          </td>
          <td style={{ padding: 12 }}>
            {trip.vehicle?.plateNumber ?? "Sin asignar"}
          </td>
	<td style={{ padding: 12 }}>
  <TripActions tripId={trip.id} status={trip.status} />
</td>
          <td style={{ padding: 12 }}>
            <span
              style={{
                display: "inline-block",
                padding: "4px 10px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: "bold",
                color: "white",
                background:
                  trip.status === "pending"
                    ? "#7f8c8d"
                    : trip.status === "assigned"
                    ? "#2980b9"
                    : trip.status === "completed"
                    ? "#27ae60"
                    : trip.status === "cancelled"
                    ? "#c0392b"
                    : "#95a5a6",
              }}
            >
              {trip.status}
            </span>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

    </main>

  );

}