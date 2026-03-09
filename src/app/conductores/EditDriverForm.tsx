"use client";

import { useState } from "react";

type Props = {
  driverId: string;
  initialPhone: string | null;
  initialEmail: string | null;
  initialLicensePoints: number | null;
};

export default function EditDriverForm({
  driverId,
  initialPhone,
  initialEmail,
  initialLicensePoints,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [email, setEmail] = useState(initialEmail ?? "");
  const [licensePoints, setLicensePoints] = useState(
    initialLicensePoints?.toString() ?? ""
  );
  const [message, setMessage] = useState("");

  async function handleSave() {
    setMessage("Guardando...");

    const res = await fetch("/api/drivers/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        driverId,
        phone,
        email,
        licensePoints,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Error al guardar");
      return;
    }

    setMessage("Guardado correctamente");
    window.location.reload();
  }

  return (
    <div style={{ marginTop: 10 }}>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            background: "#111",
            color: "white",
            border: "none",
            padding: "6px 10px",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Editar
        </button>
      ) : (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 12,
            marginTop: 8,
            background: "#fff",
            display: "grid",
            gap: 10,
          }}
        >
          <div>
            <label>Teléfono</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </div>

          <div>
            <label>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </div>

          <div>
            <label>Puntos carnet</label>
            <input
              type="number"
              value={licensePoints}
              onChange={(e) => setLicensePoints(e.target.value)}
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleSave}
              style={{
                background: "#27ae60",
                color: "white",
                border: "none",
                padding: "6px 10px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Guardar
            </button>

            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "#777",
                color: "white",
                border: "none",
                padding: "6px 10px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          </div>

          {message && <p>{message}</p>}
        </div>
      )}
    </div>
  );
}