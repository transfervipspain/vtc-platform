"use client";

import { useState } from "react";

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

  console.log("companyId", companyId);
  console.log("payload", {
    companyId,
    firstName: cleanFirstName,
    lastName: cleanLastName,
    phone: phone.trim(),
    email: email.trim(),
    licensePoints: Number(licensePoints || 0),
  });

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
        border: "1px solid #ddd",
        borderRadius: 10,
        padding: 20,
        marginBottom: 24,
        display: "grid",
        gap: 12,
        background: "#fafafa",
      }}
    >

      <h2>Nuevo conductor</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        <div>
          <label>Nombre</label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>

        <div>
          <label>Apellidos</label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 12,
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
      </div>

      <button
        type="submit"
        style={{
          background: "#111",
          color: "white",
          border: "none",
          borderRadius: 8,
          padding: "10px 14px",
          cursor: "pointer",
        }}
      >
        Crear conductor
      </button>

      {message && <p>{message}</p>}
    </form>
  );
}