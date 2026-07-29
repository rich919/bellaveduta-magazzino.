import Image from "next/image";
import Link from "next/link";
import { categoria, type Servizio } from "@/lib/data/services";
import { euro } from "@/lib/date";

/** Percorso dell'immagine di categoria, generata da scripts/generate-images.mjs. */
export function fotoCategoria(categoriaId: string): string {
  return `/images/cat-${categoriaId}.webp`;
}

/**
 * Riquadro fotografico.
 *
 * `sizes` è obbligatorio con `fill`: senza, Next scarica sempre la variante più
 * grande e su telefono si spediscono megabyte inutili.
 */
export function Foto({
  src,
  alt,
  className,
  priorita = false,
  sizes = "(max-width: 700px) 100vw, 392px",
}: {
  src: string;
  alt: string;
  className?: string;
  priorita?: boolean;
  sizes?: string;
}) {
  return (
    <div className={`foto ${className ?? ""}`}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priorita} />
    </div>
  );
}

/** Riga di listino: miniatura, nome, durata, prezzo. */
export function RigaServizio({ servizio }: { servizio: Servizio }) {
  const cat = categoria(servizio.categoria);
  return (
    <Link href={`/servizi/${servizio.id}`} className="riga">
      <Foto
        src={fotoCategoria(servizio.categoria)}
        alt=""
        className="riga-foto"
        sizes="80px"
      />
      <div className="riga-c">
        <div className="riga-t">
          <h4>{servizio.nome}</h4>
          <span className="dur num">{servizio.durata} min</span>
        </div>
        <div className="riga-d">{servizio.descrizione}</div>
        <div className="riga-p">
          <span className="lab">{cat?.nome}</span>
          {!servizio.verificato && <span className="tag-demo">da confermare</span>}
          <span className="val num">{euro(servizio.prezzo)}</span>
        </div>
      </div>
    </Link>
  );
}

/** Pallino con le iniziali dell'operatrice. */
export function Faccia({
  iniziali,
  tinta,
  dimensione = 24,
}: {
  iniziali: string;
  tinta: string;
  dimensione?: number;
}) {
  return (
    <span
      className="faccia"
      style={{
        background: `var(${tinta})`,
        width: dimensione,
        height: dimensione,
        fontSize: dimensione * 0.4,
      }}
      aria-hidden="true"
    >
      {iniziali}
    </span>
  );
}
