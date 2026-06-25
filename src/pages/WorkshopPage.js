import { useState, useMemo } from "react";
import { AREAS, ALL_SCENARIOS } from "../data/scenarios";
import { useResponses } from "../services/useApi";
import ScenarioCard from "../components/ScenarioCard";

const VIEWS = [
  { key: "workshop", label: "Workshop" },
  { key: "gaps",     label: "Gaps" },
  { key: "difs",     label: "Diferencias" },
  { key: "pend",     label: "Pendientes" },
];

export default function WorkshopPage({ project }) {
  const [area, setArea] = useState(Object.keys(AREAS)[0]);
  const [view, setView] = useState("workshop");
  const [search, setSearch] = useState("");
  const { responses, saving, upsert } = useResponses(project.id);

  const stats = useMemo(() => {
    const s = { total: ALL_SCENARIOS.length, si: 0, no: 0, dif: 0 };
    ALL_SCENARIOS.forEach(sc => {
      const a = responses[sc.id]?.answer;
      if (a === "si") s.si++;
      else if (a === "no") s.no++;
      else if (a === "dif") s.dif++;
    });
    s.pend = s.total - s.si - s.no - s.dif;
    return s;
  }, [responses]);

  const list = useMemo(() => {
    const pool = view === "workshop"
      ? AREAS[area].scenarios
      : ALL_SCENARIOS.filter(sc => {
          const a = responses[sc.id]?.answer;
          if (view === "gaps") return a === "no";
          if (view === "difs") return a === "dif";
          if (view === "pend") return !a;
          return true;
        });
    if (!search) return pool;
    const q = search.toLowerCase();
    return pool.filter(sc => sc.t.toLowerCase().includes(q) || sc.biz.toLowerCase().includes(q));
  }, [view, area, responses, search]);

  const prog = name => {
    const done = AREAS[name].scenarios.filter(sc => responses[sc.id]?.answer).length;
    return `${done}/${AREAS[name].scenarios.length}`;
  };

  const statCards = [
    { label: "Total", val: stats.total, bg: null, tc: null },
    { label: "Fit confirmado", val: stats.si, bg: "#EAF3DE", tc: "#27500A" },
    { label: "Con diferencias", val: stats.dif, bg: "#FAEEDA", tc: "#633806" },
    { label: "Gaps", val: stats.no, bg: "#FAECE7", tc: "#712B13" },
  ];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: "1.5rem" }}>
        {statCards.map(({ label, val, bg, tc }) => (
          <div key={label} style={{ background: bg || "var(--surface)", borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ fontSize: 22, fontWeight: 500, color: tc || "var(--text-primary)" }}>{val}</div>
            <div style={{ fontSize: 11, color: tc || "var(--text-tertiary)", marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {VIEWS.map(({ key, label }) => {
            const cnt = key === "gaps" ? stats.no : key === "difs" ? stats.dif : key === "pend" ? stats.pend : null;
            const active = view === key;
            return (
              <button key={key} onClick={() => { setView(key); setSearch(""); }} style={{ fontSize: 12, padding: "5px 14px", borderRadius: 8, border: active ? "1px solid #185FA5" : "0.5px solid var(--border)", background: active ? "#E6F1FB" : "transparent", color: active ? "#0C447C" : "var(--text-secondary)", cursor: "pointer", fontWeight: active ? 500 : 400 }}>
                {label}{cnt !== null ? ` (${cnt})` : ""}
              </button>
            );
          })}
        </div>
        {saving && <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>Guardando...</span>}
      </div>

      {view === "workshop" && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: "1rem" }}>
          {Object.keys(AREAS).map(name => (
            <button key={name} onClick={() => setArea(name)} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 20, border: area === name ? "1px solid #185FA5" : "0.5px solid var(--border)", background: area === name ? "#E6F1FB" : "transparent", color: area === name ? "#0C447C" : "var(--text-secondary)", cursor: "pointer", whiteSpace: "nowrap", fontWeight: area === name ? 500 : 400 }}>
              {name} <span style={{ fontSize: 10, opacity: .7 }}>{prog(name)}</span>
            </button>
          ))}
        </div>
      )}

      <input type="text" placeholder="Buscar escenario..." value={search} onChange={e => setSearch(e.target.value)}
        style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--surface)", color: "var(--text-primary)", fontSize: 14, marginBottom: 12 }} />

      {view === "workshop" && (
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 12px" }}>{AREAS[area].desc}</p>
      )}

      {list.length === 0
        ? <p style={{ fontSize: 14, color: "var(--text-tertiary)", padding: "1rem 0", textAlign: "center" }}>Sin resultados</p>
        : list.map(sc => (
            <ScenarioCard key={sc.id} scenario={sc} projectId={project.id} response={responses[sc.id]} onUpsert={upsert} />
          ))
      }
    </div>
  );
}
