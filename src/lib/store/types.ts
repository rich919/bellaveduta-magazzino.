/**
 * Il contratto del layer dati.
 *
 * Tutta l'app parla solo con questa interfaccia. Oggi c'è una sola
 * implementazione, su localStorage (`local.ts`), che rende la demo utilizzabile
 * senza database. Passare a Supabase significa aggiungere un file
 * `supabase.ts` che implementa la stessa interfaccia e cambiare una riga in
 * `index.ts`: nessun componente va toccato.
 */

export type StatoAppuntamento =
  | "confermato"
  | "completato"
  | "annullato"
  | "non-presentata";

export type StatoPagamento =
  /** Paga alla cassa, come si è sempre fatto. */
  | "in-salone"
  /** Ha versato l'acconto online, il resto si salda in salone. */
  | "acconto-versato"
  /** Ha pagato l'intero importo online. */
  | "saldato"
  | "rimborsato";

export type Appuntamento = {
  id: string;
  /** In quale delle due sedi. Le agende sono separate. */
  sedeId: string;
  /** Giorno in formato YYYY-MM-DD, ora locale. */
  giorno: string;
  /** Minuti dalla mezzanotte. */
  inizio: number;
  /** Minuti. Copiata dal servizio al momento della creazione, perché il
   *  listino può cambiare e l'appuntamento passato deve restare com'era. */
  durata: number;
  operatriceId: string;
  servizioId: string;
  /** Anche il prezzo è congelato qui, per lo stesso motivo. */
  prezzo: number;
  cliente: string;
  telefono: string;
  note: string;
  stato: StatoAppuntamento;
  pagamento: StatoPagamento;
  /** Quanto è già stato incassato online, in euro. */
  incassato: number;
  /** ISO. */
  creatoIl: string;
  /** true se è arrivato dal sito pubblico e non da inserimento manuale. */
  daOnline: boolean;
};

export type NuovoAppuntamento = Omit<Appuntamento, "id" | "creatoIl">;

export interface AppointmentsRepo {
  /** Estremi inclusi, entrambi in formato YYYY-MM-DD. */
  listaPerIntervallo(
    sedeId: string,
    da: string,
    a: string,
    operatriceId?: string,
  ): Promise<Appuntamento[]>;
  listaPerGiorno(sedeId: string, giorno: string): Promise<Appuntamento[]>;
  crea(dati: NuovoAppuntamento): Promise<Appuntamento>;
  aggiorna(
    id: string,
    modifiche: Partial<Omit<Appuntamento, "id">>,
  ): Promise<Appuntamento>;
  elimina(id: string): Promise<void>;
  /** Svuota e riscrive il seed. Usato dal pulsante di ripristino demo. */
  reimposta(): Promise<void>;
}
