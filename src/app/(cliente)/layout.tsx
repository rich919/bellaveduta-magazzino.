import { ProviderStatoApp } from "@/components/StatoApp";
import { TabBar } from "@/components/app/TabBar";

/**
 * Guscio dell'app cliente.
 *
 * Su desktop l'interfaccia sta dentro una cornice di telefono, perché è pensata
 * per il telefono ed è lì che le clienti prenoteranno davvero; mostrarla a
 * tutta larghezza su uno schermo grande la farebbe sembrare un sito storto.
 * Sotto i 700px la cornice sparisce e l'app occupa tutto lo schermo.
 */
export default function LayoutCliente({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ProviderStatoApp>
      <div className="scena">
        <div className="telefono">
          <div className="notch" aria-hidden="true" />
          <div className="statusbar" aria-hidden="true">
            <span className="num">9:41</span>
            <span>▮▮▮ ᯤ ▰</span>
          </div>
          <div className="schermo">{children}</div>
          <TabBar />
        </div>
      </div>
    </ProviderStatoApp>
  );
}
