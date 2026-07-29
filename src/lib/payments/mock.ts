/**
 * Provider di pagamento simulato.
 *
 * Non incassa nulla e non chiede i dati della carta. Serve a far vedere il
 * flusso completo e a produrre i tre stati di pagamento che il gestionale deve
 * saper mostrare, senza mettere in piedi Stripe per una demo.
 *
 * `simulato: true` non è cosmetico: l'interfaccia lo legge e mostra un avviso
 * fisso alla cliente. Quando arriverà `stripe.ts` quel flag sarà `false` e
 * l'avviso sparirà da solo.
 */

import type {
  DatiCheckout,
  PaymentProvider,
  SessioneCheckout,
} from "./types";

const sessioni = new Map<string, SessioneCheckout>();

/** Ritardo finto, così la schermata di attesa non lampeggia e basta. */
const ATTESA_MS = 1200;

function nuovoId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? `sim_${crypto.randomUUID()}`
    : `sim_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

export const providerSimulato: PaymentProvider = {
  nome: "Pagamento simulato",
  simulato: true,

  async creaCheckout(dati: DatiCheckout): Promise<SessioneCheckout> {
    const sessione: SessioneCheckout = {
      id: nuovoId(),
      esito: "in-attesa",
      importo: dati.importo,
    };
    sessioni.set(sessione.id, sessione);

    // "In salone" non è un pagamento: non c'è nulla da attendere.
    if (dati.modalita === "in-salone" || dati.importo === 0) {
      const subito: SessioneCheckout = { ...sessione, esito: "riuscito", importo: 0 };
      sessioni.set(sessione.id, subito);
      return subito;
    }

    await new Promise((r) => setTimeout(r, ATTESA_MS));
    const conclusa: SessioneCheckout = { ...sessione, esito: "riuscito" };
    sessioni.set(sessione.id, conclusa);
    return conclusa;
  },

  async statoCheckout(sessioneId: string): Promise<SessioneCheckout> {
    const s = sessioni.get(sessioneId);
    if (!s) {
      return {
        id: sessioneId,
        esito: "fallito",
        importo: 0,
        errore: "Sessione di pagamento non trovata.",
      };
    }
    return s;
  },
};
