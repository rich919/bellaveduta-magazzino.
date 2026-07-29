"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Icona } from "@/components/Icone";
import { Foto, fotoCategoria, RigaServizio } from "@/components/app/Pezzi";
import { CATEGORIE, SERVIZI } from "@/lib/data/services";

/** Filtro speciale: mostra il listino intero invece di una sola categoria. */
const TUTTI = "tutti";

/**
 * La schermata dei servizi ha due volti.
 *
 * Senza filtro mostra la griglia delle categorie: undici cartelli fotografici,
 * che è il modo in cui una cliente pensa ("voglio farmi le unghie"), non
 * quarantuno righe di listino di fila. Scelta una categoria — o appena si
 * scrive nella ricerca — diventa l'elenco vero e proprio.
 *
 * Il filtro arriva anche dalla home via /servizi?categoria=xxx, quindi non è
 * solo stato interno: va letto dall'indirizzo al primo render.
 */
export function ElencoServizi() {
  const parametri = useSearchParams();
  const [filtro, setFiltro] = useState<string | null>(parametri.get("categoria"));
  const [cerca, setCerca] = useState("");

  const q = cerca.trim().toLowerCase();
  // Cercare qualcosa è già una scelta: non ha senso restare sulla griglia
  // mentre si digita, il risultato lo si vuole vedere subito.
  const griglia = filtro === null && q === "";

  const lista = useMemo(() => {
    return SERVIZI.filter((s) => {
      if (filtro !== null && filtro !== TUTTI && s.categoria !== filtro) return false;
      if (!q) return true;
      const cat = CATEGORIE.find((c) => c.id === s.categoria);
      return (
        s.nome.toLowerCase().includes(q) ||
        s.descrizione.toLowerCase().includes(q) ||
        (cat?.nome.toLowerCase().includes(q) ?? false)
      );
    });
  }, [filtro, q]);

  const scelta = filtro && filtro !== TUTTI ? CATEGORIE.find((c) => c.id === filtro) : undefined;

  return (
    <>
      <div className="app-head">
        {griglia ? (
          <span style={{ width: 34, flex: "none" }} />
        ) : (
          <button
            type="button"
            className="tondo"
            aria-label="Torna alle categorie"
            onClick={() => {
              setFiltro(null);
              setCerca("");
            }}
          >
            <Icona nome="indietro" style={{ width: 17, height: 17 }} />
          </button>
        )}
        <h1 className="titolo-schermo">
          {scelta ? scelta.nome : griglia ? "Categorie" : "Tutti i trattamenti"}
        </h1>
        <span style={{ width: 34, flex: "none" }} />
      </div>

      {griglia && (
        <div className="domanda">
          <h2>
            Cosa cerchi <span aria-hidden="true">✦</span>
            <br />
            oggi?
          </h2>
          <span className="filetto" aria-hidden="true" />
        </div>
      )}

      <div className="cerca">
        <label htmlFor="cerca-servizi" className="sr-only">
          Cerca un trattamento
        </label>
        <input
          id="cerca-servizi"
          type="search"
          placeholder="Cerca un servizio o trattamento…"
          value={cerca}
          onChange={(e) => setCerca(e.target.value)}
        />
        <Icona nome="lente" />
      </div>

      {griglia ? (
        <>
          <div className="grigliacat">
            {CATEGORIE.map((c) => {
              const quanti = SERVIZI.filter((s) => s.categoria === c.id).length;
              return (
                <button
                  key={c.id}
                  type="button"
                  className="cartello"
                  onClick={() => setFiltro(c.id)}
                >
                  <Foto
                    src={fotoCategoria(c.id)}
                    alt=""
                    className="cartello-foto"
                    sizes="120px"
                  />
                  <b>{c.etichetta}</b>
                  <small>
                    {quanti} {quanti === 1 ? "trattamento" : "trattamenti"}
                  </small>
                </button>
              );
            })}
          </div>

          <button type="button" className="invito" onClick={() => setFiltro(TUTTI)}>
            <span>
              <b>Non trovi quello che cerchi?</b>
              <small>Vedi tutto il listino</small>
            </span>
            <span className="invito-freccia" aria-hidden="true">
              <Icona nome="freccia" style={{ width: 17, height: 17 }} />
            </span>
          </button>
        </>
      ) : (
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
              <Link href="/prenota" className="btn">
                Chiedi in salone
              </Link>
            </div>
          )}
        </div>
      )}

      <div style={{ height: "1.4rem" }} />
    </>
  );
}
