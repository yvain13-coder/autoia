import { useState, useEffect, useRef } from "react";

const translations = {
  fr: {
    nav: ["Quel modèle ?", "Comparateur", "Négociateur"],
    hero: "L'IA qui révolutionne votre rapport à l'automobile",
    heroSub: "Trouvez, comparez, négociez. Powered by AI.",
    tool1: {
      title: "Quelle voiture est faite pour moi ?",
      desc: "Répondez à 5 questions, l'IA vous trouve le match parfait.",
      q1: "Votre budget (€)",
      q1p: "Ex: 15000",
      q2: "Usage principal",
      q2p: "Ville, autoroute, mixte...",
      q3: "Nb de places souhaitées",
      q3p: "2, 4, 5, 7...",
      q4: "Carburant préféré",
      q4p: "Essence, Diesel, Électrique, Hybride...",
      q5: "Style recherché",
      q5p: "Sportive, SUV, Berline, Citadine...",
      btn: "Trouver ma voiture →",
      loading: "Analyse en cours...",
    },
    tool2: {
      title: "Comparateur technique",
      desc: "Entrez 2 modèles, obtenez un comparatif expert instantané.",
      car1: "Voiture 1",
      car1p: "Ex: Peugeot 308",
      car2: "Voiture 2",
      car2p: "Ex: Volkswagen Golf",
      btn: "Comparer →",
      loading: "Comparaison en cours...",
    },
    tool3: {
      title: "Négociateur de prix",
      desc: "Décrivez la voiture, l'IA vous donne les arguments pour négocier.",
      ph: "Ex: Renault Clio 2021, 45 000 km, essence, prix affiché 12 500€, vendu par un particulier...",
      btn: "Générer ma stratégie →",
      loading: "Préparation de votre stratégie...",
    },
    result: "Résultat",
    lang: "EN",
  },
  en: {
    nav: ["Best Match", "Compare", "Negotiate"],
    hero: "The AI that revolutionizes your car buying experience",
    heroSub: "Find, compare, negotiate. Powered by AI.",
    tool1: {
      title: "Which car is right for me?",
      desc: "Answer 5 questions, AI finds your perfect match.",
      q1: "Your budget (€/$)",
      q1p: "e.g. 15000",
      q2: "Main usage",
      q2p: "City, highway, mixed...",
      q3: "Number of seats",
      q3p: "2, 4, 5, 7...",
      q4: "Preferred fuel",
      q4p: "Petrol, Diesel, Electric, Hybrid...",
      q5: "Desired style",
      q5p: "Sports, SUV, Sedan, Hatchback...",
      btn: "Find my car →",
      loading: "Analyzing...",
    },
    tool2: {
      title: "Technical Comparator",
      desc: "Enter 2 models, get an instant expert comparison.",
      car1: "Car 1",
      car1p: "e.g. Peugeot 308",
      car2: "Car 2",
      car2p: "e.g. Volkswagen Golf",
      btn: "Compare →",
      loading: "Comparing...",
    },
    tool3: {
      title: "Price Negotiator",
      desc: "Describe the car, AI gives you the arguments to negotiate.",
      ph: "e.g. 2021 Renault Clio, 45,000 km, petrol, listed at €12,500, private seller...",
      btn: "Generate my strategy →",
      loading: "Preparing your strategy...",
    },
    result: "Result",
    lang: "FR",
  },
};

function Particle({ style }) {
  return <div className="particle" style={style} />;
}

function NeonGrid() {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0,200,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,200,255,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,100,255,0.18) 0%, transparent 70%)",
      }} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "40%",
        background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(0,255,200,0.08) 0%, transparent 70%)",
      }} />
    </div>
  );
}

export default function AutoIA() {
  const [lang, setLang] = useState("fr");
  const [activeTool, setActiveTool] = useState(0);
  const [results, setResults] = useState(["", "", ""]);
  const [loading, setLoading] = useState([false, false, false]);
  const [form1, setForm1] = useState({ budget: "", usage: "", seats: "", fuel: "", style: "" });
  const [form2, setForm2] = useState({ car1: "", car2: "" });
  const [form3, setForm3] = useState({ desc: "" });
  const [heroVisible, setHeroVisible] = useState(false);
  const t = translations[lang];

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100);
  }, []);

  const setResult = (i, val) => setResults(r => { const n = [...r]; n[i] = val; return n; });
  const setLoad = (i, val) => setLoading(l => { const n = [...l]; n[i] = val; return n; });

  async function callClaude(prompt, toolIdx) {
    setLoad(toolIdx, true);
    setResult(toolIdx, "");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "Erreur inattendue.";
      setResult(toolIdx, text);
    } catch (e) {
      setResult(toolIdx, "Erreur de connexion. Veuillez réessayer.");
    }
    setLoad(toolIdx, false);
  }

  function handleTool1() {
    const { budget, usage, seats, fuel, style } = form1;
    if (!budget || !usage) return;
    const prompt = lang === "fr"
      ? `Tu es un expert automobile. Un client cherche une voiture avec ces critères :\n- Budget : ${budget}€\n- Usage : ${usage}\n- Nb places : ${seats || "peu importe"}\n- Carburant : ${fuel || "peu importe"}\n- Style : ${style || "peu importe"}\n\nRecommande les 3 meilleures voitures avec pour chacune : modèle, prix moyen, avantages, inconvénients, et pourquoi elle correspond. Sois précis et enthousiaste.`
      : `You are a car expert. A customer is looking for a car with these criteria:\n- Budget: ${budget}\n- Usage: ${usage}\n- Seats: ${seats || "any"}\n- Fuel: ${fuel || "any"}\n- Style: ${style || "any"}\n\nRecommend the 3 best cars with: model, average price, pros, cons, and why it matches. Be precise and enthusiastic.`;
    callClaude(prompt, 0);
  }

  function handleTool2() {
    const { car1, car2 } = form2;
    if (!car1 || !car2) return;
    const prompt = lang === "fr"
      ? `Tu es un expert automobile. Compare en détail la ${car1} et la ${car2}.\n\nFais un tableau comparatif sur : performances (0-100, vitesse max), consommation, fiabilité, prix neuf/occasion, espace intérieur, technologie embarquée, coût d'entretien. Puis donne un verdict clair : laquelle acheter et pour quel profil d'acheteur.`
      : `You are a car expert. Compare in detail the ${car1} and the ${car2}.\n\nMake a comparison on: performance (0-100, top speed), fuel consumption, reliability, new/used price, interior space, onboard tech, maintenance cost. Then give a clear verdict: which one to buy and for what type of buyer.`;
    callClaude(prompt, 1);
  }

  function handleTool3() {
    const { desc } = form3;
    if (!desc) return;
    const prompt = lang === "fr"
      ? `Tu es un négociateur automobile expert. Un acheteur veut acheter cette voiture :\n${desc}\n\nDonne-lui :\n1. Une estimation de la vraie valeur marché\n2. Les points faibles à inspecter (mécaniques, carrosserie, historique)\n3. Les arguments précis pour faire baisser le prix\n4. La stratégie de négociation étape par étape\n5. Le prix cible à viser et le prix plancher à ne pas dépasser\n\nSois direct, pratique et stratégique.`
      : `You are an expert car negotiator. A buyer wants to purchase this car:\n${desc}\n\nGive them:\n1. An estimate of the real market value\n2. Weak points to inspect (mechanical, body, history)\n3. Precise arguments to lower the price\n4. Step-by-step negotiation strategy\n5. Target price and floor price\n\nBe direct, practical and strategic.`;
    callClaude(prompt, 2);
  }

  const tools = [
    {
      icon: "🚗",
      color: "#00c8ff",
      content: (
        <div style={styles.formGrid}>
          {[
            [t.tool1.q1, t.tool1.q1p, "budget", form1, setForm1],
            [t.tool1.q2, t.tool1.q2p, "usage", form1, setForm1],
            [t.tool1.q3, t.tool1.q3p, "seats", form1, setForm1],
            [t.tool1.q4, t.tool1.q4p, "fuel", form1, setForm1],
            [t.tool1.q5, t.tool1.q5p, "style", form1, setForm1],
          ].map(([label, placeholder, key, form, setForm]) => (
            <div key={key} style={styles.field}>
              <label style={styles.label}>{label}</label>
              <input
                style={styles.input}
                placeholder={placeholder}
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                onFocus={e => e.target.style.borderColor = "#00c8ff"}
                onBlur={e => e.target.style.borderColor = "rgba(0,200,255,0.2)"}
              />
            </div>
          ))}
          <button style={{ ...styles.btn, background: "linear-gradient(135deg, #00c8ff, #0066ff)", gridColumn: "1/-1" }}
            onClick={handleTool1} disabled={loading[0]}>
            {loading[0] ? t.tool1.loading : t.tool1.btn}
          </button>
        </div>
      ),
      result: results[0], loading: loading[0], toolData: t.tool1,
    },
    {
      icon: "⚡",
      color: "#7c3aed",
      content: (
        <div style={styles.formGrid}>
          {[
            [t.tool2.car1, t.tool2.car1p, "car1"],
            [t.tool2.car2, t.tool2.car2p, "car2"],
          ].map(([label, placeholder, key]) => (
            <div key={key} style={styles.field}>
              <label style={styles.label}>{label}</label>
              <input
                style={styles.input}
                placeholder={placeholder}
                value={form2[key]}
                onChange={e => setForm2(f => ({ ...f, [key]: e.target.value }))}
                onFocus={e => e.target.style.borderColor = "#7c3aed"}
                onBlur={e => e.target.style.borderColor = "rgba(0,200,255,0.2)"}
              />
            </div>
          ))}
          <button style={{ ...styles.btn, background: "linear-gradient(135deg, #7c3aed, #a855f7)", gridColumn: "1/-1" }}
            onClick={handleTool2} disabled={loading[1]}>
            {loading[1] ? t.tool2.loading : t.tool2.btn}
          </button>
        </div>
      ),
      result: results[1], loading: loading[1], toolData: t.tool2,
    },
    {
      icon: "💰",
      color: "#00ffb3",
      content: (
        <div style={styles.formGrid}>
          <div style={{ ...styles.field, gridColumn: "1/-1" }}>
            <label style={styles.label}>{lang === "fr" ? "Décrivez la voiture" : "Describe the car"}</label>
            <textarea
              style={{ ...styles.input, minHeight: 100, resize: "vertical" }}
              placeholder={t.tool3.ph}
              value={form3.desc}
              onChange={e => setForm3({ desc: e.target.value })}
              onFocus={e => e.target.style.borderColor = "#00ffb3"}
              onBlur={e => e.target.style.borderColor = "rgba(0,200,255,0.2)"}
            />
          </div>
          <button style={{ ...styles.btn, background: "linear-gradient(135deg, #00ffb3, #00c8ff)", color: "#0a0f1e", gridColumn: "1/-1" }}
            onClick={handleTool3} disabled={loading[2]}>
            {loading[2] ? t.tool3.loading : t.tool3.btn}
          </button>
        </div>
      ),
      result: results[2], loading: loading[2], toolData: t.tool3,
    },
  ];

  const activeTData = tools[activeTool];

  return (
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;600;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #05080f; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #05080f; }
        ::-webkit-scrollbar-thumb { background: #00c8ff44; border-radius: 2px; }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
        @keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 1; } 100% { transform: scale(2); opacity: 0; } }
        @keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        .tool-card:hover { transform: translateY(-2px); border-color: rgba(0,200,255,0.5) !important; }
        .nav-btn:hover { background: rgba(0,200,255,0.15) !important; }
        input::placeholder, textarea::placeholder { color: rgba(150,180,220,0.4); }
        button:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.1); }
        button:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <NeonGrid />

      {/* Scan line */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 2, zIndex: 1,
        background: "linear-gradient(90deg, transparent, #00c8ff, transparent)",
        animation: "scan 8s linear infinite", opacity: 0.3,
      }} />

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>⚡</span>
          <span style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 900, fontSize: 22, letterSpacing: 2 }}>
            AUTO<span style={{ color: "#00c8ff" }}>IA</span>
          </span>
        </div>
        <nav style={styles.nav}>
          {t.nav.map((n, i) => (
            <button key={i} className="nav-btn" style={{
              ...styles.navBtn,
              color: activeTool === i ? "#00c8ff" : "rgba(200,220,255,0.6)",
              borderBottom: activeTool === i ? "2px solid #00c8ff" : "2px solid transparent",
              background: activeTool === i ? "rgba(0,200,255,0.08)" : "transparent",
            }} onClick={() => setActiveTool(i)}>{n}</button>
          ))}
        </nav>
        <button style={styles.langBtn} onClick={() => setLang(l => l === "fr" ? "en" : "fr")}>
          {t.lang}
        </button>
      </header>

      <main style={styles.main}>
        {/* Hero */}
        <div style={{
          ...styles.hero,
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s ease",
        }}>
          <div style={styles.heroTag}>
            <span style={{ animation: "blink 1.5s infinite", marginRight: 6 }}>●</span>
            {lang === "fr" ? "IA Active" : "AI Active"}
          </div>
          <h1 style={styles.heroTitle}>{t.hero}</h1>
          <p style={styles.heroSub}>{t.heroSub}</p>
        </div>

        {/* Tool selector cards */}
        <div style={styles.toolCards}>
          {tools.map((tool, i) => (
            <div key={i} className="tool-card" style={{
              ...styles.toolCard,
              borderColor: activeTool === i ? tool.color : "rgba(0,200,255,0.15)",
              background: activeTool === i
                ? `linear-gradient(135deg, rgba(0,10,30,0.95), rgba(${tool.color === "#00c8ff" ? "0,200,255" : tool.color === "#7c3aed" ? "124,58,237" : "0,255,179"},0.08))`
                : "rgba(5,15,40,0.6)",
              boxShadow: activeTool === i ? `0 0 30px ${tool.color}22` : "none",
            }} onClick={() => setActiveTool(i)}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{tool.icon}</div>
              <div style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 13, color: activeTool === i ? tool.color : "rgba(200,220,255,0.7)", letterSpacing: 0.5 }}>
                {tool.toolData.title}
              </div>
              <div style={{ fontSize: 11, color: "rgba(150,180,220,0.5)", marginTop: 4 }}>
                {tool.toolData.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Active tool panel */}
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <span style={{ fontSize: 24 }}>{activeTData.icon}</span>
            <div>
              <div style={{ fontFamily: "'Exo 2', sans-serif", fontWeight: 700, fontSize: 18, color: "#fff" }}>
                {activeTData.toolData.title}
              </div>
              <div style={{ fontSize: 13, color: "rgba(150,180,220,0.6)", marginTop: 2 }}>
                {activeTData.toolData.desc}
              </div>
            </div>
          </div>

          {activeTData.content}

          {/* Result */}
          {(activeTData.loading || activeTData.result) && (
            <div style={styles.resultBox}>
              <div style={styles.resultHeader}>
                <span style={{ color: activeTData.color, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                  ▶ {t.result}
                </span>
                {activeTData.loading && (
                  <div style={styles.loader}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: 6, height: 6, borderRadius: "50%", background: activeTData.color,
                        animation: `pulse-ring 1s ${i * 0.2}s infinite`,
                      }} />
                    ))}
                  </div>
                )}
              </div>
              {activeTData.result && (
                <div style={styles.resultText}>
                  {activeTData.result}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer style={styles.footer}>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(100,140,180,0.4)" }}>
            AutoIA © 2026 — Powered by Claude AI
          </span>
        </footer>
      </main>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#05080f",
    color: "#e8f0ff",
    fontFamily: "'Exo 2', sans-serif",
    position: "relative",
  },
  header: {
    position: "sticky", top: 0, zIndex: 100,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 24px", height: 60,
    background: "rgba(5,8,15,0.9)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(0,200,255,0.1)",
  },
  logo: {
    display: "flex", alignItems: "center", gap: 8,
  },
  logoIcon: {
    fontSize: 20, filter: "drop-shadow(0 0 8px #00c8ff)",
  },
  nav: {
    display: "flex", gap: 4,
  },
  navBtn: {
    padding: "6px 14px", borderRadius: 6, border: "none",
    cursor: "pointer", fontFamily: "'Exo 2', sans-serif",
    fontWeight: 600, fontSize: 13, transition: "all 0.2s",
    letterSpacing: 0.5,
  },
  langBtn: {
    padding: "6px 14px",
    background: "rgba(0,200,255,0.1)",
    border: "1px solid rgba(0,200,255,0.3)",
    borderRadius: 6, color: "#00c8ff",
    cursor: "pointer", fontFamily: "'JetBrains Mono', monospace",
    fontWeight: 700, fontSize: 12, transition: "all 0.2s",
  },
  main: {
    maxWidth: 800, margin: "0 auto", padding: "40px 20px 60px",
    position: "relative", zIndex: 2,
  },
  hero: {
    textAlign: "center", marginBottom: 48,
  },
  heroTag: {
    display: "inline-flex", alignItems: "center",
    padding: "4px 14px", borderRadius: 20,
    background: "rgba(0,200,255,0.08)",
    border: "1px solid rgba(0,200,255,0.2)",
    color: "#00c8ff", fontSize: 11,
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: 1, marginBottom: 20,
  },
  heroTitle: {
    fontSize: "clamp(22px, 4vw, 38px)",
    fontWeight: 900, lineHeight: 1.2,
    letterSpacing: -0.5, marginBottom: 12,
    background: "linear-gradient(135deg, #ffffff 0%, #00c8ff 50%, #7c3aed 100%)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  heroSub: {
    color: "rgba(150,180,220,0.6)", fontSize: 15,
    fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1,
  },
  toolCards: {
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12, marginBottom: 24,
  },
  toolCard: {
    padding: 16, borderRadius: 12,
    border: "1px solid", cursor: "pointer",
    transition: "all 0.3s ease",
  },
  panel: {
    background: "rgba(5,15,40,0.8)",
    border: "1px solid rgba(0,200,255,0.15)",
    borderRadius: 16, padding: 28,
    backdropFilter: "blur(10px)",
  },
  panelHeader: {
    display: "flex", alignItems: "flex-start",
    gap: 14, marginBottom: 24,
    paddingBottom: 20,
    borderBottom: "1px solid rgba(0,200,255,0.1)",
  },
  formGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  field: {
    display: "flex", flexDirection: "column", gap: 6,
  },
  label: {
    fontSize: 12, fontWeight: 600,
    color: "rgba(150,200,255,0.7)",
    letterSpacing: 0.5,
    fontFamily: "'JetBrains Mono', monospace",
  },
  input: {
    background: "rgba(0,15,40,0.8)",
    border: "1px solid rgba(0,200,255,0.2)",
    borderRadius: 8, padding: "10px 14px",
    color: "#e8f0ff", fontSize: 14,
    fontFamily: "'Exo 2', sans-serif",
    outline: "none", transition: "border-color 0.2s",
    width: "100%",
  },
  btn: {
    padding: "12px 24px", borderRadius: 8,
    border: "none", color: "#fff",
    fontFamily: "'Exo 2', sans-serif",
    fontWeight: 700, fontSize: 14,
    cursor: "pointer", letterSpacing: 0.5,
    transition: "all 0.2s",
  },
  resultBox: {
    marginTop: 24,
    background: "rgba(0,200,255,0.04)",
    border: "1px solid rgba(0,200,255,0.15)",
    borderRadius: 10, overflow: "hidden",
  },
  resultHeader: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 16px",
    background: "rgba(0,200,255,0.06)",
    borderBottom: "1px solid rgba(0,200,255,0.1)",
  },
  loader: {
    display: "flex", gap: 6, alignItems: "center",
  },
  resultText: {
    padding: 16, fontSize: 14, lineHeight: 1.7,
    color: "rgba(200,220,255,0.85)",
    whiteSpace: "pre-wrap",
    fontFamily: "'Exo 2', sans-serif",
  },
  footer: {
    textAlign: "center", marginTop: 60,
  },
};

