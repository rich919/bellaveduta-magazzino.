"use client";

import { Testata } from "@/components/app/Testata";
import { CardTessera } from "@/components/app/CardTessera";
import { useStatoApp } from "@/components/StatoApp";
import { LIVELLI, livelloDi, PREMI, PUNTI_PER_EURO } from "@/lib/membership";

export function Tessera() {
  const { punti, pronto } = useStatoApp();
  const livello = pronto ? livelloDi(punti) : null;

  return (
    <>
      <Testata titolo="Tessera e premi" indietroA="/profilo" />
      <CardTessera statica />

      <div className="sez-cap pad">
        <h2 className="sez-tit">I livelli</h2>
      </div>
      <div className="livelli">
        {LIVELLI.map((l) => (
          <div key={l.id} className="liv" data-attivo={livello?.id === l.id}>
            <b>{l.nome}</b>
            <small>{l.soglia === 0 ? "da subito" : `da ${l.soglia} pt`}</small>
          </div>
        ))}
      </div>

      <div className="sez-cap pad">
        <h2 className="sez-tit">I premi</h2>
      </div>
      <div className="pad">
        <div className="card">
          {PREMI.map((p) => {
            const raggiunto = pronto && punti >= p.punti;
            return (
              <div key={p.punti} className="premio">
                <span className="pt num">{p.punti}</span>
                <span className="ds">{p.descrizione}</span>
                <span className={`st ${raggiunto ? "ok" : "no"}`}>
                  {raggiunto ? "Disponibile" : pronto ? `−${p.punti - punti} pt` : "…"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="sez-cap pad">
        <h2 className="sez-tit">Come funziona</h2>
      </div>
      <div className="pad">
        <div className="card">
          <div className="indicazione">
            <span className="ic" aria-hidden="true">1€</span>
            <div>
              <b>Un punto per ogni euro</b>
              <small>Vale allo stesso modo sui trattamenti e sui prodotti</small>
            </div>
          </div>
          <div className="indicazione">
            <span className="ic" aria-hidden="true">%</span>
            <div>
              <b>{PUNTI_PER_EURO} punti = 1 € di sconto</b>
              <small>Sullo shop, fino al 30% dell&apos;ordine</small>
            </div>
          </div>
          <div className="indicazione">
            <span className="ic" aria-hidden="true">★</span>
            <div>
              <b>Livello Oro</b>
              <small>Priorità sugli slot del sabato e 10% su tutto lo shop</small>
            </div>
          </div>
          <div className="indicazione">
            <span className="ic" aria-hidden="true">↺</span>
            <div>
              <b>I punti non scadono</b>
              <small>Li usi quando vuoi, anche un po&apos; per volta</small>
            </div>
          </div>
        </div>
      </div>

      <p className="pad" style={{ fontSize: "0.72rem", color: "var(--testo-2)", marginTop: "1rem" }}>
        Soglie, premi e vantaggi sono una proposta: vanno decisi dal salone.
      </p>
      <div style={{ height: "1.4rem" }} />
    </>
  );
}
