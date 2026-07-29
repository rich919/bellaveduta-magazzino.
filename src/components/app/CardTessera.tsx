"use client";

import Link from "next/link";
import { useStatoApp } from "@/components/StatoApp";
import { avanzamento, livelloDi, livelloSuccessivo } from "@/lib/membership";

/**
 * La tessera a punti, in home e nel profilo.
 *
 * Finché lo stato non è stato letto da localStorage mostra un segnaposto della
 * stessa altezza: senza, la card comparirebbe di colpo spostando tutto quello
 * che sta sotto.
 */
export function CardTessera({ statica = false }: { statica?: boolean }) {
  const { punti, pronto } = useStatoApp();

  if (!pronto) {
    return <div className="member member-attesa" aria-hidden="true" />;
  }

  const livello = livelloDi(punti);
  const prossimo = livelloSuccessivo(punti);
  const percentuale = avanzamento(punti);

  const contenuto = (
    <>
      <div className="member-t">Tessera {livello.nome}</div>
      <div className="member-p num">
        {punti} <small>punti</small>
      </div>
      <div className="barra">
        <i style={{ width: `${percentuale}%` }} />
      </div>
      <div className="member-n">
        {prossimo
          ? `Ti mancano ${prossimo.soglia - punti} punti per il livello ${prossimo.nome}`
          : "Sei al livello massimo. Grazie!"}
      </div>
    </>
  );

  if (statica) {
    return <div className="member">{contenuto}</div>;
  }

  return (
    <Link href="/profilo/tessera" className="member">
      {contenuto}
    </Link>
  );
}
