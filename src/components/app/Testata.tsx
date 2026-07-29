"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icona } from "@/components/Icone";
import { useStatoApp } from "@/components/StatoApp";

/**
 * Testata delle schermate interne: freccia indietro, titolo centrato, e uno
 * spazio a destra della stessa larghezza della freccia — senza, il titolo
 * risulterebbe spostato verso destra invece che centrato.
 */
export function Testata({
  titolo,
  indietroA,
  conCarrello = false,
}: {
  titolo: string;
  /** Se assente usa la cronologia del browser. */
  indietroA?: string;
  conCarrello?: boolean;
}) {
  const router = useRouter();
  const { pezziNelCarrello } = useStatoApp();

  return (
    <div className="app-head">
      {indietroA ? (
        <Link href={indietroA} className="tondo" aria-label="Indietro">
          <Icona nome="indietro" style={{ width: 17, height: 17 }} />
        </Link>
      ) : (
        <button
          type="button"
          className="tondo"
          aria-label="Indietro"
          onClick={() => router.back()}
        >
          <Icona nome="indietro" style={{ width: 17, height: 17 }} />
        </button>
      )}

      <div className="titolo-schermo">{titolo}</div>

      {conCarrello ? (
        <Link href="/carrello" className="tondo" aria-label="Carrello">
          <Icona nome="shop" style={{ width: 17, height: 17 }} />
          {pezziNelCarrello > 0 && <span className="badge">{pezziNelCarrello}</span>}
        </Link>
      ) : (
        <span style={{ width: 34, flex: "none" }} />
      )}
    </div>
  );
}
