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

const GARBATELLA = "garbatella" as const;
const MONTAGNOLA = "montagnola" as const;

/** Semipermanente mani monocolore: 60 minuti. A Garbatella lo fanno
 *  Claudia, Giorgia e Letizia. */
const SERVIZIO_60 = SERVIZI.find(
  (s) => s.categoria === "semipermanente-mani" && s.nome === "Monocolore",
)!;

/** Extension ciglia: 90 minuti. A Garbatella lo fanno Claudia e Martina. */
const SERVIZIO_CIGLIA = SERVIZI.find(
  (s) => s.categoria === "ciglia" && s.nome === "Extension ciglia volume",
)!;

/** Taglio e piega: solo alla Montagnola, e solo Gloria. */
const SERVIZIO_CAPELLI = SERVIZI.find(
  (s) => s.categoria === "capelli" && s.nome === "Taglio e piega",
)!;

function appuntamento(
  operatriceId: string,
  inizio: number,
  durata: number,
  extra: Partial<Appuntamento> = {},
): Appuntamento {
  return {
    id: `t-${operatriceId}-${inizio}`,
    sedeId: GARBATELLA,
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
  sedeId: "garbatella" | "montagnola" = GARBATELLA,
) {
  return slotLiberi({
    data,
    servizioId,
    sedeId,
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
    const orari = slot("martina", [], MERCOLEDI, SERVIZIO_CIGLIA.id).map(
      (s) => s.inizio,
    );
    assert.equal(Math.max(...orari), 17 * 60 + 30);
  });
});

describe("slotLiberi — competenze delle operatrici", () => {
  it("non propone chi non sa fare quel trattamento", () => {
    // Giorgia è onicotecnica: le extension ciglia non le fa.
    assert.deepEqual(slot("giorgia", [], MERCOLEDI, SERVIZIO_CIGLIA.id), []);
  });

  it("con nessuna preferenza assegna solo operatrici abilitate", () => {
    const assegnate = new Set(
      slot(NESSUNA_PREFERENZA, [], MERCOLEDI, SERVIZIO_CIGLIA.id).map(
        (s) => s.operatriceId,
      ),
    );
    // A Garbatella le ciglia le fanno solo Claudia e Martina.
    for (const id of assegnate) assert.ok(["martina", "claudia"].includes(id));
  });

  it("preferisce la specialista alla titolare, che sa fare tutto", () => {
    // Ad agenda vuota Claudia e Martina sono entrambe libere. Deve vincere
    // Martina: ha meno competenze, quindi è la scelta più giusta.
    const primo = slot(NESSUNA_PREFERENZA, [], MERCOLEDI, SERVIZIO_CIGLIA.id)[0];
    assert.equal(primo.operatriceId, "martina");
  });

  it("passa alla titolare quando la specialista è più carica", () => {
    const martinaOccupata = [appuntamento("martina", 600, 180)];
    const alle10 = slot(
      NESSUNA_PREFERENZA,
      martinaOccupata,
      MERCOLEDI,
      SERVIZIO_CIGLIA.id,
    ).find((s) => s.inizio === 600);
    assert.ok(alle10);
    assert.equal(alle10.operatriceId, "claudia");
  });
});

describe("slotLiberi — le due sedi", () => {
  it("il parrucchiere non si prenota a Garbatella", () => {
    assert.deepEqual(
      slot(NESSUNA_PREFERENZA, [], MERCOLEDI, SERVIZIO_CAPELLI.id, GARBATELLA),
      [],
    );
  });

  it("il parrucchiere si prenota alla Montagnola, con Gloria", () => {
    const orari = slot(
      NESSUNA_PREFERENZA,
      [],
      MERCOLEDI,
      SERVIZIO_CAPELLI.id,
      MONTAGNOLA,
    );
    assert.ok(orari.length > 0);
    // Gloria è l'unica parrucchiera: nessun altro può comparire.
    for (const s of orari) assert.equal(s.operatriceId, "gloria");
  });

  it("non propone chi lavora nell'altra sede", () => {
    // Giorgia sta a Garbatella: alla Montagnola non deve mai uscire.
    const alla = slot(
      "giorgia",
      [],
      MERCOLEDI,
      SERVIZIO_60.id,
      MONTAGNOLA,
    );
    assert.deepEqual(alla, []);
  });

  it("la stessa richiesta dà personale diverso nelle due sedi", () => {
    const aGarbatella = new Set(
      slot(NESSUNA_PREFERENZA, [], MERCOLEDI, SERVIZIO_60.id, GARBATELLA).map(
        (s) => s.operatriceId,
      ),
    );
    const allaMontagnola = new Set(
      slot(NESSUNA_PREFERENZA, [], MERCOLEDI, SERVIZIO_60.id, MONTAGNOLA).map(
        (s) => s.operatriceId,
      ),
    );
    assert.ok(aGarbatella.size > 0 && allaMontagnola.size > 0);
    // Solo Claudia gira su entrambe: tutti gli altri sono esclusivi.
    for (const id of aGarbatella) {
      if (id !== "claudia") assert.ok(!allaMontagnola.has(id));
    }
  });
});

describe("slotLiberi — agenda occupata", () => {
  it("toglie gli orari coperti da un appuntamento della stessa operatrice", () => {
    const orari = slot("giorgia", [appuntamento("giorgia", 600, 60)]).map(
      (s) => s.inizio,
    );
    // Un servizio da 60′ non entra prima delle 11:00 se le 10–11 sono prese.
    assert.equal(orari.includes(600), false);
    assert.equal(orari.includes(630), false);
    assert.equal(orari.includes(660), true);
  });

  it("l'agenda di una non tocca quella dell'altra", () => {
    const occupata = [appuntamento("giorgia", 600, 60)];
    assert.equal(
      slot("claudia", occupata).some((s) => s.inizio === 600),
      true,
    );
  });

  it("con nessuna preferenza lo slot resta se almeno una è libera", () => {
    // Giorgia occupata alle 10, le altre libere: le 10:00 devono restare.
    const alle10 = slot(NESSUNA_PREFERENZA, [
      appuntamento("giorgia", 600, 60),
    ]).find((s) => s.inizio === 600);
    assert.ok(alle10);
    assert.notEqual(alle10.operatriceId, "giorgia");
  });

  it("sparisce solo quando tutte le abilitate sono occupate", () => {
    // A Garbatella il semipermanente mani lo fanno Claudia, Giorgia e Letizia.
    const piena = [
      appuntamento("claudia", 600, 60),
      appuntamento("giorgia", 600, 60),
      appuntamento("letizia", 600, 60),
    ];
    assert.equal(
      slot(NESSUNA_PREFERENZA, piena).some((s) => s.inizio === 600),
      false,
    );
  });

  it("un appuntamento annullato libera il posto", () => {
    const annullato = [appuntamento("giorgia", 600, 60, { stato: "annullato" })];
    assert.equal(
      slot("giorgia", annullato).some((s) => s.inizio === 600),
      true,
    );
  });
});

describe("slotLiberi — orari già passati", () => {
  it("oggi non propone orari precedenti all'ora corrente", () => {
    const orari = slotLiberi({
      data: MERCOLEDI,
      servizioId: SERVIZIO_60.id,
      sedeId: GARBATELLA,
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
      sedeId: GARBATELLA,
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
