"use client";

import React, { useState } from "react";

type Props = {
  driverId: string;
  initialPhone: string | null;
  initialEmail: string | null;
  initialLicensePoints: number | null;
  initialCommission: number;
  initialFixedSalaryMonthly: number;
  initialCommissionMode: string;
  initialCommissionThreshold: number;
  initialCommissionEnabled: boolean;
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
  const [commissionPercentage, setCommissionPercentage] = useState(
    initialCommission.toString()
  );
  const [fixedSalaryMonthly, setFixedSalaryMonthly] = useState(
    initialFixedSalaryMonthly.toString()
  );
  const [commissionMode, setCommissionMode] = useState(initialCommissionMode);
  const [commissionThreshold, setCommissionThreshold] = useState(
    initialCommissionThreshold.toString()
  );
  const [commissionEnabled, setCommissionEnabled] = useState(
    initialCommissionEnabled
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
        phone: phone.trim(),
        email: email.trim(),
        licensePoints:
          licensePoints.trim() === "" ? null : Number(licensePoints),
        commissionPercentage: Number(commissionPercentage || 0),
        fixedSalaryMonthly: Number(fixedSalaryMonthly || 0),
        commissionMode,
        commissionThreshold: Number(commissionThreshold || 0),
        commissionEnabled,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Error al guardar");
      return;
    }

    window.location.href = "/conductores";
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{
          background: "#2563eb",
          color: "white",
          border: "none",
          padding: "8px 12px",
          borderRadius: 10,
          cursor: "pointer",
          fontWeight: 600,
          fontSize: 13,
        }}
      >
        Editar
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 720,
              maxHeight: "90vh",
              overflowY: "auto",
              background: "white",
              borderRadius: 18,
              padding: 20,
              boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
              border: "1px solid #e5e7eb",
              boxSizing: "border-box",
              display: "grid",
              gap: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <div>
                <h3 style={{ margin: 0, marginBottom: 6 }}>Editar conductor</h3>
                <p style={{ margin: 0, fontSize: 14, color: "#6b7280" }}>
                  Actualiza datos de contacto y configuración de comisión.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 999,
                  border: "1px solid #d1d5db",
                  background: "white",
                  cursor: "pointer",
                  fontSize: 22,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
              }}
            >
              <Field label="Teléfono">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={inputStyle}
                />
              </Field>

              <Field label="Email">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                />
              </Field>

              <Field label="Puntos carnet">
                <input
                  type="number"
                  value={licensePoints}
                  onChange={(e) => setLicensePoints(e.target.value)}
                  style={inputStyle}
                />
              </Field>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
              }}
            >
              <Field label="% Comisión">
                <input
                  type="number"
                  step="0.01"
                  value={commissionPercentage}
                  onChange={(e) => setCommissionPercentage(e.target.value)}
                  style={inputStyle}
                />
              </Field>

              <Field label="Sueldo fijo mensual (€)">
                <input
                  type="number"
                  step="0.01"
                  value={fixedSalaryMonthly}
                  onChange={(e) => setFixedSalaryMonthly(e.target.value)}
                  style={inputStyle}
                />
              </Field>

              <Field label="Modo comisión">
                <select
                  value={commissionMode}
                  onChange={(e) => setCommissionMode(e.target.value)}
                  style={inputStyle}
                >
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                </select>
              </Field>

              <Field label="Umbral comisión (€)">
                <input
                  type="number"
                  step="0.01"
                  value={commissionThreshold}
                  onChange={(e) => setCommissionThreshold(e.target.value)}
                  style={inputStyle}
                />
              </Field>

              <Field label="Comisión activa">
                <select
                  value={commissionEnabled ? "true" : "false"}
                  onChange={(e) => setCommissionEnabled(e.target.value === "true")}
                  style={inputStyle}
                >
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </Field>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <button
                type="button"
                onClick={handleSave}
                style={{
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  padding: "10px 14px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Guardar
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: "#e5e7eb",
                  color: "#111827",
                  border: "none",
                  padding: "10px 14px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Cancelar
              </button>
            </div>

            {message && (
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 600,
                  color: message.toLowerCase().includes("error")
                    ? "#b91c1c"
                    : "#2563eb",
                }}
              >
                {message}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <label
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "#374151",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  fontSize: 14,
  background: "#fff",
  boxSizing: "border-box",
};