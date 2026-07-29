/**
 * Sessione del gestionale.
 *
 * Cookie firmato HMAC-SHA256, senza dipendenze esterne. Usa Web Crypto perché
 * il middleware di Next gira su Edge runtime, dove il modulo `crypto` di Node
 * non è disponibile.
 *
 * Livello demo, e va detto chiaramente: è una password sola condivisa, non un
 * sistema multi-utente con ruoli. Regge perché il gestionale sta su un dominio
 * separato non linkato, il cookie è httpOnly e la firma impedisce di forgiarlo.
 * Quando si passerà a Supabase, questo file viene sostituito da Supabase Auth.
 */

export const COOKIE_SESSIONE = "cn_sessione";
/** Otto ore: una giornata di salone abbondante. */
export const DURATA_SESSIONE_S = 8 * 60 * 60;

/**
 * Restituisce un ArrayBuffer e non la Uint8Array grezza: quest'ultima è tipata
 * su ArrayBufferLike, che include SharedArrayBuffer e quindi TypeScript non la
 * accetta dove serve un BufferSource.
 */
function codifica(s: string): ArrayBuffer {
  const bytes = new TextEncoder().encode(s);
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
}

function base64url(dati: ArrayBuffer | Uint8Array): string {
  const bytes = dati instanceof Uint8Array ? dati : new Uint8Array(dati);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function chiave(segreto: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    codifica(segreto),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function firma(payload: string, segreto: string): Promise<string> {
  const k = await chiave(segreto);
  return base64url(await crypto.subtle.sign("HMAC", k, codifica(payload)));
}

/**
 * Confronto a tempo costante.
 * Un `===` su stringhe esce al primo byte diverso e, in teoria, lascia
 * misurare la firma un carattere alla volta.
 */
function confrontoSicuro(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Token `scadenza.firma`, dove scadenza è un timestamp in secondi. */
export async function creaToken(segreto: string): Promise<string> {
  const scadenza = Math.floor(Date.now() / 1000) + DURATA_SESSIONE_S;
  const payload = String(scadenza);
  return `${payload}.${await firma(payload, segreto)}`;
}

export async function tokenValido(
  token: string | undefined,
  segreto: string,
): Promise<boolean> {
  if (!token) return false;
  const punto = token.lastIndexOf(".");
  if (punto <= 0) return false;

  const payload = token.slice(0, punto);
  const ricevuta = token.slice(punto + 1);

  const scadenza = Number(payload);
  if (!Number.isFinite(scadenza)) return false;
  if (scadenza * 1000 < Date.now()) return false;

  return confrontoSicuro(ricevuta, await firma(payload, segreto));
}

/**
 * Modalità dimostrativa: il gestionale si apre senza password.
 *
 * Serve per far vedere alla titolare come sarebbe la sua dashboard, senza
 * doverle passare credenziali. Va detto chiaro: con questa attiva chiunque
 * abbia il link entra e vede l'agenda. Va bene perché i dati sono finti, non
 * appena diventano veri va spenta.
 *
 * L'autenticazione resta tutta qui sotto: si riaccende togliendo questa
 * variabile e rimettendo ADMIN_PASSWORD.
 */
export function gestionaleAperto(): boolean {
  return process.env.GESTIONALE_SENZA_PASSWORD === "1";
}

/**
 * I segreti, letti dall'ambiente.
 *
 * In sviluppo esiste un fallback per non bloccare chi clona il repo, ma in
 * produzione mancare le variabili è un errore: senza, chiunque conoscerebbe la
 * password guardando questo file.
 */
export function segretiConfigurati(): { password: string; segreto: string } {
  const password = process.env.ADMIN_PASSWORD;
  const segreto = process.env.AUTH_SECRET;

  // In modalità dimostrativa la password non viene mai confrontata: pretenderla
  // impedirebbe l'avvio proprio nel caso in cui non serve.
  if (process.env.NODE_ENV === "production" && !gestionaleAperto()) {
    if (!password || !segreto) {
      throw new Error(
        "ADMIN_PASSWORD e AUTH_SECRET devono essere impostate in produzione. " +
          "Configurale nelle Environment Variables del progetto Vercel.",
      );
    }
    return { password, segreto };
  }

  return {
    password: password ?? "garbatella2026",
    segreto: segreto ?? "segreto-solo-per-sviluppo-non-usare-in-produzione",
  };
}
