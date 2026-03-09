"use client";

type Props = {
  driverId: string;
  isActive: boolean;
};

export default function ToggleDriverActiveButton({
  driverId,
  isActive,
}: Props) {
  async function handleClick() {
    await fetch("/api/drivers/toggle-active", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        driverId,
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
      {isActive ? "Desactivar conductor" : "Activar conductor"}
    </button>
  );
}