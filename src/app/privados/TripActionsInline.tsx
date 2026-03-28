"use client";

type Props = {
  tripId: string;
  status: string;
};

export default function TripActionsInline({ tripId, status }: Props) {
  async function updateStatus(newStatus: string) {
    await fetch("/api/update-trip-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tripId,
        status: newStatus,
      }),
    });

    window.location.reload();
  }

  return (
    <div style={{ display: "flex", gap: 6 }}>
      {status === "assigned" && (
        <button style={btnBlue} onClick={() => updateStatus("in_progress")}>
          Iniciar
        </button>
      )}

      {status === "in_progress" && (
        <button style={btnGreen} onClick={() => updateStatus("completed")}>
          Completar
        </button>
      )}

      {status !== "completed" && status !== "cancelled" && (
        <button style={btnRed} onClick={() => updateStatus("cancelled")}>
          Cancelar
        </button>
      )}
    </div>
  );
}

const baseBtn = {
  border: "none",
  borderRadius: 6,
  padding: "4px 8px",
  fontSize: 12,
  cursor: "pointer",
  color: "white",
};

const btnBlue = {
  ...baseBtn,
  background: "#2563eb",
};

const btnGreen = {
  ...baseBtn,
  background: "#16a34a",
};

const btnRed = {
  ...baseBtn,
  background: "#dc2626",
};