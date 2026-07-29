import { NextResponse } from "next/server";
import {
  COOKIE_SESSIONE,
  creaToken,
  DURATA_SESSIONE_S,
  segretiConfigurati,
} from "@/lib/auth";

/**
 * Verifica la password del gestionale e apre la sessione.
 *
 * Il confronto avviene qui, sul server: la password non raggiunge mai il
 * browser. Il cookie è httpOnly, quindi nemmeno il JavaScript della pagina può
 * leggerlo, e porta una firma HMAC che impedisce di fabbricarne uno a mano.
 */
export async function POST(richiesta: Request) {
  let password = "";
  try {
    const corpo = await richiesta.json();
    password = typeof corpo?.password === "string" ? corpo.password : "";
  } catch {
    return NextResponse.json({ errore: "Richiesta non valida." }, { status: 400 });
  }

  const { password: attesa, segreto } = segretiConfigurati();

  if (password !== attesa) {
    // Ritardo fisso: senza, la rapidità della risposta racconta se la password
    // è lunga quanto quella giusta.
    await new Promise((r) => setTimeout(r, 600));
    return NextResponse.json({ errore: "Password non corretta." }, { status: 401 });
  }

  const risposta = NextResponse.json({ ok: true });
  risposta.cookies.set({
    name: COOKIE_SESSIONE,
    value: await creaToken(segreto),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURATA_SESSIONE_S,
  });
  return risposta;
}

/** Esce dalla sessione cancellando il cookie. */
export async function DELETE() {
  const risposta = NextResponse.json({ ok: true });
  risposta.cookies.set({ name: COOKIE_SESSIONE, value: "", path: "/", maxAge: 0 });
  return risposta;
}
