"use client";

import { useStatoApp } from "@/components/StatoApp";
import { SEDI, type SedeId } from "@/lib/data/sedi";

/**
 * Scelta della sede.
 *
 * Non è un dettaglio secondario: le due sedi hanno agende, personale e listini
 * diversi — il parrucchiere c'è solo alla Montagnola — quindi tutto quello che
 * la cliente vede dopo dipende da questa scelta. Per questo sta in alto e resta
 * visibile, invece di essere nascosta in un menu.
 */
export function SelettoreSede({
  compatto = false,
  /** Mostra solo queste sedi. Serve sulla scheda di un trattamento che non
   *  tutte offrono. */
  soloSedi,
  onCambio,
}: {
  compatto?: boolean;
  soloSedi?: readonly SedeId[];
  onCambio?: (sedeId: SedeId) => void;
}) {
  const { sedeId, scegliSede, pronto } = useStatoApp();
  const elenco = soloSedi ? SEDI.filter((s) => soloSedi.includes(s.id)) : SEDI;

  if (elenco.length <= 1) return null;

  function cambia(id: SedeId) {
    scegliSede(id);
    onCambio?.(id);
  }

  if (compatto) {
    return (
      <div className="sede-switch" role="group" aria-label="Sede">
        {elenco.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={pronto && sedeId === s.id}
            onClick={() => cambia(s.id)}
          >
            {s.etichetta}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="sede-scelta">
      {elenco.map((s) => (
        <button
          key={s.id}
          type="button"
          className="sede-card"
          aria-pressed={pronto && sedeId === s.id}
          onClick={() => cambia(s.id)}
        >
          <b>{s.etichetta}</b>
          <small>{s.indirizzo}</small>
          {s.categorieEscluse.length === 0 && <em>anche parrucchiere</em>}
        </button>
      ))}
    </div>
  );
}
