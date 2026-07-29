/**
 * Implementazione del layer dati su localStorage.
 *
 * Limite noto e voluto: i dati vivono nel browser, quindi non sono condivisi
 * tra dispositivi né tra la cliente e il salone. È il compromesso che permette
 * al link della demo di funzionare subito, senza database da configurare.
 * `supabase.ts` risolverà questo implementando la stessa interfaccia.
 *
 * Le funzioni sono asincrone anche se localStorage è sincrono: così la firma
 * è già quella giusta per un backend vero e i componenti non cambieranno.
 */

import { generaSeed } from "./seed";
import type {
  Appuntamento,
  AppointmentsRepo,
  NuovoAppuntamento,
} from "./types";

const CHIAVE = "claudia-nails:appuntamenti:v2";
/** Alzare quando cambia la forma dei dati, per invalidare i seed vecchi. */
const CHIAVE_VERSIONE = "claudia-nails:versione";
// v2: gli appuntamenti portano la sede.
const VERSIONE = "2";

function disponibile(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const p = "__prova__";
    window.localStorage.setItem(p, p);
    window.localStorage.removeItem(p);
    return true;
  } catch {
    // Safari in navigazione privata, o storage pieno.
    return false;
  }
}

/** Copia in memoria, usata quando localStorage non è utilizzabile. */
let memoria: Appuntamento[] | null = null;

function leggi(): Appuntamento[] {
  if (!disponibile()) {
    if (memoria === null) memoria = generaSeed();
    return memoria;
  }
  const versione = window.localStorage.getItem(CHIAVE_VERSIONE);
  const grezzo = window.localStorage.getItem(CHIAVE);
  if (!grezzo || versione !== VERSIONE) {
    const seed = generaSeed();
    scrivi(seed);
    return seed;
  }
  try {
    const dati = JSON.parse(grezzo);
    if (!Array.isArray(dati)) throw new Error("formato inatteso");
    return dati as Appuntamento[];
  } catch {
    // Dati corrotti: meglio ripartire dal seed che lasciare l'app rotta.
    const seed = generaSeed();
    scrivi(seed);
    return seed;
  }
}

function scrivi(dati: Appuntamento[]): void {
  if (!disponibile()) {
    memoria = dati;
    return;
  }
  window.localStorage.setItem(CHIAVE, JSON.stringify(dati));
  window.localStorage.setItem(CHIAVE_VERSIONE, VERSIONE);
  // Permette a più schede aperte di restare allineate.
  window.dispatchEvent(new CustomEvent("claudia-nails:cambiato"));
}

function nuovoId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `app-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export const repoLocale: AppointmentsRepo = {
  async listaPerIntervallo(sedeId, da, a, operatriceId) {
    return leggi()
      .filter((x) => x.sedeId === sedeId)
      .filter((x) => x.giorno >= da && x.giorno <= a)
      .filter((x) => !operatriceId || x.operatriceId === operatriceId)
      .sort((x, y) =>
        x.giorno === y.giorno
          ? x.inizio - y.inizio
          : x.giorno.localeCompare(y.giorno),
      );
  },

  async listaPerGiorno(sedeId, giorno) {
    return leggi()
      .filter((x) => x.sedeId === sedeId && x.giorno === giorno)
      .sort((x, y) => x.inizio - y.inizio);
  },

  async crea(dati: NuovoAppuntamento) {
    const appuntamento: Appuntamento = {
      ...dati,
      id: nuovoId(),
      creatoIl: new Date().toISOString(),
    };
    const tutti = leggi();
    tutti.push(appuntamento);
    scrivi(tutti);
    return appuntamento;
  },

  async aggiorna(id, modifiche) {
    const tutti = leggi();
    const i = tutti.findIndex((x) => x.id === id);
    if (i === -1) throw new Error(`Appuntamento ${id} non trovato`);
    tutti[i] = { ...tutti[i], ...modifiche, id };
    scrivi(tutti);
    return tutti[i];
  },

  async elimina(id) {
    scrivi(leggi().filter((x) => x.id !== id));
  },

  async reimposta() {
    scrivi(generaSeed());
  },
};
