"use client";

import { useState } from "react";

type Props = {
  driverId: string;
  initialPhone: string | null;
  initialEmail: string | null;
  initialLicensePoints: number | null;
  initialCommission: number | null;
};

export default function EditDriverForm({
  driverId,
  initialPhone,
  initialEmail,
  initialLicensePoints,
  initialCommission,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [email, setEmail] = useState(initialEmail ?? "");
  const [licensePoints, setLicensePoints] = useState(
    initialLicensePoints?.toString() ?? ""
  );
  const [commission, setCommission] = useState(
    initialCommission?.toString() ?? "40"
  );
  const [message, setMessage] = useState("");

  async function handleSave() {
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
        commissionPercentage: Number(commission),
      }),
    });

    if (!res.ok) {
      setMessage("Error guardando");
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
              gap: 14,
            }}
          >
            <h3 style={{ margin: 0 }}>Editar conductor</h3>

            {/* TELÉFONO */}
            <div>
              <label style={{ fontSize: 13, color: "#555" }}>
                Teléfono
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: "100%",
                  padding: 8,
                  marginTop: 4,
                  border: "1px solid #ccc",
                  borderRadius: 6,
                }}
              />
            </div>

            {/* EMAIL */}
            <div>
              <label style={{ fontSize: 13, color: "#555" }}>
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%",
                  padding: 8,
                  marginTop: 4,
                  border: "1px solid #ccc",
                  borderRadius: 6,
                }}
              />
            </div>

            {/* PUNTOS */}
            <div>
              <label style={{ fontSize: 13, color: "#555" }}>
                Puntos del carnet
              </label>
              <input
                type="number"
                value={licensePoints}
                onChange={(e) => setLicensePoints(e.target.value)}
                style={{
                  width: "100%",
                  padding: 8,
                  marginTop: 4,
                  border: "1px solid #ccc",
                  borderRadius: 6,
                }}
              />
            </div>

            {/* COMISIÓN */}
            <div>
              <label style={{ fontSize: 13, color: "#555" }}>
                % Comisión conductor
              </label>
              <input
                type="number"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                style={{
                  width: "100%",
                  padding: 8,
                  marginTop: 4,
                  border: "1px solid #ccc",
                  borderRadius: 6,
                }}
              />
            </div>

            {/* BOTONES */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
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
            </div>

            {message && <p style={{ margin: 0 }}>{message}</p>}
          </div>
        </div>
      )}
    </>
  );
}