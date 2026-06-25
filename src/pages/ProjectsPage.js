import { useState } from "react";
import { useProjects } from "../services/useApi";

export default function ProjectsPage({ onSelect }) {
  const { projects, loading, createProject, deleteProject } = useProjects();
  const [form, setForm] = useState({ name: "", client: "", area: "Finanzas" });
  const [showNew, setShowNew] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.client.trim()) return;
    setCreating(true);
    try {
      const p = await createProject(form);
      setForm({ name: "", client: "", area: "Finanzas" });
      setShowNew(false);
      onSelect(p);
    } finally {
      setCreating(false);
    }
  };

  const inputStyle = { width: "100%", boxSizing: "border-box", padding: "7px 10px", borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--surface)", color: "var(--text-primary)", fontSize: 13 };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, margin: 0 }}>Proyectos</h1>
        <button onClick={() => setShowNew(v => !v)} style={{ fontSize: 13, padding: "7px 16px", borderRadius: 8, border: "0.5px solid var(--border)", background: showNew ? "#E6F1FB" : "transparent", color: showNew ? "#0C447C" : "var(--text-secondary)", cursor: "pointer" }}>
          {showNew ? "Cancelar" : "+ Nuevo proyecto"}
        </button>
      </div>

      {showNew && (
        <form onSubmit={handleCreate} style={{ background: "var(--card-bg)", border: "0.5px solid var(--border)", borderRadius: 12, padding: "1.25rem", marginBottom: "1.5rem" }}>
          <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 14px" }}>Nuevo proyecto</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-tertiary)", display: "block", marginBottom: 4 }}>Nombre del proyecto</label>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej: Implementación ACME 2025" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-tertiary)", display: "block", marginBottom: 4 }}>Cliente</label>
              <input required value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} placeholder="Ej: ACME S.A." style={inputStyle} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "var(--text-tertiary)", display: "block", marginBottom: 4 }}>Área principal</label>
            <select value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} style={{ ...inputStyle, width: "auto" }}>
              {["Finanzas", "Operaciones", "Ambas"].map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <button type="submit" disabled={creating} style={{ padding: "8px 20px", fontSize: 13, borderRadius: 8, border: "none", background: "#185FA5", color: "#fff", cursor: creating ? "not-allowed" : "pointer", fontWeight: 500, opacity: creating ? .7 : 1 }}>
            {creating ? "Creando..." : "Crear proyecto"}
          </button>
        </form>
      )}

      {loading
        ? <p style={{ fontSize: 13, color: "var(--text-tertiary)", textAlign: "center", padding: "2rem 0" }}>Cargando proyectos...</p>
        : projects.length === 0
          ? <p style={{ fontSize: 14, color: "var(--text-tertiary)", textAlign: "center", padding: "2rem 0" }}>No hay proyectos todavía.</p>
          : projects.map(p => (
              <div key={p.id} style={{ background: "var(--card-bg)", border: "0.5px solid var(--border)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <div style={{ flex: 1, cursor: "pointer" }} onClick={() => onSelect(p)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</span>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: "#E6F1FB", color: "#0C447C", fontWeight: 500 }}>{p.status}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{p.client} · {p.area} · {p.created_by}</div>
                </div>
                <button onClick={() => window.confirm(`Eliminar "${p.name}"?`) && deleteProject(p.id)} style={{ fontSize: 12, padding: "5px 10px", borderRadius: 8, border: "0.5px solid var(--border)", background: "transparent", color: "var(--text-tertiary)", cursor: "pointer" }}>
                  Eliminar
                </button>
              </div>
            ))
      }
    </div>
  );
}
