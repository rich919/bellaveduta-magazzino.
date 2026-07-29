"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SALONE } from "@/lib/data/salon";

function ModuloAccesso() {
  const router = useRouter();
  const parametri = useSearchParams();
  const [password, setPassword] = useState("");
  const [errore, setErrore] = useState<string | null>(null);
  const [inCorso, setInCorso] = useState(false);

  async function invia(e: React.FormEvent) {
    e.preventDefault();
    setInCorso(true);
    setErrore(null);
    try {
      const risposta = await fetch("/api/gestionale/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!risposta.ok) {
        const dati = await risposta.json().catch(() => null);
        setErrore(dati?.errore ?? "Accesso non riuscito.");
        setInCorso(false);
        return;
      }
      // `refresh` rilegge il middleware, che ora vede il cookie valido.
      router.replace(parametri.get("torna") ?? "/gestionale");
      router.refresh();
    } catch {
      setErrore("Non riesco a raggiungere il server. Riprova.");
      setInCorso(false);
    }
  }

  return (
    <div className="accesso">
      <form className="accesso-box" onSubmit={invia}>
        <p className="accesso-marchio">{SALONE.nome}</p>
        <h1>Gestionale</h1>
        <p className="accesso-sotto">
          Da qui si vede l&apos;agenda del salone. Le clienti non arrivano su questo
          indirizzo.
        </p>

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          required
        />

        {errore && (
          <p className="errore" role="alert">
            {errore}
          </p>
        )}

        <button type="submit" className="btn btn-lg" disabled={inCorso || !password}>
          {inCorso ? "Verifico…" : "Entra"}
        </button>
      </form>
    </div>
  );
}

export default function PaginaLogin() {
  return (
    <Suspense fallback={<div className="accesso" />}>
      <ModuloAccesso />
    </Suspense>
  );
}
