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
        border: "1px solid #ddd",
        borderRadius: 12,
        padding: 20,
        background: "#fff",
        display: "grid",
        gap: 14,
      }}
    >
      <h2>Nuevo registro</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label>Conductor</label>
          <select
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          >
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.fullName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Vehículo</label>
          <select
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          >
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.plateNumber} - {vehicle.brand} {vehicle.model}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label>Fecha</label>
          <input
            type="date"
            value={operationDate}
            onChange={(e) => setOperationDate(e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
            required
          />
        </div>

        <div>
          <label>Día de la semana</label>
          <input
            value={weekdayLabel}
            onChange={(e) => setWeekdayLabel(e.target.value)}
            placeholder="Lunes, Martes..."
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <div>
          <label>Bolt (€)</label>
          <input value={bolt} onChange={(e) => setBolt(e.target.value)} type="number" step="0.01" style={{ width: "100%", padding: 8, marginTop: 4 }} />
        </div>
        <div>
          <label>Uber (€)</label>
          <input value={uber} onChange={(e) => setUber(e.target.value)} type="number" step="0.01" style={{ width: "100%", padding: 8, marginTop: 4 }} />
        </div>
        <div>
          <label>Cabify (€)</label>
          <input value={cabify} onChange={(e) => setCabify(e.target.value)} type="number" step="0.01" style={{ width: "100%", padding: 8, marginTop: 4 }} />
        </div>
        <div>
          <label>Privado (€)</label>
          <input value={privado} onChange={(e) => setPrivado(e.target.value)} type="number" step="0.01" style={{ width: "100%", padding: 8, marginTop: 4 }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <div>
          <label>Propinas (€)</label>
          <input value={propinas} onChange={(e) => setPropinas(e.target.value)} type="number" step="0.01" style={{ width: "100%", padding: 8, marginTop: 4 }} />
        </div>
        <div>
          <label>Efectivo (€)</label>
          <input value={efectivo} onChange={(e) => setEfectivo(e.target.value)} type="number" step="0.01" style={{ width: "100%", padding: 8, marginTop: 4 }} />
        </div>
        <div>
          <label>Kilómetros</label>
          <input value={kilometers} onChange={(e) => setKilometers(e.target.value)} type="number" step="0.01" style={{ width: "100%", padding: 8, marginTop: 4 }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        <div>
          <label>Coste energía (€)</label>
          <input value={energyCost} onChange={(e) => setEnergyCost(e.target.value)} type="number" step="0.01" style={{ width: "100%", padding: 8, marginTop: 4 }} />
        </div>

        <div>
          <label>{isElectric ? "kWh" : "Litros"}</label>
          <input
            value={energyQuantity}
            onChange={(e) => setEnergyQuantity(e.target.value)}
            type="number"
            step="0.01"
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </div>
      </div>

      <div>
        <label>Notas</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ width: "100%", padding: 8, marginTop: 4, minHeight: 80 }}
        />
      </div>

      <button
        type="submit"
        style={{
          background: "black",
          color: "white",
          border: "none",
          borderRadius: 8,
          padding: "12px 16px",
          cursor: "pointer",
        }}
      >
        Guardar operación
      </button>

      {message && <p>{message}</p>}
    </form>
  );
}