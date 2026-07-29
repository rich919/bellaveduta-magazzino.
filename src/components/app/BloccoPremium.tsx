import Link from "next/link";
import { Foto } from "@/components/app/Pezzi";
import { Icona } from "@/components/Icone";
import { SALONE } from "@/lib/data/salon";
import { SERVIZI } from "@/lib/data/services";
import { OPERATRICI } from "@/lib/data/staff";
import { SEDI } from "@/lib/data/sedi";
import { numero } from "@/lib/date";

/**
 * Il blocco sui prodotti: collage fotografico, promessa, e i numeri del salone.
 *
 * I numeri sono calcolati dai dati reali, non scritti a mano: la media e le
 * recensioni vengono da Treatwell, i trattamenti dal listino, le persone dalla
 * pagina "Chi siamo". Un dato inventato qui sarebbe la cosa meno credibile
 * della pagina, ed è esattamente dove l'occhio si ferma.
 */
export function BloccoPremium() {
  const numeri = [
    { valore: numero(SALONE.valutazione), etichetta: "Media recensioni" },
    { valore: numero(SALONE.recensioni), etichetta: "Recensioni" },
    { valore: `${SERVIZI.length}`, etichetta: "Trattamenti" },
    { valore: `${OPERATRICI.length}`, etichetta: "Professioniste" },
    { valore: `${SEDI.length}`, etichetta: "Sedi a Roma" },
  ];

  return (
    <section className="premium">
      <div className="premium-collage">
        <Foto src="/images/cat-viso.webp" alt="" className="pc pc-1" sizes="220px" />
        <Foto src="/images/cat-manicure.webp" alt="" className="pc pc-2" sizes="160px" />
        <Foto src="/images/cat-massaggi.webp" alt="" className="pc pc-3" sizes="160px" />
        <Foto src="/images/cat-ciglia.webp" alt="" className="pc pc-4" sizes="220px" />
      </div>

      <div className="premium-testo">
        <span className="premium-sigillo" aria-hidden="true">
          <Icona nome="foglia" />
        </span>
        <h2>
          100% Originale
          <br />
          &amp; Organico
        </h2>
        <p>
          Siamo orgogliosi di utilizzare solo prodotti 100% originali e organici
          per i nostri servizi di bellezza.
        </p>
        <Link href="/servizi" className="btn premium-cta">
          I nostri servizi
        </Link>
      </div>

      <div className="premium-numeri">
        {numeri.map((n) => (
          <div key={n.etichetta}>
            <b className="num">{n.valore}</b>
            <span>{n.etichetta}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
