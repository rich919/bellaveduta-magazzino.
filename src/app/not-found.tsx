import Link from "next/link";

export default function NonTrovata() {
  return (
    <div className="scena">
      <div className="telefono">
        <div className="schermo">
          <div className="vuoto" style={{ paddingTop: "6rem" }}>
            <h1 style={{ fontSize: "1.4rem", color: "var(--inchiostro)" }}>
              Pagina non trovata
            </h1>
            <p style={{ marginTop: "0.6rem" }}>
              Il collegamento che hai seguito non porta da nessuna parte.
            </p>
            <Link href="/" className="btn" style={{ marginTop: "1.4rem" }}>
              Torna alla home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
