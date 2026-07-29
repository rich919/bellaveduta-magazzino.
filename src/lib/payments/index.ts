/**
 * Punto unico da cui l'app ottiene il provider di pagamento.
 *
 * Per attivare Stripe: scrivere `stripe.ts` che implementa `PaymentProvider`
 * e restituirlo qui quando le chiavi sono configurate. Il fallback resta il
 * simulato, così la demo continua a funzionare anche senza credenziali.
 */

import { providerSimulato } from "./mock";
import type { PaymentProvider } from "./types";

export function provider(): PaymentProvider {
  return providerSimulato;
}

export { importoDovuto } from "./types";
export type {
  DatiCheckout,
  EsitoPagamento,
  ModalitaPagamento,
  PaymentProvider,
  SessioneCheckout,
} from "./types";
