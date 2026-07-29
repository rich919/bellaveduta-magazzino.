import Link from "next/link";
import { Icona, type NomeIcona } from "@/components/Icone";
import { Foto, fotoCategoria } from "@/components/app/Pezzi";
import { CardTessera } from "@/components/app/CardTessera";
import { ProssimoAppuntamento } from "@/components/app/ProssimoAppuntamento";
import { MappaSalone } from "@/components/app/MappaSalone";
import { SelettoreSede } from "@/components/app/SelettoreSede";
import { BloccoPremium } from "@/components/app/BloccoPremium";
import { Saluto } from "@/components/app/Saluto";
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
  ["capelli", "Taglio e piega"],
  ["massaggi", "Massaggio rilassante 50′"],
];

/**
 * Le scorciatoie sotto la copertina.
 *
 * Quattro, non di più: servono a dare una direzione immediata senza scorrere,
 * e una fila di otto icone non è più una scorciatoia ma un secondo menu.
 * Portano tutte a schermate che esistono davvero — niente voci decorative.
 */
const AZIONI: ReadonlyArray<{ href: string; icona: NomeIcona; testo: string }> = [
  { href: "/prenota", icona: "prenota", testo: "Prenota" },
  { href: "/dove-siamo", icona: "luogo", testo: "Le sedi" },
  { href: "/profilo/tessera", icona: "corona", testo: "Tessera" },
  { href: "/shop", icona: "shop", testo: "Shop" },
];

export default function Home() {
  const vetrina = IN_VETRINA.map(([cat, nome]) =>
    SERVIZI.find((s) => s.categoria === cat && s.nome === nome),
  ).filter((s) => s !== undefined);

  return (
    <>
      <div className="app-head">
        <span className="avatar-mini" aria-hidden="true">
          ER
        </span>
        <span style={{ flex: 1 }} />
        <button type="button" className="tondo" aria-label="Notifiche">
          <Icona nome="campana" style={{ width: 17, height: 17 }} />
        </button>
        <Link href="/servizi" className="tondo" aria-label="Cerca un trattamento">
          <Icona nome="lente" style={{ width: 17, height: 17 }} />
        </Link>
      </div>

      {/* Copertina editoriale: titolo a sinistra, ritratto che sborda a destra. */}
      <section className="copertina">
        <div className="copertina-testo">
          <Saluto />
          <h1>
            La bellezza
            <br />è una cura
          </h1>
          <span className="filetto" aria-hidden="true" />
          <p>{SALONE.manifesto}</p>
          <p className="copertina-voto">
            <span className="stelle">★</span> {numero(SALONE.valutazione)} ·{" "}
            {numero(SALONE.recensioni)} recensioni
          </p>
        </div>
        <Foto
          src="/images/hero-ritratto.webp"
          alt=""
          className="copertina-foto"
          sizes="200px"
          priorita
        />
      </section>

      <nav className="azioni" aria-label="Scorciatoie">
        {AZIONI.map((a) => (
          <Link key={a.href} href={a.href} className="azione">
            <span className="azione-ico">
              <Icona nome={a.icona} />
            </span>
            {a.testo}
          </Link>
        ))}
      </nav>

      <div className="sez-cap pad">
        <h2 className="sez-tit">Scegli il tuo centro</h2>
      </div>
      <div className="pad">
        <SelettoreSede />
      </div>

      <ProssimoAppuntamento />

      <div className="sez-cap pad">
        <h2 className="sez-tit">I più richiesti</h2>
        <Link href="/servizi" className="piu">
          Tutti <Icona nome="freccia" style={{ width: 13, height: 13 }} />
        </Link>
      </div>
      <div className="carosello">
        {vetrina.map((s) => (
          <Link key={s.id} href={`/servizi/${s.id}`} className="vetrina">
            <Foto
              src={fotoCategoria(s.categoria)}
              alt=""
              className="vetrina-foto"
              sizes="150px"
            />
            <div className="vetrina-b">
              <b>{s.nome}</b>
              <small className="num">da {euro(s.prezzo)}</small>
            </div>
          </Link>
        ))}
      </div>

      <CardTessera />

      <BloccoPremium />

      <div className="sez-cap pad">
        <h2 className="sez-tit">Cosa cerchi</h2>
        <Link href="/servizi" className="piu">
          Categorie <Icona nome="freccia" style={{ width: 13, height: 13 }} />
        </Link>
      </div>
      <div className="cats">
        {CATEGORIE.map((c) => (
          <Link key={c.id} href={`/servizi?categoria=${c.id}`} className="cat">
            <Foto
              src={fotoCategoria(c.id)}
              alt=""
              className="cat-foto"
              sizes="80px"
            />
            <span>{c.etichetta}</span>
          </Link>
        ))}
      </div>

      <div className="sez-cap pad">
        <h2 className="sez-tit">Chi ti segue</h2>
        <Link href="/staff" className="piu">
          Tutte <Icona nome="freccia" style={{ width: 13, height: 13 }} />
        </Link>
      </div>
      <div className="carosello">
        {OPERATRICI.map((o) => (
          <Link key={o.id} href="/staff" className="staff-card">
            <Foto src={o.foto} alt={o.nome} className="staff-foto" sizes="120px" />
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
          Indicazioni <Icona nome="freccia" style={{ width: 13, height: 13 }} />
        </Link>
      </div>
      <div className="pad">
        <MappaSalone />
      </div>
      <div style={{ height: "1.6rem" }} />
    </>
  );
}
