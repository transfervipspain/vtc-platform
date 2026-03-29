"use client";

import { useState } from "react";

type Props = {
  driverId: string;
  isActive: boolean;
};

export default function ToggleDriverActiveButton({
  driverId,
  isActive,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;

    setLoading(true);

    const res = await fetch("/api/drivers/toggle-active", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        driverId,
      }),
    });

    if (!res.ok) {
      setLoading(false);
      alert("No se pudo actualizar el estado del conductor");
      return;
    }

    window.location.reload();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      style={{
        background: isActive ? "#dc2626" : "#16a34a",
        color: "white",
        border: "none",
        padding: "8px 12px",
        borderRadius: 10,
        cursor: loading ? "not-allowed" : "pointer",
        fontWeight: 600,
        fontSize: 13,
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? "Guardando..." : isActive ? "Desactivar" : "Activar"}
    </button>
  );
}