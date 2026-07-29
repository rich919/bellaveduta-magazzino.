import type { Metadata } from "next";
import { Testata } from "@/components/app/Testata";
import { Foto } from "@/components/app/Pezzi";
import { OPERATRICI } from "@/lib/data/staff";
import { SEDI, sede } from "@/lib/data/sedi";
import { categoria } from "@/lib/data/services";
import { SALONE } from "@/lib/data/salon";

export const metadata: Metadata = {
  title: "Chi siamo",
  description:
    "Claudia, Gloria, Angela, Martina, Giorgia, Letizia, Michela e Melania: chi ti segue da Claudia Nails.",
};

export default function PaginaStaff() {
  return (
    <>
      <Testata titolo="Chi siamo" indietroA="/" />

      <p className="pad" style={{ fontSize: "0.86rem", color: "var(--testo)" }}>
        {SALONE.manifesto}
      </p>

      {SEDI.map((s) => {
        const squadra = OPERATRICI.filter((o) => o.sedi.includes(s.id));
        return (
          <section key={s.id}>
            <div className="sez-cap pad">
              <h2 className="sez-tit">{s.etichetta}</h2>
              <span className="piu num" style={{ color: "var(--testo-2)" }}>
                {squadra.length} persone
              </span>
            </div>
            <div className="pad">
              {squadra.map((o) => (
                <article key={`${s.id}-${o.id}`} className="card staff-riga">
                  <Foto src={o.foto} alt={o.nome} className="staff-riga-foto" sizes="90px" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3>{o.nome}</h3>
                    <p className="staff-ruolo">{o.ruolo}</p>
                    <p className="staff-bio">{o.bio}</p>
                    <div className="staff-tag">
                      {o.competenze.slice(0, 3).map((c) => (
                        <span key={c}>{categoria(c)?.etichetta}</span>
                      ))}
                      {o.competenze.length > 3 && (
                        <span>+{o.competenze.length - 3}</span>
                      )}
                    </div>
                    {o.sedi.length > 1 && (
                      <p className="staff-doppia">
                        Lavora anche a {sede(o.sedi.find((x) => x !== s.id)!)?.etichetta}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      <p className="pad" style={{ fontSize: "0.72rem", color: "var(--testo-2)", marginTop: "1rem" }}>
        Nomi e ruoli sono quelli veri della pagina «Chi siamo». La suddivisione fra
        le due sedi e le specializzazioni di dettaglio sono invece una proposta, da
        confermare. Le fotografie sono segnaposto generati, in attesa di quelle vere.
      </p>
      <div style={{ height: "1.6rem" }} />
    </>
  );
}
