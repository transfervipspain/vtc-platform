import { prisma } from "@/lib/prisma";
import DefaultVehicleSelect from "./DefaultVehicleSelect";
import DriverForm from "./DriverForm";
import ToggleDriverActiveButton from "./ToggleDriverActiveButton";
import EditDriverForm from "./EditDriverForm";

export const dynamic = "force-dynamic";

export default async function ConductoresPage() {
const company = await prisma.company.findFirst();
  const drivers = await prisma.driver.findMany({
    orderBy: { fullName: "asc" },
    include: {
      defaultVehicle: true,
    },
  });

  const vehicles = await prisma.vehicle.findMany({
    orderBy: { plateNumber: "asc" },
  });

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>



{company && <DriverForm companyId={company.id} />}

      <h1>Conductores</h1>

{drivers.map((driver) => (
  <div
    key={driver.id}
    style={{
      border: "1px solid #ddd",
      borderRadius: 10,
      padding: 16,
      marginBottom: 12,
    }}
  >
    <strong>{driver.fullName}</strong>

    <div>Teléfono: {driver.phone ?? "-"}</div>

    <div>
      Vehículo habitual: {driver.defaultVehicle?.plateNumber ?? "No asignado"}
    </div>

  <div>Estado: {driver.isActive ? "Activo" : "Inactivo"}</div>

    <DefaultVehicleSelect
      driverId={driver.id}
      currentVehicleId={driver.defaultVehicleId ?? null}
      vehicles={vehicles}
    />

    <div style={{ marginTop: 10 }}>
      <ToggleDriverActiveButton
        driverId={driver.id}
        isActive={driver.isActive}
      />
    </div>
<EditDriverForm
  driverId={driver.id}
  initialPhone={driver.phone}
  initialEmail={driver.email}
  initialLicensePoints={driver.licensePoints}
/>
  </div>
))}
    </main>
  );
}