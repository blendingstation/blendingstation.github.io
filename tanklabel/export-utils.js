/**
 * TankLabel - export-utils.js
 * Funzioni di esportazione: PDF, Immagine, Stampa nativa, Condivisione.
 * Estratto da index.html come parte del refactoring v4.0
 *
 * Dipendenze:
 *   - jsPDF (caricato via CDN)
 *   - html2canvas (caricato via CDN)
 *   - DOM e CONFIG definiti in index.html
 */

"use strict";

/* =========================================================
 * UTILITÀ INTERNE
 * ========================================================= */

/**
 * Prepara l'elemento etichetta per la cattura (canvas/PDF).
 * Aggiunge la classe .printing che rimuove i bordi decorativi.
 */
async function prepareCapture() {
  DOM.previewContainer.classList.add("printing");
  await new Promise((r) => setTimeout(r, 50));
  return DOM.labelContent;
}

/** Rimuove la classe .printing dopo la cattura. */
async function cleanupCapture() {
  DOM.previewContainer.classList.remove("printing");
}

/* =========================================================
 * PDF
 * ========================================================= */

/**
 * Genera un PDF con l'etichetta nelle dimensioni esatte in mm.
 * Usa html2canvas per rasterizzare e jsPDF per l'output.
 */
async function generatePdf() {
  const element = await prepareCapture();

  try {
    const canvas = await html2canvas(element, {
      scale: 4,
      useCORS: true,
      backgroundColor: "#ffffff",
    });
    const imgData = canvas.toDataURL("image/png");

    const { jsPDF } = window.jspdf;
    const widthMm = parseFloat(DOM.inputs.labelWidth.value);
    const heightMm = parseFloat(DOM.inputs.labelHeight.value);

    const doc = new jsPDF({
      orientation: widthMm > heightMm ? "l" : "p",
      unit: "mm",
      format: [widthMm + 10, heightMm + 10],
    });

    doc.addImage(imgData, "PNG", 5, 5, widthMm, heightMm);
    doc.save(`TankLabel_Label_${Date.now()}.pdf`);
  } catch (e) {
    console.error("Errore PDF:", e);
    alert("Errore nella generazione del PDF.");
  } finally {
    cleanupCapture();
  }
}

/* =========================================================
 * IMMAGINE PNG
 * ========================================================= */

/**
 * Esporta l'etichetta come file PNG ad alta risoluzione (scala 4x).
 */
async function generateImage() {
  const element = await prepareCapture();
  try {
    const canvas = await html2canvas(element, {
      scale: 4,
      backgroundColor: null,
    });
    const link = document.createElement("a");
    link.download = `TankLabel_Label_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  } catch (e) {
    console.error("Errore immagine:", e);
    alert("Errore nella generazione dell'immagine.");
  } finally {
    cleanupCapture();
  }
}

/* =========================================================
 * STAMPA NATIVA (WiFi / stampanti di sistema)
 * ========================================================= */

/**
 * Stampa l'etichetta tramite il dialogo di stampa nativo del browser.
 *
 * Come funziona:
 *  1. Clona il nodo .label-content nell'elemento #print-area
 *  2. Imposta le dimensioni esatte in mm tramite stile inline sul clone
 *  3. Chiama window.print() — il CSS @media print nasconde tutto il resto
 *  4. Pulisce #print-area dopo la stampa
 *
 * Compatibilità stampanti:
 *  - WiFi / AirPrint / Stampa di sistema → funziona direttamente
 *  - Bluetooth termica → funziona se il driver della stampante è installato
 *    e compare nel dialogo di stampa del sistema operativo
 */
async function printLabel() {
  const widthMm = parseFloat(DOM.inputs.labelWidth.value) || 50;
  const heightMm = parseFloat(DOM.inputs.labelHeight.value) || 50;
  const basePx = parseFloat(DOM.inputs.basePxSize.value) || 16;

  const printArea = document.getElementById("print-area");
  const clone = DOM.labelContent.cloneNode(true);

  // Dimensioni esatte in mm (la scala schermo non si applica in stampa)
  clone.style.width = `${widthMm}mm`;
  clone.style.height = `${heightMm}mm`;
  clone.style.fontSize = `${basePx}px`;
  clone.style.setProperty("--base-px-size", `${basePx}px`);

  printArea.innerHTML = "";
  printArea.appendChild(clone);

  // Inietta @page con dimensioni esatte dell'etichetta.
  // Deve stare al top-level del documento (non dentro @media print) per essere valido.
  const pageStyle = document.createElement("style");
  pageStyle.id = "_kiko_page_size";
  pageStyle.textContent = `@page { size: ${widthMm}mm ${heightMm}mm; margin: 0; }`;
  document.head.appendChild(pageStyle);

  await new Promise((r) => setTimeout(r, 80));
  window.print();

  // Pulizia ritardata (window.print() è sincrono ma la pulizia non deve
  // avvenire prima che il browser abbia renderizzato la stampa)
  setTimeout(() => {
    printArea.innerHTML = "";
    document.getElementById("_kiko_page_size")?.remove();
  }, 1000);
}

/* =========================================================
 * CONDIVISIONE (Web Share API)
 * ========================================================= */

/**
 * Condivide l'etichetta tramite il menu di condivisione nativo del SO.
 *
 * NOTA: usa navigator.share(), che apre il pannello "Condividi" di
 * Android/iOS. NON comunica direttamente con una stampante Bluetooth.
 * Per stampanti termiche Bluetooth, usare printLabel() e selezionare
 * la stampante dal dialogo di sistema, oppure usare app ponte come RawBT.
 */
async function shareViaBluetooth() {
  if (!navigator.share) {
    alert(
      "⚠️ Condivisione non supportata su questo browser.\n\nSuggerimento: usa il pulsante 'Immagine' per salvare il file, poi condividilo manualmente.",
    );
    return;
  }

  const element = await prepareCapture();

  try {
    const canvas = await html2canvas(element, {
      scale: 4,
      backgroundColor: "#ffffff",
    });
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    const fileName = `TankLabel_Label_${Date.now()}.png`;
    const file = new File([blob], fileName, { type: "image/png" });

    if (navigator.canShare && !navigator.canShare({ files: [file] })) {
      alert(
        "⚠️ Questo dispositivo non supporta la condivisione file.\n\nUsa il pulsante 'Immagine' per salvare e poi condividi manualmente.",
      );
      cleanupCapture();
      return;
    }

    await navigator.share({
      files: [file],
      title: "Etichetta TankLabel",
      text: "Etichetta bombola subacquea generata con TankLabel",
    });

    console.log("Etichetta condivisa con successo.");
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error("Errore condivisione:", error);
      alert(
        "Errore durante la condivisione. Prova con il pulsante 'Immagine'.",
      );
    }
  } finally {
    cleanupCapture();
  }
}
