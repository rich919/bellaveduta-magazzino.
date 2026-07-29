/**
 * Tessera a punti.
 *
 * Le soglie qui sotto sono una PROPOSTA, non una decisione del salone: quanto
 * essere generosi è una scelta commerciale di Claudia. Sono raccolte tutte in
 * questo file proprio per poterle cambiare senza toccare nient'altro.
 *
 * Regola: 1 punto per ogni euro speso, su trattamenti e prodotti allo stesso
 * modo. Semplice da spiegare alla cassa, che è il requisito vero.
 */

export type Livello = {
  id: string;
  nome: string;
  /** Punti necessari per entrare in questo livello. */
  soglia: number;
  vantaggi: readonly string[];
};

export const LIVELLI: readonly Livello[] = [
  {
    id: "base",
    nome: "Base",
    soglia: 0,
    vantaggi: ["Accumuli punti su ogni trattamento e ogni prodotto"],
  },
  {
    id: "argento",
    nome: "Argento",
    soglia: 200,
    vantaggi: ["Promemoria prioritario per il richiamo", "Cambio appuntamento fino a 12 ore prima"],
  },
  {
    id: "oro",
    nome: "Oro",
    soglia: 500,
    vantaggi: ["Priorità sugli slot del sabato", "10% su tutto lo shop", "Un ritocco gratuito l'anno"],
  },
];

export type Premio = {
  punti: number;
  descrizione: string;
};

export const PREMI: readonly Premio[] = [
  { punti: 150, descrizione: "10 € di sconto sul prossimo trattamento" },
  { punti: 300, descrizione: "Limatura e forma in omaggio" },
  { punti: 600, descrizione: "Manicure classica in omaggio" },
  { punti: 900, descrizione: "Semipermanente mani in omaggio" },
];

/** Un punto per ogni euro, arrotondato per difetto. */
export function puntiPerSpesa(euro: number): number {
  return Math.floor(euro);
}

export function livelloDi(punti: number): Livello {
  // Dal più alto al più basso: il primo che la persona ha raggiunto è il suo.
  return [...LIVELLI].reverse().find((l) => punti >= l.soglia) ?? LIVELLI[0];
}

export function livelloSuccessivo(punti: number): Livello | null {
  return LIVELLI.find((l) => punti < l.soglia) ?? null;
}

/** Percentuale di avanzamento verso il livello successivo, 0–100. */
export function avanzamento(punti: number): number {
  const attuale = livelloDi(punti);
  const prossimo = livelloSuccessivo(punti);
  if (!prossimo) return 100;
  const percorso = prossimo.soglia - attuale.soglia;
  return Math.round(((punti - attuale.soglia) / percorso) * 100);
}

/**
 * Valore in euro dei punti spendibili su un ordine.
 *
 * Due limiti insieme: 15 punti valgono 1 €, e comunque lo sconto non può
 * superare il 30% dell'ordine. Il secondo limite serve a non far uscire ordini
 * quasi gratis quando qualcuno ha accumulato tantissimo.
 */
export const PUNTI_PER_EURO = 15;
export const SCONTO_MASSIMO = 0.3;

export function scontoDisponibile(punti: number, totaleOrdine: number): number {
  const daPunti = Math.floor(punti / PUNTI_PER_EURO);
  const tetto = Math.floor(totaleOrdine * SCONTO_MASSIMO);
  return Math.max(0, Math.min(daPunti, tetto));
}

export function puntiSpesiPer(sconto: number): number {
  return sconto * PUNTI_PER_EURO;
}
