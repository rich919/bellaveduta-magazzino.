"use client";

import { useStatoApp } from "@/components/StatoApp";
import { prodotto } from "@/lib/data/products";
import { euro } from "@/lib/date";

/**
 * Aggiunge un prodotto al carrello.
 *
 * In versione compatta è la pillola dentro le card; in versione estesa è il
 * bottone grande della scheda prodotto. Quando il prodotto è già dentro lo
 * dice, invece di far sembrare che il tocco non abbia funzionato.
 */
export function BottoneAggiungi({
  prodottoId,
  compatto = false,
}: {
  prodottoId: string;
  compatto?: boolean;
}) {
  const { carrello, aggiungiAlCarrello, pronto } = useStatoApp();
  const p = prodotto(prodottoId);
  if (!p) return null;

  const dentro = carrello.find((v) => v.prodottoId === prodottoId);

  if (compatto) {
    return (
      <button
        type="button"
        className={`mini${dentro ? " fatto" : ""}`}
        onClick={() => aggiungiAlCarrello(prodottoId)}
        aria-label={`Aggiungi ${p.nome} al carrello`}
      >
        {dentro ? `✓ ${dentro.quantita}` : "Aggiungi"}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`btn btn-lg${dentro ? " btn-2" : ""}`}
      onClick={() => aggiungiAlCarrello(prodottoId)}
      disabled={!pronto}
    >
      {dentro
        ? `Nel carrello (${dentro.quantita}) — aggiungi ancora`
        : `Aggiungi al carrello — ${euro(p.prezzo)}`}
    </button>
  );
}
