/**
 * Anagrafica del salone.
 *
 * Indirizzo, telefono, orari e valutazione sono verificati su Treatwell,
 * su claudianails.it e sulla scheda Google Maps (luglio 2026).
 */

export const SALONE = {
  nome: "Claudia Nails",
  insegna: "Claudia Nails Garbatella",
  // Sono le parole del salone, prese da claudianails.it.
  claim: "Crea il tuo stile! Con noi puoi.",
  manifesto:
    "Non è solo un centro nails, ma uno spazio dedicato e condiviso da tutte le donne.",
  indirizzo: "Via Nicolò da Pistoia, 38",
  cap: "00154",
  citta: "Roma",
  quartiere: "Garbatella",
  telefono: "06 5160 3735",
  telefonoTel: "+390651603735",
  email: "info@claudianails.it",
  sito: "https://www.claudianails.it",
  treatwell: "https://www.treatwell.it/salone/claudia-nails-roma-garbatella/",
  mappa: "https://maps.app.goo.gl/UxD23CwRr3DrTCrbA",
  valutazione: 4.8,
  recensioni: 1034,
} as const;

/** La seconda sede, citata sul sito ufficiale. */
export const SEDE_MONTAGNOLA = {
  nome: "Claudia Nails Montagnola",
  indirizzo: "Piazzale Caduti della Montagnola, 7",
  citta: "Roma",
  telefono: "06 9209 8988",
} as const;

/**
 * Orari di apertura per giorno della settimana, in minuti dalla mezzanotte.
 * L'indice segue `Date.getDay()`: 0 = domenica.
 * `null` significa chiuso.
 */
export type FasciaOraria = { apre: number; chiude: number };

export const ORARI: Readonly<Record<number, FasciaOraria | null>> = {
  0: null, // domenica
  1: { apre: 10 * 60, chiude: 19 * 60 },
  2: { apre: 10 * 60, chiude: 19 * 60 },
  3: { apre: 10 * 60, chiude: 19 * 60 },
  4: { apre: 10 * 60, chiude: 19 * 60 },
  5: { apre: 10 * 60, chiude: 19 * 60 },
  6: { apre: 10 * 60, chiude: 19 * 60 },
};

/** Passo della griglia di prenotazione, in minuti. */
export const PASSO_SLOT = 15;

/** Percentuale trattenuta come acconto quando la cliente sceglie di versarlo. */
export const QUOTA_ACCONTO = 0.3;

export const GIORNI = [
  "Domenica",
  "Lunedì",
  "Martedì",
  "Mercoledì",
  "Giovedì",
  "Venerdì",
  "Sabato",
] as const;

export const MESI = [
  "gennaio",
  "febbraio",
  "marzo",
  "aprile",
  "maggio",
  "giugno",
  "luglio",
  "agosto",
  "settembre",
  "ottobre",
  "novembre",
  "dicembre",
] as const;

export function fasciaDi(data: Date): FasciaOraria | null {
  return ORARI[data.getDay()] ?? null;
}

export function eChiuso(data: Date): boolean {
  return fasciaDi(data) === null;
}

/**
 * Recensioni di esempio.
 *
 * ATTENZIONE: sono scritte per la demo, non sono recensioni reali di clienti.
 * Prima di andare in produzione vanno sostituite con quelle vere di Treatwell,
 * importandole tramite la loro pagina pubblica o l'API partner.
 */
export const RECENSIONI = [
  {
    nome: "Elena",
    stelle: 5,
    testo:
      "Vado da due anni e non cambierei. Il semipermanente mi dura tre settimane piene, e sanno esattamente come tenere le mie unghie che sono sottilissime.",
  },
  {
    nome: "Martina",
    stelle: 5,
    testo:
      "Puntualissime, cosa che per me vale quanto il lavoro. Sono entrata alle 15 e alle 16 ero fuori con il baby boomer fatto benissimo.",
  },
  {
    nome: "Chiara",
    stelle: 4,
    testo:
      "Bravissime sulla ricostruzione. Tolgo una stella solo perché il sabato è difficile trovare posto se non chiami con una settimana di anticipo.",
  },
  {
    nome: "Sofia",
    stelle: 5,
    testo:
      "Ceretta fatta con delicatezza, e questo è un miracolo. Ambiente pulitissimo, si vede che cambiano tutto tra una cliente e l'altra.",
  },
  {
    nome: "Valentina",
    stelle: 5,
    testo:
      "Ero incinta e mi hanno seguita usando prodotti adatti senza che dovessi chiedere niente. Attenzione vera, non di facciata.",
  },
  {
    nome: "Federica",
    stelle: 5,
    testo:
      "Il rapporto qualità prezzo in zona non ha rivali. E se un'unghia si rovina prima del tempo te la sistemano senza farti storie.",
  },
] as const;
