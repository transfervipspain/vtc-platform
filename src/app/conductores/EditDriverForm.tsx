"use client";

import { useState } from "react";

type Props = {
  driverId: string;
  initialPhone: string | null;
  initialEmail: string | null;
  initialLicensePoints: number | null;
  initialCommission: number | null;
  initialFixedSalaryMonthly: number | null;
  initialCommissionMode: string | null;
  initialCommissionThreshold: number | null;
  initialCommissionEnabled: boolean | null;
};

export default function EditDriverForm({
  driverId,
  initialPhone,
  initialEmail,
  initialLicensePoints,
  initialCommission,
  initialFixedSalaryMonthly,
  initialCommissionMode,
  initialCommissionThreshold,
  initialCommissionEnabled,
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
  const [fixedSalaryMonthly, setFixedSalaryMonthly] = useState(
    initialFixedSalaryMonthly?.toString() ?? "0"
  );
  const [commissionMode, setCommissionMode] = useState(
    initialCommissionMode ?? "weekly"
  );
  const [commissionThreshold, setCommissionThreshold] = useState(
    initialCommissionThreshold?.toString() ?? "0"
  );
  const [commissionEnabled, setCommissionEnabled] = useState(
    initialCommissionEnabled ?? true
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
        fixedSalaryMonthly: Number(fixedSalaryMonthly),
        commissionMode,
        commissionThreshold: Number(commissionThreshold),
        commissionEnabled,
      }),
    });

    if (!res.ok) {
      setMessage("Error guardando");
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

    if (!res.ok) {
      setMessage("Error eliminando");
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
              width: 460,
              maxWidth: "92vw",
              background: "white",
              borderRadius: 12,
              padding: 20,
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              display: "grid",
              gap: 14,
            }}
          >
            <h3 style={{ margin: 0 }}>Editar conductor</h3>

            <div>
              <label style={{ fontSize: 13, color: "#555" }}>Teléfono</label>
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

            <div>
              <label style={{ fontSize: 13, color: "#555" }}>Email</label>
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

            <div>
              <label style={{ fontSize: 13, color: "#555" }}>
                Sueldo fijo mensual (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={fixedSalaryMonthly}
                onChange={(e) => setFixedSalaryMonthly(e.target.value)}
                style={{
                  width: "100%",
                  padding: 8,
                  marginTop: 4,
                  border: "1px solid #ccc",
                  borderRadius: 6,
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 13, color: "#555" }}>
                Modo de comisión
              </label>
              <select
                value={commissionMode}
                onChange={(e) => setCommissionMode(e.target.value)}
                style={{
                  width: "100%",
                  padding: 8,
                  marginTop: 4,
                  border: "1px solid #ccc",
                  borderRadius: 6,
                }}
              >
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 13, color: "#555" }}>
                Umbral mínimo (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={commissionThreshold}
                onChange={(e) => setCommissionThreshold(e.target.value)}
                style={{
                  width: "100%",
                  padding: 8,
                  marginTop: 4,
                  border: "1px solid #ccc",
                  borderRadius: 6,
                }}
              />
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
              }}
            >
              <input
                type="checkbox"
                checked={commissionEnabled}
                onChange={(e) => setCommissionEnabled(e.target.checked)}
              />
              Comisión activa
            </label>

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