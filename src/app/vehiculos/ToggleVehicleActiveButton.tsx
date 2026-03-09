"use client";

type Props = {
  vehicleId: string;
  isActive: boolean;
};

export default function ToggleVehicleActiveButton({
  vehicleId,
  isActive,
}: Props) {
  async function handleClick() {
    await fetch("/api/vehicles/toggle-active", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vehicleId,
        isActive: !isActive,
      }),
    });

    window.location.reload();
  }

  return (
    <button
      onClick={handleClick}
      style={{
        background: isActive ? "#c0392b" : "#27ae60",
        color: "white",
        border: "none",
        padding: "6px 10px",
        borderRadius: 6,
        cursor: "pointer",
      }}
    >
      {isActive ? "Desactivar vehículo" : "Activar vehículo"}
    </button>
  );
}