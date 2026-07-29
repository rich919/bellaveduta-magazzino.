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

/**
 * Riga di listino: miniatura, nome, durata, prezzo.
 *
 * Con `onScegli` diventa un bottone invece di un collegamento. Serve nella
 * schermata di prenotazione, dove toccare la riga deve selezionare il
 * trattamento e non portare alla sua scheda. Annidare un link dentro un
 * bottone non è una scorciatoia possibile: è HTML non valido e il link vince,
 * quindi il tocco navigherebbe via invece di scegliere.
 */
export function RigaServizio({
  servizio,
  onScegli,
}: {
  servizio: Servizio;
  onScegli?: (id: string) => void;
}) {
  const cat = categoria(servizio.categoria);

  const contenuto = (
    <>

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
    </>
  );

  // Nella schermata di prenotazione la riga È già la selezione: un secondo
  // bottone "Prenota" accanto sarebbe la stessa azione due volte.
  if (onScegli) {
    return (
      <button type="button" className="riga" onClick={() => onScegli(servizio.id)}>
        {contenuto}
      </button>
    );
  }

  // Due collegamenti affiancati, non annidati: leggere la scheda e prenotare
  // subito sono due intenzioni diverse, e chi ha già deciso non deve passare
  // dal dettaglio.
  return (
    <div className="riga">
      <Link href={`/servizi/${servizio.id}`} className="riga-tocco">
        {contenuto}
      </Link>
      <Link
        href={`/prenota?servizio=${servizio.id}`}
        className="riga-prenota"
        aria-label={`Prenota ${servizio.nome}`}
      >
        Prenota
      </Link>
    </div>
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
