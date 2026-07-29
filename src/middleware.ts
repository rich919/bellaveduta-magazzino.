/**
 * Separa i due indirizzi e protegge il gestionale.
 *
 * Lo stesso codice viene distribuito come due progetti Vercel distinti, che si
 * distinguono solo per la variabile `APP_MODE`:
 *
 *   APP_MODE=site   (default)   claudia-nails.vercel.app
 *                               solo il sito pubblico. /gestionale → 404.
 *
 *   APP_MODE=admin              claudia-nails-gestionale.vercel.app
 *                               solo la dashboard, protetta da login.
 *                               Le rotte pubbliche → 404.
 *
 * Così il gestionale sta davvero su un altro indirizzo, e non è semplicemente
 * una pagina nascosta dello stesso sito: sul dominio pubblico quel codice non è
 * nemmeno raggiungibile.
 */

import { NextResponse, type NextRequest } from "next/server";
import {
  COOKIE_SESSIONE,
  gestionaleAperto,
  segretiConfigurati,
  tokenValido,
} from "@/lib/auth";

const PREFISSO_ADMIN = "/gestionale";
/** L'API che apre e chiude la sessione: vive fuori da /gestionale. */
const PREFISSO_API_ADMIN = "/api/gestionale";

function modalita(): "site" | "admin" {
  return process.env.APP_MODE === "admin" ? "admin" : "site";
}

const dentro = (percorso: string, prefisso: string) =>
  percorso === prefisso || percorso.startsWith(`${prefisso}/`);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const ePagina = dentro(pathname, PREFISSO_ADMIN);
  const eApi = dentro(pathname, PREFISSO_API_ADMIN);

  // ── Dominio pubblico ────────────────────────────────────────────────
  if (modalita() === "site") {
    if (ePagina || eApi) {
      // 404, non 403: sul sito delle clienti il gestionale non esiste proprio.
      return NextResponse.rewrite(new URL("/404", req.url), { status: 404 });
    }
    return NextResponse.next();
  }

  // ── Dominio gestionale ──────────────────────────────────────────────
  // L'API di accesso deve passare sempre: se la blocchiamo qui, la pagina di
  // login non ha modo di verificare la password e il gestionale è inutilizzabile.
  if (eApi) {
    return NextResponse.next();
  }

  // La radice porta direttamente alla dashboard.
  if (pathname === "/") {
    return NextResponse.redirect(new URL(PREFISSO_ADMIN, req.url));
  }

  // Qui non deve esistere nulla del sito pubblico.
  if (!ePagina) {
    return NextResponse.rewrite(new URL("/404", req.url), { status: 404 });
  }

  // Demo aperta: si entra direttamente, e la pagina di login non ha più senso.
  if (gestionaleAperto()) {
    if (pathname === `${PREFISSO_ADMIN}/login`) {
      return NextResponse.redirect(new URL(PREFISSO_ADMIN, req.url));
    }
    return NextResponse.next();
  }

  // La pagina di login deve restare accessibile senza sessione.
  if (pathname === `${PREFISSO_ADMIN}/login`) {
    return NextResponse.next();
  }

  const { segreto } = segretiConfigurati();
  const valido = await tokenValido(
    req.cookies.get(COOKIE_SESSIONE)?.value,
    segreto,
  );
  if (!valido) {
    const url = new URL(`${PREFISSO_ADMIN}/login`, req.url);
    // Per tornare dove si stava andando dopo il login.
    if (pathname !== PREFISSO_ADMIN) url.searchParams.set("torna", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  /**
   * Esclude gli asset statici: farli passare dal middleware significherebbe
   * una verifica di firma per ogni immagine.
   */
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|.*\\.svg$).*)"],
};
