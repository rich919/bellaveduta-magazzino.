/**
 * Date e orari.
 *
 * Regola valida per tutta l'app: un giorno è sempre una stringa `YYYY-MM-DD`
 * in ora locale, mai un `Date` serializzato e mai UTC. Usare `toISOString()`
 * per ricavare il giorno è un bug: in Italia, d'estate, sposta indietro di due
 * ore e un appuntamento dell'una di notte finirebbe nel giorno prima.
 */

import { GIORNI, MESI } from "./data/salon";

/** YYYY-MM-DD in ora locale. */
export function chiaveGiorno(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const g = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${g}`;
}

/** Ricostruisce una Date locale a mezzanotte da una chiave YYYY-MM-DD. */
export function daChiave(chiave: string): Date {
  const [a, m, g] = chiave.split("-").map(Number);
  return new Date(a, m - 1, g);
}

export function stessoGiorno(a: Date, b: Date): boolean {
  return chiaveGiorno(a) === chiaveGiorno(b);
}

export function piuGiorni(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

/** Minuti dalla mezzanotte → "HH:MM". */
export function oreMinuti(minuti: number): string {
  const h = Math.floor(minuti / 60);
  const m = minuti % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** "Mercoledì 29 luglio" */
export function dataEstesa(d: Date): string {
  return `${GIORNI[d.getDay()]} ${d.getDate()} ${MESI[d.getMonth()]}`;
}

/** "mer 29 lug" */
export function dataBreve(d: Date): string {
  return `${GIORNI[d.getDay()].slice(0, 3).toLowerCase()} ${d.getDate()} ${MESI[
    d.getMonth()
  ].slice(0, 3)}`;
}

export function euro(n: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n);
}

/** Primo giorno della griglia mensile, con la settimana che parte da lunedì. */
export function inizioGrigliaMese(anno: number, mese: number): Date {
  const primo = new Date(anno, mese, 1);
  const scarto = (primo.getDay() + 6) % 7;
  return piuGiorni(primo, -scarto);
}

export function giorniNelMese(anno: number, mese: number): number {
  return new Date(anno, mese + 1, 0).getDate();
}

/** Minuti dalla mezzanotte per l'istante indicato. */
export function minutiDelGiorno(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}
