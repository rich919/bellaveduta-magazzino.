"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Icona } from "@/components/Icone";
import { RigaServizio } from "@/components/app/Pezzi";
import { CATEGORIE, SERVIZI } from "@/lib/data/services";

const TUTTI = "tutti";

export function ElencoServizi() {
  const parametri = useSearchParams();
  // La home linka /servizi?categoria=xxx per far arrivare qui già filtrati.
  const [filtro, setFiltro] = useState(parametri.get("categoria") ?? TUTTI);
  const [cerca, setCerca] = useState("");

  const lista = useMemo(() => {
    const q = cerca.trim().toLowerCase();
    return SERVIZI.filter((s) => {
      if (filtro !== TUTTI && s.categoria !== filtro) return false;
      if (!q) return true;
      const cat = CATEGORIE.find((c) => c.id === s.categoria);
      return (
        s.nome.toLowerCase().includes(q) ||
        s.descrizione.toLowerCase().includes(q) ||
        (cat?.nome.toLowerCase().includes(q) ?? false)
      );
    });
  }, [filtro, cerca]);

  return (
    <>
      <div className="app-head">
        <span style={{ width: 34, flex: "none" }} />
        <h1 className="titolo-schermo">I nostri servizi</h1>
        <span style={{ width: 34, flex: "none" }} />
      </div>

      <div className="cerca">
        <label htmlFor="cerca-servizi" className="sr-only">
          Cerca un trattamento
        </label>
        <input
          id="cerca-servizi"
          type="search"
          placeholder="Cerca un trattamento…"
          value={cerca}
          onChange={(e) => setCerca(e.target.value)}
        />
        <Icona nome="lente" />
      </div>

      <div className="chips">
        <button
          type="button"
          className="chip"
          aria-pressed={filtro === TUTTI}
          onClick={() => setFiltro(TUTTI)}
        >
          Tutti
        </button>
        {CATEGORIE.map((c) => (
          <button
            key={c.id}
            type="button"
            className="chip"
            aria-pressed={filtro === c.id}
            onClick={() => setFiltro(c.id)}
          >
            {c.etichetta}
          </button>
        ))}
      </div>

      <div className="pad">
        {lista.length > 0 ? (
          lista.map((s) => <RigaServizio key={s.id} servizio={s} />)
        ) : (
          <div className="vuoto">
            <h4>Nessun trattamento</h4>
            <p>
              Niente che corrisponda a “{cerca}”. Prova con “semipermanente”,
              “ceretta” o “viso”.
            </p>
          </div>
        )}
      </div>
      <div style={{ height: "1.4rem" }} />
    </>
  );
}
