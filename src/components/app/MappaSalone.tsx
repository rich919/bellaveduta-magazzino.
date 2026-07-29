import { SALONE } from "@/lib/data/salon";

/**
 * Mappa del salone.
 *
 * È l'iframe ufficiale di Google Maps in modalità `output=embed`, che non
 * richiede chiave API né fatturazione: basta la query dell'indirizzo.
 * `loading="lazy"` perché la mappa compare in fondo alla home e non deve
 * rallentare il primo caricamento.
 */
export function MappaSalone({
  altezza = 200,
  query: indirizzo,
}: {
  altezza?: number;
  /** Se assente usa la sede storica di Garbatella. */
  query?: string;
}) {
  const query = encodeURIComponent(
    indirizzo ??
      `${SALONE.nome} ${SALONE.quartiere}, ${SALONE.indirizzo}, ${SALONE.cap} ${SALONE.citta}`,
  );

  return (
    <div className="mappa" style={{ height: altezza }}>
      <iframe
        title={`Mappa di ${indirizzo ?? SALONE.indirizzo}`}
        src={`https://maps.google.com/maps?q=${query}&z=16&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
