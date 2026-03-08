import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Transfer Vip Spain</h1>

      <p>La plataforma VTC está funcionando 🚀</p>

      <div style={{ marginTop: 24 }}>
        <Link href="/operacion-diaria">Operación diaria</Link>
      </div>

      <div style={{ marginTop: 12 }}>
        <Link href="/privados">Viajes privados</Link>
      </div>
    </main>
  );
}