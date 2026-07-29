#!/usr/bin/env node
/**
 * Converte i PNG generati da kie.ai in WebP e cancella gli originali.
 *
 *   node scripts/optimize-images.mjs
 *
 * Perché serve: nano-banana restituisce PNG da 1–1,7 MB l'uno. Trentasette
 * immagini fanno 45 MB, che in un repository git sono troppi — ogni clone e
 * ogni build di Vercel se li porta dietro per sempre, e i PNG non si
 * ricomprimono mai più una volta committati.
 *
 * In WebP a qualità 82 le stesse immagini stanno sotto i 200 KB senza
 * differenze visibili a schermo. Next/Image le riottimizza comunque per ogni
 * dimensione richiesta, quindi qui interessa solo il peso della sorgente.
 *
 * Lo script gira dopo generate-images.mjs ed è ripetibile: se non trova PNG
 * non fa nulla.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const RADICE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CARTELLA = path.join(RADICE, "public", "images");

const QUALITA = 82;
/** Oltre questa larghezza non serve andare: l'app è un'interfaccia mobile. */
const LARGHEZZA_MASSIMA = 1400;

const kb = (n) => Math.round(n / 1024);

async function main() {
  const file = (await fs.readdir(CARTELLA)).filter((f) => f.endsWith(".png"));

  if (file.length === 0) {
    console.log("Nessun PNG da convertire.");
    return;
  }

  console.log(`\n${file.length} immagini da convertire in WebP.\n`);

  let prima = 0;
  let dopo = 0;

  for (const nome of file) {
    const origine = path.join(CARTELLA, nome);
    const destinazione = origine.replace(/\.png$/, ".webp");

    const byteOrigine = (await fs.stat(origine)).size;
    prima += byteOrigine;

    await sharp(origine)
      .resize({ width: LARGHEZZA_MASSIMA, withoutEnlargement: true })
      .webp({ quality: QUALITA, effort: 5 })
      .toFile(destinazione);

    const byteDestinazione = (await fs.stat(destinazione)).size;
    dopo += byteDestinazione;

    await fs.unlink(origine);

    const risparmio = Math.round((1 - byteDestinazione / byteOrigine) * 100);
    console.log(
      `  ${nome.replace(".png", "").padEnd(30)} ${String(kb(byteOrigine)).padStart(5)} KB → ${String(
        kb(byteDestinazione),
      ).padStart(4)} KB  (−${risparmio}%)`,
    );
  }

  // Il manifest indica ancora i .png: lo allineo.
  const manifestPath = path.join(CARTELLA, "manifest.json");
  try {
    const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
    for (const chiave of Object.keys(manifest)) {
      manifest[chiave].formato = "webp";
    }
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  } catch {
    // Nessun manifest: non è un problema.
  }

  console.log(
    `\nDa ${kb(prima)} KB a ${kb(dopo)} KB — ${Math.round((1 - dopo / prima) * 100)}% in meno.\n`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
