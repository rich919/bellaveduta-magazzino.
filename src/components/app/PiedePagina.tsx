import Link from "next/link";
import { SALONE } from "@/lib/data/salon";
import { SEDI } from "@/lib/data/sedi";

/**
 * Piede dell'app.
 *
 * Contiene le due sedi, il "chi siamo" e i dati fiscali. La partita IVA non è
 * un dettaglio: per un'attività commerciale è un obbligo di legge esporla, e
 * un'app che prende prenotazioni e vende prodotti è a tutti gli effetti un
 * canale di vendita.
 *
 * Compare in fondo a ogni schermata, quindi sta nel layout e non nelle singole
 * pagine.
 */
export function PiedePagina() {
  return (
    <footer className="piede">
      <div className="piede-marchio">{SALONE.nome}</div>
      <p className="piede-claim">{SALONE.claim}</p>

      <section className="piede-sez">
        <h2>Chi siamo</h2>
        <p>{SALONE.manifesto}</p>
        <p style={{ marginTop: "0.5rem" }}>
          Una catena di bellezza romana con due sedi, che offre servizi per la
          cura del corpo e dei capelli: manicure e pedicure, trattamenti viso,
          massaggi, ceretta e, alla Montagnola, anche il parrucchiere.
        </p>
        <Link href="/staff" className="piede-link">
          Conosci lo staff ›
        </Link>
      </section>

      <section className="piede-sez">
        <h2>Le nostre sedi</h2>
        <div className="piede-sedi">
          {SEDI.map((s) => (
            <div key={s.id}>
              <b>{s.etichetta}</b>
              <span>{s.indirizzo}</span>
              <span>
                {s.cap} {s.citta}
              </span>
              <a href={`tel:${s.telefonoTel}`}>{s.telefono}</a>
            </div>
          ))}
        </div>
        <Link href="/dove-siamo" className="piede-link">
          Come raggiungerci ›
        </Link>
      </section>

      <section className="piede-sez">
        <h2>Contatti e orari</h2>
        <p>
          <a href={`mailto:${SALONE.email}`}>{SALONE.email}</a>
        </p>
        <p>Lunedì – Sabato, 10:00 – 19:00. Domenica chiuso.</p>
      </section>

      <div className="piede-legale">
        <p>
          © {SALONE.nome} — Tutti i diritti riservati
          <br />
          P. IVA {SALONE.partitaIva}
        </p>
        <p className="piede-demo">
          Prototipo dimostrativo: alcuni prezzi, i prodotti e le fotografie sono
          segnaposto da confermare.
        </p>
      </div>
    </footer>
  );
}
