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
    <div
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        width: "100%",
      }}
    >
      {status === "assigned" && (
        <button
          type="button"
          style={btnBlue}
          onClick={() => updateStatus("in_progress")}
        >
          Iniciar
        </button>
      )}

      {status === "in_progress" && (
        <button
          type="button"
          style={btnGreen}
          onClick={() => updateStatus("completed")}
        >
          Completar
        </button>
      )}

      {status !== "completed" && status !== "cancelled" && (
        <button
          type="button"
          style={btnRed}
          onClick={() => updateStatus("cancelled")}
        >
          Cancelar
        </button>
      )}
    </div>
  );
}

const baseBtn: React.CSSProperties = {
  border: "none",
  borderRadius: 10,
  padding: "9px 12px",
  minHeight: 40,
  fontSize: 12,
  cursor: "pointer",
  color: "white",
  fontWeight: 700,
  lineHeight: 1.2,
  whiteSpace: "nowrap",
};

const btnBlue: React.CSSProperties = {
  ...baseBtn,
  background: "#2563eb",
};

const btnGreen: React.CSSProperties = {
  ...baseBtn,
  background: "#16a34a",
};

const btnRed: React.CSSProperties = {
  ...baseBtn,
  background: "#dc2626",
};