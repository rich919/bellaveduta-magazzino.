"use client";

import { useState } from "react";
import Link from "next/link";
import { Icona } from "@/components/Icone";
import { Foto } from "@/components/app/Pezzi";
import { BottoneAggiungi } from "@/components/app/BottoneAggiungi";
import { useStatoApp } from "@/components/StatoApp";
import { FAMIGLIE, PRODOTTI, type FamigliaProdotto } from "@/lib/data/products";
import { euro } from "@/lib/date";

export function Negozio() {
  const [filtro, setFiltro] = useState<FamigliaProdotto | "tutti">("tutti");
  const { pezziNelCarrello } = useStatoApp();

  const lista = PRODOTTI.filter((p) => filtro === "tutti" || p.famiglia === filtro);

  return (
    <>
      <div className="app-head">
        <span style={{ width: 34, flex: "none" }} />
        <h1 className="titolo-schermo">Shop</h1>
        <Link href="/carrello" className="tondo" aria-label="Carrello">
          <Icona nome="shop" style={{ width: 17, height: 17 }} />
          {pezziNelCarrello > 0 && <span className="badge">{pezziNelCarrello}</span>}
        </Link>
      </div>

      <p className="pad" style={{ fontSize: "0.8rem", color: "var(--testo-2)", marginBottom: "0.8rem" }}>
        Siamo rivenditore autorizzato ghd. Ogni euro speso vale un punto tessera.
      </p>

      <div className="chips">
        {FAMIGLIE.map((f) => (
          <button
            key={f.id}
            type="button"
            className="chip"
            aria-pressed={filtro === f.id}
            onClick={() => setFiltro(f.id)}
          >
            {f.nome}
          </button>
        ))}
      </div>

      <div className="griglia">
        {lista.map((p) => (
          <div key={p.id} className="prod">
            <Link href={`/shop/${p.id}`}>
              <Foto src={p.immagine} alt={p.nome} className="prod-foto" sizes="(max-width: 700px) 50vw, 190px" />
            </Link>
            <div className="prod-b">
              <div className="prod-m">{p.marca}</div>
              <Link href={`/shop/${p.id}`} className="prod-n">
                {p.nome.replace(/^ghd /, "")}
              </Link>
              <div className="prod-r">
                <span className="prod-p num">{euro(p.prezzo)}</span>
                <BottoneAggiungi prodottoId={p.id} compatto />
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="pad" style={{ fontSize: "0.72rem", color: "var(--testo-2)", marginTop: "1rem" }}>
        I nomi dei prodotti ghd sono quelli reali di catalogo, i prezzi sono stime
        al listino italiano e vanno confermati. Le fotografie sono generiche: prima
        della vendita vanno sostituite con quelle ufficiali del marchio.
      </p>
      <div style={{ height: "1.4rem" }} />
    </>
  );
}
