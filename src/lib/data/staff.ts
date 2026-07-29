/**
 * Le operatrici del salone.
 *
 * ATTENZIONE: questi nomi sono SEGNAPOSTO. Né Treatwell né claudianails.it
 * pubblicano i nomi del personale, quindi non c'era modo di ricavarli. L'unico
 * dato reale è "Claudia", che viene dall'insegna dell'attività.
 *
 * Vanno sostituiti con i nomi veri prima di mostrare l'app alle clienti.
 * Cambiare solo questo file: `id` è usato come chiave negli appuntamenti, quindi
 * se rinomini una persona mantieni lo stesso `id` oppure migra i dati esistenti.
 *
 * Le competenze non sono decorative: il wizard di prenotazione propone solo chi
 * è abilitata al trattamento scelto, e la disponibilità degli slot è calcolata
 * sull'agenda della singola operatrice.
 */

import type { CategoriaId } from "./services";

export type Operatrice = {
  id: string;
  nome: string;
  ruolo: string;
  /** Iniziali, per l'avatar quando manca la foto. */
  iniziali: string;
  bio: string;
  /** Categorie che questa persona può eseguire. */
  competenze: readonly CategoriaId[];
  /** Token CSS della tinta con cui compare nel gestionale. */
  tinta: string;
  /** File in /public/images, generato da scripts/generate-images.mjs. */
  foto: string;
};

const TUTTE: readonly CategoriaId[] = [
  "semipermanente-mani",
  "semipermanente-piedi",
  "semigel",
  "ricostruzione",
  "manicure",
  "pedicure",
  "ceretta",
  "viso",
  "ciglia",
  "massaggi",
];

export const OPERATRICI: readonly Operatrice[] = [
  {
    id: "claudia",
    nome: "Claudia",
    ruolo: "Titolare",
    iniziali: "CL",
    bio: "Ha aperto il salone e lavora ancora in postazione tutti i giorni. Fa un po' di tutto, ma la ricostruzione è la sua.",
    competenze: TUTTE,
    tinta: "--op-claudia",
    foto: "/images/operatrice-claudia.jpg",
  },
  {
    id: "martina",
    nome: "Martina",
    ruolo: "Nail artist",
    iniziali: "MA",
    bio: "Semigel e baby boomer. Se hai unghie sottili che si sfaldano, è la persona giusta.",
    competenze: [
      "semipermanente-mani",
      "semipermanente-piedi",
      "semigel",
      "ricostruzione",
      "manicure",
    ],
    tinta: "--op-martina",
    foto: "/images/operatrice-martina.jpg",
  },
  {
    id: "sara",
    nome: "Sara",
    ruolo: "Estetista",
    iniziali: "SA",
    bio: "Ceretta e pedicure. Ha la mano leggera, cosa che sulla ceretta si sente.",
    competenze: ["ceretta", "pedicure", "manicure"],
    tinta: "--op-sara",
    foto: "/images/operatrice-sara.jpg",
  },
  {
    id: "giulia",
    nome: "Giulia",
    ruolo: "Estetista",
    iniziali: "GI",
    bio: "Viso, ciglia e massaggi. Segue anche i trattamenti per la pelle sensibile.",
    competenze: ["viso", "ciglia", "massaggi"],
    tinta: "--op-giulia",
    foto: "/images/operatrice-giulia.jpg",
  },
];

const PER_ID = new Map(OPERATRICI.map((o) => [o.id, o]));

export function operatrice(id: string): Operatrice | undefined {
  return PER_ID.get(id);
}

export function saFare(op: Operatrice, categoriaId: CategoriaId): boolean {
  return op.competenze.includes(categoriaId);
}

/** Chi può eseguire questa categoria di trattamento. */
export function abilitatePer(categoriaId: CategoriaId): Operatrice[] {
  return OPERATRICI.filter((o) => saFare(o, categoriaId));
}

/** Valore speciale del selettore: lascia scegliere al sistema. */
export const NESSUNA_PREFERENZA = "qualsiasi";
