#!/usr/bin/env node
/**
 * Genera le immagini del sito con kie.ai e le salva in public/images.
 *
 *   KIE_API_KEY=... node scripts/generate-images.mjs
 *   KIE_API_KEY=... node scripts/generate-images.mjs --solo hero,operatrice-claudia
 *   KIE_API_KEY=... node scripts/generate-images.mjs --rigenera hero
 *
 * Perché le immagini finiscono nel repo e non vengono chiamate a runtime:
 * gli URL restituiti da kie.ai SCADONO DOPO 24 ORE. Se il sito puntasse a
 * quelli, il giorno dopo il deploy le foto sparirebbero. Scaricandole e
 * committandole, su Vercel diventano file statici serviti dalla CDN: restano
 * per sempre, non costano nulla per visita e la chiave API non è mai esposta
 * al browser.
 *
 * Lo script è ripetibile: salta ciò che esiste già, così un secondo lancio non
 * consuma crediti. Usa `--rigenera <slug>` per rifare una singola immagine.
 *
 * NOTA: le immagini prodotte sono materiale generico generato. Non ritraggono
 * il salone reale né persone reali. Vanno sostituite con foto vere prima di
 * andare in produzione.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RADICE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DESTINAZIONE = path.join(RADICE, "public", "images");
const MANIFEST = path.join(DESTINAZIONE, "manifest.json");

const BASE = "https://api.kie.ai/api/v1/jobs";
const MODELLO = "nano-banana-pro";
const INTERVALLO_POLL_MS = 3000;
const TIMEOUT_MS = 3 * 60 * 1000;

/**
 * Radice stilistica comune. Tenere qui la parte condivisa è ciò che rende le
 * venti immagini una serie coerente invece di venti foto scollegate.
 */
const STILE =
  "Professional editorial photography for an Italian beauty salon in Rome. " +
  "Soft natural window light, warm and calm atmosphere, shallow depth of field, " +
  "muted sophisticated color palette, no text, no logos, no watermarks, " +
  "photorealistic, high detail.";

const IMMAGINI = [
  { slug: "hero", ratio: "16:9", risoluzione: "2K",
    prompt: "Wide interior of an elegant small nail and beauty salon: manicure stations with warm wood surfaces, a wall of nail polish bottles arranged by color, a comfortable chair, plants near a large window." },

  { slug: "categoria-semipermanente-mani", ratio: "4:3", risoluzione: "1K",
    prompt: "Close-up of a woman's hands with freshly applied glossy deep red semi-permanent nail polish, resting on a linen towel." },
  { slug: "categoria-semipermanente-piedi", ratio: "4:3", risoluzione: "1K",
    prompt: "Close-up of feet with freshly painted glossy nail polish during a pedicure, clean spa setting, soft towel." },
  { slug: "categoria-semigel", ratio: "4:3", risoluzione: "1K",
    prompt: "Extreme close-up of nails with a baby boomer gradient manicure, nude to white ombre, glossy finish." },
  { slug: "categoria-ricostruzione", ratio: "4:3", risoluzione: "1K",
    prompt: "Nail technician's gloved hands shaping a gel nail extension with a file, precise detailed work, macro." },
  { slug: "categoria-manicure", ratio: "4:3", risoluzione: "1K",
    prompt: "Manicure in progress: technician tending to cuticles with professional tools, hands resting on a small cushion." },
  { slug: "categoria-pedicure", ratio: "4:3", risoluzione: "1K",
    prompt: "Pedicure treatment in a calm salon, feet in a basin with warm water and flower petals, towels folded nearby." },
  { slug: "categoria-ceretta", ratio: "4:3", risoluzione: "1K",
    prompt: "Clean minimal beauty treatment room prepared for waxing: fresh white linens on a treatment bed, wax warmer, folded towels, soft light." },
  { slug: "categoria-viso", ratio: "4:3", risoluzione: "1K",
    prompt: "Woman relaxing during a facial treatment, clay mask applied, eyes closed, serene expression, soft spa lighting." },
  { slug: "categoria-ciglia", ratio: "4:3", risoluzione: "1K",
    prompt: "Macro close-up of a closed eye with beautifully applied volume eyelash extensions, natural skin texture." },
  { slug: "categoria-massaggi", ratio: "4:3", risoluzione: "1K",
    prompt: "Relaxing back massage in a warm dimly lit treatment room, therapist's hands, rolled towels and a candle nearby." },

  { slug: "operatrice-claudia", ratio: "3:4", risoluzione: "1K",
    prompt: "Portrait of a confident Italian woman in her forties, salon owner, dark hair, warm smile, wearing a simple black work uniform, standing in her nail salon, blurred background." },
  { slug: "operatrice-martina", ratio: "3:4", risoluzione: "1K",
    prompt: "Portrait of a young Italian woman in her late twenties, nail artist, hair tied back, friendly expression, black work uniform, salon background blurred." },
  { slug: "operatrice-sara", ratio: "3:4", risoluzione: "1K",
    prompt: "Portrait of an Italian woman in her thirties, beautician, shoulder-length brown hair, calm and welcoming expression, black work uniform, treatment room background blurred." },
  { slug: "operatrice-giulia", ratio: "3:4", risoluzione: "1K",
    prompt: "Portrait of an Italian woman in her early thirties, aesthetician specialising in facials, curly hair, gentle smile, black work uniform, soft blurred background." },

  { slug: "interno-1", ratio: "3:2", risoluzione: "1K",
    prompt: "Detail of a nail polish display wall in a salon, hundreds of bottles arranged in a color gradient from nude to deep burgundy." },
  { slug: "interno-2", ratio: "3:2", risoluzione: "1K",
    prompt: "Reception corner of a small beauty salon: wooden counter, a vase with dried flowers, appointment book, warm afternoon light." },
  { slug: "interno-3", ratio: "3:2", risoluzione: "1K",
    prompt: "Quiet treatment room in a beauty salon, neatly folded towels, professional lamp, plants, clean minimal Italian interior." },

  { slug: "dettaglio-1", ratio: "1:1", risoluzione: "1K",
    prompt: "Overhead flat lay of professional manicure tools arranged neatly on a marble surface: files, cuticle pusher, brushes, polish bottles." },
  { slug: "dettaglio-2", ratio: "1:1", risoluzione: "1K",
    prompt: "Macro shot of a nail polish brush lifting from the bottle, a glossy drop of deep plum lacquer about to fall." },

  { slug: "og", ratio: "16:9", risoluzione: "1K",
    prompt: "Elegant wide shot of a nail salon interior with warm lighting, welcoming and professional, space in the frame suitable for overlaying text later." },
];

function argomento(nome) {
  const i = process.argv.indexOf(nome);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : null;
}

const CHIAVE = process.env.KIE_API_KEY;
if (!CHIAVE) {
  console.error(
    "\nManca KIE_API_KEY.\n\n" +
      "  KIE_API_KEY=la-tua-chiave node scripts/generate-images.mjs\n\n" +
      "La chiave non va mai committata: tienila in .env.local (che è in .gitignore)\n" +
      "oppure passala sulla riga di comando.\n",
  );
  process.exit(1);
}

const intestazioni = {
  Authorization: `Bearer ${CHIAVE}`,
  "Content-Type": "application/json",
};

const attesa = (ms) => new Promise((r) => setTimeout(r, ms));

async function creaTask(img) {
  const risposta = await fetch(`${BASE}/createTask`, {
    method: "POST",
    headers: intestazioni,
    body: JSON.stringify({
      model: MODELLO,
      input: {
        prompt: `${img.prompt} ${STILE}`,
        aspect_ratio: img.ratio,
        resolution: img.risoluzione,
        output_format: "jpg",
      },
    }),
  });

  const dati = await risposta.json().catch(() => null);
  if (!risposta.ok || !dati) {
    throw new Error(`createTask HTTP ${risposta.status}: ${JSON.stringify(dati)}`);
  }
  if (dati.code !== 200 || !dati.data?.taskId) {
    throw new Error(`createTask rifiutato: ${dati.msg ?? JSON.stringify(dati)}`);
  }
  return dati.data.taskId;
}

async function attendiRisultato(taskId, slug) {
  const scadenza = Date.now() + TIMEOUT_MS;
  let ultimoStato = "";

  while (Date.now() < scadenza) {
    await attesa(INTERVALLO_POLL_MS);

    const risposta = await fetch(
      `${BASE}/recordInfo?taskId=${encodeURIComponent(taskId)}`,
      { headers: intestazioni },
    );
    const dati = await risposta.json().catch(() => null);
    if (!risposta.ok || !dati?.data) continue; // errore transitorio: riprova

    const { state, resultJson, failMsg, progress } = dati.data;
    if (state !== ultimoStato) {
      ultimoStato = state;
      process.stdout.write(`    ${slug}: ${state}${progress ? ` ${progress}%` : ""}\n`);
    }

    if (state === "success") {
      // resultJson è una STRINGA JSON, non un oggetto.
      const risultato =
        typeof resultJson === "string" ? JSON.parse(resultJson) : resultJson;
      const url = risultato?.resultUrls?.[0];
      if (!url) throw new Error("stato success ma nessun URL nel risultato");
      return url;
    }
    if (state === "fail") {
      throw new Error(`generazione fallita: ${failMsg || "motivo non indicato"}`);
    }
  }
  throw new Error(`timeout dopo ${TIMEOUT_MS / 1000}s`);
}

async function scarica(url, destinazione) {
  const risposta = await fetch(url);
  if (!risposta.ok) throw new Error(`download HTTP ${risposta.status}`);
  const buffer = Buffer.from(await risposta.arrayBuffer());
  if (buffer.length < 1024) throw new Error("file scaricato sospettosamente piccolo");
  await fs.writeFile(destinazione, buffer);
  return buffer.length;
}

async function esiste(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  await fs.mkdir(DESTINAZIONE, { recursive: true });

  const filtro = argomento("--solo")?.split(",").map((s) => s.trim());
  const rigenera = argomento("--rigenera")?.split(",").map((s) => s.trim()) ?? [];

  let manifest = {};
  if (await esiste(MANIFEST)) {
    manifest = JSON.parse(await fs.readFile(MANIFEST, "utf8"));
  }

  const daFare = IMMAGINI.filter((i) => !filtro || filtro.includes(i.slug));
  console.log(`\n${daFare.length} immagini in coda, modello ${MODELLO}.\n`);

  let generate = 0;
  let saltate = 0;
  const falliti = [];

  for (const [i, img] of daFare.entries()) {
    const file = path.join(DESTINAZIONE, `${img.slug}.jpg`);
    const etichetta = `[${i + 1}/${daFare.length}] ${img.slug}`;

    if ((await esiste(file)) && !rigenera.includes(img.slug)) {
      console.log(`${etichetta} — già presente, salto`);
      saltate++;
      continue;
    }

    console.log(`${etichetta} — genero…`);
    try {
      const taskId = await creaTask(img);
      const url = await attendiRisultato(taskId, img.slug);
      const byte = await scarica(url, file);

      manifest[img.slug] = {
        prompt: img.prompt,
        stile: STILE,
        modello: MODELLO,
        aspetto: img.ratio,
        risoluzione: img.risoluzione,
        byte,
        generataIl: new Date().toISOString(),
      };
      await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");

      console.log(`${etichetta} — salvata (${Math.round(byte / 1024)} KB)`);
      generate++;
    } catch (errore) {
      console.error(`${etichetta} — ERRORE: ${errore.message}`);
      falliti.push(img.slug);
    }
  }

  console.log(
    `\nFatto. ${generate} generate, ${saltate} saltate, ${falliti.length} fallite.`,
  );
  if (falliti.length) {
    console.log(`Da riprovare: node scripts/generate-images.mjs --solo ${falliti.join(",")}`);
    process.exitCode = 1;
  } else if (generate > 0) {
    console.log("Ricordati di committare public/images: è ciò che le fa restare su Vercel.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
