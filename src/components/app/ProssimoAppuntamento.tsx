"use client";

import Link from "next/link";
import { useStatoApp } from "@/components/StatoApp";
import { Faccia } from "@/components/app/Pezzi";
import { servizio } from "@/lib/data/services";
import { operatrice } from "@/lib/data/staff";
import { chiaveGiorno, daChiave, oreMinuti } from "@/lib/date";
import { MESI } from "@/lib/data/salon";

/** Il prossimo appuntamento della cliente. Non compare se non ce ne sono. */
export function ProssimoAppuntamento() {
  const { prenotazioni, pronto } = useStatoApp();
  if (!pronto) return null;

  const oggi = chiaveGiorno(new Date());
  const futuri = prenotazioni
    .filter((p) => p.giorno >= oggi)
    .sort((a, b) =>
      a.giorno === b.giorno ? a.inizio - b.inizio : a.giorno.localeCompare(b.giorno),
    );

  const p = futuri[0];
  if (!p) return null;

  const s = servizio(p.servizioId);
  const op = operatrice(p.operatriceId);
  if (!s || !op) return null;

  const data = daChiave(p.giorno);

  return (
    <>
      <div className="sez-cap pad">
        <h2 className="sez-tit">Il tuo prossimo appuntamento</h2>
      </div>
      <div className="pad">
        <Link href="/profilo/prenotazioni" className="card prossimo">
          <div className="quando">
            <b className="num">{data.getDate()}</b>
            <small>{MESI[data.getMonth()].slice(0, 3)}</small>
          </div>
          <div className="che">
            <b>{s.nome}</b>
            <small>
              {oreMinuti(p.inizio)} · con {op.nome}
            </small>
          </div>
          <Faccia iniziali={op.iniziali} tinta={op.tinta} dimensione={30} />
        </Link>
      </div>
    </>
  );
}
