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

async function prepareCapture() {
  DOM.previewContainer.classList.add("printing");
  await new Promise((r) => setTimeout(r, 50));
  return DOM.labelContent;
}

async function cleanupCapture() {
  DOM.previewContainer.classList.remove("printing");
}

/* =========================================================
 * PDF
 * ========================================================= */

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
 * Esporta l'etichetta come PNG ad alta risoluzione.
 * - Desktop: download diretto tramite <a download>
 * - iOS/Mobile: usa navigator.share() per aprire il pannello
 *   di condivisione nativo (Salva su Foto, AirDrop, ecc.)
 */
async function generateImage() {
  const element = await prepareCapture();
  try {
    const canvas = await html2canvas(element, {
      scale: 4,
      backgroundColor: null,
    });

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const fileName = `TankLabel_Label_${Date.now()}.png`;

    if (isIOS) {
      // iOS Safari non supporta <a download> — usa il pannello di condivisione nativo
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      const file = new File([blob], fileName, { type: "image/png" });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        // iOS 15+: condivisione file nativa → "Salva su Foto" / AirDrop / ecc.
        await navigator.share({
          files: [file],
          title: "Etichetta TankLabel",
          text: "Etichetta bombola subacquea",
        });
      } else {
        // Fallback iOS: apri immagine in nuova tab → tieni premuto per salvare
        const url = canvas.toDataURL("image/png");
        const w = window.open();
        if (w) {
          w.document.write(`<img src="${url}" style="max-width:100%;touch-action:pinch-zoom">`);
          w.document.title = fileName;
        } else {
          alert("Tieni premuto sull'immagine per salvarla.");
        }
      }
    } else {
      // Desktop / Android: download classico
      const link = document.createElement("a");
      link.download = fileName;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  } catch (e) {
    if (e.name !== "AbortError") {
      console.error("Errore immagine:", e);
      alert("Errore nella generazione dell'immagine.");
    }
  } finally {
    cleanupCapture();
  }
}

/* =========================================================
 * STAMPA NATIVA
 * ========================================================= */

async function printLabel() {
  const widthMm = parseFloat(DOM.inputs.labelWidth.value) || 50;
  const heightMm = parseFloat(DOM.inputs.labelHeight.value) || 50;
  const basePx = parseFloat(DOM.inputs.basePxSize.value) || 16;

  const printArea = document.getElementById("print-area");
  const clone = DOM.labelContent.cloneNode(true);

  clone.style.width = `${widthMm}mm`;
  clone.style.height = `${heightMm}mm`;
  clone.style.fontSize = `${basePx}px`;
  clone.style.setProperty("--base-px-size", `${basePx}px`);

  printArea.innerHTML = "";
  printArea.appendChild(clone);

  const pageStyle = document.createElement("style");
  pageStyle.id = "_kiko_page_size";
  pageStyle.textContent = `@page { size: ${widthMm}mm ${heightMm}mm; margin: 0; }`;
  document.head.appendChild(pageStyle);

  await new Promise((r) => setTimeout(r, 80));
  window.print();

  setTimeout(() => {
    printArea.innerHTML = "";
    document.getElementById("_kiko_page_size")?.remove();
  }, 1000);
}

/* =========================================================
 * CONDIVISIONE (Web Share API)
 * ========================================================= */

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
