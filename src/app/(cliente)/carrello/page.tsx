import type { Metadata } from "next";
import { Carrello } from "@/components/app/Carrello";

export const metadata: Metadata = { title: "Carrello" };

export default function PaginaCarrello() {
  return <Carrello />;
}
