/**
 * Listino trattamenti.
 *
 * Il campo `verificato` distingue due cose molto diverse:
 *
 *   verificato: true   prezzo e durata letti uno per uno sulla scheda Treatwell
 *                      del salone (luglio 2026). Sono i dati reali.
 *
 *   verificato: false  Treatwell mostra quella categoria solo come "da € X"
 *                      senza esporre il dettaglio delle singole voci. Qui la
 *                      voce è un'ipotesi ancorata a quel prezzo minimo, messa
 *                      per rendere la demo completa. VA CONFERMATA DAL SALONE
 *                      prima di andare in produzione.
 *
 * L'interfaccia mostra un'etichetta "da confermare" su tutte le voci con
 * `verificato: false`, così la distinzione resta visibile e non si perde.
 */

export type CategoriaId =
  | "semipermanente-mani"
  | "semipermanente-piedi"
  | "semigel"
  | "ricostruzione"
  | "manicure"
  | "pedicure"
  | "ceretta"
  | "viso"
  | "ciglia"
  | "massaggi"
  | "capelli";

export type Categoria = {
  id: CategoriaId;
  nome: string;
  /**
   * Nome cortissimo per le icone tonde della home e per i filtri.
   * Non si può ricavare tagliando `nome` alla prima parola: "Semipermanente
   * mani" e "Semipermanente piedi" diventerebbero due etichette identiche.
   */
  etichetta: string;
  /** Testo breve mostrato sotto il titolo di categoria nel listino. */
  descrizione: string;
  /** Token CSS della tinta che codifica la categoria in tutta l'app. */
  tinta: string;
};

export const CATEGORIE: readonly Categoria[] = [
  {
    id: "semipermanente-mani",
    etichetta: "Mani",
    nome: "Semipermanente mani",
    descrizione: "Smalto che regge tre settimane, con o senza rinforzo.",
    tinta: "--cat-semi-mani",
  },
  {
    id: "semipermanente-piedi",
    etichetta: "Piedi",
    nome: "Semipermanente piedi",
    descrizione: "Lo stesso smalto, sui piedi.",
    tinta: "--cat-semi-piedi",
  },
  {
    id: "semigel",
    etichetta: "Semigel",
    nome: "Semigel",
    descrizione: "Struttura e colore insieme: baby boomer, french, correttivo.",
    tinta: "--cat-semigel",
  },
  {
    id: "ricostruzione",
    etichetta: "Ricostruz.",
    nome: "Ricostruzione unghie",
    descrizione: "Allungamento, refill e riparazioni.",
    tinta: "--cat-ricostruzione",
  },
  {
    id: "manicure",
    etichetta: "Manicure",
    nome: "Manicure e trattamenti mani",
    descrizione: "Forma, cuticole, cura della mano.",
    tinta: "--cat-manicure",
  },
  {
    id: "pedicure",
    etichetta: "Pedicure",
    nome: "Pedicure e trattamenti piedi",
    descrizione: "Estetico e curativo.",
    tinta: "--cat-pedicure",
  },
  {
    id: "ceretta",
    etichetta: "Ceretta",
    nome: "Ceretta e depilazione",
    descrizione: "Corpo, viso e zone intime.",
    tinta: "--cat-ceretta",
  },
  {
    id: "viso",
    etichetta: "Viso",
    nome: "Trattamenti viso",
    descrizione: "Pulizia profonda e idratazione.",
    tinta: "--cat-viso",
  },
  {
    id: "ciglia",
    etichetta: "Ciglia",
    nome: "Ciglia e sopracciglia",
    descrizione: "Extension e laminazione.",
    tinta: "--cat-ciglia",
  },
  {
    id: "massaggi",
    etichetta: "Massaggi",
    nome: "Massaggi e corpo",
    descrizione: "Rilassanti, decontratturanti, esfolianti.",
    tinta: "--cat-massaggi",
  },
  {
    id: "capelli",
    etichetta: "Capelli",
    nome: "Parrucchiere",
    // Solo alla Montagnola: vedi categorieEscluse in sedi.ts.
    descrizione: "Taglio, piega e colore. Solo alla Montagnola.",
    tinta: "--cat-capelli",
  },
] as const;

export type Servizio = {
  id: string;
  categoria: CategoriaId;
  nome: string;
  /** In euro. */
  prezzo: number;
  /** In minuti, comprensiva di preparazione. */
  durata: number;
  descrizione: string;
  verificato: boolean;
};

/** Tuple compatte: [categoria, nome, prezzo, durata, verificato, descrizione] */
const RIGHE: ReadonlyArray<
  [CategoriaId, string, number, number, boolean, string]
> = [
  // ── Verificati su Treatwell ────────────────────────────────────────────
  ["semipermanente-mani", "Monocolore", 25, 60, true, "Una tinta piena, a scelta dalla cartella."],
  ["semipermanente-mani", "French", 35, 60, true, "La lunetta bianca classica."],
  ["semipermanente-mani", "Semipermanente rinforzato", 35, 60, true, "Con base rinforzante, per unghie che si sfaldano."],
  ["semipermanente-mani", "Rinforzato con french", 45, 60, true, "Rinforzo e lunetta insieme."],

  ["semipermanente-piedi", "Monocolore", 25, 45, true, "Una tinta piena sui piedi."],
  ["semipermanente-piedi", "French", 35, 45, true, "La lunetta bianca sui piedi."],

  ["semigel", "Semigel", 40, 60, true, "Struttura leggera e colore in un solo passaggio."],
  ["semigel", "Baby Boomer", 50, 60, true, "La sfumatura dal nude al bianco."],
  ["semigel", "French", 50, 60, true, "French in semigel."],
  ["semigel", "Semigel correttivo", 50, 60, true, "Corregge la forma dell'unghia mentre la copre."],
  ["semigel", "Baby Boomer in struttura", 55, 60, true, "Baby boomer con struttura piena."],

  ["ricostruzione", "Riparazione singola unghia", 3, 15, true, "Rimetti a posto una sola unghia."],
  ["ricostruzione", "Cambio smalto piedi", 15, 15, true, "Rimozione e nuova stesura."],

  ["ceretta", "Ceretta inguine parziale", 15, 10, true, "Solo il perimetro."],
  ["ceretta", "Ceretta inguine totale", 20, 20, true, "Completa."],

  ["viso", "Pulizia viso profonda", 35, 60, true, "Detersione, vapore, estrazione e maschera."],

  ["ciglia", "Extension ciglia volume", 60, 90, true, "Applicazione ciglia a volume."],

  ["massaggi", "Massaggio rilassante 50′", 25, 50, true, "Schiena, spalle e collo."],
  ["massaggi", "Scrub corpo esfoliante", 40, 45, true, "Esfoliazione completa e idratazione."],

  // ── Da confermare: Treatwell espone solo il "da € X" di categoria ──────
  ["ricostruzione", "Refill gel", 40, 75, false, "Rigenera la ricostruzione già presente."],
  ["ricostruzione", "Ricostruzione completa in gel", 55, 90, false, "Allungamento e struttura da zero."],

  ["manicure", "Limatura e forma", 10, 20, false, "Solo forma, senza smalto."],
  ["manicure", "Manicure classica", 18, 40, false, "Forma, cuticole e crema."],
  ["manicure", "Manicure con smalto", 22, 50, false, "Manicure completa più smalto tradizionale."],

  ["pedicure", "Pedicure estetico", 30, 50, false, "Forma, cuticole e smalto."],
  ["pedicure", "Pedicure curativo", 38, 60, false, "Con trattamento di callosità e talloni."],

  ["ceretta", "Ceretta gambe complete", 25, 30, false, "Dalla caviglia all'inguine."],
  ["ceretta", "Ceretta mezze gambe", 15, 20, false, "Dal ginocchio in giù."],
  ["ceretta", "Ceretta ascelle", 10, 10, false, "Rapida."],
  ["ceretta", "Ceretta braccia", 15, 20, false, "Braccia complete."],
  ["ceretta", "Baffetti", 5, 10, false, "Labbro superiore."],
  ["ceretta", "Sopracciglia con pinzetta", 8, 15, false, "Disegno e pulizia."],

  ["viso", "Trattamento idratante", 40, 55, false, "Maschera e sieri per pelli secche."],

  ["ciglia", "Laminazione ciglia", 45, 60, false, "Curva e nutre le ciglia naturali."],
  ["ciglia", "Refill extension ciglia", 35, 60, false, "Mantenimento a tre settimane."],

  ["massaggi", "Massaggio decontratturante", 40, 60, false, "Lavoro mirato sulle contratture."],

  // Parrucchiere, disponibile solo alla Montagnola. Il sito ufficiale conferma
  // il servizio ma non pubblica il listino: prezzi e durate sono da confermare.
  ["capelli", "Taglio e piega", 35, 60, false, "Taglio su misura e piega finale."],
  ["capelli", "Piega", 20, 40, false, "Solo la piega, su capelli già lavati."],
  ["capelli", "Colore e piega", 55, 90, false, "Colore completo e piega."],
  ["capelli", "Colpi di sole", 65, 105, false, "Schiariture su tutta la lunghezza."],
  ["capelli", "Trattamento ricostruttivo", 30, 45, false, "Per capelli sfibrati da colore e calore."],
];

export const SERVIZI: readonly Servizio[] = RIGHE.map(
  ([categoria, nome, prezzo, durata, verificato, descrizione], i) => ({
    id: `${categoria}-${i}`,
    categoria,
    nome,
    prezzo,
    durata,
    verificato,
    descrizione,
  }),
);

const PER_ID = new Map(SERVIZI.map((s) => [s.id, s]));
const CATEGORIA_PER_ID = new Map(CATEGORIE.map((c) => [c.id, c]));

export function servizio(id: string): Servizio | undefined {
  return PER_ID.get(id);
}

export function categoria(id: CategoriaId): Categoria | undefined {
  return CATEGORIA_PER_ID.get(id);
}

export function serviziDi(categoriaId: CategoriaId): Servizio[] {
  return SERVIZI.filter((s) => s.categoria === categoriaId);
}

/** Prezzo minimo di una categoria, per le etichette "da € X". */
export function prezzoMinimo(categoriaId: CategoriaId): number {
  return Math.min(...serviziDi(categoriaId).map((s) => s.prezzo));
}
