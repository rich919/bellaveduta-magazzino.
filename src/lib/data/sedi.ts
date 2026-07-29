/**
 * Le due sedi.
 *
 * Indirizzi e telefoni sono verificati su claudianails.it. La differenza che
 * conta per l'app: il **parrucchiere c'è solo alla Montagnola**, quindi i
 * trattamenti capelli non devono nemmeno comparire quando la cliente sceglie
 * Garbatella.
 */

import type { CategoriaId } from "./services";

export type SedeId = "garbatella" | "montagnola";

export type Sede = {
  id: SedeId;
  nome: string;
  /** Nome breve per chip e filtri. */
  etichetta: string;
  indirizzo: string;
  cap: string;
  citta: string;
  telefono: string;
  /** Formato per href="tel:". */
  telefonoTel: string;
  mappa: string;
  /** File in /public/images. */
  foto: string;
  /** Come ci si arriva: usato nella pagina "Dove siamo". */
  indicazioni: ReadonlyArray<{ icona: string; titolo: string; testo: string }>;
  /**
   * Categorie NON disponibili in questa sede. Vuoto significa "tutte".
   * Meglio elencare le eccezioni che l'elenco completo: aggiungendo una
   * categoria al listino non ci si dimentica di abilitarla ovunque.
   */
  categorieEscluse: readonly CategoriaId[];
};

export const SEDI: readonly Sede[] = [
  {
    id: "garbatella",
    nome: "Claudia Nails Garbatella",
    etichetta: "Garbatella",
    indirizzo: "Via Nicolò da Pistoia, 38",
    cap: "00154",
    citta: "Roma",
    telefono: "06 5160 3735",
    telefonoTel: "+390651603735",
    mappa: "https://maps.app.goo.gl/UxD23CwRr3DrTCrbA",
    foto: "/images/sede-garbatella.webp",
    indicazioni: [
      {
        icona: "Ⓜ",
        titolo: "Metro B — Garbatella",
        testo:
          "Sei minuti a piedi: esci, prendi Via Giovanni Ansaldo e gira in Via Nicolò da Pistoia",
      },
      { icona: "◉", titolo: "Bus 715 e 716", testo: "Fermata Ansaldo, a duecento metri" },
      {
        icona: "🅿",
        titolo: "Parcheggio",
        testo: "Strisce blu in Via Nicolò da Pistoia, gratis dopo le 20",
      },
    ],
    // Il parrucchiere qui non c'è.
    categorieEscluse: ["capelli"],
  },
  {
    id: "montagnola",
    nome: "Claudia Nails Montagnola",
    etichetta: "Montagnola",
    indirizzo: "Piazzale Caduti della Montagnola, 7",
    cap: "00142",
    citta: "Roma",
    telefono: "06 9209 8988",
    telefonoTel: "+390692098988",
    mappa: "https://www.google.com/maps/search/?api=1&query=Claudia+Nails+Piazzale+Caduti+della+Montagnola+7+Roma",
    foto: "/images/sede-montagnola.webp",
    indicazioni: [
      {
        icona: "Ⓜ",
        titolo: "Metro B — Palasport o Marconi",
        testo: "Dieci minuti a piedi, oppure una fermata di bus",
      },
      {
        icona: "◉",
        titolo: "Bus 670, 707 e 762",
        testo: "Fermata Piazzale Caduti della Montagnola, davanti al centro",
      },
      {
        icona: "✂",
        titolo: "Qui c'è anche il parrucchiere",
        testo: "Taglio, piega e colore si prenotano solo in questa sede",
      },
    ],
    categorieEscluse: [],
  },
];

const PER_ID = new Map(SEDI.map((s) => [s.id, s]));

export function sede(id: string): Sede | undefined {
  return PER_ID.get(id as SedeId);
}

export const SEDE_PREDEFINITA: SedeId = "garbatella";

export function sedeOffre(sedeId: SedeId, categoriaId: CategoriaId): boolean {
  const s = PER_ID.get(sedeId);
  return s ? !s.categorieEscluse.includes(categoriaId) : false;
}

/** Le sedi in cui un certo trattamento si può prenotare. */
export function sediPerCategoria(categoriaId: CategoriaId): Sede[] {
  return SEDI.filter((s) => !s.categorieEscluse.includes(categoriaId));
}
