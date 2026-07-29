/**
 * Cosa comprende ciascun tipo di trattamento.
 *
 * Serve a rispondere alla domanda che la cliente si fa davvero prima di
 * prenotare — "cosa mi fanno esattamente per venticinque euro?" — e a togliere
 * le telefonate di chiarimento al salone.
 *
 * Sono passaggi standard del mestiere, ma il dettaglio va rivisto con Claudia:
 * ogni salone lavora a modo suo.
 */

import type { CategoriaId } from "./services";

export const COSA_COMPRENDE: Readonly<Record<CategoriaId, readonly string[]>> = {
  "semipermanente-mani": [
    "Limatura e forma",
    "Cura delle cuticole",
    "Base rinforzante",
    "Smalto semipermanente",
    "Top coat lucido",
    "Olio nutriente",
  ],
  "semipermanente-piedi": [
    "Limatura e forma",
    "Cura delle cuticole",
    "Base protettiva",
    "Smalto semipermanente",
    "Top coat lucido",
    "Crema piedi",
  ],
  semigel: [
    "Preparazione dell'unghia",
    "Struttura in gel",
    "Colore a scelta",
    "Rifinitura della forma",
    "Top coat lucido",
    "Olio cuticole",
  ],
  ricostruzione: [
    "Rimozione del precedente",
    "Preparazione della lamina",
    "Applicazione del gel",
    "Modellatura",
    "Rifinitura e lucidatura",
    "Olio nutriente",
  ],
  manicure: [
    "Limatura e forma",
    "Ammorbidimento cuticole",
    "Pulizia del contorno",
    "Massaggio mani",
    "Crema nutriente",
  ],
  pedicure: [
    "Pediluvio",
    "Limatura e forma",
    "Cura delle cuticole",
    "Rimozione delle callosità",
    "Massaggio piedi",
    "Crema idratante",
  ],
  ceretta: [
    "Detersione della zona",
    "Cera tiepida a bassa temperatura",
    "Rimozione delicata",
    "Lenitivo post-ceretta",
  ],
  viso: [
    "Detersione profonda",
    "Vapore",
    "Estrazione",
    "Maschera su misura",
    "Siero specifico",
    "Crema finale",
  ],
  ciglia: [
    "Analisi delle ciglia naturali",
    "Applicazione ciuffo per ciuffo",
    "Rifinitura della curva",
    "Consigli di mantenimento",
  ],
  massaggi: [
    "Colloquio iniziale",
    "Olio caldo",
    "Massaggio mirato",
    "Rilassamento finale",
  ],
  capelli: [
    "Consulenza sul taglio",
    "Lavaggio con massaggio",
    "Taglio o colore",
    "Piega finale",
  ],
};
