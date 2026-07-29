import { Suspense } from "react";
import type { Metadata } from "next";
import { ElencoServizi } from "@/components/app/ElencoServizi";

export const metadata: Metadata = {
  title: "I nostri servizi",
  description: "Il listino completo: semipermanente, semigel, ricostruzione, ceretta, viso, ciglia e massaggi.",
};

export default function PaginaServizi() {
  // useSearchParams richiede un confine di Suspense per non forzare
  // tutta la pagina al rendering dinamico.
  return (
    <Suspense fallback={<div className="vuoto">Carico il listino…</div>}>
      <ElencoServizi />
    </Suspense>
  );
}
