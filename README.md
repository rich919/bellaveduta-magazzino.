# Claudia Nails — app del centro estetico

App mobile per **Claudia Nails**, centro estetico con **due sedi a Roma**:
Garbatella (Via Nicolò da Pistoia 38) e Montagnola (Piazzale Caduti della
Montagnola 7). Le clienti scelgono la sede, poi trattamento, operatrice, giorno e
orario; il gestionale mostra le due agende, su un indirizzo separato.

**È una demo.** Prima di darla in mano alle clienti va letta la sezione
"Cosa va confermato" in fondo: alcuni dati sono ipotesi dichiarate.

## Avvio

```bash
npm install
cp .env.example .env.local     # poi riempi i valori
npm run dev                    # http://localhost:3000
```

| Comando | Cosa fa |
|---|---|
| `npm run dev` | sviluppo |
| `npm run build` | build di produzione |
| `npm test` | test della disponibilità (19 casi) |
| `npm run lint` | ESLint |
| `npm run immagini` | rigenera le foto con kie.ai (serve `KIE_API_KEY`) |

## Due indirizzi, una sola codebase

Il gestionale non è una pagina nascosta del sito: sul dominio pubblico il suo
codice **non è raggiungibile**. Lo decide `APP_MODE`, letto da `src/middleware.ts`.

| Progetto Vercel | `APP_MODE` | Espone |
|---|---|---|
| `claudia-nails` | `site` (default) | solo il sito. `/gestionale` → **404** |
| `claudia-nails-gestionale` | `admin` | solo la dashboard, dietro login. Le rotte pubbliche → **404** |

Entrambi i progetti puntano allo **stesso repository**: cambia solo la variabile
d'ambiente.

### Variabili su Vercel

Sul progetto `site` basta `APP_MODE=site`.
Sul progetto `admin` servono tutte e tre, altrimenti l'app si rifiuta di partire:

```
APP_MODE=admin
ADMIN_PASSWORD=<la password del salone>
AUTH_SECRET=<openssl rand -base64 32>
```

`KIE_API_KEY` serve **solo in locale** per rigenerare le foto: su Vercel non va messa.

## Struttura

```
src/app/(cliente)/      home, servizi, prenota, shop, profilo, dove siamo
src/app/gestionale/     login e cruscotto
src/app/api/gestionale/ apertura e chiusura sessione
src/middleware.ts       separazione dei due indirizzi + guardia del cookie
src/lib/data/           listino, operatrici, prodotti, anagrafica salone
src/lib/booking/slots.ts   calcolo della disponibilità (+ test)
src/lib/store/          layer dati, oggi su localStorage
src/lib/payments/       layer pagamenti, oggi simulato
scripts/                generazione e compressione delle immagini
```

### I due layer sostituibili

Tutta l'app parla con due sole interfacce, mai con l'implementazione:

- **`AppointmentsRepo`** (`src/lib/store/types.ts`) — oggi `local.ts` su
  localStorage. Per passare a Supabase: scrivere `supabase.ts` che implementa la
  stessa interfaccia e cambiare una riga in `store/index.ts`. Nessun componente
  da toccare.
- **`PaymentProvider`** (`src/lib/payments/types.ts`) — oggi `mock.ts`, che
  simula. L'interfaccia è disegnata per Stripe Checkout: non esiste un campo per
  il numero di carta, perché quei dati non devono passare da noi. Per attivare
  Stripe: `stripe.ts` + webhook, e una riga in `payments/index.ts`.

### Le due sedi

Non sono un'etichetta: hanno **personale diverso**, **agende separate** e
**listini diversi**. Il vincolo che struttura tutto è che il **parrucchiere
esiste solo alla Montagnola**, quindi i trattamenti capelli non compaiono
nemmeno quando la cliente ha scelto Garbatella.

La sede scelta vive nello stato del cliente (`StatoApp`), si sceglie una volta e
resta. Cambiarla azzera operatrice e orario già selezionati: sarebbero riferiti a
persone che nell'altra sede non ci sono. Nel gestionale c'è un interruttore in
testata; cambiando sede si azzera anche il filtro per operatrice, altrimenti
resterebbe puntato su qualcuno che lì non lavora e la griglia sembrerebbe vuota
senza spiegazione.

Le eccezioni si dichiarano in `sedi.ts` con `categorieEscluse`: elencare cosa
*manca* invece di cosa *c'è* evita di dimenticarsi di abilitare una categoria
nuova su entrambe.

### Disponibilità

`src/lib/booking/slots.ts` è la parte con più insidie, quindi è tutta in funzioni
pure e coperta da 19 test (`npm test`). Le regole:

- chiuso la domenica;
- il trattamento deve entrare **intero** prima della chiusura: alle 18:30 non si
  può iniziare un servizio da un'ora;
- la disponibilità è **per operatrice**, e solo fra quelle abilitate a quella
  categoria;
- si propone solo chi **lavora in quella sede**;
- gli appuntamenti annullati liberano il posto;
- oggi non si propongono orari già passati;
- con "nessuna preferenza" l'assegnazione **bilancia il carico** e preferisce la
  specialista. Senza questa regola Claudia, che sa fare tutto, si prendeva ogni
  prenotazione automatica lasciando ferme le altre.

## Immagini

Le 44 foto sono generate con **kie.ai** (`google/nano-banana`, 1K) e
**committate** in `public/images`.

La coerenza fra scatti diversi non viene dai singoli prompt ma da una radice
comune (`STILE` in `generate-images.mjs`) che fissa quattro cose e non le cambia
mai: **stessa ottica** (medio formato, 85mm), **stessa luce** (finestra da
sinistra, ombre morbide), **stessa palette** (crema, rosa antico, cammello,
terracotta chiara, desaturati) e **stessa resa di pellicola**. Cambiarne anche
una sola su metà delle immagini basta a far sembrare la serie un collage di
stock diversi. È una scelta, non una scorciatoia: gli URL restituiti da
kie.ai **scadono dopo 24 ore**, quindi un sito che li linkasse resterebbe senza
foto il giorno dopo il deploy. Committandole diventano file statici sulla CDN di
Vercel: restano per sempre, non costano nulla per visita, e la chiave API non
raggiunge mai il browser.

`scripts/optimize-images.mjs` le converte in WebP: da 48 MB a 1,4 MB, il 97% in
meno, senza differenze visibili.

Per rigenerarle:

```bash
KIE_API_KEY=... npm run immagini
node scripts/optimize-images.mjs
```

## Cosa va confermato prima della produzione

Niente di quanto segue è un bug: sono punti dove ho dovuto ipotizzare, e sono
segnalati anche dentro l'app.

1. **Prezzi del listino.** 19 voci hanno prezzo e durata letti uno per uno sulla
   scheda Treatwell del salone. Le altre sono ipotesi ancorate al "da € X" che
   Treatwell mostra per quelle categorie: nel codice hanno `verificato: false` e
   nell'app portano l'etichetta *da confermare*.
2. **Assegnazione dello staff alle sedi.** Nomi e ruoli delle otto persone —
   Claudia, Gloria, Angela, Martina, Giorgia, Letizia, Michela, Melania — sono
   quelli **veri** della pagina "Chi siamo". Il sito però non dice chi lavora
   dove: l'unico vincolo certo è che Gloria, unica parrucchiera, sta alla
   Montagnola. La ripartizione del resto, e le competenze di dettaglio, sono una
   proposta da confermare in `src/lib/data/staff.ts`.
3. **Prodotti ghd.** I nomi sono quelli reali di catalogo, i prezzi sono stime al
   listino italiano. Le **fotografie sono still life generici e senza marchio**:
   non riproducono i prodotti ghd e vanno sostituite con quelle ufficiali fornite
   dal marchio, come è prassi per un rivenditore autorizzato.
4. **Tessera a punti.** Soglie, premi e vantaggi in `src/lib/membership.ts` sono
   una proposta: quanto essere generosi è una decisione commerciale.
5. **Listino del parrucchiere.** Il servizio è confermato dal sito ufficiale ma
   il listino non è pubblicato: prezzi e durate dei cinque trattamenti capelli
   sono stime.
6. **Recensioni.** Quelle in `salon.ts` sono scritte per la demo. Le vere vanno
   importate da Treatwell.
7. **Ritratti e ambienti.** Sono immagini generate: i ritratti dello staff sono
   segnaposto e **non ritraggono le persone vere**, che vanno fotografate.

## Limite noto: i dati non sono condivisi

`localStorage` è **per browser e per dominio**. Conseguenze:

- due dispositivi diversi vedono agende diverse;
- una prenotazione fatta sul dominio pubblico **non compare** sul dominio del
  gestionale, perché sono due origini distinte.

Il gestionale mostra comunque un'agenda completa e realistica generata dal seed,
quindi la demo del cruscotto funziona. Ma il passaggio "prenoto e la titolare lo
vede" richiede un database condiviso: è esattamente ciò che risolve il passaggio
a Supabase descritto sopra, ed è il primo lavoro da fare dopo la demo.
