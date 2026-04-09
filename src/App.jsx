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
    serialLabel: "N° SERIE MACCHINA",
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
    serialLabel: "MACHINE SERIAL NO.",
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

const SYSTEM_PROMPT = `Sei TechAssist, assistente tecnico esperto per officine meccaniche professionali specializzato in attrezzatura Cormach (equilibratrici MEC, smontagomme, sollevatori Cascos).

Rispondi SEMPRE nella stessa lingua dell'utente.
Rispondi SOLO in JSON valido senza markdown:

Se è un problema tecnico:
{"tipo":"diagnosi","priorita":"alta"|"media"|"bassa","causa":"...","azione":"...","steps":["..."],"nota":"...","tags":["..."]}

Se è una domanda informativa:
{"tipo":"info","risposta":"...","nota":"..."}

Regole tecniche: vibrazione solo in frenata = problema freni non squilibrio; cono standard su cerchio alluminio = centraggio errato; bassa velocità = runout non squilibrio; dopo urto = verificare cerchio prima di bilanciare.`;

async function callGemini(apiKey, { description, serial, speed, location, axle, centering, precedent, useParams, lang }) {
  const paramsText = useParams
    ? (lang === "en"
      ? `\n\nADDITIONAL PARAMETERS:\n- Speed: ${speed}\n- Felt at: ${location}\n- Axle: ${axle}\n- Centering: ${centering}\n- When it started: ${precedent}`
      : `\n\nPARAMETRI:\n- Velocità: ${speed}\n- Dove si sente: ${location}\n- Asse: ${axle}\n- Centraggio: ${centering}\n- Quando è comparso: ${precedent}`)
    : "";

  const serialText = serial ? (lang === "en" ? `\nMachine serial: ${serial}` : `\nN° serie macchina: ${serial}`) : "";

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\n${description}${serialText}${paramsText}` }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 1000, topP: 0.8 },
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

export default function App() {
  const [lang, setLang]               = useState(() => {
    const saved = localStorage.getItem("ta_lang");
    if (saved) return saved;
    return navigator.language?.startsWith("it") ? "it" : "en";
  });
  const [darkMode, setDarkMode]       = useState(() => localStorage.getItem("ta_theme") !== "light");
  const [apiKey, setApiKey]           = useState("");
  const [keyInput, setKeyInput]       = useState("");
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

  const t = T[lang];
  const SPEEDS     = lang === "en" ? SPEEDS_EN : SPEEDS_IT;
  const LOCATIONS  = lang === "en" ? LOCATIONS_EN : LOCATIONS_IT;
  const AXLES      = lang === "en" ? AXLES_EN : AXLES_IT;
  const CENTERING  = lang === "en" ? CENTERING_EN : CENTERING_IT;
  const PRECEDENTS = lang === "en" ? PRECEDENTS_EN : PRECEDENTS_IT;

  useEffect(() => {
    const saved = localStorage.getItem("ta_apikey");
    if (saved) setApiKey(saved);
  }, []);

  useEffect(() => {
    document.body.setAttribute("data-theme", darkMode ? "dark" : "light");
    localStorage.setItem("ta_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const switchLang = (l) => {
    setLang(l);
    localStorage.setItem("ta_lang", l);
    setResult(null);
  };

  const saveKey = () => {
    const k = keyInput.trim();
    if (!k.startsWith("AIza")) { setError(t.keyError); return; }
    localStorage.setItem("ta_apikey", k);
    setApiKey(k);
    setKeyInput("");
    setShowKeyPanel(false);
    setError(null);
  };

  const removeKey = () => {
    localStorage.removeItem("ta_apikey");
    setApiKey("");
    setShowKeyPanel(false);
  };

  const getLabel = (arr, id) => arr.find(x => x.id === id)?.label || id;
  const canAnalyze = description.trim().length >= 5;

  const analyze = async () => {
    if (!apiKey) { setShowKeyPanel(true); return; }
    if (!canAnalyze) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await callGemini(apiKey, {
        description: description.trim(),
        serial: serial.trim(),
        speed: getLabel(SPEEDS, speed),
        location: getLabel(LOCATIONS, location),
        axle: getLabel(AXLES, axle),
        centering: getLabel(CENTERING, centering),
        precedent: getLabel(PRECEDENTS, precedent),
        useParams: showParams,
        lang,
      });
      setResult(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const priorityColor = { alta: "#ff4d4d", alta_en: "#ff4d4d", media: "#f5a623", bassa: "#4caf82", high: "#ff4d4d", medium: "#f5a623", low: "#4caf82" };

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
    try {
      await navigator.clipboard.writeText(buildReport());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { alert("Cannot copy"); }
  };

  const pColor = priorityColor[result?.priorita] || priorityColor[result?.priority] || "#f5a623";
  const isInfo = result?.tipo === "info" || result?.type === "info";

  return (
    <div className={`app ${darkMode ? "dark" : "light"}`}>
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
              <button className={`lang-btn ${lang === "it" ? "lang-active" : ""}`} onClick={() => switchLang("it")}>IT</button>
              <button className={`lang-btn ${lang === "en" ? "lang-active" : ""}`} onClick={() => switchLang("en")}>EN</button>
            </div>
            <button className="theme-btn" onClick={() => setDarkMode(d => !d)}>{darkMode ? "☀️" : "🌙"}</button>
            <button className={`key-btn ${apiKey ? "key-active" : "key-missing"}`} onClick={() => setShowKeyPanel(!showKeyPanel)}>
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
                <div className="key-panel-title">{lang === "it" ? "API Key configurata" : "API Key configured"}</div>
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
                  <input type={keyVisible ? "text" : "password"} className="key-input" placeholder="AIzaSy..."
                    value={keyInput} onChange={e => setKeyInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && saveKey()} autoComplete="off" spellCheck={false} />
                  <button className="key-eye" onClick={() => setKeyVisible(!keyVisible)}>{keyVisible ? "🙈" : "👁"}</button>
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
          <textarea
            className="problem-input"
            placeholder={t.fieldPlaceholder}
            value={description}
            onChange={e => { setDescription(e.target.value); setResult(null); }}
            rows={4}
          />
          <div className="serial-row">
            <input
              className="serial-input"
              placeholder={t.serialPlaceholder}
              value={serial}
              onChange={e => setSerial(e.target.value)}
            />
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
              [SPEEDS, speed, setSpeed, lang === "it" ? "VELOCITÀ" : "SPEED", lang === "it" ? "Quando si manifesta?" : "When does it occur?"],
              [LOCATIONS, location, setLocation, lang === "it" ? "DOVE SI SENTE" : "FELT AT", lang === "it" ? "Punto di percezione" : "Where felt"],
              [AXLES, axle, setAxle, lang === "it" ? "ASSE" : "AXLE", lang === "it" ? "Quale asse?" : "Which axle?"],
              [CENTERING, centering, setCentering, lang === "it" ? "CENTRAGGIO" : "CENTERING", lang === "it" ? "Accessorio usato" : "Tool used"],
              [PRECEDENTS, precedent, setPrecedent, lang === "it" ? "QUANDO È COMPARSO" : "WHEN IT STARTED", lang === "it" ? "Precedente noto" : "Known event"],
            ].map(([items, val, setter, label, hint]) => (
              <FieldBlock key={label} label={label} hint={hint}>
                <div className="chip-group">
                  {items.map(s => <Chip key={s.id} active={val === s.id} onClick={() => setter(s.id)} label={s.label} />)}
                </div>
              </FieldBlock>
            ))}
          </div>
        </details>

        <button
          className={`analyze-btn ${loading ? "loading" : ""} ${!apiKey ? "no-key" : ""} ${!canAnalyze && apiKey ? "disabled" : ""}`}
          onClick={analyze}
          disabled={loading || (!canAnalyze && !!apiKey)}
        >
          {loading ? <><span className="spinner" />{t.analyzing}</>
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
              <div className="priority-badge" style={{ "--p-color": pColor }}>
                <span className="priority-dot" />
                {t.priority} {(result.priorita || result.priority)?.toUpperCase()}
              </div>
            </div>
            {result.tags?.length > 0 && (
              <div className="tag-row">{result.tags.map(tag => <span key={tag} className="tag">#{tag}</span>)}</div>
            )}
            <div className="result-section">
              <div className="result-label">{t.causeLabel}</div>
              <div className="result-text">{result.causa || result.cause}</div>
            </div>
            <div className="result-section">
              <div className="result-label">{t.actionLabel}</div>
              <div className="result-text">{result.azione || result.action}</div>
            </div>
            <div className="result-section">
              <div className="result-label">{t.procedureLabel}</div>
              <ol className="steps-list">
                {(result.steps || []).map((step, i) => (
                  <li key={i} className="step-item"><span className="step-num">{i + 1}</span><span>{step}</span></li>
                ))}
              </ol>
            </div>
            {result.nota && <div className="note-block"><span className="note-icon">⚠</span><span>{result.nota}</span></div>}
            <button className={`copy-btn ${copied ? "copied" : ""}`} onClick={copyReport}>
              {copied ? t.copied : t.copyReport}
            </button>
          </div>
        )}

        {result && isInfo && (
          <div className="result-card">
            <div className="result-header">
              <div className="result-title">{t.infoTitle}</div>
            </div>
            <div className="result-section">
              <div className="result-text info-text">{result.risposta || result.answer}</div>
            </div>
            {result.nota && <div className="note-block"><span className="note-icon">⚠</span><span>{result.nota}</span></div>}
            <button className={`copy-btn ${copied ? "copied" : ""}`} onClick={copyReport}>
              {copied ? t.copied : t.copyAnswer}
            </button>
          </div>
        )}

        {!result && !loading && (
          <div className="checklist-card">
            <div className="checklist-title">{t.checklistTitle}</div>
            <div className="checklist-items">
              {t.checklistItems.map(([n, title, sub]) => (
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
        <span>TechAssist AI</span><span className="footer-dot">·</span><span>PezzaliApp</span>
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
  return <button className={`chip ${active ? "chip-active" : ""}`} onClick={onClick}>{label}</button>;
}
