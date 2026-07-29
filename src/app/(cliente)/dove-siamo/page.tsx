import type { Metadata } from "next";
import { Testata } from "@/components/app/Testata";
import { MappaSalone } from "@/components/app/MappaSalone";
import { SALONE, SEDE_MONTAGNOLA } from "@/lib/data/salon";

export const metadata: Metadata = {
  title: "Dove siamo",
  description: `${SALONE.indirizzo}, ${SALONE.cap} ${SALONE.citta}. A sei minuti a piedi dalla metro Garbatella.`,
};

const COME_ARRIVARE = [
  ["◎", SALONE.indirizzo, `${SALONE.cap} ${SALONE.citta} — ${SALONE.quartiere}`],
  ["Ⓜ", "Metro B — Garbatella", "Sei minuti a piedi: esci, prendi Via Giovanni Ansaldo e gira in Via Nicolò da Pistoia"],
  ["◉", "Bus 715 e 716", "Fermata Ansaldo, a duecento metri"],
  ["🅿", "Parcheggio", "Strisce blu in Via Nicolò da Pistoia, gratis dopo le 20"],
] as const;

export default function PaginaDoveSiamo() {
  return (
    <>
      <Testata titolo="Dove siamo" indietroA="/profilo" />
      <div className="pad">
        <MappaSalone altezza={220} />
      </div>

      <div className="pad" style={{ marginTop: "0.9rem" }}>
        <div className="card">
          {COME_ARRIVARE.map(([ic, titolo, sotto]) => (
            <div key={titolo} className="indicazione">
              <span className="ic" aria-hidden="true">{ic}</span>
              <div>
                <b>{titolo}</b>
                <small>{sotto}</small>
              </div>
            </div>
          ))}
        </div>

        <div className="sez-cap">
          <h2 className="sez-tit">Orari</h2>
        </div>
        <div className="card">
          <div className="indicazione">
            <span className="ic" aria-hidden="true">◔</span>
            <div><b>Lunedì – Sabato</b><small>10:00 – 19:00</small></div>
          </div>
          <div className="indicazione">
            <span className="ic" aria-hidden="true">✕</span>
            <div><b>Domenica</b><small>Chiuso</small></div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", marginTop: "0.9rem" }}>
          <a className="btn" href={SALONE.mappa} target="_blank" rel="noopener noreferrer">
            Apri in Maps
          </a>
          <a className="btn btn-2" href={`tel:${SALONE.telefonoTel}`}>
            Chiama
          </a>
        </div>

        <div className="sez-cap">
          <h2 className="sez-tit">L&apos;altra sede</h2>
        </div>
        <div className="card">
          <div className="indicazione">
            <span className="ic" aria-hidden="true">◎</span>
            <div>
              <b>{SEDE_MONTAGNOLA.nome}</b>
              <small>
                {SEDE_MONTAGNOLA.indirizzo} · {SEDE_MONTAGNOLA.telefono} · qui c&apos;è anche il parrucchiere
              </small>
            </div>
          </div>
        </div>
      </div>
      <div style={{ height: "1.6rem" }} />
    </>
  );
}
