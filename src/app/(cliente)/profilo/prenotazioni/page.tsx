import type { Metadata } from "next";
import { MiePrenotazioni } from "@/components/app/MiePrenotazioni";

export const metadata: Metadata = { title: "Le mie prenotazioni" };

export default function PaginaMiePrenotazioni() {
  return <MiePrenotazioni />;
}
