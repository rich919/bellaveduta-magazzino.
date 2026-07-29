"use client";

/**
 * Stato del cliente: carrello, punti tessera, prenotazioni personali.
 *
 * Vive in un context perché serve alla tab bar (badge del carrello), alla home
 * (card punti), al carrello e alla conferma di prenotazione — cioè in rami
 * diversi dell'albero.
 *
 * Persistito su localStorage, come gli appuntamenti. Vale lo stesso limite:
 * è per-browser, non condiviso. Con Supabase diventerà una riga per cliente.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { prodotto } from "@/lib/data/products";
import { SEDE_PREDEFINITA, type SedeId } from "@/lib/data/sedi";
import { puntiPerSpesa } from "@/lib/membership";

export type VoceCarrello = { prodottoId: string; quantita: number };

export type MiaPrenotazione = {
  appuntamentoId: string;
  giorno: string;
  inizio: number;
  servizioId: string;
  operatriceId: string;
  prezzo: number;
};

type Stato = {
  /** La sede scelta dalla cliente: si decide una volta e resta. */
  sedeId: SedeId;
  carrello: VoceCarrello[];
  punti: number;
  prenotazioni: MiaPrenotazione[];
  /** false finché non abbiamo letto localStorage: evita il flash di dati sbagliati. */
  pronto: boolean;
};

type Azioni = {
  scegliSede: (sedeId: SedeId) => void;
  aggiungiAlCarrello: (prodottoId: string) => void;
  cambiaQuantita: (prodottoId: string, delta: number) => void;
  svuotaCarrello: () => void;
  registraOrdine: (puntiSpesi: number, spesa: number) => void;
  registraPrenotazione: (p: MiaPrenotazione) => void;
  pezziNelCarrello: number;
  totaleCarrello: number;
};

const CHIAVE = "claudia-nails:cliente:v2";

/** Punti di partenza della cliente dimostrativa, per non mostrare una tessera vuota. */
const PUNTI_INIZIALI = 340;

const INIZIALE: Stato = {
  sedeId: SEDE_PREDEFINITA,
  carrello: [],
  punti: PUNTI_INIZIALI,
  prenotazioni: [],
  pronto: false,
};

const Ctx = createContext<(Stato & Azioni) | null>(null);

export function ProviderStatoApp({ children }: { children: ReactNode }) {
  const [stato, setStato] = useState<Stato>(INIZIALE);

  // Lettura solo dopo il mount: leggere localStorage durante il render
  // farebbe divergere HTML del server e del client.
  useEffect(() => {
    try {
      const grezzo = window.localStorage.getItem(CHIAVE);
      if (grezzo) {
        const dati = JSON.parse(grezzo) as Partial<Stato>;
        setStato({
          sedeId: dati.sedeId ?? SEDE_PREDEFINITA,
          carrello: Array.isArray(dati.carrello) ? dati.carrello : [],
          punti: typeof dati.punti === "number" ? dati.punti : PUNTI_INIZIALI,
          prenotazioni: Array.isArray(dati.prenotazioni) ? dati.prenotazioni : [],
          pronto: true,
        });
        return;
      }
    } catch {
      // Dati illeggibili o storage negato: si riparte dallo stato iniziale.
    }
    setStato((s) => ({ ...s, pronto: true }));
  }, []);

  useEffect(() => {
    if (!stato.pronto) return;
    try {
      // `pronto` è stato di runtime, non va salvato.
      window.localStorage.setItem(
        CHIAVE,
        JSON.stringify({
          sedeId: stato.sedeId,
          carrello: stato.carrello,
          punti: stato.punti,
          prenotazioni: stato.prenotazioni,
        }),
      );
    } catch {
      // Storage pieno o negato: la sessione corrente funziona lo stesso.
    }
  }, [stato]);

  const scegliSede = useCallback((sedeId: SedeId) => {
    setStato((s) => ({ ...s, sedeId }));
  }, []);

  const aggiungiAlCarrello = useCallback((prodottoId: string) => {
    setStato((s) => {
      const dentro = s.carrello.find((v) => v.prodottoId === prodottoId);
      return {
        ...s,
        carrello: dentro
          ? s.carrello.map((v) =>
              v.prodottoId === prodottoId ? { ...v, quantita: v.quantita + 1 } : v,
            )
          : [...s.carrello, { prodottoId, quantita: 1 }],
      };
    });
  }, []);

  const cambiaQuantita = useCallback((prodottoId: string, delta: number) => {
    setStato((s) => ({
      ...s,
      carrello: s.carrello
        .map((v) =>
          v.prodottoId === prodottoId ? { ...v, quantita: v.quantita + delta } : v,
        )
        .filter((v) => v.quantita > 0),
    }));
  }, []);

  const svuotaCarrello = useCallback(() => {
    setStato((s) => ({ ...s, carrello: [] }));
  }, []);

  const registraOrdine = useCallback((puntiSpesi: number, spesa: number) => {
    setStato((s) => ({
      ...s,
      carrello: [],
      // Chi paga con i punti non ne accumula altri sullo stesso ordine.
      punti: s.punti - puntiSpesi + (puntiSpesi > 0 ? 0 : puntiPerSpesa(spesa)),
    }));
  }, []);

  const registraPrenotazione = useCallback((p: MiaPrenotazione) => {
    setStato((s) => ({
      ...s,
      prenotazioni: [...s.prenotazioni, p],
      punti: s.punti + puntiPerSpesa(p.prezzo),
    }));
  }, []);

  const pezziNelCarrello = useMemo(
    () => stato.carrello.reduce((n, v) => n + v.quantita, 0),
    [stato.carrello],
  );

  const totaleCarrello = useMemo(
    () =>
      stato.carrello.reduce((n, v) => {
        const p = prodotto(v.prodottoId);
        return n + (p ? p.prezzo * v.quantita : 0);
      }, 0),
    [stato.carrello],
  );

  const valore = useMemo(
    () => ({
      ...stato,
      scegliSede,
      aggiungiAlCarrello,
      cambiaQuantita,
      svuotaCarrello,
      registraOrdine,
      registraPrenotazione,
      pezziNelCarrello,
      totaleCarrello,
    }),
    [
      stato,
      scegliSede,
      aggiungiAlCarrello,
      cambiaQuantita,
      svuotaCarrello,
      registraOrdine,
      registraPrenotazione,
      pezziNelCarrello,
      totaleCarrello,
    ],
  );

  return <Ctx.Provider value={valore}>{children}</Ctx.Provider>;
}

export function useStatoApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStatoApp va usato dentro ProviderStatoApp");
  return v;
}
