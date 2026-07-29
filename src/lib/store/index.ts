/**
 * Punto unico da cui l'app ottiene il layer dati.
 *
 * Per passare a Supabase: scrivere `supabase.ts` che implementa
 * `AppointmentsRepo`, importarlo qui e cambiare il return di `repo()`.
 * Nient'altro nell'app va toccato.
 */

import { repoLocale } from "./local";
import type { AppointmentsRepo } from "./types";

export function repo(): AppointmentsRepo {
  return repoLocale;
}

export type {
  Appuntamento,
  AppointmentsRepo,
  NuovoAppuntamento,
  StatoAppuntamento,
  StatoPagamento,
} from "./types";
