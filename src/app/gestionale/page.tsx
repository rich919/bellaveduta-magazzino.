import { Cruscotto } from "@/components/admin/Cruscotto";
import { gestionaleAperto } from "@/lib/auth";

/**
 * Va reso dinamico a mano.
 *
 * Di default Next prerenderizza questa pagina durante il build, quando
 * GESTIONALE_SENZA_PASSWORD non è ancora nell'ambiente: l'HTML finirebbe
 * congelato con `senzaPassword={false}` e l'avviso della demo non comparirebbe
 * mai, pur essendo il gestionale davvero aperto a tutti. È esattamente il tipo
 * di incoerenza che non deve esistere su un avviso di sicurezza.
 */
export const dynamic = "force-dynamic";

export default function PaginaGestionale() {
  // Letto sul server a ogni richiesta: il client non può fingere di essere in demo.
  return <Cruscotto senzaPassword={gestionaleAperto()} />;
}
