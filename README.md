# BlendingStation

**Calcolatore di miscelazione gas e generatore di report per centri immersione.**

🌐 **App online:** [blendingstation.github.io](https://blendingstation.github.io)

BlendingStation è una Progressive Web App (PWA) pensata per chi prepara miscele respiratorie per la subacquea tecnica e ricreativa. Calcola come ottenere la miscela desiderata a partire da ciò che c'è già nella bombola e produce un report stampabile da consegnare al cliente o da archiviare.

È nata ed è usata ogni giorno in un centro immersioni per gestire le ricariche Nitrox e Trimix dei clienti.

---

## Cosa fa

### Calcolo della miscela
- Calcolo per **Nitrox** e **Trimix** (normossico e ipossico) con il metodo a pressioni parziali
- Parte dal contenuto residuo della bombola e indica quanto gas aggiungere, nell'ordine corretto
- **Spurgo controllabile dall'utente**: se la miscela residua non permette di raggiungere quella richiesta, l'app indica quanto scaricare, ma la scelta di spurgare resta all'operatore
- Gestione dei diversi **tipi di bombola**, incluse le configurazioni bibombola

### Report e registro
- **Report di miscelazione stampabile** con tutti i dati della ricarica e il tipo di bombola
- **Registro di Miscelazione Gas** in formato documento formale, con:
  - campi compilati automaticamente dai dati dell'app
  - doppia firma (operatore e cliente)
  - informativa privacy (GDPR)
- Layout di stampa ottimizzato anche da smartphone (una sola pagina)

### Interfaccia
- **Multilingua**: italiano e altre cinque lingue
- Impostazioni organizzate in pannelli a fisarmonica
- Funziona offline una volta installata

---

## Installazione

BlendingStation non richiede installazione da store: basta aprirla dal browser.

**Su smartphone (consigliato)**
1. Apri [blendingstation.github.io](https://blendingstation.github.io)
2. **iPhone/iPad (Safari):** tocca *Condividi* → *Aggiungi alla schermata Home*
3. **Android (Chrome):** menu ⋮ → *Installa app* / *Aggiungi a schermata Home*

L'app comparirà tra le altre app e funzionerà anche senza connessione.

**Su computer:** apri il link in Chrome o Edge e clicca l'icona di installazione nella barra degli indirizzi.

### Aggiornamenti
L'app si aggiorna da sola tramite il service worker. Se dopo un rilascio vedi ancora la versione precedente, chiudi completamente l'app e riaprila (o ricarica la pagina un paio di volte).

---

## Struttura del progetto

| File | Descrizione |
|---|---|
| `index.html` | Interfaccia e logica principale dell'app |
| `manifest.json` | Manifest della PWA (nome, icone, colori) |
| `service-worker.js` | Cache offline e gestione degli aggiornamenti |

Il sito è pubblicato tramite **GitHub Pages** direttamente da questo repository.

### Rilasciare una nuova versione
Quando modifichi i file dell'app, incrementa il numero di versione della cache in `service-worker.js`: è ciò che forza l'aggiornamento sui dispositivi in cui l'app è già installata.

---

## ⚠️ Avvertenza di sicurezza

BlendingStation è uno strumento di supporto al calcolo. **Non sostituisce la formazione come gas blender né l'analisi della miscela.**

- Ogni bombola deve essere **analizzata** (O₂ e, per il Trimix, He) dopo la ricarica e prima dell'uso.
- L'operatore è responsabile del rispetto delle procedure di sicurezza, della compatibilità all'ossigeno delle attrezzature e delle norme vigenti.
- Il subacqueo deve verificare personalmente la miscela e la relativa MOD prima dell'immersione.

L'uso dell'app è a proprio rischio.

---

## Autore

Sviluppata da **Kiko** — sviluppatore e subacqueo tecnico.
Fa parte di una piccola famiglia di strumenti per la comunità subacquea, insieme a **TankLabel** (generatore di etichette per bombole Nitrox/Trimix).
