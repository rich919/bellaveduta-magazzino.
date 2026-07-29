import type { Metadata } from "next";
import { Negozio } from "@/components/app/Negozio";

export const metadata: Metadata = {
  title: "Shop",
  description: "Styling ghd e prodotti di cura mani e piedi. Ogni euro speso vale un punto tessera.",
};

export default function PaginaShop() {
  return <Negozio />;
}
