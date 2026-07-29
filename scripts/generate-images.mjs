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
const MODELLO = "google/nano-banana";
const INTERVALLO_POLL_MS = 3000;
const TIMEOUT_MS = 3 * 60 * 1000;

/**
 * Radice stilistica comune. Tenere qui la parte condivisa è ciò che rende le
 * venti immagini una serie coerente invece di venti foto scollegate.
 */
const STILE =
  // Le leve della coerenza sono queste quattro, ripetute identiche su ogni
  // scatto: stessa ottica, stessa luce e stessa direzione, stessa palette,
  // stessa resa di pellicola. Cambiare anche solo una di queste su metà delle
  // immagini basta a far sembrare la serie un collage di stock diversi.
  "Shot on medium format with an 85mm lens, shallow depth of field. " +
  "Soft natural window light falling from the left, gentle shadows, no harsh contrast. " +
  "Warm palette of cream, dusty rose, camel and pale terracotta; muted and slightly " +
  "desaturated, never vivid. Editorial beauty campaign for a refined Italian salon: " +
  "calm, expensive, understated. Subtle fine film grain. " +
  "No text, no logos, no watermarks, no signage. Photorealistic, high detail.";

const IMMAGINI = [
  // ── Copertine ────────────────────────────────────────────────────────
  { slug: "hero", ratio: "16:9",
    prompt: "Wide interior of a refined nail and beauty salon: pale oak manicure stations, a full wall of nail polish arranged in a colour gradient, upholstered chairs in dusty rose, tall window with sheer linen curtains, olive tree in a stone pot." },
  { slug: "hero-ritratto", ratio: "3:4",
    prompt: "Portrait of a young Italian woman with softly gathered dark hair, serene confident expression, looking straight at the camera, one hand resting near her jaw showing perfectly manicured nude nails, plain warm cream background with generous empty space around her." },
  { slug: "og", ratio: "16:9",
    prompt: "Elegant wide interior of a beauty salon at golden hour, generous empty space on the right of the frame for overlaying text later." },

  // ── Le due sedi ──────────────────────────────────────────────────────
  { slug: "sede-garbatella", ratio: "3:2",
    prompt: "Intimate nail salon interior in a 1920s Roman garden-city building: arched window, warm oak counter, polish wall, two manicure stations, plants on the sill." },
  { slug: "sede-montagnola", ratio: "3:2",
    prompt: "Larger beauty salon interior combining a hair styling area with washbasins and mirrors on one side and manicure stations on the other, open and bright." },

  // ── Categorie di trattamento ─────────────────────────────────────────
  { slug: "cat-semipermanente-mani", ratio: "4:3",
    prompt: "Close-up of a woman's hands with freshly applied glossy deep burgundy semi-permanent polish, resting on folded cream linen." },
  { slug: "cat-semipermanente-piedi", ratio: "4:3",
    prompt: "Close-up of clean feet with freshly painted glossy nude polish during a pedicure, cream towel underneath, stone floor." },
  { slug: "cat-semigel", ratio: "4:3",
    prompt: "Extreme close-up of almond-shaped nails with a baby boomer gradient, nude fading to soft white, mirror-gloss finish." },
  { slug: "cat-ricostruzione", ratio: "4:3",
    prompt: "Nail technician's hands shaping a gel extension with a file, macro, brushes and a small lamp softly out of focus behind." },
  { slug: "cat-manicure", ratio: "4:3",
    prompt: "Manicure in progress: technician tending to cuticles with steel tools, the client's hand resting on a small velvet cushion." },
  { slug: "cat-pedicure", ratio: "4:3",
    prompt: "Pedicure treatment: feet in a pale ceramic basin of warm water, rolled towels and a small dish of salts on a stone ledge." },
  { slug: "cat-ceretta", ratio: "4:3",
    prompt: "Treatment room prepared for waxing: crisp cream linen on the bed, wax warmer, folded towels, a single stem in a vase." },
  { slug: "cat-viso", ratio: "4:3",
    prompt: "Woman lying down during a facial, clay mask applied, eyes closed, serene, a therapist's hands just entering the frame." },
  { slug: "cat-ciglia", ratio: "4:3",
    prompt: "Macro of a closed eye with volume lash extensions, natural skin texture and fine brows, extremely soft light." },
  { slug: "cat-massaggi", ratio: "4:3",
    prompt: "Back massage in a warm treatment room, therapist's hands mid-stroke, rolled towels and a lit candle behind." },
  { slug: "cat-capelli", ratio: "4:3",
    prompt: "Hairdresser's hands blow-drying and shaping long brown hair with a round brush, salon mirror softly out of focus behind." },

  // ── Ritratti dello staff ─────────────────────────────────────────────
  // Persone generate, non reali: sono segnaposto in attesa delle foto vere.
  // Stessa inquadratura e stessa uniforme per tutte, così la fila di ritratti
  // sulla pagina staff resta ordinata.
  { slug: "staff-claudia", ratio: "3:4",
    prompt: "Waist-up portrait of a confident Italian woman in her forties with dark hair worn up, warm direct gaze, black work tunic, standing in a nail salon, background softly blurred." },
  { slug: "staff-gloria", ratio: "3:4",
    prompt: "Waist-up portrait of an Italian woman in her late thirties with layered auburn hair, warm smile, black work tunic, standing in a hair salon, background softly blurred." },
  { slug: "staff-angela", ratio: "3:4",
    prompt: "Waist-up portrait of an Italian woman in her thirties with dark hair in a low bun, calm composed expression, black work tunic, treatment room blurred behind." },
  { slug: "staff-giorgia", ratio: "3:4",
    prompt: "Waist-up portrait of a young Italian woman in her twenties with long straight dark hair, friendly open expression, black work tunic, nail salon blurred behind." },
  { slug: "staff-letizia", ratio: "3:4",
    prompt: "Waist-up portrait of a young Italian woman in her late twenties with wavy chestnut hair tied back, gentle smile, black work tunic, nail salon blurred behind." },
  { slug: "staff-martina", ratio: "3:4",
    prompt: "Waist-up portrait of an Italian woman in her thirties with shoulder-length brown hair, warm welcoming expression, black work tunic, treatment room blurred behind." },
  { slug: "staff-michela", ratio: "3:4",
    prompt: "Waist-up portrait of an Italian woman in her early thirties with curly dark hair, quiet confident expression, black work tunic, nail salon blurred behind." },
  { slug: "staff-melania", ratio: "3:4",
    prompt: "Waist-up portrait of a young Italian woman in her twenties with blonde hair in a ponytail, bright friendly expression, black work tunic, nail salon blurred behind." },

  // ── Ambienti ─────────────────────────────────────────────────────────
  { slug: "interno-1", ratio: "3:2",
    prompt: "Detail of a nail polish display wall, hundreds of bottles arranged in a gradient from milky nude to deep burgundy, warm oak shelving." },
  { slug: "interno-2", ratio: "3:2",
    prompt: "Reception corner: oak counter, dried flowers in a ceramic vase, an open appointment book, late afternoon light across the wall." },
  { slug: "interno-3", ratio: "3:2",
    prompt: "Quiet treatment room, neatly folded cream towels, a professional lamp, plants, calm minimal Italian interior." },

  // ── Prodotti dello shop ──────────────────────────────────────────────
  // Still life GENERICI e SENZA MARCHIO: non riproducono i prodotti ghd reali
  // e non vanno spacciati per tali. Prima della vendita si sostituiscono con le
  // foto ufficiali fornite dal marchio, come è prassi per un rivenditore.
  { slug: "prod-piastra-1", ratio: "1:1",
    prompt: "Unbranded matte black hair straightener lying on cream marble, single soft shadow, minimal still life, no logos or text anywhere." },
  { slug: "prod-piastra-2", ratio: "1:1",
    prompt: "Unbranded glossy black ceramic hair straightener standing upright on a pale stone plinth, no logos or text." },
  { slug: "prod-piastra-3", ratio: "1:1",
    prompt: "Unbranded charcoal hair styler resting on folded cream linen, warm side light, no logos or text." },
  { slug: "prod-piastra-4", ratio: "1:1",
    prompt: "Unbranded cordless black hair straightener beside a small charging base on cream marble, no logos or text." },
  { slug: "prod-phon-1", ratio: "1:1",
    prompt: "Unbranded matte black hair dryer on a cream background, elegant product still life, soft shadow, no logos or text." },
  { slug: "prod-phon-2", ratio: "1:1",
    prompt: "Unbranded black hair dryer with a concentrator nozzle laid beside it on pale stone, no logos or text." },
  { slug: "prod-ferro-1", ratio: "1:1",
    prompt: "Unbranded black conical curling wand on cream marble with a soft shadow, no logos or text." },
  { slug: "prod-spazzola-1", ratio: "1:1",
    prompt: "Unbranded black round hot air styling brush on cream linen, minimal still life, no logos or text." },
  { slug: "prod-spazzola-2", ratio: "1:1",
    prompt: "Unbranded black flat paddle hair brush on pale stone, clean still life, no logos or text." },
  { slug: "prod-spazzola-3", ratio: "1:1",
    prompt: "Unbranded black oval dressing brush on cream marble, soft studio light, no logos or text." },
  { slug: "prod-spray-1", ratio: "1:1",
    prompt: "Unbranded frosted glass spray bottle with a black cap on cream marble, blank label with no text." },
  { slug: "prod-spray-2", ratio: "1:1",
    prompt: "Unbranded slim white cosmetic spray bottle on a cream background, soft shadow, blank label with no text." },
  { slug: "prod-olio-cuticole", ratio: "1:1",
    prompt: "Small amber glass dropper bottle of cuticle oil on cream marble beside a sprig of almond blossom, blank label with no text." },
  { slug: "prod-crema-mani", ratio: "1:1",
    prompt: "Elegant unbranded cream-coloured hand cream tube on soft beige linen, blank label with no text." },
  { slug: "prod-base-rinforzante", ratio: "1:1",
    prompt: "Clear nail treatment bottle with a black cap on pale marble, glossy liquid visible, blank label with no text." },
  { slug: "prod-lima-vetro", ratio: "1:1",
    prompt: "Crystal glass nail file resting on cream linen, catching the light along its edge, no text." },
  { slug: "prod-scrub-piedi", ratio: "1:1",
    prompt: "Open glass jar of coarse salt scrub on pale stone with a few scattered crystals, blank label with no text." },
  { slug: "prod-kit-rimozione", ratio: "1:1",
    prompt: "Flat lay on cream marble: small unlabelled bottle, cotton pads, wooden cuticle stick, foil wraps, no text or logos." },
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
        // nano-banana genera nativamente a 1K: il rapporto decide le dimensioni
        // (16:9 → 1344×768, 1:1 → 1024×1024). Non esiste un parametro separato
        // per la risoluzione.
        image_size: img.ratio,
        output_format: "png",
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
    const file = path.join(DESTINAZIONE, `${img.slug}.png`);
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
