import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Icona } from "@/components/Icone";
import { Faccia, Foto, fotoCategoria } from "@/components/app/Pezzi";
import { BottoneAggiungi } from "@/components/app/BottoneAggiungi";
import { categoria, servizio, SERVIZI } from "@/lib/data/services";
import { abilitatePer } from "@/lib/data/staff";
import { correlatiPerCategoria } from "@/lib/data/products";
import { euro } from "@/lib/date";
import { COSA_COMPRENDE } from "@/lib/data/incluso";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return SERVIZI.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const s = servizio(id);
  if (!s) return { title: "Trattamento non trovato" };
  return {
    title: s.nome,
    description: `${s.descrizione} ${s.durata} minuti, ${euro(s.prezzo)}.`,
  };
}

export default async function PaginaServizio({ params }: Props) {
  const { id } = await params;
  const s = servizio(id);
  if (!s) notFound();

  const cat = categoria(s.categoria);
  const incluso = COSA_COMPRENDE[s.categoria] ?? [];
  const chi = abilitatePer(s.categoria);
  const correlati = correlatiPerCategoria(s.categoria);

  return (
    <>
      <div className="det-testata">
        <Foto
          src={fotoCategoria(s.categoria)}
          alt={s.nome}
          className="det-foto"
          priorita
        />
        <Link href="/servizi" className="tondo det-back" aria-label="Torna al listino">
          <Icona nome="indietro" style={{ width: 17, height: 17 }} />
        </Link>
      </div>

      <div className="det-corpo">
        <div className="det-tit">
          <h1>{s.nome}</h1>
          <div className="det-min">
            <b className="num">{s.durata}</b>
            min
          </div>
        </div>

        <div className="det-prezzo num">{euro(s.prezzo)}</div>
        <p className="det-voto">
          <span className="stelle">★</span> 4,8 · {cat?.nome}
          {!s.verificato && (
            <>
              {" · "}
              <span className="tag-demo">prezzo da confermare</span>
            </>
          )}
        </p>

        <p className="det-desc">{s.descrizione}</p>

        {incluso.length > 0 && (
          <>
            <div className="sez-cap">
              <h2 className="sez-tit">Cosa comprende</h2>
            </div>
            <div className="incluso">
              {incluso.map((x) => (
                <div key={x}>
                  <span className="spunta" aria-hidden="true">
                    ✓
                  </span>
                  {x}
                </div>
              ))}
            </div>
          </>
        )}

        <div className="sez-cap">
          <h2 className="sez-tit">Chi te lo fa</h2>
        </div>
        <div className="chi">
          {chi.map((o) => (
            <span key={o.id} className="chi-op">
              <Faccia iniziali={o.iniziali} tinta={o.tinta} />
              {o.nome}
            </span>
          ))}
        </div>

        <div className="sez-cap">
          <h2 className="sez-tit">Da portare a casa</h2>
          <Link href="/shop" className="piu">
            Shop ›
          </Link>
        </div>
      </div>

      <div className="carosello">
        {correlati.map((p) => (
          <div key={p.id} className="addon">
            <Link href={`/shop/${p.id}`}>
              <Foto src={p.immagine} alt={p.nome} className="addon-foto" sizes="130px" />
            </Link>
            <div className="addon-b">
              <div className="addon-n">{p.nome}</div>
              <div className="addon-r">
                <span className="addon-p num">{euro(p.prezzo)}</span>
                <BottoneAggiungi prodottoId={p.id} compatto />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="prima-di-cta" />

      <div className="cta-fissa">
        <Link href={`/prenota?servizio=${s.id}`} className="btn btn-lg">
          Prenota — {euro(s.prezzo)}
        </Link>
      </div>
    </>
  );
}
