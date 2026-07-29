/**
 * Catalogo dello shop.
 *
 * Due famiglie con provenienze diverse, e la distinzione conta:
 *
 * 1. ghd — marchio reale di cui il salone è rivenditore autorizzato (lo dichiara
 *    claudianails.it). I NOMI dei prodotti sono quelli veri di catalogo. I PREZZI
 *    sono stime al listino italiano: `verificato: false` su tutti, vanno confermati.
 *
 * 2. Linea del salone — prodotti di cura mani e piedi, inventati per la demo.
 *    Un centro unghie li vende, ma questi specifici non esistono.
 *
 * Le immagini in /public/images sono still life GENERICI e SENZA MARCHIO: non
 * riproducono i prodotti ghd reali. Prima della produzione vanno sostituite con
 * le foto ufficiali fornite dal marchio, che è la prassi per un rivenditore.
 */

export type FamigliaProdotto = "styling" | "mani" | "piedi";

export type Prodotto = {
  id: string;
  marca: string;
  nome: string;
  /** In euro. */
  prezzo: number;
  famiglia: FamigliaProdotto;
  descrizione: string;
  immagine: string;
  verificato: boolean;
};

/** [marca, nome, prezzo, famiglia, immagine, descrizione] */
const RIGHE: ReadonlyArray<
  [string, string, number, FamigliaProdotto, string, string]
> = [
  ["ghd", "ghd platinum+ Styler", 269, "styling", "prod-piastra-1",
    "Regola il calore trenta volte al secondo su ogni ciocca: resta a 185°C senza mai bruciare."],
  ["ghd", "ghd gold Styler", 199, "styling", "prod-piastra-2",
    "La classica a doppia zona riscaldante. Una passata sola e la piega tiene."],
  ["ghd", "ghd chronos Styler", 329, "styling", "prod-piastra-3",
    "La più veloce della gamma. Se hai i capelli lunghi ti fa risparmiare metà del tempo."],
  ["ghd", "ghd unplugged Styler", 329, "styling", "prod-piastra-4",
    "Senza filo, a batteria. Sta in borsa e funziona ovunque."],
  ["ghd", "ghd helios Asciugacapelli", 239, "styling", "prod-phon-1",
    "Flusso d'aria mirato: asciuga in fretta e lascia il capello liscio, senza crespo."],
  ["ghd", "ghd duet style", 399, "styling", "prod-phon-2",
    "Asciuga e piastra insieme, partendo dal capello bagnato."],
  ["ghd", "ghd curve Creative Curl Wand", 169, "styling", "prod-ferro-1",
    "Ferro conico per onde morbide che il giorno dopo ci sono ancora."],
  ["ghd", "ghd rise Volumizing Hot Brush", 189, "styling", "prod-spazzola-1",
    "Spazzola calda che dà volume alla radice senza appesantire."],
  ["ghd", "ghd glide Hot Brush", 159, "styling", "prod-spazzola-2",
    "Liscia in fretta sui capelli già asciutti. Comoda al mattino."],
  ["ghd", "ghd Oval Dressing Brush", 25, "styling", "prod-spazzola-3",
    "Spazzola ovale per rifinire la piega."],
  ["ghd", "ghd Paddle Brush", 29, "styling", "prod-spazzola-3",
    "Piatta e larga: districa i capelli lunghi senza spezzarli."],
  ["ghd", "ghd Heat Protect Spray", 22, "styling", "prod-spray-1",
    "Protegge fino a 200°C. Da mettere sempre prima della piastra."],

  ["Claudia Nails", "Olio cuticole alla mandorla", 14, "mani", "prod-olio-cuticole",
    "Una goccia per unghia ogni sera: è quello che fa durare il semipermanente."],
  ["Claudia Nails", "Crema mani nutriente", 18, "mani", "prod-crema-mani",
    "Si assorbe subito e non unge, quindi la usi anche prima di uscire."],
  ["Claudia Nails", "Base rinforzante", 15, "mani", "prod-base-rinforzante",
    "Per unghie che si sfaldano. Funziona anche da sola, senza colore sopra."],
  ["Claudia Nails", "Lima in vetro", 9, "mani", "prod-lima-vetro",
    "Non sfibra il bordo come quelle di cartone, e dura anni."],
  ["Claudia Nails", "Scrub piedi al sale", 16, "piedi", "prod-scrub-piedi",
    "Tiene la pelle morbida fra un pedicure e l'altro."],
  ["Claudia Nails", "Kit rimozione semipermanente", 24, "piedi", "prod-kit-rimozione",
    "Per toglierlo in casa senza grattare e senza rovinare l'unghia."],
];

export const PRODOTTI: readonly Prodotto[] = RIGHE.map(
  ([marca, nome, prezzo, famiglia, immagine, descrizione], i) => ({
    id: `p${i}`,
    marca,
    nome,
    prezzo,
    famiglia,
    descrizione,
    immagine: `/images/${immagine}.webp`,
    // Nessun prezzo è confermato dal salone: i ghd sono stime di listino,
    // la linea interna è inventata per la demo.
    verificato: false,
  }),
);

const PER_ID = new Map(PRODOTTI.map((p) => [p.id, p]));

export function prodotto(id: string): Prodotto | undefined {
  return PER_ID.get(id);
}

export const FAMIGLIE: ReadonlyArray<{ id: FamigliaProdotto | "tutti"; nome: string }> = [
  { id: "tutti", nome: "Tutti" },
  { id: "styling", nome: "Styling ghd" },
  { id: "mani", nome: "Cura mani" },
  { id: "piedi", nome: "Cura piedi" },
];

/** Soglia oltre la quale la spedizione non si paga. */
export const SPEDIZIONE_GRATIS_DA = 60;
export const COSTO_SPEDIZIONE = 6;

/** Prodotti da suggerire in fondo alla scheda di un trattamento. */
export function correlatiPerCategoria(categoriaId: string): Prodotto[] {
  const famiglia: FamigliaProdotto =
    categoriaId === "pedicure" || categoriaId === "semipermanente-piedi"
      ? "piedi"
      : "mani";
  const scelti = PRODOTTI.filter((p) => p.famiglia === famiglia);
  // Se una famiglia ha poche voci, completo con la cura mani: meglio quattro
  // suggerimenti coerenti che due caselle vuote nel carosello.
  return scelti.length >= 4
    ? scelti.slice(0, 4)
    : [...scelti, ...PRODOTTI.filter((p) => p.famiglia === "mani")].slice(0, 4);
}
