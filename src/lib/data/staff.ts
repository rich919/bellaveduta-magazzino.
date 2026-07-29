/**
 * Lo staff.
 *
 * Nomi e ruoli sono quelli VERI, presi dalla pagina "Chi siamo" di
 * claudianails.it (luglio 2026): Claudia titolare e onicotecnica, Gloria
 * parrucchiera, Angela e Martina estetiste, Giorgia, Letizia, Michela e
 * Melania onicotecniche.
 *
 * DUE COSE SONO INVECE IPOTESI E VANNO CONFERMATE:
 *
 * 1. L'ASSEGNAZIONE ALLE SEDI. Il sito non dice chi lavora dove. L'unico
 *    vincolo certo è che il parrucchiere esiste solo alla Montagnola, quindi
 *    Gloria è lì. Il resto è una ripartizione plausibile.
 *
 * 2. LE COMPETENZE PER CATEGORIA. Il ruolo dà l'indirizzo — un'onicotecnica fa
 *    unghie, un'estetista fa ceretta e viso — ma la ripartizione fine è mia.
 *
 * Le competenze non sono decorative: il wizard propone solo chi è abilitata al
 * trattamento scelto, e la disponibilità è calcolata sull'agenda della singola
 * persona. Cambiando questi elenchi cambia ciò che le clienti possono prenotare.
 */

import type { CategoriaId } from "./services";
import type { SedeId } from "./sedi";

export type Operatrice = {
  id: string;
  nome: string;
  ruolo: string;
  /** Iniziali, per l'avatar quando manca la foto. */
  iniziali: string;
  bio: string;
  /** In quali sedi lavora. Chi ne ha due copre entrambe le agende. */
  sedi: readonly SedeId[];
  competenze: readonly CategoriaId[];
  /** Token CSS della tinta con cui compare nel gestionale. */
  tinta: string;
  foto: string;
};

/** Tutto quello che si fa sulle unghie. */
const UNGHIE: readonly CategoriaId[] = [
  "semipermanente-mani",
  "semipermanente-piedi",
  "semigel",
  "ricostruzione",
  "manicure",
];

/** Il mestiere dell'estetista. */
const ESTETICA: readonly CategoriaId[] = [
  "ceretta",
  "viso",
  "ciglia",
  "massaggi",
  "pedicure",
];

export const OPERATRICI: readonly Operatrice[] = [
  {
    id: "claudia",
    nome: "Claudia",
    ruolo: "Titolare e onicotecnica",
    iniziali: "CL",
    bio: "Ha aperto il centro e lavora ancora in postazione. La ricostruzione è la sua, ma fa un po' di tutto.",
    sedi: ["garbatella", "montagnola"],
    competenze: [...UNGHIE, ...ESTETICA],
    tinta: "--op-claudia",
    foto: "/images/staff-claudia.webp",
  },
  {
    id: "gloria",
    nome: "Gloria",
    ruolo: "Parrucchiera",
    iniziali: "GL",
    bio: "Taglio, piega e colore. È l'unica a occuparsi di capelli, e lavora solo alla Montagnola.",
    sedi: ["montagnola"],
    competenze: ["capelli"],
    tinta: "--op-gloria",
    foto: "/images/staff-gloria.webp",
  },
  {
    id: "angela",
    nome: "Angela",
    ruolo: "Estetista",
    iniziali: "AN",
    bio: "Viso e trattamenti corpo. Segue anche le pelli sensibili e le clienti in gravidanza.",
    sedi: ["montagnola"],
    competenze: ESTETICA,
    tinta: "--op-angela",
    foto: "/images/staff-angela.webp",
  },
  {
    id: "martina",
    nome: "Martina",
    ruolo: "Estetista",
    iniziali: "MA",
    bio: "Ceretta e pedicure. Ha la mano leggera, cosa che sulla ceretta si sente.",
    sedi: ["garbatella"],
    competenze: ESTETICA,
    tinta: "--op-martina",
    foto: "/images/staff-martina.webp",
  },
  {
    id: "giorgia",
    nome: "Giorgia",
    ruolo: "Onicotecnica",
    iniziali: "GI",
    bio: "Semigel e baby boomer. Se hai unghie sottili che si sfaldano, è la persona giusta.",
    sedi: ["garbatella"],
    competenze: UNGHIE,
    tinta: "--op-giorgia",
    foto: "/images/staff-giorgia.webp",
  },
  {
    id: "letizia",
    nome: "Letizia",
    ruolo: "Onicotecnica",
    iniziali: "LE",
    bio: "French e nail art. Precisa fino all'ultimo millimetro.",
    sedi: ["garbatella"],
    competenze: UNGHIE,
    tinta: "--op-letizia",
    foto: "/images/staff-letizia.webp",
  },
  {
    id: "michela",
    nome: "Michela",
    ruolo: "Onicotecnica",
    iniziali: "MI",
    bio: "Ricostruzione e refill. Veloce senza mai correre.",
    sedi: ["montagnola"],
    competenze: UNGHIE,
    tinta: "--op-michela",
    foto: "/images/staff-michela.webp",
  },
  {
    id: "melania",
    nome: "Melania",
    ruolo: "Onicotecnica",
    iniziali: "ME",
    bio: "Semipermanente e cura della mano. Ti spiega sempre come farlo durare di più.",
    sedi: ["montagnola"],
    competenze: UNGHIE,
    tinta: "--op-melania",
    foto: "/images/staff-melania.webp",
  },
];

const PER_ID = new Map(OPERATRICI.map((o) => [o.id, o]));

export function operatrice(id: string): Operatrice | undefined {
  return PER_ID.get(id);
}

export function saFare(op: Operatrice, categoriaId: CategoriaId): boolean {
  return op.competenze.includes(categoriaId);
}

export function lavoraIn(op: Operatrice, sedeId: SedeId): boolean {
  return op.sedi.includes(sedeId);
}

/**
 * Chi può eseguire questa categoria, in questa sede.
 *
 * Entrambi i filtri servono: senza la sede il wizard proporrebbe alla cliente
 * di Garbatella un'operatrice che quel giorno è alla Montagnola.
 */
export function abilitatePer(categoriaId: CategoriaId, sedeId: SedeId): Operatrice[] {
  return OPERATRICI.filter((o) => saFare(o, categoriaId) && lavoraIn(o, sedeId));
}

/** Chi lavora in una sede, per le colonne del gestionale. */
export function inSede(sedeId: SedeId): Operatrice[] {
  return OPERATRICI.filter((o) => lavoraIn(o, sedeId));
}

/** Valore speciale del selettore: lascia scegliere al sistema. */
export const NESSUNA_PREFERENZA = "qualsiasi";
