import { Suspense } from "react";
import type { Metadata } from "next";
import { Prenotazione } from "@/components/app/Prenotazione";

export const metadata: Metadata = {
  title: "Prenota",
  description: "Scegli trattamento, operatrice, giorno e orario. Paghi in salone o online.",
};

export default function PaginaPrenota() {
  return (
    <Suspense fallback={<div className="vuoto">Preparo il calendario…</div>}>
      <Prenotazione />
    </Suspense>
  );
}
