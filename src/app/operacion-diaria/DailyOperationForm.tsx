"use client";

import { useMemo, useState } from "react";

type Driver = {
  id: string;
  fullName: string;
};

type Vehicle = {
  id: string;
  plateNumber: string;
  brand: string;
  model: string;
  energyType: string;
};

type Props = {
  companyId: string;
  drivers: Driver[];
  vehicles: Vehicle[];
};

function getWeekdayLabel(dateString: string) {
  if (!dateString) return "";

  const date = new Date(dateString);
  const weekdays = [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ];

  return weekdays[date.getDay()];
}

export default function DailyOperationForm({
  companyId,
  drivers,
  vehicles,
}: Props) {
  const [driverId, setDriverId] = useState(drivers[0]?.id ?? "");
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id ?? "");
  const [operationDate, setOperationDate] = useState("");
  const [weekdayLabel, setWeekdayLabel] = useState("");
  const [bolt, setBolt] = useState("0");
  const [uber, setUber] = useState("0");
  const [cabify, setCabify] = useState("0");
  const [privado, setPrivado] = useState("0");
  const [propinas, setPropinas] = useState("0");
  const [efectivo, setEfectivo] = useState("0");
  const [kilometers, setKilometers] = useState("0");
  const [energyCost, setEnergyCost] = useState("0");
  const [energyQuantity, setEnergyQuantity] = useState("0");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === vehicleId),
    [vehicleId, vehicles]
  );

  const isElectric = selectedVehicle?.energyType === "electric";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("Guardando...");

    const res = await fetch("/api/daily-operations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        companyId,
        driverId,
        vehicleId,
        operationDate,
        weekdayLabel,
        bolt: Number(bolt || 0),
        uber: Number(uber || 0),
        cabify: Number(cabify || 0),
        privado: Number(privado || 0),
        propinas: Number(propinas || 0),
        efectivo: Number(efectivo || 0),
        kilometers: Number(kilometers || 0),
        energyCost: Number(energyCost || 0),
        energyQuantity: Number(energyQuantity || 0),
        notes,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Error al guardar");
      return;
    }

    setMessage("Registro guardado correctamente");
    window.location.href = "/operacion-diaria";
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "grid",
        gap: 20,
      }}
    >
      <div>
        <h2 style={{ margin: 0, marginBottom: 6 }}>Nuevo registro</h2>
        <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
          Registra la operación diaria de un conductor y su vehículo.
        </p>
      </div>

      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Datos básicos</div>

        <div style={twoColsStyle}>
          <Field label="Conductor">
            <select
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              style={inputStyle}
            >
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.fullName}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Vehículo">
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              style={inputStyle}
            >
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plateNumber} - {vehicle.brand} {vehicle.model}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div style={twoColsStyle}>
          <Field label="Fecha">
            <input
              type="date"
              value={operationDate}
              onChange={(e) => {
                const value = e.target.value;
                setOperationDate(value);
                setWeekdayLabel(getWeekdayLabel(value));
              }}
              style={inputStyle}
              required
            />
          </Field>

          <Field label="Día de la semana">
            <input
              value={weekdayLabel}
              onChange={(e) => setWeekdayLabel(e.target.value)}
              placeholder="Lunes, Martes..."
              style={inputStyle}
            />
          </Field>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Ingresos por plataforma</div>

        <div style={fourColsStyle}>
          <Field label="Bolt (€)">
            <input
              value={bolt}
              onChange={(e) => setBolt(e.target.value)}
              type="number"
              step="0.01"
              style={inputStyle}
            />
          </Field>

          <Field label="Uber (€)">
            <input
              value={uber}
              onChange={(e) => setUber(e.target.value)}
              type="number"
              step="0.01"
              style={inputStyle}
            />
          </Field>

          <Field label="Cabify (€)">
            <input
              value={cabify}
              onChange={(e) => setCabify(e.target.value)}
              type="number"
              step="0.01"
              style={inputStyle}
            />
          </Field>

          <Field label="Privado (€)">
            <input
              value={privado}
              onChange={(e) => setPrivado(e.target.value)}
              type="number"
              step="0.01"
              style={inputStyle}
            />
          </Field>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Extras y energía</div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 14,
          }}
        >
          <Field label="Propinas (€)">
            <input
              value={propinas}
              onChange={(e) => setPropinas(e.target.value)}
              type="number"
              step="0.01"
              style={inputStyle}
            />
          </Field>

          <Field label="Efectivo (€)">
            <input
              value={efectivo}
              onChange={(e) => setEfectivo(e.target.value)}
              type="number"
              step="0.01"
              style={inputStyle}
            />
          </Field>

          <Field label="Kilómetros">
            <input
              value={kilometers}
              onChange={(e) => setKilometers(e.target.value)}
              type="number"
              step="0.01"
              style={inputStyle}
            />
          </Field>

          <Field label="Coste energía (€)">
            <input
              value={energyCost}
              onChange={(e) => setEnergyCost(e.target.value)}
              type="number"
              step="0.01"
              style={inputStyle}
            />
          </Field>

          <Field label={isElectric ? "kWh" : "Litros"}>
            <input
              value={energyQuantity}
              onChange={(e) => setEnergyQuantity(e.target.value)}
              type="number"
              step="0.01"
              style={inputStyle}
            />
          </Field>
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Observaciones</div>

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
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <button type="submit" style={submitButtonStyle}>
          Guardar operación
        </button>

        {message ? (
          <span
            style={{
              color: message.toLowerCase().includes("error")
                ? "#b91c1c"
                : "#166534",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {message}
          </span>
        ) : null}
      </div>
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

const sectionStyle: React.CSSProperties = {
  display: "grid",
  gap: 14,
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "#111827",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const twoColsStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 14,
};

const fourColsStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: 14,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #d1d5db",
  borderRadius: 10,
  fontSize: 14,
  background: "#fff",
  boxSizing: "border-box",
};

const submitButtonStyle: React.CSSProperties = {
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: 10,
  padding: "12px 18px",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
};