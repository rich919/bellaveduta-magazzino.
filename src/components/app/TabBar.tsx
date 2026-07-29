"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icona, type NomeIcona } from "@/components/Icone";
import { useStatoApp } from "@/components/StatoApp";

const VOCI: ReadonlyArray<{ href: string; nome: string; icona: NomeIcona }> = [
  { href: "/", nome: "Home", icona: "home" },
  { href: "/servizi", nome: "Servizi", icona: "servizi" },
  { href: "/prenota", nome: "Prenota", icona: "prenota" },
  { href: "/shop", nome: "Shop", icona: "shop" },
  { href: "/profilo", nome: "Profilo", icona: "profilo" },
];

export function TabBar() {
  const percorso = usePathname();
  const { pezziNelCarrello } = useStatoApp();

  return (
    <nav className="tabbar" aria-label="Navigazione principale">
      {VOCI.map((v) => {
        // La home è attiva solo sul percorso esatto, le altre anche sulle
        // sottopagine: /servizi/s3 deve tenere accesa la voce "Servizi".
        const attivo =
          v.href === "/" ? percorso === "/" : percorso.startsWith(v.href);
        return (
          <Link
            key={v.href}
            href={v.href}
            className="tab"
            data-attivo={attivo}
            aria-current={attivo ? "page" : undefined}
          >
            <span style={{ position: "relative" }}>
              <Icona nome={v.icona} />
              {v.href === "/shop" && pezziNelCarrello > 0 && (
                <span className="badge">{pezziNelCarrello}</span>
              )}
            </span>
            {v.nome}
            <span className="pallino" />
          </Link>
        );
      })}
    </nav>
  );
}
