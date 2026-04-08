import { useState, useEffect } from "react";
import "./App.css";

// ─── COSTANTI ─────────────────────────────────────────────────────────────────

const SPEEDS = [
  { id: "80-90",       label: "80–90 km/h" },
  { id: "90-110",      label: "90–110 km/h" },
  { id: "oltre110",    label: "> 110 km/h" },
  { id: "solo-frenata",label: "Solo in frenata" },
  { id: "bassa",       label: "< 40 km/h" },
  { id: "sempre",      label: "Sempre / qualsiasi" },
];
const LOCATIONS = [
  { id: "volante", label: "Volante" },
  { id: "sedile",  label: "Sedile / Pianale" },
  { id: "intera",  label: "Tutta la scocca" },
];
const AXLES = [
  { id: "anteriore", label: "Anteriore" },
  { id: "posteriore",label: "Posteriore" },
  { id: "entrambi",  label: "Entrambi" },
  { id: "non-so",    label: "Non so" },
];
const CENTERING = [
  { id: "cono-std",      label: "Cono standard" },
  { id: "cono-corretto", label: "Centratore corretto" },
  { id: "flangia",       label: "Flangia / Adapter" },
  { id: "non-verificato",label: "Non verificato" },
];
const PRECEDENTS = [
  { id: "dopo-equil",    label: "Dopo equilibratura" },
  { id: "dopo-montaggio",label: "Dopo montaggio gomme" },
  { id: "progressivo",   label: "Comparso gradualmente" },
  { id: "dopo-urto",     label: "Dopo urto / buche" },
  { id: "nessuno",       label: "Nessun precedente" },
];

const SYSTEM_PROMPT = `Sei TechAssist, assistente tecnico esperto di equilibratrici ruote per officine meccaniche professionali. Lavori per Cormach Srl, distributore di equilibratrici MEC (MEC5, MEC10, MEC110, MEC810, MEC820, Touch MEC 900) e sollevatori Cascos.

Diagnosi vibrazioni post-equilibratura basata sui parametri del meccanico.

Rispondi SOLO in JSON valido, senza markdown, senza backtick, senza testo aggiuntivo:

{
  "priorita": "alta" | "media" | "bassa",
  "causa": "causa probabile in 1-2 frasi chiare",
  "azione": "azione raccomandata in 1-2 frasi",
  "steps": ["step 1", "step 2", "step 3", "step 4", "step 5"],
  "nota": "nota tecnica importante oppure stringa vuota",
  "tags": ["tag1", "tag2"]
}

Regole tecniche:
- Vibrazione SOLO in frenata → problema frenante, non squilibrio
- Cono standard su cerchio alluminio → causa classica di centraggio errato
- Bassa velocità (<40 km/h) → runout pneumatico, non squilibrio
- Dopo urto → verificare cerchio deformato prima di bilanciare
- Steps: max 5, pratici, nell'ordine corretto
- Tags: 2-3 parole chiave tecniche, senza spazi (usa trattino)
- Tono diretto, usa "tu" rivolto al meccanico`;

// ─── API CALL ─────────────────────────────────────────────────────────────────

async function callClaude(apiKey, params) {
  const { speed, location, axle, centering, precedent, notes } = params;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{
        role: "user",
        content: `Diagnosi vibrazione:\n- Velocità: ${speed}\n- Dove si sente: ${location}\n- Asse: ${axle}\n- Centraggio: ${centering}\n- Quando è comparso: ${precedent}${notes ? `\n- Note: ${notes}` : ""}`
      }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = err?.error?.message || "";
    if (response.status === 401) throw new Error("API key non valida. Controlla e reinserisci.");
    if (response.status === 429) throw new Error("Troppe richieste. Aspetta un momento e riprova.");
    throw new Error(msg || `Errore API (${response.status})`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || "";
  try {
    return JSON.parse(text.trim());
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Risposta AI non valida. Riprova.");
  }
}

// ─── COMPONENTE PRINCIPALE ────────────────────────────────────────────────────

export default function App() {
  const [apiKey, setApiKey]       = useState("");
  const [keyInput, setKeyInput]   = useState("");
  const [keyVisible, setKeyVisible] = useState(false);
  const [showKeyPanel, setShowKeyPanel] = useState(false);

  const [speed, setSpeed]         = useState("90-110");
  const [location, setLocation]   = useState("volante");
  const [axle, setAxle]           = useState("anteriore");
  const [centering, setCentering] = useState("cono-std");
  const [precedent, setPrecedent] = useState("dopo-equil");
  const [notes, setNotes]         = useState("");

  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [copied, setCopied]       = useState(false);

  // Carica key da localStorage all'avvio
  useEffect(() => {
    const saved = localStorage.getItem("ta_apikey");
    if (saved) setApiKey(saved);
  }, []);

  const saveKey = () => {
    const k = keyInput.trim();
    if (!k.startsWith("sk-ant-")) {
      setError("La key Anthropic deve iniziare con sk-ant-");
      return;
    }
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

  const analyze = async () => {
    if (!apiKey) { setShowKeyPanel(true); return; }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const params = {
        speed:     getLabel(SPEEDS, speed),
        location:  getLabel(LOCATIONS, location),
        axle:      getLabel(AXLES, axle),
        centering: getLabel(CENTERING, centering),
        precedent: getLabel(PRECEDENTS, precedent),
        notes,
      };
      const diagnosis = await callClaude(apiKey, params);
      setResult(diagnosis);
    } catch (e) {
      setError(e.message);
      if (e.message.includes("non valida")) {
        localStorage.removeItem("ta_apikey");
        setApiKey("");
      }
    } finally {
      setLoading(false);
    }
  };

  const priorityColor = { alta: "#ff4d4d", media: "#f5a623", bassa: "#4caf82" };

  const reportText = result ? `TECHASSIST OFFICINA — DIAGNOSI AI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PARAMETRI:
• Velocità: ${getLabel(SPEEDS, speed)}
• Dove si sente: ${getLabel(LOCATIONS, location)}
• Asse: ${getLabel(AXLES, axle)}
• Centraggio: ${getLabel(CENTERING, centering)}
• Precedente: ${getLabel(PRECEDENTS, precedent)}${notes ? `\n• Note: ${notes}` : ""}

PRIORITÀ: ${result.priorita?.toUpperCase()}

CAUSA PROBABILE:
${result.causa}

AZIONE RACCOMANDATA:
${result.azione}

PROCEDURA:
${result.steps?.map((s, i) => `${i + 1}. ${s}`).join("\n")}${result.nota ? `\n\n⚠ NOTA: ${result.nota}` : ""}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TechAssist Officina AI — PezzaliApp / Cormach Srl` : "";

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { alert("Impossibile copiare"); }
  };

  return (
    <div className="app">

      {/* ── HEADER ── */}
      <header className="header">
        <div className="header-inner">
          <div className="logo-block">
            <span className="logo-icon">⟁</span>
            <div>
              <div className="logo-title">TechAssist AI</div>
              <div className="logo-sub">DIAGNOSI VIBRAZIONI · CORMACH</div>
            </div>
          </div>
          <button
            className={`key-btn ${apiKey ? "key-active" : "key-missing"}`}
            onClick={() => setShowKeyPanel(!showKeyPanel)}
            title={apiKey ? "API Key configurata" : "Configura API Key"}
          >
            {apiKey ? "🔑 KEY OK" : "🔑 KEY?"}
          </button>
        </div>
      </header>

      {/* ── PANNELLO API KEY ── */}
      {showKeyPanel && (
        <div className="key-panel">
          <div className="key-panel-inner">
            {apiKey ? (
              <>
                <div className="key-panel-title">API Key configurata</div>
                <div className="key-masked">sk-ant-···{apiKey.slice(-6)}</div>
                <div className="key-panel-actions">
                  <button className="key-action-remove" onClick={removeKey}>Rimuovi key</button>
                  <button className="key-action-close" onClick={() => setShowKeyPanel(false)}>Chiudi</button>
                </div>
              </>
            ) : (
              <>
                <div className="key-panel-title">Inserisci la tua API Key Anthropic</div>
                <div className="key-panel-hint">
                  Ottienila su <a href="https://console.anthropic.com" target="_blank" rel="noreferrer">console.anthropic.com</a> → API Keys.<br />
                  Viene salvata solo nel tuo browser, non nel codice.
                </div>
                <div className="key-input-row">
                  <input
                    type={keyVisible ? "text" : "password"}
                    className="key-input"
                    placeholder="sk-ant-api03-..."
                    value={keyInput}
                    onChange={e => setKeyInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && saveKey()}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button className="key-eye" onClick={() => setKeyVisible(!keyVisible)}>
                    {keyVisible ? "🙈" : "👁"}
                  </button>
                </div>
                <button className="key-save-btn" onClick={saveKey}>Salva key</button>
              </>
            )}
          </div>
        </div>
      )}

      <main className="main">

        {/* ── INTRO ── */}
        <div className="intro-bar">
          <span className="intro-label">SELEZIONA I PARAMETRI E AVVIA LA DIAGNOSI AI</span>
          <span className="intro-line" />
        </div>

        {/* ── FORM ── */}
        <div className="form-grid">
          <FieldBlock label="01 VELOCITÀ" hint="Quando si manifesta?">
            <div className="chip-group">
              {SPEEDS.map(s => <Chip key={s.id} active={speed === s.id} onClick={() => setSpeed(s.id)} label={s.label} />)}
            </div>
          </FieldBlock>

          <FieldBlock label="02 DOVE SI SENTE" hint="Punto di percezione">
            <div className="chip-group">
              {LOCATIONS.map(l => <Chip key={l.id} active={location === l.id} onClick={() => setLocation(l.id)} label={l.label} />)}
            </div>
          </FieldBlock>

          <FieldBlock label="03 ASSE" hint="Quale asse è coinvolto?">
            <div className="chip-group">
              {AXLES.map(a => <Chip key={a.id} active={axle === a.id} onClick={() => setAxle(a.id)} label={a.label} />)}
            </div>
          </FieldBlock>

          <FieldBlock label="04 CENTRAGGIO" hint="Accessorio usato in equilibratrice">
            <div className="chip-group">
              {CENTERING.map(c => <Chip key={c.id} active={centering === c.id} onClick={() => setCentering(c.id)} label={c.label} />)}
            </div>
          </FieldBlock>

          <FieldBlock label="05 QUANDO È COMPARSO" hint="Precedente noto">
            <div className="chip-group">
              {PRECEDENTS.map(p => <Chip key={p.id} active={precedent === p.id} onClick={() => setPrecedent(p.id)} label={p.label} />)}
            </div>
          </FieldBlock>

          <FieldBlock label="06 NOTE" hint="Facoltativo — dettagli aggiuntivi">
            <textarea
              className="notes-input"
              placeholder='Es: cerchio alluminio 17", vibra di più in curva...'
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
            />
          </FieldBlock>
        </div>

        {/* ── BOTTONE ANALISI ── */}
        <button
          className={`analyze-btn ${loading ? "loading" : ""} ${!apiKey ? "no-key" : ""}`}
          onClick={analyze}
          disabled={loading}
        >
          {loading ? (
            <><span className="spinner" />ANALISI IN CORSO...</>
          ) : !apiKey ? (
            <>🔑 CONFIGURA API KEY PER INIZIARE</>
          ) : (
            <>⟁ AVVIA DIAGNOSI AI</>
          )}
        </button>

        {/* ── ERRORE ── */}
        {error && (
          <div className="error-card">
            <span className="error-icon">⚠</span>
            <div>
              <div className="error-title">Errore</div>
              <div className="error-msg">{error}</div>
            </div>
          </div>
        )}

        {/* ── RISULTATO ── */}
        {result && (
          <div className="result-card">
            <div className="result-header">
              <div className="result-title">DIAGNOSI AI</div>
              <div className="priority-badge" style={{ "--p-color": priorityColor[result.priorita] || "#f5a623" }}>
                <span className="priority-dot" />
                PRIORITÀ {result.priorita?.toUpperCase()}
              </div>
            </div>

            {result.tags?.length > 0 && (
              <div className="tag-row">
                {result.tags.map(t => <span key={t} className="tag">#{t}</span>)}
              </div>
            )}

            <div className="result-section">
              <div className="result-label">CAUSA PROBABILE</div>
              <div className="result-text">{result.causa}</div>
            </div>

            <div className="result-section">
              <div className="result-label">AZIONE RACCOMANDATA</div>
              <div className="result-text">{result.azione}</div>
            </div>

            <div className="result-section">
              <div className="result-label">PROCEDURA</div>
              <ol className="steps-list">
                {result.steps?.map((step, i) => (
                  <li key={i} className="step-item">
                    <span className="step-num">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {result.nota && (
              <div className="note-block">
                <span className="note-icon">⚠</span>
                <span>{result.nota}</span>
              </div>
            )}

            <button className={`copy-btn ${copied ? "copied" : ""}`} onClick={copyReport}>
              {copied ? "✓ COPIATO" : "COPIA REPORT"}
            </button>
          </div>
        )}

        {/* ── CHECKLIST (solo se non c'è risultato) ── */}
        {!result && !loading && (
          <div className="checklist-card">
            <div className="checklist-title">ORDINE OPERATIVO — REGOLA D'ORO</div>
            <div className="checklist-items">
              {[
                ["01", "Centraggio",       "Prima di tutto"],
                ["02", "Ripetibilità",     "2 lanci → confronto"],
                ["03", "Runout cerchio",   "Soglia 0.5 mm"],
                ["04", "Runout gomma",     "Match-mount se > 1.5 mm"],
                ["05", "Veicolo",          "Solo dopo esclusione ruota"],
              ].map(([n, title, sub]) => (
                <div key={n} className="checklist-item">
                  <div className="cl-num">{n}</div>
                  <div>
                    <div className="cl-title">{title}</div>
                    <div className="cl-sub">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      <footer className="footer">
        <span>TechAssist AI</span>
        <span className="footer-dot">·</span>
        <span>PezzaliApp</span>
        <span className="footer-dot">·</span>
        <span>Cormach Srl</span>
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
  return (
    <button className={`chip ${active ? "chip-active" : ""}`} onClick={onClick}>
      {label}
    </button>
  );
}
