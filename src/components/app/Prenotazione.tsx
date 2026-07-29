"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Icona } from "@/components/Icone";
import { Faccia, Foto, fotoCategoria, RigaServizio } from "@/components/app/Pezzi";
import { SelettoreSede } from "@/components/app/SelettoreSede";
import { useStatoApp } from "@/components/StatoApp";
import { SERVIZI, servizio } from "@/lib/data/services";
import {
  abilitatePer,
  NESSUNA_PREFERENZA,
  operatrice,
} from "@/lib/data/staff";
import { eChiuso, GIORNI, MESI } from "@/lib/data/salon";
import { sede, sediPerCategoria } from "@/lib/data/sedi";
import { raggruppaPerFascia, slotLiberi, type Slot } from "@/lib/booking/slots";
import { repo } from "@/lib/store";
import type { Appuntamento } from "@/lib/store/types";
import { importoDovuto, provider, type ModalitaPagamento } from "@/lib/payments";
import { chiaveGiorno, euro, giorniNelMese, oreMinuti } from "@/lib/date";
import { puntiPerSpesa } from "@/lib/membership";

type Fase = "scelta" | "compilazione" | "pagamento" | "fatto";

/**
 * Riporta la schermata in cima.
 *
 * Ce ne sono due di contenitori che scorrono, a seconda della larghezza:
 * sopra i 700px scorre `.schermo` dentro la cornice del telefono, sotto
 * scorre la finestra. Riportarne su uno solo lascia l'altro dov'era, ed è
 * esattamente il caso che rompeva la conferma.
 */
function tornaSu() {
  window.scrollTo(0, 0);
  document.querySelector(".schermo")?.scrollTo(0, 0);
}

export function Prenotazione() {
  const parametri = useSearchParams();
  const { sedeId, registraPrenotazione } = useStatoApp();

  const [servizioId, setServizioId] = useState<string | null>(
    parametri.get("servizio"),
  );
  const [operatriceId, setOperatriceId] = useState<string>(NESSUNA_PREFERENZA);
  const [mese, setMese] = useState(() => new Date());
  const [giorno, setGiorno] = useState<Date | null>(null);
  const [slotScelto, setSlotScelto] = useState<Slot | null>(null);
  const [modalita, setModalita] = useState<ModalitaPagamento>("in-salone");
  const [fase, setFase] = useState<Fase>("scelta");
  const [foglioAperto, setFoglioAperto] = useState(false);
  const [errore, setErrore] = useState<string | null>(null);

  const [appuntamentiDelGiorno, setAppuntamentiDelGiorno] = useState<Appuntamento[]>([]);
  const [caricamentoSlot, setCaricamentoSlot] = useState(false);

  const srv = servizioId ? servizio(servizioId) : null;

  /*
   * Ogni passo del wizard sostituisce l'intera schermata, ma il browser tiene
   * la posizione di scorrimento di quella precedente. Il pulsante di conferma
   * sta in fondo a una pagina lunga: senza questo, confermando ci si ritrova
   * nel footer invece che davanti alla conferma.
   */
  const schermata = !srv ? "scelta-servizio" : fase === "fatto" ? "fatto" : "wizard";
  const schermataPrec = useRef(schermata);
  useEffect(() => {
    // Non al primo render: lì ci pensa già la navigazione di Next, e forzarlo
    // calpesterebbe il ripristino della posizione quando si torna indietro.
    if (schermataPrec.current !== schermata) {
      schermataPrec.current = schermata;
      tornaSu();
    }
  }, [schermata]);

  // Ogni cambio di giorno rilegge l'agenda: gli slot dipendono da cosa c'è già.
  useEffect(() => {
    if (!giorno) {
      setAppuntamentiDelGiorno([]);
      return;
    }
    let annullato = false;
    setCaricamentoSlot(true);
    repo()
      .listaPerGiorno(sedeId, chiaveGiorno(giorno))
      .then((a) => {
        if (!annullato) setAppuntamentiDelGiorno(a);
      })
      .finally(() => {
        if (!annullato) setCaricamentoSlot(false);
      });
    return () => {
      annullato = true;
    };
  }, [giorno, sedeId]);

  const slot = useMemo(() => {
    if (!giorno || !servizioId) return [];
    return slotLiberi({
      data: giorno,
      servizioId,
      sedeId,
      operatriceId,
      appuntamenti: appuntamentiDelGiorno,
    });
  }, [giorno, servizioId, sedeId, operatriceId, appuntamentiDelGiorno]);

  const { mattina, pomeriggio } = useMemo(() => raggruppaPerFascia(slot), [slot]);

  const conferma = useCallback(async () => {
    if (!srv || !giorno || !slotScelto) return;
    setErrore(null);
    setFase("pagamento");

    const importo = importoDovuto(srv.prezzo, modalita);

    try {
      const sessione = await provider().creaCheckout({
        importo,
        totale: srv.prezzo,
        modalita,
        descrizione: srv.nome,
        cliente: "Elena Ricci",
      });

      if (sessione.esito !== "riuscito") {
        setErrore(sessione.errore ?? "Il pagamento non è andato a buon fine. Riprova.");
        setFase("compilazione");
        return;
      }

      // Rileggo l'agenda un attimo prima di scrivere: fra la scelta dello slot
      // e la conferma qualcun altro potrebbe averlo preso.
      const aggiornati = await repo().listaPerGiorno(sedeId, chiaveGiorno(giorno));
      const ancoraLibero = slotLiberi({
        data: giorno,
        servizioId: srv.id,
        sedeId,
        operatriceId,
        appuntamenti: aggiornati,
      }).some(
        (s) => s.inizio === slotScelto.inizio && s.operatriceId === slotScelto.operatriceId,
      );

      if (!ancoraLibero) {
        setErrore(
          "Quell'orario è appena stato prenotato da qualcun altro. Scegline un altro.",
        );
        setAppuntamentiDelGiorno(aggiornati);
        setSlotScelto(null);
        setFase("compilazione");
        return;
      }

      const creato = await repo().crea({
        sedeId,
        giorno: chiaveGiorno(giorno),
        inizio: slotScelto.inizio,
        durata: srv.durata,
        operatriceId: slotScelto.operatriceId,
        servizioId: srv.id,
        prezzo: srv.prezzo,
        cliente: "Elena Ricci",
        telefono: "340 1234567",
        note: "Prenotato dall'app.",
        stato: "confermato",
        pagamento: modalita === "in-salone" ? "in-salone" : "saldato",
        incassato: importo,
        daOnline: true,
      });

      registraPrenotazione({
        appuntamentoId: creato.id,
        giorno: creato.giorno,
        inizio: creato.inizio,
        servizioId: creato.servizioId,
        operatriceId: creato.operatriceId,
        prezzo: creato.prezzo,
      });

      setFase("fatto");
    } catch {
      setErrore("Qualcosa è andato storto. Riprova fra un momento.");
      setFase("compilazione");
    }
  }, [srv, giorno, slotScelto, modalita, sedeId, operatriceId, registraPrenotazione]);

  /* ── Nessun trattamento scelto ────────────────────────────────── */
  if (!srv) {
    return (
      <>
        <div className="app-head">
          <span style={{ width: 34, flex: "none" }} />
          <h1 className="titolo-schermo">Prenota</h1>
          <span style={{ width: 34, flex: "none" }} />
        </div>
        <p className="pad" style={{ fontSize: "0.84rem", color: "var(--testo)" }}>
          Da cosa cominciamo?
        </p>
        <div className="pad" style={{ marginTop: "0.9rem" }}>
          {SERVIZI.filter((s) => s.verificato)
            .slice(0, 8)
            .map((s) => (
              <RigaServizio key={s.id} servizio={s} onScegli={setServizioId} />
            ))}
          <Link href="/servizi" className="btn btn-2 btn-lg" style={{ marginTop: "0.4rem" }}>
            Vedi tutti i trattamenti
          </Link>
        </div>
        <div style={{ height: "1.4rem" }} />
      </>
    );
  }

  /* ── Confermato ───────────────────────────────────────────────── */
  if (fase === "fatto" && giorno && slotScelto) {
    const op = operatrice(slotScelto.operatriceId);
    return (
      <>
        <div className="app-head">
          <span style={{ width: 34, flex: "none" }} />
          <h1 className="titolo-schermo">Prenotato</h1>
          <span style={{ width: 34, flex: "none" }} />
        </div>
        <div className="fatto">
          <div className="cerchio" aria-hidden="true">
            ✓
          </div>
          <h2 style={{ fontSize: "1.4rem" }}>
            Ci vediamo {GIORNI[giorno.getDay()].toLowerCase()}
          </h2>
          <p style={{ color: "var(--testo)", fontSize: "0.85rem", marginTop: "0.4rem" }}>
            Ti mandiamo il promemoria via SMS il giorno prima.
          </p>
          <div className="scontrino">
            <div>
              <span>Trattamento</span>
              <b>{srv.nome}</b>
            </div>
            <div>
              <span>Con</span>
              <b>{op?.nome}</b>
            </div>
            <div>
              <span>Dove</span>
              <b>{sede(sedeId)?.etichetta}</b>
            </div>
            <div>
              <span>Quando</span>
              <b>
                {GIORNI[giorno.getDay()]} {giorno.getDate()} {MESI[giorno.getMonth()]},{" "}
                {oreMinuti(slotScelto.inizio)}
              </b>
            </div>
            <div>
              <span>Durata</span>
              <b className="num">{srv.durata} minuti</b>
            </div>
            <div>
              <span>Totale</span>
              <b className="num">{euro(srv.prezzo)}</b>
            </div>
            <div>
              <span>Pagamento</span>
              <b>
                {modalita === "in-salone" ? "In salone" : "Saldato online"}
              </b>
            </div>
            <div>
              <span>Punti guadagnati</span>
              <b style={{ color: "var(--verde)" }}>+{puntiPerSpesa(srv.prezzo)}</b>
            </div>
          </div>
          <Link href="/profilo/prenotazioni" className="btn btn-lg" style={{ marginTop: "1.2rem" }}>
            Le mie prenotazioni
          </Link>
        </div>
        <div style={{ height: "1.4rem" }} />
      </>
    );
  }

  /* ── Scelta di data e orario ──────────────────────────────────── */
  const abilitate = abilitatePer(srv.categoria, sedeId);
  const opScelta = operatriceId === NESSUNA_PREFERENZA ? null : operatrice(operatriceId);
  const daPagare = importoDovuto(srv.prezzo, modalita);
  const pronto = giorno !== null && slotScelto !== null;
  const inCorso = fase === "pagamento";

  const anno = mese.getFullYear();
  const numeroMese = mese.getMonth();
  const scarto = (new Date(anno, numeroMese, 1).getDay() + 6) % 7;
  const oggi = new Date();
  oggi.setHours(0, 0, 0, 0);

  return (
    <>
      <div className="app-head">
        <span style={{ width: 34, flex: "none" }} />
        <h1 className="titolo-schermo">Prenota la tua visita</h1>
        <span style={{ width: 34, flex: "none" }} />
      </div>

      <div className="sez-cap pad" style={{ marginTop: 0 }}>
        <h2 className="sez-tit">In quale sede</h2>
      </div>
      <div className="pad" style={{ marginBottom: "0.9rem" }}>
        <SelettoreSede
          soloSedi={sediPerCategoria(srv.categoria).map((x) => x.id)}
          onCambio={() => {
            // Cambiare sede cambia il personale e l'agenda: le scelte fatte
            // dopo non valgono più.
            setOperatriceId(NESSUNA_PREFERENZA);
            setSlotScelto(null);
          }}
        />
      </div>

      <div className="card riepilogo-srv">
        <Foto src={fotoCategoria(srv.categoria)} alt="" className="riepilogo-foto" sizes="60px" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <b>{srv.nome}</b>
          <small className="num">
            {euro(srv.prezzo)} — {srv.durata} min
          </small>
        </div>
        <button
          type="button"
          className="tondo"
          aria-label="Cambia trattamento"
          onClick={() => {
            setServizioId(null);
            setSlotScelto(null);
            setGiorno(null);
          }}
        >
          <Icona nome="scambia" style={{ width: 17, height: 17 }} />
        </button>
      </div>

      <button type="button" className="scelta" onClick={() => setFoglioAperto(true)}>
        {opScelta ? (
          <Faccia iniziali={opScelta.iniziali} tinta={opScelta.tinta} dimensione={30} />
        ) : (
          <span className="faccia faccia-vuota" aria-hidden="true">
            ?
          </span>
        )}
        <span>
          <span className="et">Operatrice</span>
          <b>{opScelta ? opScelta.nome : "Nessuna preferenza"}</b>
        </span>
        <span className="frec" aria-hidden="true">
          ›
        </span>
      </button>

      {/* Calendario */}
      <div className="card cal">
        <div className="cal-top">
          <button
            type="button"
            className="cal-nav"
            aria-label="Mese precedente"
            onClick={() => setMese(new Date(anno, numeroMese - 1, 1))}
          >
            ‹
          </button>
          <h2>
            {MESI[numeroMese][0].toUpperCase() + MESI[numeroMese].slice(1)} {anno}
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
            const passato = d < oggi;
            const chiuso = eChiuso(d);
            const selezionato = giorno !== null && chiaveGiorno(giorno) === chiaveGiorno(d);
            return (
              <button
                key={i}
                type="button"
                className={`gg${chiaveGiorno(d) === chiaveGiorno(oggi) ? " oggi" : ""}`}
                aria-pressed={selezionato}
                aria-label={`${d.getDate()} ${MESI[numeroMese]}${chiuso ? ", chiuso" : ""}`}
                disabled={passato || chiuso}
                onClick={() => {
                  setGiorno(d);
                  setSlotScelto(null);
                  setErrore(null);
                }}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orari */}
      {giorno === null ? (
        <p className="pad" style={{ fontSize: "0.8rem", color: "var(--testo-2)" }}>
          Scegli un giorno per vedere gli orari.
        </p>
      ) : caricamentoSlot ? (
        <p className="pad" style={{ fontSize: "0.8rem", color: "var(--testo-2)" }}>
          Controllo la disponibilità…
        </p>
      ) : slot.length === 0 ? (
        <div className="vuoto">
          <h4>Giornata piena</h4>
          <p>
            Per {srv.nome} non resta spazio
            {opScelta ? ` nell'agenda di ${opScelta.nome}` : ""}. Prova un altro giorno
            {opScelta ? ", o togli la preferenza sull'operatrice" : ""}.
          </p>
        </div>
      ) : (
        <>
          <div className="sez-cap pad">
            <h2 className="sez-tit">Orari disponibili</h2>
            <span className="piu num" style={{ color: "var(--testo-2)" }}>
              {slot.length} liberi
            </span>
          </div>
          {[
            ["Mattina", mattina],
            ["Pomeriggio", pomeriggio],
          ].map(([titolo, elenco]) =>
            (elenco as Slot[]).length === 0 ? null : (
              <div key={titolo as string}>
                <p className="fascia pad">{titolo as string}</p>
                <div className="orari">
                  {(elenco as Slot[]).map((s) => (
                    <button
                      key={`${s.inizio}-${s.operatriceId}`}
                      type="button"
                      className="ora num"
                      aria-pressed={slotScelto?.inizio === s.inizio}
                      onClick={() => {
                        setSlotScelto(s);
                        setErrore(null);
                      }}
                    >
                      {oreMinuti(s.inizio)}
                    </button>
                  ))}
                </div>
              </div>
            ),
          )}
        </>
      )}

      {/* Pagamento */}
      <div className="pagam">
        <p className="pagam-avviso">
          {provider().simulato
            ? "Prototipo: nessun pagamento viene incassato davvero e non ti chiediamo i dati della carta."
            : "Il pagamento è gestito in sicurezza dal nostro fornitore."}
        </p>
        {(
          [
            ["in-salone", "Pago in salone", "Come sempre, alla cassa", 0],
            ["saldo", "Pago tutto ora", "Arrivi e ti siedi, niente cassa", srv.prezzo],
          ] as const
        ).map(([id, titolo, sotto, importo]) => (
          <button
            key={id}
            type="button"
            className="pag"
            aria-pressed={modalita === id}
            onClick={() => setModalita(id)}
          >
            <span className="radio" aria-hidden="true" />
            <span>
              <b>{titolo}</b>
              <small>{sotto}</small>
            </span>
            <span className="imp num">{euro(importo)}</span>
          </button>
        ))}
      </div>

      <div className="card conto">
        <div>
          <span>{srv.nome}</span>
          <b className="num">{euro(srv.prezzo)}</b>
        </div>
        <div>
          <span>Da pagare adesso</span>
          <b className="num">{euro(daPagare)}</b>
        </div>
        <div className="tot">
          <span>Totale</span>
          <b className="num">{euro(srv.prezzo)}</b>
        </div>
        <div>
          <span className="guad">Punti che guadagni</span>
          <b className="guad">+{puntiPerSpesa(srv.prezzo)}</b>
        </div>
      </div>

      {errore && (
        <p className="errore pad" role="alert">
          {errore}
        </p>
      )}

      <div className="prima-di-cta" />
      <div className="cta-fissa">
        <button
          type="button"
          className="btn btn-lg"
          disabled={!pronto || inCorso}
          onClick={conferma}
        >
          {inCorso
            ? "Un attimo…"
            : pronto
              ? modalita === "in-salone"
                ? "Conferma prenotazione"
                : `Paga ${euro(daPagare)} e conferma`
              : "Scegli giorno e orario"}
        </button>
      </div>

      {/* Foglio per la scelta dell'operatrice */}
      <div
        className="velo"
        data-open={foglioAperto}
        onClick={() => setFoglioAperto(false)}
        aria-hidden="true"
      />
      <div className="foglio" data-open={foglioAperto} role="dialog" aria-label="Scegli l'operatrice">
        <div className="foglio-top">
          <h2>Scegli l&apos;operatrice</h2>
          <button
            type="button"
            className="tondo"
            aria-label="Chiudi"
            onClick={() => setFoglioAperto(false)}
          >
            <Icona nome="chiudi" style={{ width: 15, height: 15 }} />
          </button>
        </div>
        <div className="foglio-corpo">
          <p style={{ fontSize: "0.78rem", color: "var(--testo-2)", marginBottom: "0.7rem" }}>
            Per {srv.nome} sono abilitate {abilitate.length} operatrici.
          </p>
          <button
            type="button"
            className="op-scelta"
            aria-pressed={operatriceId === NESSUNA_PREFERENZA}
            onClick={() => {
              setOperatriceId(NESSUNA_PREFERENZA);
              setSlotScelto(null);
              setFoglioAperto(false);
            }}
          >
            <span className="faccia faccia-vuota" aria-hidden="true">
              ?
            </span>
            <span>
              <b>Nessuna preferenza</b>
              <small>Ti diamo la più libera — è la scelta con più orari</small>
            </span>
          </button>
          {abilitate.map((o) => (
            <button
              key={o.id}
              type="button"
              className="op-scelta"
              aria-pressed={operatriceId === o.id}
              onClick={() => {
                setOperatriceId(o.id);
                setSlotScelto(null);
                setFoglioAperto(false);
              }}
            >
              <Faccia iniziali={o.iniziali} tinta={o.tinta} dimensione={34} />
              <span>
                <b>{o.nome}</b>
                <small>{o.ruolo}</small>
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
