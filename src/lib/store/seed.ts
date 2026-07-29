/**
 * Agenda di esempio.
 *
 * Deterministica: lo stesso giorno produce sempre gli stessi appuntamenti.
 * Serve perché la demo va aperta e chiusa più volte e deve restare coerente,
 * e perché `Math.random()` renderebbe impossibile riprodurre un bug.
 *
 * La generazione procede per operatrice, avanzando nel tempo, quindi due
 * appuntamenti della stessa persona non possono sovrapporsi per costruzione.
 */

import { fasciaDi } from "../data/salon";
import { SERVIZI } from "../data/services";
import { inSede, saFare } from "../data/staff";
import { SEDI, sedeOffre, type SedeId } from "../data/sedi";
import { chiaveGiorno, daChiave, piuGiorni } from "../date";
import type { Appuntamento, StatoAppuntamento, StatoPagamento } from "./types";

/** mulberry32: piccolo, veloce, e soprattutto riproducibile. */
function generatore(seme: number): () => number {
  let t = seme >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

const NOMI = [
  "Giulia Rossi", "Martina Conti", "Sofia Barbieri", "Elena Marchetti",
  "Chiara De Santis", "Alessia Pellegrini", "Federica Testa", "Valentina Sarti",
  "Ilaria Neri", "Sara Gatti", "Francesca Lombardi", "Marta Vitali",
  "Beatrice Amato", "Silvia Ferrara", "Roberta Esposito", "Camilla Zanetti",
  "Noemi Quaranta", "Gaia Rinaldi", "Letizia Bruni", "Arianna Costa",
];

const NOTE = [
  "Preferisce tinte scure.",
  "Allergia al lattice, usare guanti in nitrile.",
  "Unghie sottili, va usata la base rinforzante.",
  "Arriva sempre con dieci minuti di anticipo.",
  "Ha chiesto di essere richiamata per il prossimo appuntamento.",
];

function scegli<T>(r: () => number, elenco: readonly T[]): T {
  return elenco[Math.floor(r() * elenco.length)];
}

/** Appuntamenti di un singolo giorno, per una sola sede. */
function perGiorno(data: Date, oggi: Date, sedeId: SedeId): Appuntamento[] {
  const fascia = fasciaDi(data);
  if (!fascia) return []; // domenica: chiuso

  const giorno = chiaveGiorno(data);
  // Il seme comprende la sede, altrimenti le due agende sarebbero identiche.
  const r = generatore(
    data.getFullYear() * 10000 +
      (data.getMonth() + 1) * 100 +
      data.getDate() +
      (sedeId === "montagnola" ? 7919 : 0),
  );
  const eSabato = data.getDay() === 6;
  const eePassato = data < oggi && chiaveGiorno(data) !== chiaveGiorno(oggi);

  const out: Appuntamento[] = [];

  for (const op of inSede(sedeId)) {
    // Solo i trattamenti che questa persona sa fare E che la sede offre:
    // senza il secondo filtro, Garbatella si riempirebbe di pieghe.
    const suoi = SERVIZI.filter(
      (s) => saFare(op, s.categoria) && sedeOffre(sedeId, s.categoria),
    );
    if (suoi.length === 0) continue;
    let t = fascia.apre + Math.floor(r() * 40);

    while (t < fascia.chiude - 20) {
      // Il sabato è più fitto: meno probabilità di lasciare un buco.
      if (r() < (eSabato ? 0.12 : 0.3)) {
        t += 30 + Math.floor(r() * 45);
        continue;
      }
      const srv = scegli(r, suoi);
      if (t + srv.durata > fascia.chiude) break;

      // Il salone non offre acconti: gli appuntamenti sono pagati alla cassa
      // oppure saldati online, e l'agenda deve mostrare solo stati possibili.
      const pagamento: StatoPagamento = r() < 0.55 ? "in-salone" : "saldato";
      const incassato = pagamento === "saldato" ? srv.prezzo : 0;

      let stato: StatoAppuntamento = "confermato";
      if (eePassato) {
        const s = r();
        stato = s < 0.88 ? "completato" : s < 0.95 ? "annullato" : "non-presentata";
      }

      out.push({
        id: `seed-${sedeId}-${giorno}-${op.id}-${t}`,
        sedeId,
        giorno,
        inizio: t,
        durata: srv.durata,
        operatriceId: op.id,
        servizioId: srv.id,
        prezzo: srv.prezzo,
        cliente: scegli(r, NOMI),
        telefono: `3${Math.floor(r() * 5) + 3}${Math.floor(r() * 10)} ${
          Math.floor(r() * 9000000) + 1000000
        }`,
        note: r() < 0.15 ? scegli(r, NOTE) : "",
        stato,
        pagamento,
        incassato,
        creatoIl: daChiave(giorno).toISOString(),
        daOnline: r() < 0.55,
      });

      t += srv.durata + (r() < 0.35 ? 15 : 0) + 5;
    }
  }

  return out.sort((a, b) => a.inizio - b.inizio);
}

/**
 * Genera l'agenda da `giorniIndietro` prima a `giorniAvanti` dopo la data data.
 * Di default copre sei settimane a cavallo di oggi.
 */
export function generaSeed(
  oggi: Date = new Date(),
  giorniIndietro = 14,
  giorniAvanti = 28,
): Appuntamento[] {
  const out: Appuntamento[] = [];
  for (let i = -giorniIndietro; i <= giorniAvanti; i++) {
    const data = piuGiorni(oggi, i);
    for (const s of SEDI) out.push(...perGiorno(data, oggi, s.id));
  }
  return out;
}
