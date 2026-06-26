import { useState, useMemo, useEffect } from "react";
import { ALL_AREAS, ALL_SCENARIOS_COMBINED } from "../data/scenarios";
import { useResponses, useProjectMembers } from "../services/useApi";
import ScenarioCard from "../components/ScenarioCard";

const VIEWS = [
  { key: "workshop", label: "Workshop" },
  { key: "gaps",     label: "Gaps" },
  { key: "difs",     label: "Diferencias" },
  { key: "pend",     label: "Pendientes" },
];

const FINANCE_AREAS = ["Contabilidad general", "Cuentas a pagar", "Cuentas a cobrar", "Tesorería y bancos", "Presupuesto", "Activos fijos", "Impuestos", "Control y compliance"];
const OPS_AREAS = ["Compras", "Inventario y almacenes", "Producción y manufactura", "Planificación de producción", "Mantenimiento", "Gestión de productos"];

export default function WorkshopPage({ project, currentUser }) {
  const [area, setArea] = useState(null);
  const [view, setView] = useState("workshop");
  const [search, setSearch] = useState("");
  const { responses, saving, upsert } = useResponses(project.id);
  const { members } = useProjectMembers(project.id);

  const isLeadOrAdmin = currentUser?.role === "admin" || currentUser?.role === "lead";

  // Determinar áreas permitidas según asignación del consultor en el proyecto
  const allowedAreas = useMemo(() => {
    if (isLeadOrAdmin) return Object.keys(ALL_AREAS);
    const myMember = members.find(m => m.consultants?.email === currentUser?.email);
    if (!myMember || !myMember.area || myMember.area === "Todas") return Object.keys(ALL_AREAS);
    // Si el área asignada es "Finanzas" o "Operaciones" como grupo
    if (myMember.area === "Finanzas") return FINANCE_AREAS;
    if (myMember.area === "Operaciones") return OPS_AREAS;
    return [myMember.area];
  }, [members, currentUser, isLeadOrAdmin]);

  useEffect(() => {
    if (allowedAreas.length > 0 && (!area || !allowedAreas.includes(area))) {
      setArea(allowedAreas[0]);
    }
  }, [allowedAreas, area]);

  const allowedScenarios = useMemo(() =>
    ALL_SCENARIOS_COMBINED.filter(s => allowedAreas.includes(s.area)),
    [allowedAreas]
  );

  const stats = useMemo(() => {
    const s = { total: allowedScenarios.length, si: 0, no: 0, dif: 0, gap: 0 };
    allowedScenarios.forEach(sc => {
      const a = responses[sc.id]?.answer;
      if (a === "si") s.si++;
      else if (a === "no") s.no++;
      else if (a === "dif") s.dif++;
      else if (a === "gap") s.gap++;
    });
    s.pend = s.total - s.si - s.no - s.dif - s.gap;
    return s;
  }, [allowedScenarios, responses]);

  const list = useMemo(() => {
    const pool = view === "workshop"
      ? (area ? ALL_AREAS[area]?.scenarios || [] : [])
      : allowedScenarios.filter(sc => {
          const a = responses[sc.id]?.answer;
          if (view === "gaps") return a === "no" || a === "gap";
          if (view === "difs") return a === "dif";
          if (view === "pend") return !a;
          return true;
        });
    if (!search) return pool;
    const q = search.toLowerCase();
    return pool.filter(sc => sc.t.toLowerCase().includes(q) || sc.biz.toLowerCase().includes(q));
  }, [view, area, allowedScenarios, responses, search]);

  const prog = name => {
    const scenarios = ALL_AREAS[name]?.scenarios || [];
    const done = scenarios.filter(sc => responses[sc.id]?.answer).length;
    return `${done}/${scenarios.length}`;
  };

  // Agrupar áreas por módulo para el nav
  const financeAllowed = allowedAreas.filter(a => FINANCE_AREAS.includes(a));
  const opsAllowed = allowedAreas.filter(a => OPS_AREAS.includes(a));

  if (!area) return <p style={{ fontSize: 13, color: "var(--text-tertiary)", textAlign: "center", padding: "2rem 0" }}>Cargando...</p>;

  return (
    <div>
      {!isLeadOrAdmin && allowedAreas.length < Object.keys(ALL_AREAS).length && (
        <div style={{ background: "#E6F1FB", borderRadius: 8, padding: "8px 14px", marginBottom: "1rem", fontSize: 13, color: "#0C447C" }}>
          Estás asignado a <strong>{allowedAreas.length === FINANCE_AREAS.length ? "Finanzas" : allowedAreas.length === OPS_AREAS.length ? "Operaciones" : allowedAreas.join(", ")}</strong> en este proyecto.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: "1.5rem" }}>
        {[
          { label: "Total", val: stats.total, bg: null, tc: null },
          { label: "Fit confirmado", val: stats.si, bg: "#EAF3DE", tc: "#27500A" },
          { label: "Con diferencias", val: stats.dif, bg: "#FAEEDA", tc: "#633806" },
          { label: "Gaps", val: stats.no + stats.gap, bg: "#FAECE7", tc: "#712B13" },
        ].map(({ label, val, bg, tc }) => (
          <div key={label} style={{ background: bg || "var(--surface)", borderRadius: 8, padding: "10px 14px" }}>
            <div style={{ fontSize: 22, fontWeight: 500, color: tc || "var(--text-primary)" }}>{val}</div>
            <div style={{ fontSize: 11, color: tc || "var(--text-tertiary)", marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {VIEWS.map(({ key, label }) => {
            const cnt = key === "gaps" ? stats.no + stats.gap : key === "difs" ? stats.dif : key === "pend" ? stats.pend : null;
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
        <div style={{ marginBottom: "1rem" }}>
          {financeAllowed.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: "var(--text-tertiary)", display: "block", marginBottom: 5 }}>FINANZAS</span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {financeAllowed.map(name => (
                  <button key={name} onClick={() => setArea(name)} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 20, border: area === name ? "1px solid #185FA5" : "0.5px solid var(--border)", background: area === name ? "#E6F1FB" : "transparent", color: area === name ? "#0C447C" : "var(--text-secondary)", cursor: "pointer", whiteSpace: "nowrap", fontWeight: area === name ? 500 : 400 }}>
                    {name} <span style={{ fontSize: 10, opacity: .7 }}>{prog(name)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {opsAllowed.length > 0 && (
            <div>
              <span style={{ fontSize: 11, color: "var(--text-tertiary)", display: "block", marginBottom: 5 }}>OPERACIONES</span>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {opsAllowed.map(name => (
                  <button key={name} onClick={() => setArea(name)} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 20, border: area === name ? "1px solid #3B6D11" : "0.5px solid var(--border)", background: area === name ? "#EAF3DE" : "transparent", color: area === name ? "#27500A" : "var(--text-secondary)", cursor: "pointer", whiteSpace: "nowrap", fontWeight: area === name ? 500 : 400 }}>
                    {name} <span style={{ fontSize: 10, opacity: .7 }}>{prog(name)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <input type="text" placeholder="Buscar escenario..." value={search} onChange={e => setSearch(e.target.value)}
        style={{ width: "100%", boxSizing: "border-box", padding: "8px 12px", borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--surface)", color: "var(--text-primary)", fontSize: 14, marginBottom: 12 }} />

      {view === "workshop" && area && (
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 12px" }}>{ALL_AREAS[area]?.desc}</p>
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
