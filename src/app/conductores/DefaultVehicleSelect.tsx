"use client";

type Vehicle = {
  id: string;
  plateNumber: string;
  brand: string;
  model: string;
};

type Props = {
  driverId: string;
  currentVehicleId: string | null;
  vehicles: Vehicle[];
};

export default function DefaultVehicleSelect({
  driverId,
  currentVehicleId,
  vehicles,
}: Props) {
  async function handleChange(vehicleId: string) {
    await fetch("/api/drivers/default-vehicle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        driverId,
        vehicleId: vehicleId || null,
      }),
    });

    window.location.reload();
  }

  return (
    <div style={{ marginTop: 10 }}>
      <label>Vehículo habitual</label>

      <select
        defaultValue={currentVehicleId ?? ""}
        onChange={(e) => handleChange(e.target.value)}
        style={{ display: "block", marginTop: 6, padding: 8 }}
      >
        <option value="">-- sin asignar --</option>

        {vehicles.map((vehicle) => (
          <option key={vehicle.id} value={vehicle.id}>
            {vehicle.plateNumber} - {vehicle.brand} {vehicle.model}
          </option>
        ))}
      </select>
    </div>
  );
}