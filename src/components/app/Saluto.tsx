"use client";

import { useEffect, useState } from "react";

/**
 * "Buongiorno, Elena" in cima alla home.
 *
 * La fascia oraria si può sapere solo nel browser: calcolarla sul server
 * darebbe l'ora del datacenter, e in più farebbe divergere l'HTML del server da
 * quello del client. Per questo parte da un saluto neutro e si specifica dopo
 * il primo render.
 *
 * Il nome è quello della cliente dimostrativa. In un'app vera arriva
 * dall'accesso: senza login non c'è modo di sapere chi sta guardando.
 */
const NOME_CLIENTE = "Elena";

export function Saluto() {
  const [fascia, setFascia] = useState<string>("Ciao");

  useEffect(() => {
    const ora = new Date().getHours();
    setFascia(ora < 13 ? "Buongiorno" : ora < 18 ? "Buon pomeriggio" : "Buonasera");
  }, []);

  return (
    <p className="saluto">
      {fascia}, <em>{NOME_CLIENTE}</em>
    </p>
  );
}
