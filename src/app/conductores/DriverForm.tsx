"use client";

import React, { useState } from "react";

type Props = {
  companyId: string;
};

export default function DriverForm({ companyId }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [licensePoints, setLicensePoints] = useState("8");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();

    if (!companyId || !cleanFirstName || !cleanLastName) {
      setMessage("Faltan campos obligatorios");
      return;
    }

    setMessage("Guardando...");

    const res = await fetch("/api/drivers/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        companyId,
        firstName: cleanFirstName,
        lastName: cleanLastName,
        phone: phone.trim(),
        email: email.trim(),
        licensePoints: Number(licensePoints || 0),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Error al crear conductor");
      return;
    }

    setMessage("Conductor creado correctamente");
    window.location.reload();
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        display: "grid",
        gap: 16,
        background: "white",
        boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
      }}
    >
      <h2 style={{ margin: 0 }}>Nuevo conductor</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))",
          gap: 12,
        }}
      >
        <Field label="Nombre">
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            style={inputStyle}
          />
        </Field>

        <Field label="Apellidos">
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            style={inputStyle}
          />
        </Field>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))",
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

      <button type="submit" style={primaryButtonStyle}>
        Crear conductor
      </button>

      {message && <p style={{ margin: 0 }}>{message}</p>}
    </form>
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
      <label style={{ fontSize: 14, fontWeight: 600 }}>{label}</label>
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
};

const primaryButtonStyle: React.CSSProperties = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 600,
};