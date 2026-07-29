/**
 * Il contratto del layer pagamenti.
 *
 * Stessa idea del layer dati: l'app conosce solo questa interfaccia.
 * Oggi c'è `mock.ts`, che simula. Domani `stripe.ts` implementerà la stessa
 * interfaccia con Checkout Session e webhook, e i componenti resteranno uguali.
 *
 * Nota importante sul perché non esiste un `numeroCarta` qui dentro: i dati
 * della carta non devono mai passare dalla nostra applicazione. Con Stripe la
 * pagina di pagamento è ospitata da loro, noi riceviamo solo un identificativo
 * di sessione e l'esito. L'interfaccia è disegnata per quel flusso.
 */

export type ModalitaPagamento =
  /** Nessun addebito ora, si paga alla cassa. */
  | "in-salone"
  /** Intero importo adesso. */
  | "saldo";

export type EsitoPagamento = "in-attesa" | "riuscito" | "fallito" | "annullato";

export type DatiCheckout = {
  /** In euro. Zero per "in-salone". */
  importo: number;
  /** Totale del trattamento, per mostrare quanto resta da saldare. */
  totale: number;
  modalita: ModalitaPagamento;
  descrizione: string;
  cliente: string;
  email?: string;
};

export type SessioneCheckout = {
  id: string;
  esito: EsitoPagamento;
  importo: number;
  /** Con Stripe: l'URL di Checkout su cui reindirizzare. */
  urlPagamento?: string;
  /** Presente quando l'esito è "fallito". */
  errore?: string;
};

export interface PaymentProvider {
  /** Nome leggibile, mostrato nell'interfaccia. */
  readonly nome: string;
  /** true finché non è un incasso vero: l'interfaccia lo dichiara alla cliente. */
  readonly simulato: boolean;
  creaCheckout(dati: DatiCheckout): Promise<SessioneCheckout>;
  statoCheckout(sessioneId: string): Promise<SessioneCheckout>;
}

/** Quanto va incassato adesso, dato il totale e la modalità scelta. */
export function importoDovuto(totale: number, modalita: ModalitaPagamento): number {
  return modalita === "in-salone" ? 0 : totale;
}
