import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Icona } from "@/components/Icone";
import { Foto } from "@/components/app/Pezzi";
import { BottoneAggiungi } from "@/components/app/BottoneAggiungi";
import { PRODOTTI, prodotto, SPEDIZIONE_GRATIS_DA } from "@/lib/data/products";
import { SALONE } from "@/lib/data/salon";
import { euro } from "@/lib/date";
import { puntiPerSpesa } from "@/lib/membership";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return PRODOTTI.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = prodotto(id);
  if (!p) return { title: "Prodotto non trovato" };
  return { title: p.nome, description: p.descrizione };
}

export default async function PaginaProdotto({ params }: Props) {
  const { id } = await params;
  const p = prodotto(id);
  if (!p) notFound();

  return (
    <>
      <div className="det-testata">
        <Foto src={p.immagine} alt={p.nome} className="det-foto" priorita />
        <Link href="/shop" className="tondo det-back" aria-label="Torna allo shop">
          <Icona nome="indietro" style={{ width: 17, height: 17 }} />
        </Link>
      </div>

      <div className="det-corpo">
        <div className="prod-m">{p.marca}</div>
        <h1 style={{ fontSize: "1.35rem", marginTop: "0.2rem" }}>{p.nome}</h1>
        <div className="det-prezzo num">{euro(p.prezzo)}</div>
        <p className="det-voto">
          Guadagni <b style={{ color: "var(--verde)" }}>+{puntiPerSpesa(p.prezzo)} punti</b>
          {" · "}
          <span className="tag-demo">prezzo da confermare</span>
        </p>

        <p className="det-desc">{p.descrizione}</p>

        <div className="sez-cap">
          <h2 className="sez-tit">Come lo ricevi</h2>
        </div>
        <div className="card">
          <div className="indicazione">
            <span className="ic" aria-hidden="true">◎</span>
            <div>
              <b>Ritiro in salone</b>
              <small>Pronto in giornata in {SALONE.indirizzo}</small>
            </div>
          </div>
          <div className="indicazione">
            <span className="ic" aria-hidden="true">↗</span>
            <div>
              <b>Spedizione a casa</b>
              <small>2–4 giorni lavorativi, gratis sopra {euro(SPEDIZIONE_GRATIS_DA)}</small>
            </div>
          </div>
        </div>
        <div className="prima-di-cta" />
      </div>

      <div className="cta-fissa">
        <BottoneAggiungi prodottoId={p.id} />
      </div>
    </>
  );
}
