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
        width: "100%",
        minHeight: 40,
        padding: "9px 12px",
        borderRadius: 10,
        border: "1px solid #d1d5db",
        fontSize: 13,
        background: "white",
        cursor: "pointer",
        fontWeight: 600,
        color: "#111827",
        boxSizing: "border-box",
        outline: "none",
      }}
    >
      <option value="">Asignar conductor</option>
      {drivers.map((driver) => (
        <option key={driver.id} value={driver.id}>
          {driver.fullName}
        </option>
      ))}
    </select>
  );
}