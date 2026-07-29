"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Faccia } from "@/components/app/Pezzi";
import { categoria, servizio } from "@/lib/data/services";
import { inSede, operatrice } from "@/lib/data/staff";
import { SEDE_PREDEFINITA, SEDI, type SedeId } from "@/lib/data/sedi";
import { eChiuso, GIORNI, MESI, ORARI, QUOTA_ACCONTO, SALONE } from "@/lib/data/salon";
import { repo } from "@/lib/store";
import type { Appuntamento } from "@/lib/store/types";
import {
  chiaveGiorno,
  dataEstesa,
  euro,
  giorniNelMese,
  oreMinuti,
} from "@/lib/date";
import { puntiPerSpesa } from "@/lib/membership";

const APRE = ORARI[1]!.apre;
const CHIUDE = ORARI[1]!.chiude;
/**
 * Altezza di un'ora nella griglia, in pixel.
 *
 * Non si può abbassare troppo: con 56px un trattamento da 10 minuti occupa
 * 9px, sotto l'altezza minima leggibile, e finisce per coprire quello dopo.
 * A 72px anche la ceretta ascelle da 10 minuti ha il suo spazio senza
 * sovrapporsi al successivo.
 */
const PX_ORA = 72;
/** Sotto questa altezza il nome del trattamento verrebbe tagliato a metà riga. */
const ALTEZZA_CON_NOME = 34;

const ETICHETTA_PAGAMENTO: Record<string, [string, string]> = {
  "in-salone": ["In salone", "salone"],
  "acconto-versato": ["Acconto versato", "acconto"],
  saldato: ["Saldato online", "saldato"],
  rimborsato: ["Rimborsato", "salone"],
};

const ETICHETTA_STATO: Record<string, string> = {
  confermato: "Confermato",
  completato: "Completato",
  annullato: "Annullato",
  "non-presentata": "Non presentata",
};

export function Cruscotto() {
  const router = useRouter();
  const [oggi] = useState(() => new Date());
  // Le due sedi hanno agende e personale diversi: si guarda una per volta.
  const [sedeId, setSedeId] = useState<SedeId>(SEDE_PREDEFINITA);
  const [mese, setMese] = useState(() => new Date());
  const [selezionato, setSelezionato] = useState(() => new Date());
  const [filtro, setFiltro] = useState<string | null>(null);
  const [appuntamenti, setAppuntamenti] = useState<Appuntamento[]>([]);
  const [densita, setDensita] = useState<Record<string, number>>({});
  const [aperto, setAperto] = useState<string | null>(null);
  const [caricamento, setCaricamento] = useState(true);

  const giornoScelto = chiaveGiorno(selezionato);

  const ricarica = useCallback(async () => {
    setCaricamento(true);
    const [delGiorno, delMese] = await Promise.all([
      repo().listaPerGiorno(sedeId, giornoScelto),
      repo().listaPerIntervallo(
        sedeId,
        chiaveGiorno(new Date(mese.getFullYear(), mese.getMonth(), 1)),
        chiaveGiorno(
          new Date(mese.getFullYear(), mese.getMonth(), giorniNelMese(mese.getFullYear(), mese.getMonth())),
        ),
      ),
    ]);
    setAppuntamenti(delGiorno);
    const conteggio: Record<string, number> = {};
    for (const a of delMese) {
      if (a.stato === "annullato") continue;
      conteggio[a.giorno] = (conteggio[a.giorno] ?? 0) + 1;
    }
    setDensita(conteggio);
    setCaricamento(false);
  }, [giornoScelto, mese, sedeId]);

  useEffect(() => {
    void ricarica();
  }, [ricarica]);

  // Se la cliente prenota in un'altra scheda, l'agenda qui si aggiorna da sola.
  useEffect(() => {
    const suCambio = () => void ricarica();
    window.addEventListener("claudia-nails:cambiato", suCambio);
    return () => window.removeEventListener("claudia-nails:cambiato", suCambio);
  }, [ricarica]);

  const attivi = useMemo(
    () => appuntamenti.filter((a) => a.stato !== "annullato"),
    [appuntamenti],
  );

  /** Chi lavora nella sede aperta: sono le colonne della griglia. */
  const personale = useMemo(() => inSede(sedeId), [sedeId]);

  const kpi = useMemo(() => {
    const incassato = attivi.reduce((n, a) => n + a.incassato, 0);
    const atteso = attivi.reduce((n, a) => n + a.prezzo, 0);
    const minuti = attivi.reduce((n, a) => n + a.durata, 0);
    const capienza = personale.length * (CHIUDE - APRE);
    const perCategoria: Record<string, number> = {};
    for (const a of attivi) {
      const s = servizio(a.servizioId);
      if (!s) continue;
      perCategoria[s.categoria] = (perCategoria[s.categoria] ?? 0) + 1;
    }
    const top = Object.entries(perCategoria).sort((x, y) => y[1] - x[1])[0];
    return {
      quanti: attivi.length,
      incassato,
      daIncassare: atteso - incassato,
      occupazione: capienza > 0 ? Math.round((minuti / capienza) * 100) : 0,
      top: top ? { nome: categoria(top[0] as never)?.etichetta ?? "—", quanti: top[1] } : null,
    };
  }, [attivi, personale]);

  const colonne = filtro ? personale.filter((o) => o.id === filtro) : personale;
  const ore = (CHIUDE - APRE) / 60;
  const chiuso = eChiuso(selezionato);

  const anno = mese.getFullYear();
  const numeroMese = mese.getMonth();
  const scarto = (new Date(anno, numeroMese, 1).getDay() + 6) % 7;

  const dettaglio = aperto ? appuntamenti.find((a) => a.id === aperto) : null;

  async function esci() {
    await fetch("/api/gestionale/login", { method: "DELETE" });
    router.replace("/gestionale/login");
    router.refresh();
  }

  return (
    <>
      <header className="adm-bar">
        <div className="adm-bar-in">
          <span className="marchio">{SALONE.nome}</span>
          <span className="adm-tag">Gestionale</span>
          <div className="sede-switch" role="group" aria-label="Sede">
            {SEDI.map((x) => (
              <button
                key={x.id}
                type="button"
                aria-pressed={sedeId === x.id}
                onClick={() => {
                  setSedeId(x.id);
                  // Il filtro punta a una persona che nell'altra sede può non
                  // esserci: azzerarlo evita una griglia vuota inspiegabile.
                  setFiltro(null);
                }}
              >
                {x.etichetta}
              </button>
            ))}
          </div>
          <div className="adm-who">
            <span>{dataEstesa(oggi)}</span>
            <button type="button" className="btn btn-2" style={{ padding: "0.35rem 0.9rem", fontSize: "0.7rem" }} onClick={esci}>
              Esci
            </button>
          </div>
        </div>
      </header>

      <div className="adm-w">
        <div className="kpis">
          {[
            ["Appuntamenti", String(kpi.quanti), `${GIORNI[selezionato.getDay()]} ${selezionato.getDate()}`, ""],
            ["Già incassato", euro(kpi.incassato), "acconti e saldi online", "pos"],
            ["Da incassare", euro(kpi.daIncassare), "alla cassa in salone", "att"],
            ["Occupazione", `${kpi.occupazione}%`, `su ${personale.length} in sede`, ""],
            [
              "Più richiesto",
              kpi.top ? kpi.top.nome : "—",
              kpi.top ? `${kpi.top.quanti} appuntamenti` : "giornata libera",
              "",
            ],
          ].map(([etichetta, valore, sotto, tono]) => (
            <div key={etichetta} className="kpi">
              <div className="l">{etichetta}</div>
              <div className={`v num ${tono}`}>{valore}</div>
              <div className="s">{sotto}</div>
            </div>
          ))}
        </div>

        <div className="adm-grid">
          <aside className="pan">
            <div className="pan-h">
              <button
                type="button"
                className="cal-nav"
                aria-label="Mese precedente"
                onClick={() => setMese(new Date(anno, numeroMese - 1, 1))}
              >
                ‹
              </button>
              <h2 style={{ flex: 1, textAlign: "center", fontSize: "0.68rem", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "var(--sans)", fontWeight: 700, color: "var(--testo)" }}>
                {MESI[numeroMese]} {anno}
              </h2>
              <button
                type="button"
                className="cal-nav"
                aria-label="Mese successivo"
                onClick={() => setMese(new Date(anno, numeroMese + 1, 1))}
              >
                ›
              </button>
            </div>
            <div style={{ padding: "0.6rem" }}>
              <div className="cal-dow" aria-hidden="true">
                {["L", "M", "M", "G", "V", "S", "D"].map((g, i) => (
                  <span key={i}>{g}</span>
                ))}
              </div>
              <div className="cal-gg">
                {Array.from({ length: scarto }, (_, i) => (
                  <span key={`v${i}`} />
                ))}
                {Array.from({ length: giorniNelMese(anno, numeroMese) }, (_, i) => {
                  const d = new Date(anno, numeroMese, i + 1);
                  const chiave = chiaveGiorno(d);
                  const quanti = densita[chiave] ?? 0;
                  return (
                    <button
                      key={i}
                      type="button"
                      className={`gg${chiave === chiaveGiorno(oggi) ? " oggi" : ""}`}
                      aria-pressed={chiave === giornoScelto}
                      disabled={eChiuso(d)}
                      onClick={() => setSelezionato(d)}
                    >
                      <span className="num">{i + 1}</span>
                      <span className="carico" aria-hidden="true">
                        {Array.from({ length: Math.min(3, Math.ceil(quanti / 6)) }, (_, j) => (
                          <i key={j} />
                        ))}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="filtri">
              <button
                type="button"
                className="filtro"
                aria-pressed={filtro === null}
                onClick={() => setFiltro(null)}
              >
                <span className="sw" style={{ background: "var(--testo-2)" }} />
                Tutte le operatrici
                <span className="n num">{attivi.length}</span>
              </button>
              {personale.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className="filtro"
                  aria-pressed={filtro === o.id}
                  onClick={() => setFiltro(o.id)}
                >
                  <span className="sw" style={{ background: `var(${o.tinta})` }} />
                  {o.nome}
                  <span className="n num">
                    {attivi.filter((a) => a.operatriceId === o.id).length}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <section className="pan">
            <div className="day-h">
              <div>
                <h2>{dataEstesa(selezionato)}</h2>
                <div className="s">
                  {chiuso
                    ? "Chiuso"
                    : `${attivi.length} appuntamenti · ${oreMinuti(APRE)} – ${oreMinuti(CHIUDE)}`}
                </div>
              </div>
              <div className="r">
                <button
                  type="button"
                  className="btn btn-2"
                  style={{ padding: "0.4rem 0.9rem", fontSize: "0.7rem" }}
                  onClick={() => {
                    setSelezionato(new Date(oggi));
                    setMese(new Date(oggi));
                  }}
                >
                  Oggi
                </button>
              </div>
            </div>

            {chiuso ? (
              <div className="vuoto">
                <h4>Chiuso</h4>
                <p>La domenica il salone è chiuso. Scegli un altro giorno dal calendario.</p>
              </div>
            ) : caricamento ? (
              <div className="vuoto">Carico l&apos;agenda…</div>
            ) : (
              <div className="scorri">
                <div
                  className="dgrid"
                  style={{
                    gridTemplateColumns: `54px repeat(${colonne.length}, minmax(120px, 1fr))`,
                    gridTemplateRows: `auto repeat(${ore}, ${PX_ORA}px)`,
                  }}
                >
                  <div className="dg-ang" />
                  {colonne.map((o) => (
                    <div key={o.id} className="dg-op">
                      <Faccia iniziali={o.iniziali} tinta={o.tinta} dimensione={22} />
                      <b>{o.nome}</b>
                      <small className="num">
                        {attivi.filter((a) => a.operatriceId === o.id).length}
                      </small>
                    </div>
                  ))}

                  {Array.from({ length: ore }, (_, i) => (
                    <div key={`h${i}`} className="dg-ora num" style={{ gridColumn: 1, gridRow: i + 2 }}>
                      {oreMinuti(APRE + i * 60)}
                    </div>
                  ))}
                  {colonne.map((_, c) =>
                    Array.from({ length: ore }, (_, i) => (
                      <div
                        key={`c${c}-${i}`}
                        className="dg-cel"
                        style={{ gridColumn: c + 2, gridRow: i + 2 }}
                      />
                    )),
                  )}

                  {colonne.map((o, c) => (
                    <div
                      key={`col${o.id}`}
                      className="dg-col"
                      style={{ gridColumn: c + 2, gridRow: `2 / span ${ore}` }}
                    >
                      {appuntamenti
                        .filter((a) => a.operatriceId === o.id)
                        .map((a) => {
                          const s = servizio(a.servizioId);
                          const cat = s ? categoria(s.categoria) : null;
                          const top = ((a.inizio - APRE) / 60) * PX_ORA;
                          const altezza = Math.max((a.durata / 60) * PX_ORA - 2, 12);
                          return (
                            <button
                              key={a.id}
                              type="button"
                              className={`app${a.stato === "annullato" ? " ann" : ""}`}
                              title={`${oreMinuti(a.inizio)} · ${a.cliente} · ${s?.nome}`}
                              style={{
                                top,
                                height: altezza,
                                background: cat ? `var(${cat.tinta})` : "var(--rosa)",
                                boxShadow: a.daOnline ? "0 0 0 2px var(--inchiostro)" : undefined,
                              }}
                              onClick={() => setAperto(a.id)}
                            >
                              {a.pagamento !== "in-salone" && (
                                <span
                                  className={`pg ${a.pagamento === "saldato" ? "pieno" : "mezzo"}`}
                                  aria-hidden="true"
                                />
                              )}
                              <b>
                                {oreMinuti(a.inizio)} {a.cliente}
                              </b>
                              {altezza >= ALTEZZA_CON_NOME && <em>{s?.nome}</em>}
                            </button>
                          );
                        })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
        <div style={{ height: "3rem" }} />
      </div>

      {/* Pannello di dettaglio */}
      <div
        className="velo-adm"
        data-open={dettaglio !== null && dettaglio !== undefined}
        onClick={() => setAperto(null)}
        aria-hidden="true"
      />
      <aside
        className="cassetto"
        data-open={dettaglio !== null && dettaglio !== undefined}
        aria-label="Dettaglio appuntamento"
      >
        {dettaglio && (
          <DettaglioAppuntamento
            appuntamento={dettaglio}
            chiudi={() => setAperto(null)}
            aggiorna={async (modifiche) => {
              await repo().aggiorna(dettaglio.id, modifiche);
              setAperto(null);
              await ricarica();
            }}
          />
        )}
      </aside>
    </>
  );
}

function DettaglioAppuntamento({
  appuntamento: a,
  chiudi,
  aggiorna,
}: {
  appuntamento: Appuntamento;
  chiudi: () => void;
  aggiorna: (modifiche: Partial<Appuntamento>) => Promise<void>;
}) {
  const s = servizio(a.servizioId);
  const cat = s ? categoria(s.categoria) : null;
  const op = operatrice(a.operatriceId);
  const [pag, classe] = ETICHETTA_PAGAMENTO[a.pagamento] ?? ["—", "salone"];
  const acconto = Math.round(a.prezzo * QUOTA_ACCONTO);

  return (
    <>
      <div className="cass-h">
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "0.65rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--testo-2)" }}>
            {cat?.nome}
          </div>
          <h2 style={{ marginTop: "0.25rem", fontSize: "1.25rem" }}>{a.cliente}</h2>
        </div>
        <button type="button" className="tondo" aria-label="Chiudi" onClick={chiudi}>
          ✕
        </button>
      </div>
      <div className="cass-b">
        {[
          ["Trattamento", s?.nome ?? "—"],
          ["Operatrice", op?.nome ?? "—"],
          ["Orario", `${oreMinuti(a.inizio)} – ${oreMinuti(a.inizio + a.durata)}`],
          ["Durata", `${a.durata} minuti`],
          ["Prezzo", euro(a.prezzo)],
        ].map(([k, v]) => (
          <div key={k} className="dr">
            <span>{k}</span>
            <b className="num">{v}</b>
          </div>
        ))}
        <div className="dr">
          <span>Pagamento</span>
          <b>
            <span className={`pillola ${classe}`}>{pag}</span>
          </b>
        </div>
        {a.pagamento === "acconto-versato" && (
          <div className="dr">
            <span>Da incassare</span>
            <b className="num">{euro(a.prezzo - acconto)}</b>
          </div>
        )}
        <div className="dr">
          <span>Punti maturati</span>
          <b style={{ color: "var(--verde)" }}>+{puntiPerSpesa(a.prezzo)}</b>
        </div>
        <div className="dr">
          <span>Stato</span>
          <b>{ETICHETTA_STATO[a.stato]}</b>
        </div>
        <div className="dr">
          <span>Telefono</span>
          <b className="num">{a.telefono}</b>
        </div>
        <div className="dr">
          <span>Origine</span>
          <b>{a.daOnline ? "Prenotato dall'app" : "Inserito in salone"}</b>
        </div>
        {a.note && (
          <p style={{ fontSize: "0.8rem", color: "var(--testo)", marginTop: "0.9rem" }}>
            {a.note}
          </p>
        )}

        <div style={{ display: "flex", gap: "0.4rem", marginTop: "1.4rem", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn btn-2"
            style={{ padding: "0.45rem 0.9rem", fontSize: "0.7rem" }}
            onClick={() => aggiorna({ stato: "annullato" })}
            disabled={a.stato === "annullato"}
          >
            Annulla
          </button>
          <button
            type="button"
            className="btn"
            style={{ padding: "0.45rem 0.9rem", fontSize: "0.7rem", marginLeft: "auto" }}
            onClick={() =>
              aggiorna({ stato: "completato", pagamento: "saldato", incassato: a.prezzo })
            }
            disabled={a.stato === "completato"}
          >
            Completato e saldato
          </button>
        </div>
      </div>
    </>
  );
}
