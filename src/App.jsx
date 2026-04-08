import { useState, useEffect } from "react";
import "./App.css";

const SYSTEM_PROMPT = `Sei TechAssist, assistente tecnico esperto per officine meccaniche professionali. Lavori per Cormach Srl, distributore di:
- Equilibratrici MEC (MEC5, MEC10, MEC110, MEC810, MEC820, Touch MEC 900, Touch MEC 1000, MEC 200 Truck)
- Smontagomme (F535S, F536S GT, LIGRO, CM 1200BB, PUMA, B124, B224, FT-26SN)
- Sollevatori Cascos (C-3.2, C-3.5, C-4, C-5, C-5.5, C-125, C430/440/450)
- Sollevatori Cormach (AL40, ALB40, AL55, PFA40/50, L3300/L3400/L3500N EVO)
- Colonne mobili WL85 MOVE
- Allineatori GEO 25 / GEO 20

Rispondi SEMPRE in italiano, in modo diretto e pratico. Sei rivolto a meccanici professionisti.

Se la domanda riguarda un problema tecnico, rispondi in JSON valido senza markdown:
{
  "tipo": "diagnosi",
  "priorita": "alta" | "media" | "bassa",
  "causa": "causa probabile in 1-2 frasi",
  "azione": "azione raccomandata in 1-2 frasi",
  "steps": ["step 1", "step 2", "step 3", "step 4", "step 5"],
  "nota": "nota tecnica oppure stringa vuota",
  "tags": ["tag1", "tag2"]
}

Se la domanda è informativa (come funziona X, quanto deve essere Y, procedura per Z), rispondi in JSON:
{
  "tipo": "info",
  "risposta": "risposta tecnica completa e pratica",
  "nota": "eventuale nota aggiuntiva oppure stringa vuota"
}

Regole tecniche fondamentali:
- Vibrazione SOLO in frenata → problema frenante, non squilibrio
- Cono standard su cerchio alluminio → causa classica centraggio errato
- Bassa velocità <40 km/h → runout pneumatico, non squilibrio
- Dopo urto → verificare cerchio deformato prima di bilanciare
- Steps diagnosi: max 5, pratici, nell'ordine corretto
- Tags: parole chiave tecniche senza spazi (usa trattino)
- Tono diretto, usa "tu" rivolto al meccanico`;

async function callClaude(apiKey, { description, speed, location, axle, centering, precedent, useParams }) {
  const paramsText = useParams ? `\n\nPARAMETRI AGGIUNTIVI:\n- Velocità: ${speed}\n- Dove si sente: ${location}\n- Asse: ${axle}\n- Centraggio: ${centering}\n- Quando è comparso: ${precedent}` : "";

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
        content: `${description}${paramsText}`
      }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    if (response.status === 401) throw new Error("API key non valida. Controlla e reinserisci.");
    if (response.status === 429) throw new Error("Troppe richieste. Aspetta un momento e riprova.");
    throw new Error(err?.error?.message || `Errore API (${response.status})`);
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

const SPEEDS = [
  { id: "80-90",        label: "80–90 km/h" },
  { id: "90-110",       label: "90–110 km/h" },
  { id: "oltre110",     label: "> 110 km/h" },
  { id: "solo-frenata", label: "Solo in frenata" },
  { id: "bassa",        label: "< 40 km/h" },
  { id: "sempre",       label: "Sempre / qualsiasi" },
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
  { id: "cono-std",       label: "Cono standard" },
  { id: "cono-corretto",  label: "Centratore corretto" },
  { id: "flangia",        label: "Flangia / Adapter" },
  { id: "non-verificato", label: "Non verificato" },
];
const PRECEDENTS = [
  { id: "dopo-equil",     label: "Dopo equilibratura" },
  { id: "dopo-montaggio", label: "Dopo montaggio gomme" },
  { id: "progressivo",    label: "Comparso gradualmente" },
  { id: "dopo-urto",      label: "Dopo urto / buche" },
  { id: "nessuno",        label: "Nessun precedente" },
];

const ESEMPI = [
  "Come si calibra la MEC10?",
  "Smontagomme PUMA che perde aria dal cilindro",
  "Ruota sempre sbilanciata lato interno dopo equilibratura",
  "Sollevatore Cascos C-4 non sale in modo uniforme",
  "Qual è il runout massimo tollerato su un cerchio da 18\"?",
];

export default function App() {
  const [apiKey, setApiKey]           = useState("");
  const [keyInput, setKeyInput]       = useState("");
  const [keyVisible, setKeyVisible]   = useState(false);
  const [showKeyPanel, setShowKeyPanel] = useState(false);

  const [description, setDescription] = useState("");
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

  useEffect(() => {
    const saved = localStorage.getItem("ta_apikey");
    if (saved) setApiKey(saved);
  }, []);

  const saveKey = () => {
    const k = keyInput.trim();
    if (!k.startsWith("sk-ant-")) { setError("La key deve iniziare con sk-ant-"); return; }
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
      const res = await callClaude(apiKey, {
        description: description.trim(),
        speed:     getLabel(SPEEDS, speed),
        location:  getLabel(LOCATIONS, location),
        axle:      getLabel(AXLES, axle),
        centering: getLabel(CENTERING, centering),
        precedent: getLabel(PRECEDENTS, precedent),
        useParams: showParams,
      });
      setResult(res);
    } catch (e) {
      setError(e.message);
      if (e.message.includes("non valida")) { localStorage.removeItem("ta_apikey"); setApiKey(""); }
    } finally {
      setLoading(false);
    }
  };

  const priorityColor = { alta: "#ff4d4d", media: "#f5a623", bassa: "#4caf82" };

  const buildReport = () => {
    if (!result) return "";
    if (result.tipo === "info") {
      return `TECHASSIST OFFICINA — RISPOSTA AI\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nDOMANDA:\n"${description}"\n\nRISPOSTA:\n${result.risposta}${result.nota ? `\n\n⚠ NOTA: ${result.nota}` : ""}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nTechAssist AI — PezzaliApp / Cormach Srl`;
    }
    return `TECHASSIST OFFICINA — DIAGNOSI AI\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nPROBLEMA:\n"${description}"\n\nPRIORITÀ: ${result.priorita?.toUpperCase()}\n\nCAUSA PROBABILE:\n${result.causa}\n\nAZIONE RACCOMANDATA:\n${result.azione}\n\nPROCEDURA:\n${result.steps?.map((s, i) => `${i + 1}. ${s}`).join("\n")}${result.nota ? `\n\n⚠ NOTA: ${result.nota}` : ""}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nTechAssist AI — PezzaliApp / Cormach Srl`;
  };

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(buildReport());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { alert("Impossibile copiare"); }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo-block">
            <span className="logo-icon">⟁</span>
            <div>
              <div className="logo-title">TechAssist AI</div>
              <div className="logo-sub">ASSISTENTE TECNICO · CORMACH</div>
            </div>
          </div>
          <button className={`key-btn ${apiKey ? "key-active" : "key-missing"}`} onClick={() => setShowKeyPanel(!showKeyPanel)}>
            {apiKey ? "🔑 KEY OK" : "🔑 KEY?"}
          </button>
        </div>
      </header>

      {showKeyPanel && (
        <div className="key-panel">
          <div className="key-panel-inner">
            {apiKey ? (
              <>
                <div className="key-panel-title">API Key configurata</div>
                <div className="key-masked">sk-ant-···{apiKey.slice(-6)}</div>
                <div className="key-panel-actions">
                  <button className="key-action-remove" onClick={removeKey}>Rimuovi</button>
                  <button className="key-action-close" onClick={() => setShowKeyPanel(false)}>Chiudi</button>
                </div>
              </>
            ) : (
              <>
                <div className="key-panel-title">Inserisci la tua API Key Anthropic</div>
                <div className="key-panel-hint">
                  Ottienila su <a href="https://console.anthropic.com" target="_blank" rel="noreferrer">console.anthropic.com</a> → API Keys.
                  Salvata solo nel tuo browser.
                </div>
                <div className="key-input-row">
                  <input type={keyVisible ? "text" : "password"} className="key-input" placeholder="sk-ant-api03-..."
                    value={keyInput} onChange={e => setKeyInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && saveKey()} autoComplete="off" spellCheck={false} />
                  <button className="key-eye" onClick={() => setKeyVisible(!keyVisible)}>{keyVisible ? "🙈" : "👁"}</button>
                </div>
                <button className="key-save-btn" onClick={saveKey}>Salva key</button>
              </>
            )}
          </div>
        </div>
      )}

      <main className="main">

        {/* ── CAMPO DOMANDA ── */}
        <div className="problem-block">
          <div className="problem-header">
            <span className="problem-label">DOMANDA O PROBLEMA</span>
            <span className="problem-hint">vibrazioni, calibrazioni, guasti, procedure, qualsiasi domanda tecnica</span>
          </div>
          <textarea
            className="problem-input"
            placeholder={`Es: "${ESEMPI[Math.floor(Date.now() / 10000) % ESEMPI.length]}"`}
            value={description}
            onChange={e => { setDescription(e.target.value); setResult(null); }}
            rows={4}
          />
          {/* Esempi cliccabili */}
          <div className="esempi-row">
            {ESEMPI.slice(0,3).map((e, i) => (
              <button key={i} className="esempio-chip" onClick={() => { setDescription(e); setResult(null); }}>
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* ── PARAMETRI VIBRAZIONI (opzionale) ── */}
        <details className="params-details" onToggle={e => setShowParams(e.target.open)}>
          <summary className="params-summary">
            <span className="params-summary-label">⊕ PARAMETRI VIBRAZIONI</span>
            <span className="params-summary-hint">opzionale — aggiunge contesto per diagnosi vibrazioni</span>
          </summary>
          <div className="form-grid">
            <FieldBlock label="VELOCITÀ" hint="Quando si manifesta?">
              <div className="chip-group">
                {SPEEDS.map(s => <Chip key={s.id} active={speed === s.id} onClick={() => setSpeed(s.id)} label={s.label} />)}
              </div>
            </FieldBlock>
            <FieldBlock label="DOVE SI SENTE" hint="Punto di percezione">
              <div className="chip-group">
                {LOCATIONS.map(l => <Chip key={l.id} active={location === l.id} onClick={() => setLocation(l.id)} label={l.label} />)}
              </div>
            </FieldBlock>
            <FieldBlock label="ASSE" hint="Quale asse è coinvolto?">
              <div className="chip-group">
                {AXLES.map(a => <Chip key={a.id} active={axle === a.id} onClick={() => setAxle(a.id)} label={a.label} />)}
              </div>
            </FieldBlock>
            <FieldBlock label="CENTRAGGIO" hint="Accessorio usato">
              <div className="chip-group">
                {CENTERING.map(c => <Chip key={c.id} active={centering === c.id} onClick={() => setCentering(c.id)} label={c.label} />)}
              </div>
            </FieldBlock>
            <FieldBlock label="QUANDO È COMPARSO" hint="Precedente noto">
              <div className="chip-group">
                {PRECEDENTS.map(p => <Chip key={p.id} active={precedent === p.id} onClick={() => setPrecedent(p.id)} label={p.label} />)}
              </div>
            </FieldBlock>
          </div>
        </details>

        {/* ── BOTTONE ── */}
        <button
          className={`analyze-btn ${loading ? "loading" : ""} ${!apiKey ? "no-key" : ""} ${!canAnalyze && apiKey ? "disabled" : ""}`}
          onClick={analyze}
          disabled={loading || (!canAnalyze && !!apiKey)}
        >
          {loading ? <><span className="spinner" />ANALISI IN CORSO...</>
            : !apiKey ? <>🔑 CONFIGURA API KEY PER INIZIARE</>
            : !canAnalyze ? <>⟁ SCRIVI LA TUA DOMANDA</>
            : <>⟁ AVVIA ANALISI AI</>}
        </button>

        {error && (
          <div className="error-card">
            <span className="error-icon">⚠</span>
            <div><div className="error-title">Errore</div><div className="error-msg">{error}</div></div>
          </div>
        )}

        {/* ── RISULTATO DIAGNOSI ── */}
        {result?.tipo === "diagnosi" && (
          <div className="result-card">
            <div className="result-header">
              <div className="result-title">DIAGNOSI AI</div>
              <div className="priority-badge" style={{ "--p-color": priorityColor[result.priorita] || "#f5a623" }}>
                <span className="priority-dot" />
                PRIORITÀ {result.priorita?.toUpperCase()}
              </div>
            </div>
            {result.tags?.length > 0 && (
              <div className="tag-row">{result.tags.map(t => <span key={t} className="tag">#{t}</span>)}</div>
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
            {result.nota && <div className="note-block"><span className="note-icon">⚠</span><span>{result.nota}</span></div>}
            <button className={`copy-btn ${copied ? "copied" : ""}`} onClick={copyReport}>
              {copied ? "✓ COPIATO" : "COPIA REPORT"}
            </button>
          </div>
        )}

        {/* ── RISULTATO INFO ── */}
        {result?.tipo === "info" && (
          <div className="result-card">
            <div className="result-header">
              <div className="result-title">RISPOSTA TECNICA</div>
            </div>
            <div className="result-section">
              <div className="result-text info-text">{result.risposta}</div>
            </div>
            {result.nota && <div className="note-block"><span className="note-icon">⚠</span><span>{result.nota}</span></div>}
            <button className={`copy-btn ${copied ? "copied" : ""}`} onClick={copyReport}>
              {copied ? "✓ COPIATO" : "COPIA RISPOSTA"}
            </button>
          </div>
        )}

        {/* ── CHECKLIST ── */}
        {!result && !loading && (
          <div className="checklist-card">
            <div className="checklist-title">ORDINE OPERATIVO VIBRAZIONI — REGOLA D'ORO</div>
            <div className="checklist-items">
              {[
                ["01","Centraggio","Prima di tutto"],
                ["02","Ripetibilità","2 lanci → confronto"],
                ["03","Runout cerchio","Soglia 0.5 mm"],
                ["04","Runout gomma","Match-mount se > 1.5 mm"],
                ["05","Veicolo","Solo dopo esclusione ruota"],
              ].map(([n,title,sub]) => (
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
        <span>TechAssist AI</span><span className="footer-dot">·</span>
        <span>PezzaliApp</span><span className="footer-dot">·</span>
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
    <button className={`chip ${active ? "chip-active" : ""}`} onClick={onClick}>{label}</button>
  );
}
