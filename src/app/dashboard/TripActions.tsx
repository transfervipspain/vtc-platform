"use client";

type Props = {
  tripId: string;
  status: string;
};

export default function TripActions({ tripId, status }: Props) {
  async function updateTripStatus(newStatus: string) {
    await fetch("/api/update-trip-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tripId, status: newStatus }),
    });

    window.location.reload();
  }

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {(status === "pending" || status === "confirmed") && (
        <button
          onClick={() => updateTripStatus("assigned")}
          style={{
            background: "#2980b9",
            color: "white",
            border: "none",
            padding: "6px 10px",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Asignar
        </button>
      )}

      {status === "assigned" && (
        <button
          onClick={() => updateTripStatus("in_progress")}
          style={{
            background: "#f39c12",
            color: "white",
            border: "none",
            padding: "6px 10px",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Iniciar
        </button>
      )}

      {status === "in_progress" && (
        <button
          onClick={() => updateTripStatus("completed")}
          style={{
            background: "#27ae60",
            color: "white",
            border: "none",
            padding: "6px 10px",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Completar
        </button>
      )}

      {status !== "completed" && status !== "cancelled" && (
        <button
          onClick={() => updateTripStatus("cancelled")}
          style={{
            background: "#c0392b",
            color: "white",
            border: "none",
            padding: "6px 10px",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Cancelar
        </button>
      )}
    </div>
  );
}