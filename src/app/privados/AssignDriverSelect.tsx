"use client";

type Driver = {
  id: string;
  fullName: string;
};

type Props = {
  tripId: string;
  drivers: Driver[];
};

export default function AssignDriverSelect({ tripId, drivers }: Props) {
  async function handleChange(driverId: string) {
    if (!driverId) return;

    await fetch("/api/assign-trip", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tripId,
        driverId,
      }),
    });

    window.location.reload();
  }

  return (
    <div style={{ marginTop: 10 }}>
      <label>Asignar conductor</label>

      <select
        defaultValue=""
        onChange={(e) => handleChange(e.target.value)}
        style={{ display: "block", marginTop: 6, padding: 8 }}
      >
        <option value="">-- seleccionar --</option>

        {drivers.map((driver) => (
          <option key={driver.id} value={driver.id}>
            {driver.fullName}
          </option>
        ))}
      </select>
    </div>
  );
}