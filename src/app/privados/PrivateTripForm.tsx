"use client";

type Props = {
  companyId: string;
};

import { useState } from "react";

export default function PrivateTripForm({ companyId }: Props) {

  const [serviceDate,setServiceDate] = useState("");
  const [serviceTime,setServiceTime] = useState("");
  const [amount,setAmount] = useState("0");
  const [intermediary,setIntermediary] = useState("");
  const [communicator,setCommunicator] = useState("");
  const [notes,setNotes] = useState("");
  const [status,setStatus] = useState("pending");
  const [message,setMessage] = useState("");
  const [origin,setOrigin] = useState("");
  const [stops,setStops] = useState("");
  const [destination,setDestination] = useState("");

  async function handleSubmit(e:any){

    e.preventDefault();

    setMessage("Guardando...");

    const res = await fetch("/api/private-trips",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
  	companyId,
        serviceDate,
        serviceTime,
        amount:Number(amount),
        origin,
	stops,
	destination,
        intermediary,
        communicator,
        notes,
        status
      })
    });

    const data = await res.json();

    if(!res.ok){
      setMessage(data.error || "Error");
      return;
    }

    setMessage("Servicio guardado");

    window.location.href="/privados";
  }

  return(

    <form onSubmit={handleSubmit}
    style={{
      border:"1px solid #ddd",
      borderRadius:10,
      padding:20,
      marginBottom:30,
      display:"grid",
      gap:12
    }}>

      <h2>Nuevo viaje privado</h2>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>

        <div>
          <label>Fecha</label>
          <input
          type="date"
          value={serviceDate}
          onChange={(e)=>setServiceDate(e.target.value)}
          required
          style={{width:"100%",padding:8}}
          />
        </div>

        <div>
          <label>Hora</label>
          <input
          type="time"
          value={serviceTime}
          onChange={(e)=>setServiceTime(e.target.value)}
          required
          style={{width:"100%",padding:8}}
          />
        </div>

      </div>

      <div>
        <label>Importe (€)</label>
        <input
        type="number"
        step="0.01"
        value={amount}
        onChange={(e)=>setAmount(e.target.value)}
        style={{width:"100%",padding:8}}
        />
      </div>
<div>
<label>Origen</label>
<input
value={origin}
onChange={(e)=>setOrigin(e.target.value)}
style={{width:"100%",padding:8}}
placeholder="Dirección de recogida"
/>
</div>

<div>
<label>Paradas intermedias</label>
<input
value={stops}
onChange={(e)=>setStops(e.target.value)}
style={{width:"100%",padding:8}}
placeholder="Opcional"
/>
</div>

<div>
<label>Destino final</label>
<input
value={destination}
onChange={(e)=>setDestination(e.target.value)}
style={{width:"100%",padding:8}}
placeholder="Dirección destino"
/>
</div>

      <div>
        <label>Intermediario</label>
        <input
        value={intermediary}
        onChange={(e)=>setIntermediary(e.target.value)}
        style={{width:"100%",padding:8}}
        placeholder="Directo / Hotel / Agencia"
        />
      </div>

      <div>
        <label>Comunicador</label>
        <input
        value={communicator}
        onChange={(e)=>setCommunicator(e.target.value)}
        style={{width:"100%",padding:8}}
        placeholder="Quien lo gestionó"
        />
      </div>

      <div>
        <label>Estado</label>

        <select
        value={status}
        onChange={(e)=>setStatus(e.target.value)}
        style={{width:"100%",padding:8}}
        >

          <option value="pending">pendiente</option>
          <option value="confirmed">confirmado</option>
          <option value="assigned">asignado</option>
          <option value="completed">completado</option>
          <option value="cancelled">cancelado</option>

        </select>

      </div>

      <div>
        <label>Notas</label>

        <textarea
        value={notes}
        onChange={(e)=>setNotes(e.target.value)}
        style={{width:"100%",padding:8}}
        />
      </div>

      <button
      style={{
        background:"black",
        color:"white",
        padding:"10px",
        borderRadius:6,
        border:"none"
      }}>
        Guardar servicio
      </button>

      {message && <p>{message}</p>}

    </form>

  );
}