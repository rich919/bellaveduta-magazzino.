import type { Metadata } from "next";
import { Tessera } from "@/components/app/Tessera";

export const metadata: Metadata = { title: "Tessera e premi" };

export default function PaginaTessera() {
  return <Tessera />;
}
