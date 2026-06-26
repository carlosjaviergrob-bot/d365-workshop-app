import { useState, useEffect, useMemo } from "react";
import backend from "../services/backend";

const FIT_COLORS = {
  fit: ["Estándar", "#EAF3DE", "#27500A"],
  cfg: ["Configurable", "#FAEEDA", "#633806"],
  gap: ["Gap probable", "#FAECE7", "#712B13"],
};

export default function ScenarioCatalogPage() {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [search, setSearch] = useState("");
  const [filterArea, setFilterArea] = useState("Todas");
  const [filterStatus, setFilterStatus] = useState("Todos");

  useEffect(() => {
    backend.getCatalogScenarios().then(data => {
      setScenarios(data);
      setLoading(false);
    }).catch(e => { console.error(e); setLoading(false); });
  }, []);

  const areas = useMemo(() => ["Todas", ...new Set(scenarios.map(s => s.area).sort())], [scenarios]);

  const filtered = useMemo(() => {
    return scenarios.filter(s => {
      if (filterArea !== "Todas" && s.area !== filterArea) return false;
      if (filterStatus === "Activos" && !s.active) return false;
      if (filterStatus === "Inactivos" && s.active) return false;
      if (search) {
        const q = search.toLowerCase();
        return s.title.toLowerCase().includes(q) || s.scenario_id.toLowerCase().includes(q) || (s.area || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [scenarios, filterArea, filterStatus, search]);

  const stats = useMemo(() => ({
    total: scenarios.length,
    active: scenarios.filter(s => s.active).length,
    inactive: scenarios.filter(s => !s.active).length,
  }), [scenarios]);

  const toggle = async (id, currentActive) => {
    setSaving(id);
    try {
      await backend.toggleCatalogScenario(id, !currentActive);
      setScenarios(prev => prev.map(s => s.scenario_id === id ? { ...s, active: !currentActive } : s));
    } catch (e) { alert("Error: " + e.message); }
    finally { setSaving(null); }
  };

  const selectStyle = { padding: "6px 10px", borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--surface)", color: "var(--text-primary)", fontSize: 13 };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, margin: "0 0 4px" }}>Catálogo de escenarios BPC</h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
          Activá los escenarios que querés que aparezcan en los workshops. Los inactivos no se muestran a los consultores.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: "1.5rem" }}>
        {[
          { label: "Total en BPC", val: stats.total, bg: null },
          { label: "Activos en workshops", val: stats.active, bg: "#EAF3DE", tc: "#27500A" },
          { label: "Disponibles para activar", val: stats.inactive, bg: "var(--surface)", tc: null },
        ].map(({ label, val, bg, tc }) => (
          <div key={label} style={{ background: bg, borderRadius: 8, padding: "10px 14px", border: "0.5px solid var(--border)" }}>
            <div style={{ fontSize: 22, fontWeight: 500, color: tc || "var(--text-primary)" }}>{val}</div>
            <div style={{ fontSize: 11, color: tc || "var(--text-tertiary)", marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
        <input type="text" placeholder="Buscar por título o ID..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200, padding: "7px 12px", borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--surface)", color: "var(--text-primary)", fontSize: 13 }} />
        <select value={filterArea} onChange={e => setFilterArea(e.target.value)} style={selectStyle}>
          {areas.map(a => <option key={a}>{a}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle}>
          <option>Todos</option>
          <option>Activos</option>
          <option>Inactivos</option>
        </select>
      </div>

      <p style={{ fontSize: 12, color: "var(--text-tertiary)", margin: "0 0 10px" }}>{filtered.length} escenarios</p>

      {loading
        ? <p style={{ fontSize: 13, color: "var(--text-tertiary)", textAlign: "center", padding: "2rem 0" }}>Cargando catálogo...</p>
        : (
          <div style={{ background: "var(--card-bg)", border: "0.5px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
            {filtered.map((s, i) => {
              const [fl, fb, fc] = FIT_COLORS[s.fit] || FIT_COLORS.fit;
              const isSaving = saving === s.scenario_id;
              return (
                <div key={s.scenario_id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: i < filtered.length - 1 ? "0.5px solid var(--border)" : "none", opacity: s.active ? 1 : .6 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 2 }}>
                      <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontFamily: "monospace" }}>{s.scenario_id}</span>
                      <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 20, fontWeight: 500, background: fb, color: fc }}>{fl}</span>
                      <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{s.area}</span>
                    </div>
                    <p style={{ fontSize: 13, margin: 0, fontWeight: s.active ? 500 : 400, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</p>
                    {s.menu && <p style={{ fontSize: 11, color: "var(--text-tertiary)", margin: "2px 0 0", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.menu}</p>}
                  </div>
                  <button
                    onClick={() => toggle(s.scenario_id, s.active)}
                    disabled={isSaving}
                    style={{
                      flexShrink: 0,
                      fontSize: 12,
                      padding: "5px 14px",
                      borderRadius: 8,
                      border: s.active ? "1px solid #3B6D11" : "0.5px solid var(--border)",
                      background: s.active ? "#EAF3DE" : "transparent",
                      color: s.active ? "#27500A" : "var(--text-secondary)",
                      cursor: isSaving ? "not-allowed" : "pointer",
                      fontWeight: s.active ? 500 : 400,
                      opacity: isSaving ? .5 : 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {isSaving ? "..." : s.active ? "✓ Activo" : "Activar"}
                  </button>
                </div>
              );
            })}
          </div>
        )
      }
    </div>
  );
}
