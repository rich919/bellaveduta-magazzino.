"use client";

import Link from "next/link";
import { Testata } from "@/components/app/Testata";
import { Faccia } from "@/components/app/Pezzi";
import { useStatoApp } from "@/components/StatoApp";
import { servizio } from "@/lib/data/services";
import { operatrice } from "@/lib/data/staff";
import { MESI } from "@/lib/data/salon";
import { chiaveGiorno, daChiave, euro, oreMinuti } from "@/lib/date";

export function MiePrenotazioni() {
  const { prenotazioni, pronto } = useStatoApp();

  if (!pronto) {
    return (
      <>
        <Testata titolo="Le mie prenotazioni" indietroA="/profilo" />
        <div className="vuoto">Un attimo…</div>
      </>
    );
  }

  const oggi = chiaveGiorno(new Date());
  const ordina = (a: { giorno: string; inizio: number }, b: typeof a) =>
    a.giorno === b.giorno ? a.inizio - b.inizio : a.giorno.localeCompare(b.giorno);

  const future = prenotazioni.filter((p) => p.giorno >= oggi).sort(ordina);
  const passate = prenotazioni.filter((p) => p.giorno < oggi).sort(ordina).reverse();

  function Blocco({ elenco }: { elenco: typeof prenotazioni }) {
    return (
      <>
        {elenco.map((p) => {
          const s = servizio(p.servizioId);
          const op = operatrice(p.operatriceId);
          if (!s || !op) return null;
          const data = daChiave(p.giorno);
          return (
            <div key={p.appuntamentoId} className="card prossimo" style={{ marginBottom: "0.6rem" }}>
              <div className="quando">
                <b className="num">{data.getDate()}</b>
                <small>{MESI[data.getMonth()].slice(0, 3)}</small>
              </div>
              <div className="che">
                <b>{s.nome}</b>
                <small>
                  {oreMinuti(p.inizio)} · con {op.nome} · {euro(p.prezzo)}
                </small>
              </div>
              <Faccia iniziali={op.iniziali} tinta={op.tinta} dimensione={30} />
            </div>
          );
        })}
      </>
    );
  }

  return (
    <>
      <Testata titolo="Le mie prenotazioni" indietroA="/profilo" />
      <div className="pad">
        {prenotazioni.length === 0 ? (
          <div className="vuoto">
            <h4>Ancora nessuna prenotazione</h4>
            <p>
              Quando prenoti un trattamento lo ritrovi qui, con l&apos;orario e il
              nome di chi ti segue.
            </p>
            <Link href="/prenota" className="btn" style={{ marginTop: "1rem" }}>
              Prenota il primo
            </Link>
          </div>
        ) : (
          <>
            {future.length > 0 && (
              <>
                <div className="sez-cap" style={{ marginTop: "0.4rem" }}>
                  <h2 className="sez-tit">In arrivo</h2>
                </div>
                <Blocco elenco={future} />
              </>
            )}
            {passate.length > 0 && (
              <>
                <div className="sez-cap">
                  <h2 className="sez-tit">Già fatte</h2>
                </div>
                <Blocco elenco={passate} />
              </>
            )}
            <Link href="/prenota" className="btn btn-2 btn-lg" style={{ marginTop: "0.5rem" }}>
              Prenota un altro trattamento
            </Link>
          </>
        )}
      </div>
      <div style={{ height: "1.4rem" }} />
    </>
  );
}
