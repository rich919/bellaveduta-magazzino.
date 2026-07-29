import type { Metadata } from "next";
import Link from "next/link";
import { CardTessera } from "@/components/app/CardTessera";
import { SALONE } from "@/lib/data/salon";

export const metadata: Metadata = { title: "Il mio profilo" };

const VOCI = [
  { href: "/profilo/prenotazioni", icona: "📅", testo: "Le mie prenotazioni" },
  { href: "/carrello", icona: "🛍", testo: "Il mio carrello" },
  { href: "/profilo/tessera", icona: "★", testo: "Tessera e premi" },
  { href: "/dove-siamo", icona: "◎", testo: "Dove siamo" },
];

export default function PaginaProfilo() {
  return (
    <>
      <div className="app-head">
        <span style={{ width: 34, flex: "none" }} />
        <h1 className="titolo-schermo">Il mio profilo</h1>
        <span style={{ width: 34, flex: "none" }} />
      </div>

      <div className="profilo-top">
        <div className="avatar-g" aria-hidden="true">
          ER
        </div>
        <h2>Elena Ricci</h2>
        <small>Cliente dal 2021</small>
      </div>

      <CardTessera />

      <div className="pad" style={{ marginTop: "1rem" }}>
        <div className="card">
          {VOCI.map((v) => (
            <Link key={v.href} href={v.href} className="voce">
              <span aria-hidden="true">{v.icona}</span>
              {v.testo}
              <span className="frec" aria-hidden="true">
                ›
              </span>
            </Link>
          ))}
        </div>
      </div>

      <p className="pad" style={{ fontSize: "0.72rem", color: "var(--testo-2)", marginTop: "1rem" }}>
        Il profilo è quello di una cliente dimostrativa: nell&apos;app vera qui ci
        sarebbe l&apos;accesso con il proprio numero di telefono.
      </p>
      <p className="pad" style={{ fontSize: "0.72rem", color: "var(--testo-2)", marginTop: "0.6rem" }}>
        {SALONE.nome} · {SALONE.indirizzo}, {SALONE.citta} · {SALONE.telefono}
      </p>
      <div style={{ height: "1.4rem" }} />
    </>
  );
}
