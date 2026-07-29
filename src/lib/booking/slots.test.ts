/**
 * Test della disponibilità.
 *
 *   npm test
 *
 * Girano con il runner integrato di Node e lo type stripping nativo, così non
 * serve installare Jest o Vitest per coprire l'unica parte davvero insidiosa
 * del progetto.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { raggruppaPerFascia, siSovrappongono, slotLiberi } from "./slots";
import { NESSUNA_PREFERENZA } from "../data/staff";
import { SERVIZI } from "../data/services";
import { chiaveGiorno } from "../date";
import type { Appuntamento } from "../store/types";

// Riferimenti fissi, così i test non dipendono dal giorno in cui girano.
const MERCOLEDI = new Date(2026, 6, 29); // aperto 10:00–19:00
const DOMENICA = new Date(2026, 7, 2); // chiuso

/** Semipermanente mani monocolore: 60 minuti. Lo fanno Claudia e Martina. */
const SERVIZIO_60 = SERVIZI.find(
  (s) => s.categoria === "semipermanente-mani" && s.nome === "Monocolore",
)!;

/** Extension ciglia: 90 minuti. La fanno Giulia (specialista) e Claudia (titolare). */
const SERVIZIO_CIGLIA = SERVIZI.find(
  (s) => s.categoria === "ciglia" && s.nome === "Extension ciglia volume",
)!;

function appuntamento(
  operatriceId: string,
  inizio: number,
  durata: number,
  extra: Partial<Appuntamento> = {},
): Appuntamento {
  return {
    id: `t-${operatriceId}-${inizio}`,
    giorno: chiaveGiorno(MERCOLEDI),
    inizio,
    durata,
    operatriceId,
    servizioId: SERVIZIO_60.id,
    prezzo: SERVIZIO_60.prezzo,
    cliente: "Cliente di prova",
    telefono: "333 1234567",
    note: "",
    stato: "confermato",
    pagamento: "in-salone",
    incassato: 0,
    creatoIl: MERCOLEDI.toISOString(),
    daOnline: false,
    ...extra,
  };
}

/** Un istante prima dell'apertura: nessuno slot viene scartato come passato. */
const PRIMA_DELL_APERTURA = new Date(2026, 6, 29, 8, 0);

function slot(
  operatriceId: string,
  appuntamenti: Appuntamento[] = [],
  data = MERCOLEDI,
  servizioId = SERVIZIO_60.id,
) {
  return slotLiberi({
    data,
    servizioId,
    operatriceId,
    appuntamenti,
    adesso: PRIMA_DELL_APERTURA,
  });
}

describe("siSovrappongono", () => {
  it("riconosce due intervalli che si accavallano", () => {
    assert.equal(siSovrappongono(600, 60, 630, 60), true);
  });

  it("non considera sovrapposti due intervalli adiacenti", () => {
    // 10:00–11:00 e 11:00–12:00 si toccano ma non si accavallano.
    assert.equal(siSovrappongono(600, 60, 660, 60), false);
  });

  it("riconosce un intervallo interamente contenuto nell'altro", () => {
    assert.equal(siSovrappongono(600, 120, 630, 15), true);
  });
});

describe("slotLiberi — orari di apertura", () => {
  it("non propone nulla di domenica", () => {
    assert.deepEqual(slot(NESSUNA_PREFERENZA, [], DOMENICA), []);
  });

  it("apre alle 10:00", () => {
    assert.equal(slot(NESSUNA_PREFERENZA)[0].inizio, 600);
  });

  it("non lascia iniziare un servizio da 60′ dopo le 18:00", () => {
    // Il salone chiude alle 19:00: alle 18:15 il trattamento sborderebbe.
    const orari = slot(NESSUNA_PREFERENZA).map((s) => s.inizio);
    assert.equal(Math.max(...orari), 18 * 60);
  });

  it("per un servizio da 90′ l'ultimo orario è le 17:30", () => {
    const orari = slot("giulia", [], MERCOLEDI, SERVIZIO_CIGLIA.id).map(
      (s) => s.inizio,
    );
    assert.equal(Math.max(...orari), 17 * 60 + 30);
  });
});

describe("slotLiberi — competenze delle operatrici", () => {
  it("non propone chi non sa fare quel trattamento", () => {
    // Sara fa ceretta e pedicure, non le extension ciglia.
    assert.deepEqual(slot("sara", [], MERCOLEDI, SERVIZIO_CIGLIA.id), []);
  });

  it("con nessuna preferenza assegna solo operatrici abilitate", () => {
    const assegnate = new Set(
      slot(NESSUNA_PREFERENZA, [], MERCOLEDI, SERVIZIO_CIGLIA.id).map(
        (s) => s.operatriceId,
      ),
    );
    // Sara e Martina non fanno ciglia: non devono mai comparire.
    for (const id of assegnate) assert.ok(["giulia", "claudia"].includes(id));
  });

  it("preferisce la specialista alla titolare, che sa fare tutto", () => {
    // Ad agenda vuota Claudia e Giulia sono entrambe libere. Deve vincere
    // Giulia: ha meno competenze, quindi è la persona più giusta per le ciglia.
    const primo = slot(NESSUNA_PREFERENZA, [], MERCOLEDI, SERVIZIO_CIGLIA.id)[0];
    assert.equal(primo.operatriceId, "giulia");
  });

  it("passa alla titolare quando la specialista è più carica", () => {
    const giuliaOccupata = [appuntamento("giulia", 600, 180)];
    const alle10 = slot(
      NESSUNA_PREFERENZA,
      giuliaOccupata,
      MERCOLEDI,
      SERVIZIO_CIGLIA.id,
    ).find((s) => s.inizio === 600);
    assert.ok(alle10);
    assert.equal(alle10.operatriceId, "claudia");
  });
});

describe("slotLiberi — agenda occupata", () => {
  it("toglie gli orari coperti da un appuntamento della stessa operatrice", () => {
    const orari = slot("martina", [appuntamento("martina", 600, 60)]).map(
      (s) => s.inizio,
    );
    // Un servizio da 60′ non entra prima delle 11:00 se le 10–11 sono prese.
    assert.equal(orari.includes(600), false);
    assert.equal(orari.includes(630), false);
    assert.equal(orari.includes(660), true);
  });

  it("l'agenda di una non tocca quella dell'altra", () => {
    const occupata = [appuntamento("martina", 600, 60)];
    assert.equal(
      slot("claudia", occupata).some((s) => s.inizio === 600),
      true,
    );
  });

  it("con nessuna preferenza lo slot resta se almeno una è libera", () => {
    // Martina occupata alle 10, Claudia libera: le 10:00 devono restare.
    const alle10 = slot(NESSUNA_PREFERENZA, [
      appuntamento("martina", 600, 60),
    ]).find((s) => s.inizio === 600);
    assert.ok(alle10);
    assert.equal(alle10.operatriceId, "claudia");
  });

  it("sparisce solo quando tutte le abilitate sono occupate", () => {
    const piena = [appuntamento("claudia", 600, 60), appuntamento("martina", 600, 60)];
    assert.equal(
      slot(NESSUNA_PREFERENZA, piena).some((s) => s.inizio === 600),
      false,
    );
  });

  it("un appuntamento annullato libera il posto", () => {
    const annullato = [appuntamento("martina", 600, 60, { stato: "annullato" })];
    assert.equal(
      slot("martina", annullato).some((s) => s.inizio === 600),
      true,
    );
  });
});

describe("slotLiberi — orari già passati", () => {
  it("oggi non propone orari precedenti all'ora corrente", () => {
    const orari = slotLiberi({
      data: MERCOLEDI,
      servizioId: SERVIZIO_60.id,
      operatriceId: NESSUNA_PREFERENZA,
      appuntamenti: [],
      adesso: new Date(2026, 6, 29, 14, 20), // le 14:20 dello stesso giorno
    }).map((s) => s.inizio);
    assert.equal(orari.some((o) => o < 14 * 60 + 20), false);
    assert.equal(orari[0], 14 * 60 + 30);
  });

  it("su un giorno futuro l'ora corrente non filtra niente", () => {
    const domani = new Date(2026, 6, 30);
    const orari = slotLiberi({
      data: domani,
      servizioId: SERVIZIO_60.id,
      operatriceId: NESSUNA_PREFERENZA,
      appuntamenti: [],
      adesso: new Date(2026, 6, 29, 18, 0),
    });
    assert.equal(orari[0].inizio, 600);
  });
});

describe("raggruppaPerFascia", () => {
  it("separa mattina e pomeriggio alle 13:00", () => {
    const { mattina, pomeriggio } = raggruppaPerFascia(slot(NESSUNA_PREFERENZA));
    assert.equal(mattina.every((s) => s.inizio < 780), true);
    assert.equal(pomeriggio.every((s) => s.inizio >= 780), true);
    assert.equal(mattina.length + pomeriggio.length, slot(NESSUNA_PREFERENZA).length);
  });
});
