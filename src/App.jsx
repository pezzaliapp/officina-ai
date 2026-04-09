import { useState, useEffect } from "react";
import "./App.css";

// ─── TRADUZIONI ───────────────────────────────────────────────────────────────
const T = {
  it: {
    title: "TechAssist AI",
    sub: "ASSISTENTE TECNICO",
    keyOk: "🔑 KEY OK",
    keyMissing: "🔑 KEY?",
    keyTitle: "Inserisci la tua API Key",
    keyHint: "Ottienila su",
    keySaved: "Salvata solo nel tuo browser.",
    keySave: "SALVA KEY",
    keyRemove: "Rimuovi",
    keyClose: "Chiudi",
    fieldLabel: "DOMANDA O PROBLEMA",
    fieldHint: "vibrazioni, calibrazioni, guasti, procedure, qualsiasi domanda tecnica",
    fieldPlaceholder: "Descrivi il problema o fai una domanda tecnica...",
    serialPlaceholder: "Es: MEC10-2024-001 (opzionale)",
    paramsLabel: "⊕ PARAMETRI VIBRAZIONI",
    paramsHint: "opzionale — affina la diagnosi",
    analyzeBtn: "⟁ AVVIA ANALISI AI",
    analyzing: "ANALISI IN CORSO...",
    writeFirst: "⟁ SCRIVI LA TUA DOMANDA",
    configKey: "🔑 CONFIGURA API KEY PER INIZIARE",
    diagnosisTitle: "DIAGNOSI AI",
    infoTitle: "RISPOSTA TECNICA",
    causeLabel: "CAUSA PROBABILE",
    actionLabel: "AZIONE RACCOMANDATA",
    procedureLabel: "PROCEDURA",
    copyReport: "COPIA REPORT",
    copyAnswer: "COPIA RISPOSTA",
    copied: "✓ COPIATO",
    waBtn: "📲 INVIA SU WHATSAPP",
    errorTitle: "Errore",
    checklistTitle: "ORDINE OPERATIVO VIBRAZIONI — REGOLA D'ORO",
    checklistItems: [
      ["01","Centraggio","Prima di tutto"],
      ["02","Ripetibilità","2 lanci → confronto"],
      ["03","Runout cerchio","Soglia 0.5 mm"],
      ["04","Runout gomma","Match-mount se > 1.5 mm"],
      ["05","Veicolo","Solo dopo esclusione ruota"],
    ],
    priority: "PRIORITÀ",
    reportHeader: "TECHASSIST OFFICINA — DIAGNOSI AI",
    reportHeaderInfo: "TECHASSIST OFFICINA — RISPOSTA AI",
    reportProblem: "PROBLEMA",
    reportQuestion: "DOMANDA",
    reportAnswer: "RISPOSTA",
    reportSerial: "N° SERIE",
    reportPriority: "PRIORITÀ",
    reportCause: "CAUSA PROBABILE",
    reportAction: "AZIONE RACCOMANDATA",
    reportProcedure: "PROCEDURA",
    keyError: "La key deve iniziare con AIza",
    esempi: [
      "Come si calibra la MEC10?",
      "Smontagomme PUMA che perde aria dal cilindro",
      "Ruota sempre sbilanciata lato interno dopo equilibratura",
    ],
  },
  en: {
    title: "TechAssist AI",
    sub: "TECHNICAL ASSISTANT",
    keyOk: "🔑 KEY OK",
    keyMissing: "🔑 KEY?",
    keyTitle: "Enter your API Key",
    keyHint: "Get it at",
    keySaved: "Saved only in your browser.",
    keySave: "SAVE KEY",
    keyRemove: "Remove",
    keyClose: "Close",
    fieldLabel: "QUESTION OR PROBLEM",
    fieldHint: "vibrations, calibrations, faults, procedures, any technical question",
    fieldPlaceholder: "Describe the problem or ask a technical question...",
    serialPlaceholder: "E.g.: MEC10-2024-001 (optional)",
    paramsLabel: "⊕ VIBRATION PARAMETERS",
    paramsHint: "optional — refines vibration diagnosis",
    analyzeBtn: "⟁ START AI ANALYSIS",
    analyzing: "ANALYZING...",
    writeFirst: "⟁ WRITE YOUR QUESTION FIRST",
    configKey: "🔑 SET UP API KEY TO START",
    diagnosisTitle: "AI DIAGNOSIS",
    infoTitle: "TECHNICAL ANSWER",
    causeLabel: "PROBABLE CAUSE",
    actionLabel: "RECOMMENDED ACTION",
    procedureLabel: "PROCEDURE",
    copyReport: "COPY REPORT",
    copyAnswer: "COPY ANSWER",
    copied: "✓ COPIED",
    waBtn: "📲 SEND VIA WHATSAPP",
    errorTitle: "Error",
    checklistTitle: "VIBRATION OPERATIONAL ORDER — GOLDEN RULE",
    checklistItems: [
      ["01","Centering","First of all"],
      ["02","Repeatability","2 spins → compare"],
      ["03","Rim runout","Threshold 0.5 mm"],
      ["04","Tyre runout","Match-mount if > 1.5 mm"],
      ["05","Vehicle","Only after ruling out wheel"],
    ],
    priority: "PRIORITY",
    reportHeader: "TECHASSIST WORKSHOP — AI DIAGNOSIS",
    reportHeaderInfo: "TECHASSIST WORKSHOP — AI ANSWER",
    reportProblem: "PROBLEM",
    reportQuestion: "QUESTION",
    reportAnswer: "ANSWER",
    reportSerial: "SERIAL NO.",
    reportPriority: "PRIORITY",
    reportCause: "PROBABLE CAUSE",
    reportAction: "RECOMMENDED ACTION",
    reportProcedure: "PROCEDURE",
    keyError: "Key must start with AIza",
    esempi: [
      "How do I calibrate the MEC10?",
      "PUMA tyre changer leaking air from cylinder",
      "Wheel always unbalanced on inner side after balancing",
    ],
  }
};

const SPEEDS_IT = [
  { id: "80-90", label: "80–90 km/h" },
  { id: "90-110", label: "90–110 km/h" },
  { id: "oltre110", label: "> 110 km/h" },
  { id: "solo-frenata", label: "Solo in frenata" },
  { id: "bassa", label: "< 40 km/h" },
  { id: "sempre", label: "Sempre / qualsiasi" },
];
const SPEEDS_EN = [
  { id: "80-90", label: "80–90 km/h" },
  { id: "90-110", label: "90–110 km/h" },
  { id: "oltre110", label: "> 110 km/h" },
  { id: "solo-frenata", label: "Braking only" },
  { id: "bassa", label: "< 40 km/h" },
  { id: "sempre", label: "Always / any speed" },
];
const LOCATIONS_IT = [
  { id: "volante", label: "Volante" },
  { id: "sedile", label: "Sedile / Pianale" },
  { id: "intera", label: "Tutta la scocca" },
];
const LOCATIONS_EN = [
  { id: "volante", label: "Steering wheel" },
  { id: "sedile", label: "Seat / Floor" },
  { id: "intera", label: "Whole body" },
];
const AXLES_IT = [
  { id: "anteriore", label: "Anteriore" },
  { id: "posteriore", label: "Posteriore" },
  { id: "entrambi", label: "Entrambi" },
  { id: "non-so", label: "Non so" },
];
const AXLES_EN = [
  { id: "anteriore", label: "Front" },
  { id: "posteriore", label: "Rear" },
  { id: "entrambi", label: "Both" },
  { id: "non-so", label: "Unknown" },
];
const CENTERING_IT = [
  { id: "cono-std", label: "Cono standard" },
  { id: "cono-corretto", label: "Centratore corretto" },
  { id: "flangia", label: "Flangia / Adapter" },
  { id: "non-verificato", label: "Non verificato" },
];
const CENTERING_EN = [
  { id: "cono-std", label: "Standard cone" },
  { id: "cono-corretto", label: "Correct centering" },
  { id: "flangia", label: "Flange / Adapter" },
  { id: "non-verificato", label: "Not checked" },
];
const PRECEDENTS_IT = [
  { id: "dopo-equil", label: "Dopo equilibratura" },
  { id: "dopo-montaggio", label: "Dopo montaggio gomme" },
  { id: "progressivo", label: "Comparso gradualmente" },
  { id: "dopo-urto", label: "Dopo urto / buche" },
  { id: "nessuno", label: "Nessun precedente" },
];
const PRECEDENTS_EN = [
  { id: "dopo-equil", label: "After balancing" },
  { id: "dopo-montaggio", label: "After tyre fitting" },
  { id: "progressivo", label: "Appeared gradually" },
  { id: "dopo-urto", label: "After impact / potholes" },
  { id: "nessuno", label: "No known event" },
];

// ─── KNOWLEDGE BASE ────────────────────────────────────────────────────────
// Suddivisa in sezioni. Il router seleziona solo quella rilevante per la domanda.

const KB = {
  base: `Sei TechAssist, assistente tecnico per officine meccaniche Cormach.
Rispondi SOLO in JSON valido, senza markdown, senza testo fuori dal JSON.
Se problema tecnico: {"tipo":"diagnosi","priorita":"alta"|"media"|"bassa","causa":"...","azione":"...","steps":["..."],"nota":"...","tags":["..."]}
Se domanda informativa: {"tipo":"info","risposta":"...","nota":"..."}
Rispondi nella stessa lingua della domanda.`,

  calibrazione: `PROCEDURA CALIBRAZIONE CAR/SUV — MEC 5, MEC 10, MEC 10 ESD, MEC 20, MEC 20-P:
Materiale necessario: ruota equilibrata con cerchio in ACCIAIO 15" larghezza 6" distanza ~100mm + 1 peso da 50g. NON usare cerchi in alluminio.
Passi esatti:
1. Accendere la macchina e togliere ruota e tutti gli accessori dall'albero
2. Premere [F+P3] → display mostra "SER SER" (modalità SERVICE attiva)
3. Premere [P3] → display mostra "CAL CAr"
4. Premere [P3] ancora → display mostra "CAL 0"
5. Abbassare il carter → la macchina esegue 4 lanci brevi poi 1 completo → display mostra "CAL 1"
6. Montare la ruota campione, inserire le dimensioni: [P1]=distanza, [P2]=larghezza, [P3]=diametro, [P4]/[P5] per variare i valori
7. Abbassare il carter → lancio
8. Ruotare la ruota a mano finché il display SINISTRO mostra "50" → applicare 50g lato INTERNO a ore 12
9. Abbassare il carter → lancio
10. Togliere il peso interno
11. Ruotare la ruota a mano finché il display DESTRO mostra "50" → applicare 50g lato ESTERNO a ore 12
12. Abbassare il carter → lancio (solo MEC 20: mantenere il carter abbassato per tutto il lancio)
13. Fine → la macchina torna automaticamente in modalità NORMAL
Per uscire in qualsiasi momento: premere [F+P3].`,

  calibrazione_moto: `PROCEDURA CALIBRAZIONE MOTO — MEC 5, MEC 10, MEC 20:
Prerequisito: calibrazione CAR/SUV già eseguita. ERR 031 = calibrazione MOTO mancante.
Passi:
1. Posizionare il gruppo MOTO sull'albero in posizione PERFETTAMENTE VERTICALE
2. Premere [F+P3] → SERVICE → premere [P3] → "CAL CAr" → premere [P4] → "CAL Mot" → premere [P3] → "CAL 0"
3. Abbassare il carter → lancio
4. Display mostra "h12 CAL" → applicare il peso lato INTERNO, portare il gruppo MOTO verticale con il peso in alto
5. Abbassare il carter → lancio
6. Display mostra "CAL h12" → applicare il peso lato ESTERNO, portare verticale con il peso in alto
7. Abbassare il carter → lancio → fine, ritorno automatico in NORMAL
ERR 043 = la bridà non è esattamente verticale → riposizionare e riprovare.`,

  esd: `ESD — EASY SONAR DATA (solo MEC 10 ESD):
Calcola automaticamente la larghezza ruota. Funziona SOLO con cerchi in FERRO, non alluminio.
Procedura:
1. Montare la ruota sull'albero
2. Estrarre il tastatore, appoggiarlo sul cerchio → attendere il bip lungo → riposizionarlo a riposo
3. Il programma STANDARD + ESD si attivano automaticamente
4. Abbassare il carter per avviare il lancio → ESD calcola la larghezza automaticamente
Se display mostra "URN 002" poi "LAr" → valore ESD non valido → misurare la larghezza manualmente e inserirla con [P4]/[P5].`,

  errori: `CODICI ERRORE EQUILIBRATRICI MEC — cause e soluzioni:
ERR 000-009 (INT ERR): Errore interno parametri → contattare assistenza tecnica
ERR 010 (REV SPN): Rotazione inversa della ruota → contattare assistenza
ERR 012 (NO STP): Ruota non si arresta → controllare tensione rete; se persiste → assistenza
ERR 014 (NO SPN): Ruota non ruota → contattare assistenza
ERR 015: Tasti premuti all'accensione → rilasciare tutti i tasti, spegnere e riaccendere
ERR 016 (DIS OUT): Tastatore distanza non a riposo → riposizionarlo; oppure [F+P2] per disabilitare temporaneamente
ERR 017 (LAR OUT): Tastatore larghezza non a riposo → riposizionarlo; oppure [F+P2] per disabilitare
ERR 019 (NO CP): Processore comunicazione assente → spegnere e riaccendere; porta USB disabilitata
ERR 020 (NO EEP): Nessuna comunicazione EEPROM → spegnere e riaccendere; se persiste → assistenza
ERR 021 (EEP ERR): Dati calibrazione assenti o corrotti → eseguire calibrazione CAR/SUV e/o MOTO
ERR 022-024: Segnale pick-up canale A troppo alto → spegnere e riaccendere; se persiste → assistenza
ERR 025 (SHF IMB): Peso presente durante fase CAL0 → togliere il peso e ripetere il lancio CAL0
ERR 026 (NO -A-): Segnale pick-up A assente durante CAL2 → applicare il peso e ripetere
ERR 027 (NO -B-): Segnale pick-up B assente durante CAL2 → applicare il peso e ripetere
ERR 028 (INN IMB): Peso interno durante CAL3, deve essere ESTERNO → togliere e ripetere
ERR 030 (CAR CAL): Dati calibrazione CAR/SUV assenti → eseguire calibrazione CAR/SUV
ERR 031 (MOT CAL): Dati calibrazione MOTO assenti → eseguire calibrazione MOTO
ERR 034 (ALU -1-): Tipo ruota MOTO attivo → impossibile cambiare programma
ERR 039 (W.GUARD): Carter aperto → abbassare il carter
ERR 042: Procedura SWI annullata → verificare freno elettromagnetico e attrito
ERR 043 (NO VRT): Bridà moto non verticale durante calibrazione → riposizionare verticalmente
ERR 046 (NO DIA): Tastatore diametro disconnesso → premere [F+P2] per disabilitare
ERR 047 (NO LAR): Tastatore larghezza disconnesso → premere [F+P2] per disabilitare
ERR 050: Pesi nascosti: ruota già equilibrata lato esterno → operazione non consentita
ERR 051 (TOO FAR): Pesi nascosti: punto W1 oltre 120° dal balourd esterno → selezionare punto più vicino
ERR 052 (NOT INC): Pesi nascosti: balourd esterno non compreso tra W1 e W2 → rifare procedura
ERR 055 (NO OPT): Balourd statico troppo basso per programma ottimizzazione (soglia < 12g)
AVV 001 (DO OPT): Balourd eccessivo → consigliato usare programma ottimizzazione`,

  vibrazioni: `REGOLE DIAGNOSI VIBRAZIONI:
- Vibrazione SOLO in frenata → problema freni o disco, NON squilibrio ruota
- Vibrazione a BASSA velocità (<40 km/h) → runout cerchio o gomma, non squilibrio
- Cono standard su cerchio ALLUMINIO → centraggio errato, usare centratore corretto
- Comparso dopo URTO o buche → verificare cerchio per ammaccature prima di bilanciare
- Vibrazione al volante → prevalentemente asse anteriore
- Vibrazione al sedile/pianale → prevalentemente asse posteriore
- Ripetibile su entrambi i lanci → problema ruota (squilibrio, runout)
- Non ripetibile → problema centraggio o serraggio
Ordine operativo: 1.Centraggio 2.Ripetibilità 3.Runout cerchio 4.Runout gomma 5.Veicolo`,

  smontagomme: `SMONTAGOMME CORMACH (PUMA, CM 1200BB, F535S, F536S, LIGRO):
Problemi comuni:
- Perdita aria dal cilindro → guarnizioni cilindro usurate, raccordi pneumatici allentati, valvola difettosa. Soluzione: verificare pressione compressore (min 8 bar), controllare tutti i raccordi, sostituire guarnizioni
- Braccio non scende → pressione compressore insufficiente, blocco meccanico, olio esaurito. Soluzione: verificare pressione, lubrificare guide, controllare valvola di discesa
- Testa non ruota → problema motore o cinghia o finecorsa. Soluzione: verificare alimentazione elettrica, tensione cinghia, posizione finecorsa
- Bead breaker non funziona → pressione insufficiente, usura lame. Soluzione: aumentare pressione, verificare usura pala`,

  sollevatori: `SOLLEVATORI CASCOS (C-3.2, C-3.5, C-4, C-5, C-5.5, C-125):
Problemi comuni:
- Non sale o sale storto → livello olio idraulico basso, sincronizzazione colonne ILC, blocchi sicurezza attivati. Soluzione: verificare livello olio, controllare sistema ILC, sbloccare sicurezze
- Rimane bloccato → sblocco manuale di emergenza (vedi manuale specifico modello)
- Rumore anomalo durante salita/discesa → cuscinetti usurati, pompa idraulica, livello olio
- Sistema ILC non sincronizza → batteria scarica, sensori livello, aggiornamento firmware
- Ponte a forbice non scende → valvola di controllo discesa, centralina idraulica`,
};

// ─── ROUTER INTELLIGENTE ───────────────────────────────────────────────────
// Seleziona solo le sezioni KB rilevanti in base alla domanda
function selectKnowledge(text) {
  const q = text.toLowerCase();
  const sections = [];

  // Calibrazione
  if (/calibr|cal\s|f\+p3|err.?02[01]|eep.?err|car.?cal|mot.?cal/i.test(q)) {
    sections.push(KB.calibrazione);
    if (/moto|bike|mot/i.test(q)) sections.push(KB.calibrazione_moto);
  }

  // ESD
  if (/esd|sonar|larghezza.?auto|auto.?larghezza/i.test(q)) {
    sections.push(KB.esd);
  }

  // Codici errore
  if (/err\s*0?\d+|errore|error|dis.?out|lar.?out|no.?stp|no.?spn|rev.?spn|eep|shf|no.?cp|w.?guard|no.?vrt|no.?dia|no.?lar|too.?far|not.?inc|no.?opt/i.test(q)) {
    sections.push(KB.errori);
  }

  // Vibrazioni
  if (/vibr|trema|balla|squilibr|runout|centraggio|bilanc|pesa|peso/i.test(q)) {
    sections.push(KB.vibrazioni);
  }

  // Smontagomme
  if (/smontagomm|puma|ligro|cm.?1200|f.?535|f.?536|aria|cilindro|bead|braccio/i.test(q)) {
    sections.push(KB.smontagomme);
  }

  // Sollevatori
  if (/sollevator|ponte|cascos|ilc|colonne|sale|scende|forbicc/i.test(q)) {
    sections.push(KB.sollevatori);
  }

  // Se nessuna sezione specifica, aggiungi quella sulle vibrazioni come base
  if (sections.length === 0) {
    sections.push(KB.vibrazioni);
  }

  return sections.join("\n\n");
}

// ─── CHIAMATA API GEMMA 3 ─────────────────────────────────────────────────
async function callGemma(apiKey, { description, serial, speed, location, axle, centering, precedent, useParams, lang }) {
  const paramsText = useParams
    ? `\nParametri aggiuntivi: velocità=${speed}, dove si sente=${location}, asse=${axle}, centraggio=${centering}, quando=${precedent}`
    : "";
  const serialText = serial ? `\nN° serie: ${serial}` : "";

  // Seleziona solo la conoscenza rilevante per questa domanda
  const knowledge = selectKnowledge(description);

  const prompt = `${KB.base}

CONOSCENZA TECNICA RILEVANTE:
${knowledge}

DOMANDA: ${description}${serialText}${paramsText}

Rispondi SOLO con JSON valido:`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 1200, topP: 0.8 },
      safetySettings: [
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error (${response.status})`);
  }
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(lang === "en" ? "Invalid AI response. Please try again." : "Risposta AI non valida. Riprova.");
  try { return JSON.parse(match[0]); }
  catch { throw new Error(lang === "en" ? "Invalid AI response. Please try again." : "Risposta AI non valida. Riprova."); }
}

// ─── COMPONENTE PRINCIPALE ────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem("ta_lang");
    if (saved) return saved;
    return navigator.language?.startsWith("it") ? "it" : "en";
  });
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("ta_theme") !== "light");
  const [apiKey, setApiKey]     = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [keyVisible, setKeyVisible]   = useState(false);
  const [showKeyPanel, setShowKeyPanel] = useState(false);
  const [description, setDescription] = useState("");
  const [serial, setSerial]           = useState("");
  const [showParams, setShowParams]   = useState(false);
  const [speed, setSpeed]             = useState("90-110");
  const [location, setLocation]       = useState("volante");
  const [axle, setAxle]               = useState("anteriore");
  const [centering, setCentering]     = useState("cono-std");
  const [precedent, setPrecedent]     = useState("dopo-equil");
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [copied, setCopied]   = useState(false);

  const t          = T[lang];
  const SPEEDS     = lang === "en" ? SPEEDS_EN     : SPEEDS_IT;
  const LOCATIONS  = lang === "en" ? LOCATIONS_EN  : LOCATIONS_IT;
  const AXLES      = lang === "en" ? AXLES_EN      : AXLES_IT;
  const CENTERING  = lang === "en" ? CENTERING_EN  : CENTERING_IT;
  const PRECEDENTS = lang === "en" ? PRECEDENTS_EN : PRECEDENTS_IT;

  useEffect(() => { const s = localStorage.getItem("ta_apikey"); if (s) setApiKey(s); }, []);
  useEffect(() => {
    document.body.setAttribute("data-theme", darkMode ? "dark" : "light");
    localStorage.setItem("ta_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const switchLang = (l) => { setLang(l); localStorage.setItem("ta_lang", l); setResult(null); };

  const saveKey = () => {
    const k = keyInput.trim();
    if (!k.startsWith("AIza")) { setError(t.keyError); return; }
    localStorage.setItem("ta_apikey", k);
    setApiKey(k); setKeyInput(""); setShowKeyPanel(false); setError(null);
  };
  const removeKey = () => { localStorage.removeItem("ta_apikey"); setApiKey(""); setShowKeyPanel(false); };

  const getLabel = (arr, id) => arr.find(x => x.id === id)?.label || id;
  const canAnalyze = description.trim().length >= 5;

  const analyze = async () => {
    if (!apiKey) { setShowKeyPanel(true); return; }
    if (!canAnalyze) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await callGemma(apiKey, {
        description: description.trim(), serial: serial.trim(),
        speed: getLabel(SPEEDS, speed), location: getLabel(LOCATIONS, location),
        axle: getLabel(AXLES, axle), centering: getLabel(CENTERING, centering),
        precedent: getLabel(PRECEDENTS, precedent), useParams: showParams, lang,
      });
      setResult(res);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const priorityColor = { alta:"#ff4d4d", media:"#f5a623", bassa:"#4caf82", high:"#ff4d4d", medium:"#f5a623", low:"#4caf82" };

  const buildReport = () => {
    if (!result) return "";
    const sep = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━";
    const serialLine = serial ? `\n${t.reportSerial}: ${serial}` : "";
    if (result.tipo === "info" || result.type === "info") {
      return `${t.reportHeaderInfo}\n${sep}\n${t.reportQuestion}:\n"${description}"${serialLine}\n\n${t.reportAnswer}:\n${result.risposta || result.answer}${result.nota ? `\n\n⚠ ${result.nota}` : ""}\n${sep}\nTechAssist AI — PezzaliApp`;
    }
    return `${t.reportHeader}\n${sep}\n${t.reportProblem}:\n"${description}"${serialLine}\n\n${t.reportPriority}: ${result.priorita?.toUpperCase() || result.priority?.toUpperCase()}\n\n${t.reportCause}:\n${result.causa || result.cause}\n\n${t.reportAction}:\n${result.azione || result.action}\n\n${t.reportProcedure}:\n${(result.steps || []).map((s, i) => `${i + 1}. ${s}`).join("\n")}${result.nota ? `\n\n⚠ ${result.nota}` : ""}\n${sep}\nTechAssist AI — PezzaliApp`;
  };

  const copyReport = async () => {
    try { await navigator.clipboard.writeText(buildReport()); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { alert("Cannot copy"); }
  };

  // WhatsApp: apre l'app, l'utente sceglie il destinatario
  const sendWhatsApp = () => {
    const text = buildReport();
    if (!text) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const pColor = priorityColor[result?.priorita] || priorityColor[result?.priority] || "#f5a623";
  const isInfo  = result?.tipo === "info" || result?.type === "info";

  return (
    <div className={`app ${darkMode ? "dark" : "light"}`}>

      {/* CSS WhatsApp — inline, nessun file extra */}
      <style>{`
        .action-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:4px;}
        .action-row .copy-btn{flex:1;min-width:140px;}
        .wa-btn{display:flex;align-items:center;justify-content:center;gap:8px;flex:1;min-width:180px;padding:10px 16px;background:#25D366;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:700;letter-spacing:.4px;cursor:pointer;transition:background .18s,transform .1s;font-family:inherit;}
        .wa-btn:hover{background:#1ebe5a;transform:translateY(-1px);}
        .wa-btn:active{background:#17a84f;transform:translateY(0);}
      `}</style>

      <header className="header">
        <div className="header-inner">
          <div className="logo-block">
            <span className="logo-icon">⟁</span>
            <div>
              <div className="logo-title">{t.title}</div>
              <div className="logo-sub">{t.sub}</div>
            </div>
          </div>
          <div className="header-actions">
            <div className="lang-toggle">
              <button className={`lang-btn ${lang==="it"?"lang-active":""}`} onClick={() => switchLang("it")}>IT</button>
              <button className={`lang-btn ${lang==="en"?"lang-active":""}`} onClick={() => switchLang("en")}>EN</button>
            </div>
            <button className="theme-btn" onClick={() => setDarkMode(d => !d)}>{darkMode ? "☀️" : "🌙"}</button>
            <button className={`key-btn ${apiKey?"key-active":"key-missing"}`} onClick={() => setShowKeyPanel(!showKeyPanel)}>
              {apiKey ? t.keyOk : t.keyMissing}
            </button>
          </div>
        </div>
      </header>

      {showKeyPanel && (
        <div className="key-panel">
          <div className="key-panel-inner">
            {apiKey ? (
              <>
                <div className="key-panel-title">{lang==="it" ? "API Key configurata" : "API Key configured"}</div>
                <div className="key-masked">AIza···{apiKey.slice(-6)}</div>
                <div className="key-panel-actions">
                  <button className="key-action-remove" onClick={removeKey}>{t.keyRemove}</button>
                  <button className="key-action-close" onClick={() => setShowKeyPanel(false)}>{t.keyClose}</button>
                </div>
              </>
            ) : (
              <>
                <div className="key-panel-title">{t.keyTitle}</div>
                <div className="key-panel-hint">
                  {t.keyHint} <a href="https://aistudio.google.com" target="_blank" rel="noreferrer">aistudio.google.com</a> → Get API Key. {t.keySaved}
                </div>
                <div className="key-input-row">
                  <input type={keyVisible?"text":"password"} className="key-input" placeholder="AIzaSy..."
                    value={keyInput} onChange={e => setKeyInput(e.target.value)}
                    onKeyDown={e => e.key==="Enter" && saveKey()} autoComplete="off" spellCheck={false}/>
                  <button className="key-eye" onClick={() => setKeyVisible(!keyVisible)}>{keyVisible?"🙈":"👁"}</button>
                </div>
                <button className="key-save-btn" onClick={saveKey}>{t.keySave}</button>
              </>
            )}
          </div>
        </div>
      )}

      <main className="main">
        <div className="problem-block">
          <div className="problem-header">
            <span className="problem-label">{t.fieldLabel}</span>
            <span className="problem-hint">{t.fieldHint}</span>
          </div>
          <textarea className="problem-input" placeholder={t.fieldPlaceholder}
            value={description} onChange={e => { setDescription(e.target.value); setResult(null); }} rows={4}/>
          <div className="serial-row">
            <input className="serial-input" placeholder={t.serialPlaceholder}
              value={serial} onChange={e => setSerial(e.target.value)}/>
          </div>
          <div className="esempi-row">
            {t.esempi.map((e, i) => (
              <button key={i} className="esempio-chip" onClick={() => { setDescription(e); setResult(null); }}>{e}</button>
            ))}
          </div>
        </div>

        <details className="params-details" onToggle={e => setShowParams(e.target.open)}>
          <summary className="params-summary">
            <span className="params-summary-label">{t.paramsLabel}</span>
            <span className="params-summary-hint">{t.paramsHint}</span>
          </summary>
          <div className="form-grid">
            {[
              [SPEEDS,     speed,     setSpeed,     lang==="it"?"VELOCITÀ":"SPEED",                    lang==="it"?"Quando si manifesta?":"When does it occur?"],
              [LOCATIONS,  location,  setLocation,  lang==="it"?"DOVE SI SENTE":"FELT AT",             lang==="it"?"Punto di percezione":"Where felt"],
              [AXLES,      axle,      setAxle,      lang==="it"?"ASSE":"AXLE",                         lang==="it"?"Quale asse?":"Which axle?"],
              [CENTERING,  centering, setCentering, lang==="it"?"CENTRAGGIO":"CENTERING",              lang==="it"?"Accessorio usato":"Tool used"],
              [PRECEDENTS, precedent, setPrecedent, lang==="it"?"QUANDO È COMPARSO":"WHEN IT STARTED", lang==="it"?"Precedente noto":"Known event"],
            ].map(([items, val, setter, label, hint]) => (
              <FieldBlock key={label} label={label} hint={hint}>
                <div className="chip-group">
                  {items.map(s => <Chip key={s.id} active={val===s.id} onClick={() => setter(s.id)} label={s.label}/>)}
                </div>
              </FieldBlock>
            ))}
          </div>
        </details>

        <button
          className={`analyze-btn ${loading?"loading":""} ${!apiKey?"no-key":""} ${!canAnalyze&&apiKey?"disabled":""}`}
          onClick={analyze} disabled={loading||(!canAnalyze&&!!apiKey)}>
          {loading ? <><span className="spinner"/>{t.analyzing}</>
            : !apiKey ? t.configKey
            : !canAnalyze ? t.writeFirst
            : t.analyzeBtn}
        </button>

        {error && (
          <div className="error-card">
            <span className="error-icon">⚠</span>
            <div><div className="error-title">{t.errorTitle}</div><div className="error-msg">{error}</div></div>
          </div>
        )}

        {result && !isInfo && (
          <div className="result-card">
            <div className="result-header">
              <div className="result-title">{t.diagnosisTitle}</div>
              <div className="priority-badge" style={{"--p-color":pColor}}>
                <span className="priority-dot"/>
                {t.priority} {(result.priorita||result.priority)?.toUpperCase()}
              </div>
            </div>
            {result.tags?.length > 0 && (
              <div className="tag-row">{result.tags.map(tag => <span key={tag} className="tag">#{tag}</span>)}</div>
            )}
            <div className="result-section">
              <div className="result-label">{t.causeLabel}</div>
              <div className="result-text">{result.causa||result.cause}</div>
            </div>
            <div className="result-section">
              <div className="result-label">{t.actionLabel}</div>
              <div className="result-text">{result.azione||result.action}</div>
            </div>
            <div className="result-section">
              <div className="result-label">{t.procedureLabel}</div>
              <ol className="steps-list">
                {(result.steps||[]).map((step,i) => (
                  <li key={i} className="step-item"><span className="step-num">{i+1}</span><span>{step}</span></li>
                ))}
              </ol>
            </div>
            {result.nota && <div className="note-block"><span className="note-icon">⚠</span><span>{result.nota}</span></div>}
            <div className="action-row">
              <button className={`copy-btn ${copied?"copied":""}`} onClick={copyReport}>
                {copied ? t.copied : t.copyReport}
              </button>
              <button className="wa-btn" onClick={sendWhatsApp}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {t.waBtn}
              </button>
            </div>
          </div>
        )}

        {result && isInfo && (
          <div className="result-card">
            <div className="result-header">
              <div className="result-title">{t.infoTitle}</div>
            </div>
            <div className="result-section">
              <div className="result-text info-text">{result.risposta||result.answer}</div>
            </div>
            {result.nota && <div className="note-block"><span className="note-icon">⚠</span><span>{result.nota}</span></div>}
            <div className="action-row">
              <button className={`copy-btn ${copied?"copied":""}`} onClick={copyReport}>
                {copied ? t.copied : t.copyAnswer}
              </button>
              <button className="wa-btn" onClick={sendWhatsApp}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {t.waBtn}
              </button>
            </div>
          </div>
        )}

        {!result && !loading && (
          <div className="checklist-card">
            <div className="checklist-title">{t.checklistTitle}</div>
            <div className="checklist-items">
              {t.checklistItems.map(([n,title,sub]) => (
                <div key={n} className="checklist-item">
                  <div className="cl-num">{n}</div>
                  <div><div className="cl-title">{title}</div><div className="cl-sub">{sub}</div></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        <span>TechAssist AI</span><span className="footer-dot">·</span><span>PezzaliApp</span><span className="footer-dot">·</span><span>Cormach Srl</span>
      </footer>
    </div>
  );
}

function FieldBlock({ label, hint, children }) {
  return (
    <div className="field-block">
      <div className="field-header">
        <span className="field-label">{label}</span>
        <span className="field-hint">{hint}</span>
      </div>
      {children}
    </div>
  );
}

function Chip({ active, onClick, label }) {
  return <button className={`chip ${active?"chip-active":""}`} onClick={onClick}>{label}</button>;
}
