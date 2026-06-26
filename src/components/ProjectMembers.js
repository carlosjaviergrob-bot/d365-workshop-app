import { useConsultants, useProjectMembers } from "../services/useApi";
import { useState } from "react";
import { ALL_AREAS } from "../data/scenarios";

const AREAS_LIST = ["Todas", "Finanzas", "Operaciones", ...Object.keys(ALL_AREAS)];
const ROLES = { admin: ["Admin", "#FAECE7", "#712B13"], lead: ["Lead", "#FAEEDA", "#633806"], consultant: ["Consultor", "#E6F1FB", "#0C447C"] };

export default function ProjectMembers({ project, currentUser, onClose }) {
  const { members, loading: loadingM, add, remove } = useProjectMembers(project.id);
  const { consultants, loading: loadingC } = useConsultants();
  const [selectedId, setSelectedId] = useState("");
  const [selectedArea, setSelectedArea] = useState("Todas");
  const [adding, setAdding] = useState(false);
  const isLeadOrAdmin = currentUser?.role === "admin" || currentUser?.role === "lead";

  const assignedIds = new Set(members.map(m => m.consultant_id));
  const available = consultants.filter(c => c.active && !assignedIds.has(c.id));

  const handleAdd = async () => {
    if (!selectedId) return;
    setAdding(true);
    try {
      await add(selectedId, selectedArea === "Todas" ? null : selectedArea);
      setSelectedId("");
      setSelectedArea("Todas");
    } catch (err) {
      alert("Error: " + err.message);
    } finally { setAdding(false); }
  };

  const handleRemove = async (consultantId, name) => {
    if (!window.confirm(`¿Quitar a ${name} del proyecto?`)) return;
    await remove(consultantId);
  };

  return (
    <div style={{ background: "var(--card-bg)", border: "1px solid #185FA5", borderRadius: 12, padding: "1.25rem", marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <p style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>Equipo — {project.name}</p>
        <button onClick={onClose} style={{ fontSize: 13, color: "var(--text-tertiary)", background: "none", border: "none", cursor: "pointer" }}>✕</button>
      </div>

      {/* Miembros actuales */}
      {loadingM
        ? <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Cargando...</p>
        : members.length === 0
          ? <p style={{ fontSize: 13, color: "var(--text-tertiary)", margin: "0 0 12px" }}>Sin miembros asignados todavía.</p>
          : (
            <div style={{ marginBottom: 14 }}>
              {members.map(m => {
                const c = m.consultants;
                const [rl, rb, rc] = ROLES[c?.role] || ROLES.consultant;
                return (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "0.5px solid var(--border)" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#E6F1FB", color: "#0C447C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 500, flexShrink: 0 }}>
                      {c?.full_name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{c?.full_name}</span>
                      {m.area && <span style={{ fontSize: 11, color: "var(--text-tertiary)", marginLeft: 6 }}>{m.area}</span>}
                    </div>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 500, background: rb, color: rc }}>{rl}</span>
                    {isLeadOrAdmin && (
                      <button onClick={() => handleRemove(m.consultant_id, c?.full_name)} style={{ fontSize: 11, color: "var(--text-tertiary)", background: "none", border: "none", cursor: "pointer" }}>✕</button>
                    )}
                  </div>
                );
              })}
            </div>
          )
      }

      {/* Agregar miembro */}
      {isLeadOrAdmin && !loadingC && available.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 2, minWidth: 160 }}>
            <label style={{ fontSize: 11, color: "var(--text-tertiary)", display: "block", marginBottom: 3 }}>Consultor</label>
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)} style={{ width: "100%", padding: "6px 8px", borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--surface)", color: "var(--text-primary)", fontSize: 13 }}>
              <option value="">Elegir consultor...</option>
              {available.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
          </div>
          <div style={{ flex: 2, minWidth: 140 }}>
            <label style={{ fontSize: 11, color: "var(--text-tertiary)", display: "block", marginBottom: 3 }}>Área asignada</label>
            <select value={selectedArea} onChange={e => setSelectedArea(e.target.value)} style={{ width: "100%", padding: "6px 8px", borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--surface)", color: "var(--text-primary)", fontSize: 13 }}>
              {AREAS_LIST.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <button onClick={handleAdd} disabled={!selectedId || adding} style={{ padding: "6px 16px", fontSize: 13, borderRadius: 8, border: "none", background: "#185FA5", color: "#fff", cursor: selectedId && !adding ? "pointer" : "not-allowed", opacity: selectedId && !adding ? 1 : .6, whiteSpace: "nowrap" }}>
            {adding ? "Agregando..." : "Agregar"}
          </button>
        </div>
      )}
    </div>
  );
}
