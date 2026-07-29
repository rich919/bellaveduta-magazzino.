import type { Metadata } from "next";
import Link from "next/link";
import { Testata } from "@/components/app/Testata";
import { Foto } from "@/components/app/Pezzi";
import { SALONE } from "@/lib/data/salon";
import { SEDI } from "@/lib/data/sedi";

export const metadata: Metadata = {
  title: "Chi siamo",
  description:
    "Non è solo un centro nails, ma uno spazio dedicato e condiviso da tutte le donne che si amano e che amano piacere.",
};

export default function PaginaChiSiamo() {
  return (
    <>
      <Testata titolo="Chi siamo" />

      <div className="pad">
        <Foto
          src="/images/interno-2.webp"
          alt="L'accoglienza del centro"
          className="chi-foto"
          priorita
        />
      </div>

      <article className="chi-testo">
        <h1>{SALONE.nome}</h1>

        <p className="chi-apertura">
          Non è solo un centro nails, ma uno spazio dedicato e condiviso da tutte
          le donne che si amano e che amano piacere.
        </p>

        <p>
          Nasce come un centro a carattere familiare, ma si è via via trasformato
          in un vero e proprio punto di riferimento per tutte le donne che qui si
          sentono coccolate e curate a 360 gradi; dai trattamenti per le unghie,
          all&apos;estetica, alla cura dei capelli.
        </p>

        <p className="chi-firma">{SALONE.claim}</p>
      </article>

      <div className="sez-cap pad">
        <h2 className="sez-tit">Dove ci trovi</h2>
      </div>
      <div className="pad">
        <div className="card">
          {SEDI.map((s) => (
            <div key={s.id} className="indicazione">
              <span className="ic" aria-hidden="true">
                ◎
              </span>
              <div>
                <b>{s.etichetta}</b>
                <small>
                  {s.indirizzo}, {s.cap} {s.citta} · {s.telefono}
                </small>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.6rem",
            marginTop: "1rem",
          }}
        >
          <Link href="/staff" className="btn btn-2">
            Lo staff
          </Link>
          <Link href="/prenota" className="btn">
            Prenota
          </Link>
        </div>
      </div>
      <div style={{ height: "1.6rem" }} />
    </>
  );
}
