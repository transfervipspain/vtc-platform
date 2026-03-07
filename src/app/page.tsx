import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const company = await prisma.company.findFirst({
    include: {
      drivers: true,
      vehicles: true,
    },
  });

  if (!company) {
    return (
      <main style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
        <h1>Transfer Vip Spain</h1>
        <p>No hay datos cargados todavía.</p>
      </main>
    );
  }

  return (
    <main style={{ padding: "40px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>
        {company.tradeName || company.legalName}
      </h1>

      <p style={{ marginBottom: "30px", color: "#555" }}>
        Panel inicial de la plataforma VTC
      </p>

      <section style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>Resumen</h2>
        <ul>
          <li>Conductores: {company.drivers.length}</li>
          <li>Vehículos: {company.vehicles.length}</li>
        </ul>
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>Conductores</h2>
        <ul>
          {company.drivers.map((driver) => (
            <li key={driver.id}>
              {driver.fullName} {driver.phone ? `- ${driver.phone}` : ""}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 style={{ fontSize: "24px", marginBottom: "10px" }}>Vehículos</h2>
        <ul>
          {company.vehicles.map((vehicle) => (
            <li key={vehicle.id}>
              {vehicle.plateNumber} - {vehicle.brand} {vehicle.model} ({vehicle.energyType})
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}