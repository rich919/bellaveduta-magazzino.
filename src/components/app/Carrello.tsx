"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Testata } from "@/components/app/Testata";
import { Foto } from "@/components/app/Pezzi";
import { useStatoApp } from "@/components/StatoApp";
import { COSTO_SPEDIZIONE, prodotto, SPEDIZIONE_GRATIS_DA } from "@/lib/data/products";
import { euro } from "@/lib/date";
import { puntiPerSpesa, puntiSpesiPer, scontoDisponibile } from "@/lib/membership";
import { provider } from "@/lib/payments";

export function Carrello() {
  const router = useRouter();
  const {
    carrello,
    punti,
    pronto,
    cambiaQuantita,
    registraOrdine,
    totaleCarrello,
  } = useStatoApp();
  const [usaPunti, setUsaPunti] = useState(false);
  const [inCorso, setInCorso] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);

  if (!pronto) {
    return (
      <>
        <Testata titolo="Carrello" indietroA="/shop" />
        <div className="vuoto">Un attimo…</div>
      </>
    );
  }

  if (carrello.length === 0) {
    return (
      <>
        <Testata titolo="Carrello" indietroA="/shop" />
        <div className="vuoto">
          <h4>Il carrello è vuoto</h4>
          <p>Ogni euro speso nello shop vale un punto sulla tua tessera.</p>
          <Link href="/shop" className="btn" style={{ marginTop: "1rem" }}>
            Vai allo shop
          </Link>
        </div>
      </>
    );
  }

  const spedizione = totaleCarrello >= SPEDIZIONE_GRATIS_DA ? 0 : COSTO_SPEDIZIONE;
  const scontoMassimo = scontoDisponibile(punti, totaleCarrello);
  const sconto = usaPunti ? scontoMassimo : 0;
  const totale = totaleCarrello + spedizione - sconto;

  async function paga() {
    setInCorso(true);
    setErrore(null);
    try {
      const sessione = await provider().creaCheckout({
        importo: totale,
        totale,
        modalita: "saldo",
        descrizione: `Ordine shop — ${carrello.length} articoli`,
        cliente: "Elena Ricci",
      });
      if (sessione.esito !== "riuscito") {
        setErrore(sessione.errore ?? "Il pagamento non è andato a buon fine.");
        setInCorso(false);
        return;
      }
      registraOrdine(puntiSpesiPer(sconto), totaleCarrello);
      router.push("/shop?ordine=ok");
    } catch {
      setErrore("Qualcosa è andato storto. Riprova fra un momento.");
      setInCorso(false);
    }
  }

  return (
    <>
      <Testata titolo="Carrello" indietroA="/shop" />

      <div className="pad">
        {carrello.map((v) => {
          const p = prodotto(v.prodottoId);
          if (!p) return null;
          return (
            <div key={v.prodottoId} className="card carrello-riga">
              <Foto src={p.immagine} alt="" className="carrello-foto" sizes="70px" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <b>{p.nome}</b>
                <small className="num">{euro(p.prezzo)}</small>
              </div>
              <div className="qta">
                <button
                  type="button"
                  onClick={() => cambiaQuantita(v.prodottoId, -1)}
                  aria-label={`Togli un ${p.nome}`}
                >
                  −
                </button>
                <span className="num">{v.quantita}</span>
                <button
                  type="button"
                  onClick={() => cambiaQuantita(v.prodottoId, 1)}
                  aria-label={`Aggiungi un ${p.nome}`}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card usa-punti">
        <div>
          <b>Usa i tuoi punti</b>
          <small>
            {scontoMassimo > 0
              ? `Hai ${punti} punti · sconto fino a ${euro(scontoMassimo)}`
              : `Hai ${punti} punti · servono più punti per uno sconto su questo ordine`}
          </small>
        </div>
        <button
          type="button"
          className="interr"
          aria-pressed={usaPunti}
          aria-label="Usa i punti su questo ordine"
          disabled={scontoMassimo === 0}
          onClick={() => setUsaPunti((v) => !v)}
        >
          <i />
        </button>
      </div>

      <div className="card conto">
        <div>
          <span>Prodotti</span>
          <b className="num">{euro(totaleCarrello)}</b>
        </div>
        <div>
          <span>Spedizione</span>
          <b className="num">{spedizione === 0 ? "Gratis" : euro(spedizione)}</b>
        </div>
        {sconto > 0 && (
          <div>
            <span className="guad">Sconto punti</span>
            <b className="guad">− {euro(sconto)}</b>
          </div>
        )}
        <div className="tot">
          <span>Totale</span>
          <b className="num">{euro(totale)}</b>
        </div>
        <div>
          <span className="guad">
            {usaPunti ? "Punti che spendi" : "Punti che guadagni"}
          </span>
          <b className="guad">
            {usaPunti
              ? `− ${puntiSpesiPer(sconto)}`
              : `+${puntiPerSpesa(totaleCarrello)}`}
          </b>
        </div>
      </div>

      {provider().simulato && (
        <p className="pad" style={{ fontSize: "0.72rem", color: "var(--testo-2)", marginTop: "0.8rem" }}>
          Prototipo: nessun pagamento viene incassato davvero.
        </p>
      )}

      {errore && (
        <p className="errore pad" role="alert">
          {errore}
        </p>
      )}

      <div className="prima-di-cta" />
      <div className="cta-fissa">
        <button type="button" className="btn btn-lg" onClick={paga} disabled={inCorso}>
          {inCorso ? "Un attimo…" : `Paga ${euro(totale)}`}
        </button>
      </div>
    </>
  );
}
