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

    window.location.reload();
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "¿Seguro que quieres eliminar este conductor? Solo se podrá borrar si no tiene historial."
    );

    if (!confirmed) return;

    const res = await fetch("/api/drivers/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        driverId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Error al eliminar");
      return;
    }

    window.location.reload();
  }

  return (
    <>
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

      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: 420,
              maxWidth: "90vw",
              background: "white",
              borderRadius: 12,
              padding: 20,
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              display: "grid",
              gap: 12,
            }}
          >
            <h3 style={{ margin: 0 }}>Editar conductor</h3>

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

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={handleSave}
                style={{
                  background: "#27ae60",
                  color: "white",
                  border: "none",
                  padding: "8px 12px",
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
                  padding: "8px 12px",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>

              <button
                onClick={handleDelete}
                style={{
                  background: "#c0392b",
                  color: "white",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Eliminar conductor
              </button>
            </div>

            {message && <p style={{ margin: 0 }}>{message}</p>}
          </div>
        </div>
      )}
    </>
  );
}