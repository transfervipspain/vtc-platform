"use client";

import React, { useState } from "react";
import { DatePickerInput } from "@mantine/dates";

type Props = {
  companyId: string;
};

export default function PrivateTripForm({ companyId }: Props) {
  const [serviceDate, setServiceDate] = useState<string | null>(null);
  const [serviceTime, setServiceTime] = useState("");
  const [amount, setAmount] = useState("0");
  const [intermediary, setIntermediary] = useState("");
  const [communicator, setCommunicator] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("pending");
  const [message, setMessage] = useState("");
  const [origin, setOrigin] = useState("");
  const [stops, setStops] = useState("");
  const [destination, setDestination] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!serviceDate) {
  setMessage("Debes seleccionar una fecha");
  return;
}

const normalizedDate =
  serviceDate instanceof Date
    ? serviceDate
    : new Date(serviceDate as string);

if (Number.isNaN(normalizedDate.getTime())) {
  setMessage("La fecha no es válida");
  return;
}

setMessage("Guardando...");

const res = await fetch("/api/private-trips", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    companyId,
    serviceDate: normalizedDate.toISOString().split("T")[0],
        serviceTime,
        amount: Number(amount),
        origin: origin.trim(),
        stops: stops.trim(),
        destination: destination.trim(),
        intermediary: intermediary.trim(),
        communicator: communicator.trim(),
        notes: notes.trim(),
        status,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Error");
      return;
    }

    setMessage("Servicio guardado");
    window.location.href = "/privados";
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "grid",
        gap: 18,
      }}
    >
      <div>
        <h2 style={{ margin: 0, marginBottom: 6 }}>Nuevo viaje privado</h2>
        <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
          Registra un servicio privado con ruta, importe y estado.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        <Field label="Fecha">
          <DatePickerInput
            value={serviceDate}
            onChange={setServiceDate}
            placeholder="Selecciona fecha"
            valueFormat="DD/MM/YYYY"
            clearable={false}
            firstDayOfWeek={1}
            styles={{
              input: {
                width: "100%",
                minHeight: 42,
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #d1d5db",
                fontSize: 14,
                background: "#fff",
                boxSizing: "border-box",
              },
            }}
          />
        </Field>

        <Field label="Hora">
          <input
            type="time"
            value={serviceTime}
            onChange={(e) => setServiceTime(e.target.value)}
            required
            style={inputStyle}
          />
        </Field>

        <Field label="Importe (€)">
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={inputStyle}
          />
        </Field>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 12,
        }}
      >
        <Field label="Origen">
          <input
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            style={inputStyle}
            placeholder="Dirección de recogida"
          />
        </Field>

        <Field label="Paradas intermedias">
          <input
            value={stops}
            onChange={(e) => setStops(e.target.value)}
            style={inputStyle}
            placeholder="Opcional"
          />
        </Field>

        <Field label="Destino final">
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            style={inputStyle}
            placeholder="Dirección destino"
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
        <Field label="Intermediario">
          <input
            value={intermediary}
            onChange={(e) => setIntermediary(e.target.value)}
            style={inputStyle}
            placeholder="Directo / Hotel / Agencia"
          />
        </Field>

        <Field label="Comunicador">
          <input
            value={communicator}
            onChange={(e) => setCommunicator(e.target.value)}
            style={inputStyle}
            placeholder="Quién lo gestionó"
          />
        </Field>

        <Field label="Estado">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={inputStyle}
          >
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmado</option>
            <option value="assigned">Asignado</option>
            <option value="completed">Completado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </Field>
      </div>

      <Field label="Notas">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{
            ...inputStyle,
            minHeight: 96,
            resize: "vertical",
          }}
        />
      </Field>

      <button type="submit" style={primaryButtonStyle}>
        Guardar servicio
      </button>

      {message && (
        <p
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 600,
            color: message.toLowerCase().includes("error") ? "#b91c1c" : "#2563eb",
          }}
        >
          {message}
        </p>
      )}
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
      <label style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 42,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  fontSize: 14,
  background: "#fff",
  boxSizing: "border-box",
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