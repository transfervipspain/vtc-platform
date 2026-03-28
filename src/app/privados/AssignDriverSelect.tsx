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
    <select
      defaultValue=""
      onChange={(e) => handleChange(e.target.value)}
      style={{
        padding: "6px 10px",
        borderRadius: 8,
        border: "1px solid #d1d5db",
        fontSize: 13,
        background: "white",
        cursor: "pointer",
      }}
    >
      <option value="">Asignar</option>

      {drivers.map((driver) => (
        <option key={driver.id} value={driver.id}>
          {driver.fullName}
        </option>
      ))}
    </select>
  );
}