import Link from "next/link";
import { Icona, ICONA_CATEGORIA } from "@/components/Icone";
import { Foto, fotoCategoria } from "@/components/app/Pezzi";
import { CardTessera } from "@/components/app/CardTessera";
import { ProssimoAppuntamento } from "@/components/app/ProssimoAppuntamento";
import { MappaSalone } from "@/components/app/MappaSalone";
import { SelettoreSede } from "@/components/app/SelettoreSede";
import { Foto as FotoStaff } from "@/components/app/Pezzi";
import { OPERATRICI } from "@/lib/data/staff";
import { CATEGORIE, SERVIZI } from "@/lib/data/services";
import { RECENSIONI, SALONE } from "@/lib/data/salon";
import { euro, numero } from "@/lib/date";

/**
 * I trattamenti in vetrina, indicati per nome e non per id: gli id dipendono
 * dalla posizione nel listino e cambierebbero al primo riordino delle righe.
 */
const IN_VETRINA: ReadonlyArray<[string, string]> = [
  ["semigel", "Baby Boomer"],
  ["semipermanente-mani", "Monocolore"],
  ["ciglia", "Extension ciglia volume"],
  ["viso", "Pulizia viso profonda"],
  ["semigel", "Semigel"],
];

export default function Home() {
  const vetrina = IN_VETRINA.map(([cat, nome]) =>
    SERVIZI.find((s) => s.categoria === cat && s.nome === nome),
  ).filter((s) => s !== undefined);

  return (
    <>
      <div className="app-head">
        <span className="tondo" aria-hidden="true">
          ✦
        </span>
        <div className="marchio">{SALONE.nome}</div>
        <button type="button" className="tondo" aria-label="Notifiche">
          <Icona nome="campana" style={{ width: 17, height: 17 }} />
        </button>
      </div>

      <div className="hero">
        <div className="hero-testo">
          <p className="hero-claim">{SALONE.claim}</p>
          <p className="hero-sub">{SALONE.manifesto}</p>
          <p className="hero-voto">
            <span className="stelle">★</span> {numero(SALONE.valutazione)} —{" "}
            {numero(SALONE.recensioni)} recensioni
          </p>
        </div>
        <Foto
          src="/images/hero.webp"
          alt="L'interno del salone Claudia Nails"
          className="hero-foto"
          priorita
        />
      </div>

      <section className="promessa">
        <span className="promessa-sigillo" aria-hidden="true">
          <Icona nome="foglia" />
        </span>
        <h2>100% Originale &amp; Organico</h2>
        <p>
          Siamo orgogliosi di utilizzare solo prodotti 100% originali e organici
          per i nostri servizi di bellezza.
        </p>
      </section>

      <div className="sez-cap pad">
        <h2 className="sez-tit">Dove vuoi venire</h2>
      </div>
      <div className="pad">
        <SelettoreSede />
      </div>

      <div className="hero-azioni">
        <Link href="/prenota" className="btn">
          Prenota ora
        </Link>
        <Link href="/servizi" className="btn btn-2">
          Vedi i servizi
        </Link>
      </div>

      <div className="cats">
        {CATEGORIE.map((c) => (
          <Link key={c.id} href={`/servizi?categoria=${c.id}`} className="cat">
            <span className="cat-ico" style={{ background: `var(${c.tinta})` }}>
              <Icona nome={ICONA_CATEGORIA[c.id]} />
            </span>
            <span>{c.etichetta}</span>
          </Link>
        ))}
      </div>

      <CardTessera />
      <ProssimoAppuntamento />

      <div className="sez-cap pad">
        <h2 className="sez-tit">I più richiesti</h2>
        <Link href="/servizi" className="piu">
          Tutti ›
        </Link>
      </div>
      <div className="carosello">
        {vetrina.map((s) => (
          <Link key={s.id} href={`/servizi/${s.id}`} className="amata">
            <Foto
              src={fotoCategoria(s.categoria)}
              alt=""
              className="amata-foto"
              sizes="160px"
            />
            <div className="amata-b">
              <div className="amata-n">{s.nome}</div>
              <div className="amata-r">
                <span className="amata-p num">{euro(s.prezzo)}</span>
                <span className="amata-btn">Prenota</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="sez-cap pad">
        <h2 className="sez-tit">Chi ti segue</h2>
        <Link href="/staff" className="piu">
          Tutte ›
        </Link>
      </div>
      <div className="carosello">
        {OPERATRICI.map((o) => (
          <Link key={o.id} href="/staff" className="staff-card">
            <FotoStaff src={o.foto} alt={o.nome} className="staff-foto" sizes="120px" />
            <div className="staff-b">
              <b>{o.nome}</b>
              <small>{o.ruolo}</small>
            </div>
          </Link>
        ))}
      </div>

      <div className="sez-cap pad">
        <h2 className="sez-tit">Dicono di noi</h2>
      </div>
      <div className="carosello">
        {RECENSIONI.slice(0, 4).map((r) => (
          <article key={r.nome} className="card rev">
            <div className="stelle">{"★".repeat(r.stelle)}</div>
            <p>{r.testo}</p>
            <cite>{r.nome}</cite>
          </article>
        ))}
      </div>

      <div className="sez-cap pad">
        <h2 className="sez-tit">Dove siamo</h2>
        <Link href="/dove-siamo" className="piu">
          Indicazioni ›
        </Link>
      </div>
      <div className="pad">
        <MappaSalone />
      </div>
      <div style={{ height: "1.6rem" }} />
    </>
  );
}
