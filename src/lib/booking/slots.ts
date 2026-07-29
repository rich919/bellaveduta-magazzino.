/**
 * Calcolo della disponibilità.
 *
 * È la parte con più logica del progetto e quella che si rompe più facilmente,
 * quindi sta tutta qui, come funzioni pure e senza dipendenze da React o dal
 * layer dati. In questo modo si può testare passandole semplicemente una lista
 * di appuntamenti.
 *
 * Le regole:
 *  - il salone è chiuso la domenica (vedi ORARI in data/salon);
 *  - uno slot è valido solo se il trattamento ci sta INTERO prima della
 *    chiusura: alle 18:30 non si può iniziare un servizio da un'ora;
 *  - la disponibilità è per operatrice, non globale: se Martina è occupata ma
 *    Claudia è libera, lo slot esiste solo per chi sceglie Claudia o "nessuna
 *    preferenza";
 *  - un'operatrice può essere proposta solo se è abilitata a quella categoria;
 *  - gli appuntamenti annullati liberano il posto;
 *  - oggi non si propongono orari già passati.
 */

import { fasciaDi, PASSO_SLOT } from "../data/salon";
import { servizio, type Servizio } from "../data/services";
import {
  abilitatePer,
  NESSUNA_PREFERENZA,
  operatrice,
  type Operatrice,
} from "../data/staff";
import { sedeOffre, type SedeId } from "../data/sedi";
import type { Appuntamento } from "../store/types";
import { chiaveGiorno, minutiDelGiorno } from "../date";

export type Slot = {
  /** Minuti dalla mezzanotte. */
  inizio: number;
  /** Chi eseguirà il trattamento in questo slot. */
  operatriceId: string;
};

/** Due intervalli [aI, aF) e [bI, bF) si sovrappongono? */
export function siSovrappongono(
  aInizio: number,
  aDurata: number,
  bInizio: number,
  bDurata: number,
): boolean {
  return aInizio < bInizio + bDurata && bInizio < aInizio + aDurata;
}

/** Gli appuntamenti che occupano davvero l'agenda. Gli annullati no. */
function occupanti(appuntamenti: readonly Appuntamento[]): Appuntamento[] {
  return appuntamenti.filter((a) => a.stato !== "annullato");
}

export function operatriceLibera(
  operatriceId: string,
  inizio: number,
  durata: number,
  appuntamenti: readonly Appuntamento[],
  ignoraAppuntamentoId?: string,
): boolean {
  return !occupanti(appuntamenti).some(
    (a) =>
      a.operatriceId === operatriceId &&
      a.id !== ignoraAppuntamentoId &&
      siSovrappongono(inizio, durata, a.inizio, a.durata),
  );
}

export type OpzioniSlot = {
  data: Date;
  servizioId: string;
  /** In quale sede si vuole prenotare. */
  sedeId: SedeId;
  /** Id di un'operatrice, oppure NESSUNA_PREFERENZA. */
  operatriceId: string;
  /** Gli appuntamenti già presenti in quel giorno. */
  appuntamenti: readonly Appuntamento[];
  /** Per non proporre orari passati. Iniettabile per rendere i test stabili. */
  adesso?: Date;
};

/**
 * Gli orari in cui il trattamento può davvero iniziare.
 * Lista vuota se il salone è chiuso o la giornata è piena.
 */
export function slotLiberi({
  data,
  servizioId,
  sedeId,
  operatriceId,
  appuntamenti,
  adesso = new Date(),
}: OpzioniSlot): Slot[] {
  const fascia = fasciaDi(data);
  if (!fascia) return []; // domenica

  const srv = servizio(servizioId);
  if (!srv) return [];

  // Il parrucchiere esiste solo alla Montagnola: qui non si prenota.
  if (!sedeOffre(sedeId, srv.categoria)) return [];

  const candidate = candidateFor(srv, sedeId, operatriceId);
  if (candidate.length === 0) return [];

  // Se stiamo guardando oggi, gli orari già passati non sono prenotabili.
  const eOggi = chiaveGiorno(data) === chiaveGiorno(adesso);
  const minimo = eOggi ? minutiDelGiorno(adesso) : -Infinity;

  const attivi = occupanti(appuntamenti);
  const ordinate = perCaricoCrescente(candidate, attivi);
  const out: Slot[] = [];

  // `<=` sull'ora di fine: il trattamento deve entrare tutto prima di chiudere.
  for (let t = fascia.apre; t + srv.durata <= fascia.chiude; t += PASSO_SLOT) {
    if (t < minimo) continue;
    const libera = ordinate.find((op) =>
      operatriceLibera(op.id, t, srv.durata, attivi),
    );
    if (libera) out.push({ inizio: t, operatriceId: libera.id });
  }
  return out;
}

/**
 * Ordina le candidate dalla più scarica alla più carica.
 *
 * Serve per "nessuna preferenza". Senza questo, l'assegnazione seguirebbe
 * l'ordine dell'elenco e Claudia — che essendo titolare sa fare tutto — si
 * prenderebbe ogni prenotazione automatica, lasciando ferme le specialiste.
 * A parità di carico vince chi ha meno competenze, così un trattamento che
 * solo una persona sa fare non finisce a chi potrebbe farne anche altri.
 */
function perCaricoCrescente(
  candidate: readonly Operatrice[],
  appuntamenti: readonly Appuntamento[],
): Operatrice[] {
  const carico = new Map<string, number>();
  for (const op of candidate) carico.set(op.id, 0);
  for (const a of appuntamenti) {
    if (carico.has(a.operatriceId)) {
      carico.set(a.operatriceId, carico.get(a.operatriceId)! + a.durata);
    }
  }
  return [...candidate].sort((x, y) => {
    const diff = carico.get(x.id)! - carico.get(y.id)!;
    if (diff !== 0) return diff;
    return x.competenze.length - y.competenze.length;
  });
}

/**
 * Chi può prendere in carico questo servizio, nell'ordine in cui va tentata
 * l'assegnazione automatica.
 */
function candidateFor(
  srv: Servizio,
  sedeId: SedeId,
  operatriceId: string,
): Operatrice[] {
  const abilitate = abilitatePer(srv.categoria, sedeId);
  if (operatriceId === NESSUNA_PREFERENZA) return abilitate;
  const scelta = operatrice(operatriceId);
  // Una scelta esplicita vale solo se quella persona sa fare il trattamento.
  if (!scelta || !abilitate.some((o) => o.id === scelta.id)) return [];
  return [scelta];
}

/** Quanti orari restano in un giorno. Serve alla striscia dei giorni. */
export function contaSlot(opzioni: OpzioniSlot): number {
  return slotLiberi(opzioni).length;
}

/** Divide gli orari in mattina e pomeriggio, per non mostrare un muro di bottoni. */
export function raggruppaPerFascia(slot: readonly Slot[]): {
  mattina: Slot[];
  pomeriggio: Slot[];
} {
  const soglia = 13 * 60;
  return {
    mattina: slot.filter((s) => s.inizio < soglia),
    pomeriggio: slot.filter((s) => s.inizio >= soglia),
  };
}
