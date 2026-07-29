/**
 * Icone dell'interfaccia.
 *
 * Disegnate a mano e non prese da una libreria: sono dodici glifi, importare un
 * pacchetto per averli significherebbe spedire al browser molto più del
 * necessario. `stroke="currentColor"` così ereditano il colore del contesto.
 */

type Props = {
  nome: NomeIcona;
  className?: string;
  style?: React.CSSProperties;
};

export type NomeIcona =
  | "home"
  | "servizi"
  | "prenota"
  | "shop"
  | "profilo"
  | "unghie"
  | "piede"
  | "gel"
  | "mano"
  | "cera"
  | "viso"
  | "ciglia"
  | "massaggi"
  | "capelli"
  | "foglia"
  | "luogo"
  | "corona"
  | "freccia"
  | "lente"
  | "campana"
  | "indietro"
  | "avanti"
  | "chiudi"
  | "scambia";

const TRACCIATI: Record<NomeIcona, string> = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  servizi: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  prenota: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  shop: '<path d="M6 8h12l-1 12H7z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  profilo: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/>',
  unghie: '<path d="M8 4a4 4 0 0 1 8 0v9a4 4 0 0 1-8 0z"/><path d="M8 13h8"/>',
  piede:
    '<ellipse cx="12" cy="15" rx="5" ry="6.4"/><circle cx="7.4" cy="6.6" r="1.4"/><circle cx="11" cy="5" r="1.4"/><circle cx="14.6" cy="5.6" r="1.4"/><circle cx="17.4" cy="7.6" r="1.2"/>',
  gel: '<path d="M9 3h6l-1 5 3 4v7a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-7l3-4z"/>',
  mano: '<path d="M7 12V5a1.5 1.5 0 0 1 3 0v6M10 11V4a1.5 1.5 0 0 1 3 0v7M13 11V6a1.5 1.5 0 0 1 3 0v8M16 12c0-1 1-2 2-1v5a6 6 0 0 1-11 3l-3-5a1.5 1.5 0 0 1 2.5-1.7L7 14"/>',
  cera: '<path d="M12 3c3 4 5 6 5 9a5 5 0 0 1-10 0c0-3 2-5 5-9z"/>',
  viso: '<circle cx="12" cy="12" r="8"/><path d="M9 10h.01M15 10h.01M9 15c1 1 5 1 6 0"/>',
  ciglia: '<path d="M2 13s4-6 10-6 10 6 10 6"/><path d="M6 10 4 7M12 8V4.5M18 10l2-3"/>',
  massaggi:
    '<path d="M4 16c3-4 6-4 8 0M4 16c-1 2 0 4 2 4h12c2 0 3-2 2-4"/><circle cx="12" cy="7" r="3"/>',
  capelli:
    '<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M7.7 16.2 18 4M16.3 16.2 6 4"/>',
  foglia:
    '<path d="M20 4C10 4 5 8.5 5 14.5a5.5 5.5 0 0 0 5.5 5.5C17 20 20 13 20 4z"/><path d="M5.5 19.5C8 15 12 11.5 17 9.5"/>',
  luogo: '<path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  corona: '<path d="M4 18h16M4 18 3 8l5 3.5L12 5l4 6.5L21 8l-1 10z"/>',
  freccia: '<path d="M5 12h13M13 6l6 6-6 6"/>',
  lente: '<circle cx="11" cy="11" r="6"/><path d="m20 20-4.5-4.5"/>',
  campana: '<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
  indietro: '<path d="m15 5-7 7 7 7"/>',
  avanti: '<path d="m9 5 7 7-7 7"/>',
  chiudi: '<path d="m6 6 12 12M18 6 6 18"/>',
  scambia: '<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
};

export function Icona({ nome, className, style }: Props) {
  // Senza questo, aggiungere una categoria e dimenticare la sua icona passa
  // `undefined` a dangerouslySetInnerHTML e fa fallire il build dell'intera
  // pagina, con un errore che non nomina la causa.
  const tracciato = TRACCIATI[nome];
  if (!tracciato) return null;

  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      style={style}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: tracciato }}
    />
  );
}

/** L'icona giusta per ciascuna categoria del listino. */
export const ICONA_CATEGORIA: Record<string, NomeIcona> = {
  "semipermanente-mani": "unghie",
  "semipermanente-piedi": "piede",
  semigel: "gel",
  ricostruzione: "unghie",
  manicure: "mano",
  pedicure: "piede",
  ceretta: "cera",
  viso: "viso",
  ciglia: "ciglia",
  massaggi: "massaggi",
  capelli: "capelli",
};
