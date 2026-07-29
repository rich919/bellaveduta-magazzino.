import type { Metadata } from "next";
import { Testata } from "@/components/app/Testata";
import { MappaSalone } from "@/components/app/MappaSalone";
import { SEDI } from "@/lib/data/sedi";
import { SALONE } from "@/lib/data/salon";

export const metadata: Metadata = {
  title: "Dove siamo",
  description:
    "Due sedi a Roma: Garbatella in Via Nicolò da Pistoia 38 e Montagnola in Piazzale Caduti della Montagnola 7.",
};

export default function PaginaDoveSiamo() {
  return (
    <>
      <Testata titolo="Dove siamo" indietroA="/profilo" />

      <p className="pad" style={{ fontSize: "0.84rem", color: "var(--testo)" }}>
        Siamo in due sedi. Il parrucchiere c&apos;è solo alla Montagnola.
      </p>

      {SEDI.map((s) => (
        <section key={s.id} style={{ marginTop: "1.2rem" }}>
          <div className="sez-cap pad" style={{ marginTop: 0 }}>
            <h2 className="sez-tit">{s.etichetta}</h2>
          </div>
          <div className="pad">
            <MappaSalone
              altezza={180}
              query={`${s.nome}, ${s.indirizzo}, ${s.cap} ${s.citta}`}
            />

            <div className="card" style={{ marginTop: "0.8rem" }}>
              <div className="indicazione">
                <span className="ic" aria-hidden="true">◎</span>
                <div>
                  <b>{s.indirizzo}</b>
                  <small>
                    {s.cap} {s.citta}
                  </small>
                </div>
              </div>
              {s.indicazioni.map((i) => (
                <div key={i.titolo} className="indicazione">
                  <span className="ic" aria-hidden="true">
                    {i.icona}
                  </span>
                  <div>
                    <b>{i.titolo}</b>
                    <small>{i.testo}</small>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.6rem",
                marginTop: "0.8rem",
              }}
            >
              <a className="btn" href={s.mappa} target="_blank" rel="noopener noreferrer">
                Apri in Maps
              </a>
              <a className="btn btn-2" href={`tel:${s.telefonoTel}`}>
                {s.telefono}
              </a>
            </div>
          </div>
        </section>
      ))}

      <div className="sez-cap pad">
        <h2 className="sez-tit">Orari</h2>
      </div>
      <div className="pad">
        <div className="card">
          <div className="indicazione">
            <span className="ic" aria-hidden="true">◔</span>
            <div>
              <b>Lunedì – Sabato</b>
              <small>10:00 – 19:00</small>
            </div>
          </div>
          <div className="indicazione">
            <span className="ic" aria-hidden="true">✕</span>
            <div>
              <b>Domenica</b>
              <small>Chiuso</small>
            </div>
          </div>
        </div>
        <p style={{ fontSize: "0.72rem", color: "var(--testo-2)", marginTop: "0.8rem" }}>
          Per informazioni: <a href={`mailto:${SALONE.email}`}>{SALONE.email}</a>
        </p>
      </div>
      <div style={{ height: "1.6rem" }} />
    </>
  );
}
