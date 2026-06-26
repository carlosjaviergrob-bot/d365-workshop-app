import { useState, useEffect, useMemo } from "react";
import backend from "../services/backend";

const FIT_COLORS = {
  fit: ["Estándar", "#EAF3DE", "#27500A"],
  cfg: ["Configurable", "#FAEEDA", "#633806"],
  gap: ["Gap probable", "#FAECE7", "#712B13"],
};

const FIELD_LABELS = {
  forms:        { label: "Formularios clave", placeholder: "Ej: Vendor invoice (VendEditInvoice) | Pending vendor invoices" },
  biz_question: { label: "Pregunta de negocio", placeholder: "¿Cómo ingresan las facturas hoy? ¿Manual, escaneado, EDI?" },
  key_points:   { label: "Qué mostrar", placeholder: "Factura pendiente, registro, matching" },
  tip:          { label: "Tip para el consultor", placeholder: "Consejo para el consultor junior sobre cómo manejarlo en el workshop" },
};

export default function ScenarioCatalogPage() {
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editFields, setEditFields] = useState({});
  const [saving, setSaving] = useState(false);
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

  const filtered = useMemo(() => scenarios.filter(s => {
    if (filterArea !== "Todas" && s.area !== filterArea) return false;
    if (filterStatus === "Activos" && !s.active) return false;
    if (filterStatus === "Inactivos" && s.active) return false;
    if (search) {
      const q = search.toLowerCase();
      return s.title.toLowerCase().includes(q) || s.scenario_id.toLowerCase().includes(q) || (s.area||'').toLowerCase().includes(q);
    }
    return true;
  }), [scenarios, filterArea, filterStatus, search]);

  const stats = useMemo(() => ({
    total: scenarios.length,
    active: scenarios.filter(s => s.active).length,
    enriched: scenarios.filter(s => s.active && s.tip).length,
  }), [scenarios]);

  const toggle = async (id, current) => {
    setToggling(id);
    try {
      await backend.toggleCatalogScenario(id, !current);
      setScenarios(prev => prev.map(s => s.scenario_id === id ? { ...s, active: !current } : s));
    } catch (e) { alert("Error: " + e.message); }
    finally { setToggling(null); }
  };

  const startEdit = (s) => {
    setEditId(s.scenario_id);
    setEditFields({ forms: s.forms||"", biz_question: s.biz_question||"", key_points: s.key_points||"", tip: s.tip||"" });
  };

  const saveEdit = async (id) => {
    setSaving(true);
    try {
      await backend.updateCatalogScenario(id, editFields);
      setScenarios(prev => prev.map(s => s.scenario_id === id ? { ...s, ...editFields } : s));
      setEditId(null);
    } catch (e) { alert("Error: " + e.message); }
    finally { setSaving(false); }
  };

  const selectStyle = { padding: "6px 10px", borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--surface)", color: "var(--text-primary)", fontSize: 13 };
  const taStyle = { width: "100%", boxSizing: "border-box", padding: "7px 10px", borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--card-bg)", color: "var(--text-primary)", fontSize: 13, resize: "vertical", minHeight: 60 };

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, margin: "0 0 4px" }}>Catálogo de escenarios BPC</h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
          Activá escenarios y completá los campos de workshop para que aparezcan en las sesiones con clientes.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: "1.5rem" }}>
        {[
          { label: "Total en BPC", val: stats.total, bg: null },
          { label: "Activos en workshops", val: stats.active, bg: "#EAF3DE", tc: "#27500A" },
          { label: "Activos con tip completo", val: stats.enriched, bg: "#E6F1FB", tc: "#0C447C" },
        ].map(({ label, val, bg, tc }) => (
          <div key={label} style={{ background: bg || "var(--surface)", borderRadius: 8, padding: "10px 14px", border: "0.5px solid var(--border)" }}>
            <div style={{ fontSize: 22, fontWeight: 500, color: tc || "var(--text-primary)" }}>{val}</div>
            <div style={{ fontSize: 11, color: tc || "var(--text-tertiary)", marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

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
        : filtered.map((s, i) => {
          const [fl, fb, fc] = FIT_COLORS[s.fit] || FIT_COLORS.fit;
          const isEditing = editId === s.scenario_id;
          const hasEnrichment = s.tip || s.forms || s.biz_question;
          return (
            <div key={s.scenario_id} style={{ background: "var(--card-bg)", border: isEditing ? "1px solid #185FA5" : "0.5px solid var(--border)", borderRadius: 12, padding: "12px 16px", marginBottom: 8, opacity: s.active ? 1 : .65 }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", marginBottom: 3 }}>
                    <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontFamily: "monospace" }}>{s.scenario_id}</span>
                    <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 20, fontWeight: 500, background: fb, color: fc }}>{fl}</span>
                    <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{s.area}</span>
                    {hasEnrichment && <span style={{ fontSize: 11, color: "#0C447C" }}>✓ Enriquecido</span>}
                  </div>
                  <p style={{ fontSize: 14, margin: "0 0 2px", fontWeight: 500 }}>{s.title}</p>
                  {(s.bpc_e2e || s.bpc_process) && !isEditing && (
                    <p style={{ fontSize: 11, color: "var(--text-tertiary)", margin: "2px 0 0" }}>
                      {s.bpc_e2e && <span style={{ background: "#F1EFE8", borderRadius: 4, padding: "1px 6px", marginRight: 4 }}>{s.bpc_e2e}</span>}
                      {s.bpc_process && <span style={{ background: "#E6F1FB", borderRadius: 4, padding: "1px 6px", color: "#0C447C" }}>{s.bpc_process}</span>}
                    </p>
                  )}
                  {s.menu && !isEditing && <p style={{ fontSize: 11, color: "var(--text-tertiary)", margin: 0, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.menu}</p>}
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  {!isEditing && (
                    <button onClick={() => startEdit(s)} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 8, border: "0.5px solid var(--border)", background: "transparent", cursor: "pointer", color: "var(--text-secondary)" }}>
                      {hasEnrichment ? "Editar" : "+ Completar"}
                    </button>
                  )}
                  <button
                    onClick={() => toggle(s.scenario_id, s.active)}
                    disabled={toggling === s.scenario_id}
                    style={{ fontSize: 12, padding: "4px 14px", borderRadius: 8, border: s.active ? "1px solid #3B6D11" : "0.5px solid var(--border)", background: s.active ? "#EAF3DE" : "transparent", color: s.active ? "#27500A" : "var(--text-secondary)", cursor: "pointer", fontWeight: s.active ? 500 : 400, whiteSpace: "nowrap" }}
                  >
                    {toggling === s.scenario_id ? "..." : s.active ? "✓ Activo" : "Activar"}
                  </button>
                </div>
              </div>

              {/* Fields preview (when not editing) */}
              {!isEditing && hasEnrichment && (
                <div style={{ marginTop: 10, background: "var(--surface)", borderRadius: 8, padding: "10px 12px" }}>
                  {s.biz_question && (
                    <div style={{ display: "flex", gap: 8, padding: "4px 0", borderBottom: "0.5px solid var(--border)", fontSize: 13 }}>
                      <span style={{ color: "var(--text-tertiary)", minWidth: 120, fontSize: 12 }}>Pregunta de negocio</span>
                      <span style={{ color: "var(--text-secondary)" }}>{s.biz_question}</span>
                    </div>
                  )}
                  {s.forms && (
                    <div style={{ display: "flex", gap: 8, padding: "4px 0", borderBottom: "0.5px solid var(--border)", fontSize: 13 }}>
                      <span style={{ color: "var(--text-tertiary)", minWidth: 120, fontSize: 12 }}>Formularios clave</span>
                      <span style={{ color: "var(--text-secondary)" }}>{s.forms}</span>
                    </div>
                  )}
                  {s.key_points && (
                    <div style={{ display: "flex", gap: 8, padding: "4px 0", borderBottom: "0.5px solid var(--border)", fontSize: 13 }}>
                      <span style={{ color: "var(--text-tertiary)", minWidth: 120, fontSize: 12 }}>Qué mostrar</span>
                      <span style={{ color: "var(--text-secondary)" }}>{s.key_points}</span>
                    </div>
                  )}
                  {s.tip && (
                    <div style={{ display: "flex", gap: 8, padding: "4px 0", fontSize: 13 }}>
                      <span style={{ color: "var(--text-tertiary)", minWidth: 120, fontSize: 12 }}>Tip</span>
                      <span style={{ color: "var(--text-warning, #633806)", background: "var(--color-background-warning, #FAEEDA)", borderRadius: 6, padding: "2px 8px" }}>{s.tip}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Edit form */}
              {isEditing && (
                <div style={{ marginTop: 12 }}>
                  {Object.entries(FIELD_LABELS).map(([field, { label, placeholder }]) => (
                    <div key={field} style={{ marginBottom: 10 }}>
                      <label style={{ fontSize: 12, color: "var(--text-tertiary)", display: "block", marginBottom: 4 }}>{label}</label>
                      <textarea
                        rows={field === "tip" || field === "biz_question" ? 2 : 2}
                        placeholder={placeholder}
                        value={editFields[field]}
                        onChange={e => setEditFields(prev => ({ ...prev, [field]: e.target.value }))}
                        style={taStyle}
                      />
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <button onClick={() => saveEdit(s.scenario_id)} disabled={saving} style={{ padding: "7px 18px", fontSize: 13, borderRadius: 8, border: "none", background: "#185FA5", color: "#fff", cursor: saving ? "not-allowed" : "pointer", fontWeight: 500, opacity: saving ? .7 : 1 }}>
                      {saving ? "Guardando..." : "Guardar"}
                    </button>
                    <button onClick={() => setEditId(null)} style={{ padding: "7px 14px", fontSize: 13, borderRadius: 8, border: "0.5px solid var(--border)", background: "transparent", cursor: "pointer", color: "var(--text-secondary)" }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      }
    </div>
  );
}
