import { useState } from "react";
import { useConsultants } from "../services/useApi";

const ROLES = { admin: ["Admin", "#FAECE7", "#712B13"], lead: ["Lead", "#FAEEDA", "#633806"], consultant: ["Consultor", "#E6F1FB", "#0C447C"] };

export default function AdminPage() {
  const { consultants, loading, create, update, remove } = useConsultants();
  const [form, setForm] = useState({ email: "", full_name: "", role: "consultant" });
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editRole, setEditRole] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.full_name.trim()) return;
    setSaving(true);
    try {
      await create(form);
      setForm({ email: "", full_name: "", role: "consultant" });
      setShowNew(false);
    } catch (err) {
      alert("Error al crear el consultor: " + err.message);
    } finally { setSaving(false); }
  };

  const handleRoleChange = async (id, role) => {
    await update(id, { role });
    setEditId(null);
  };

  const handleDeactivate = async (id, name) => {
    if (!window.confirm(`¿Desactivar a ${name}? No podrá acceder a la app.`)) return;
    await remove(id);
  };

  const inputStyle = { width: "100%", boxSizing: "border-box", padding: "7px 10px", borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--surface)", color: "var(--text-primary)", fontSize: 13 };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 500, margin: "0 0 4px" }}>Maestro de consultores</h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
            Gestioná los roles del equipo. Solo los consultores registrados acá pueden acceder a la app.
          </p>
        </div>
        <button onClick={() => setShowNew(v => !v)} style={{ fontSize: 13, padding: "7px 16px", borderRadius: 8, border: "0.5px solid var(--border)", background: showNew ? "#E6F1FB" : "transparent", color: showNew ? "#0C447C" : "var(--text-secondary)", cursor: "pointer", whiteSpace: "nowrap" }}>
          {showNew ? "Cancelar" : "+ Nuevo consultor"}
        </button>
      </div>

      {showNew && (
        <form onSubmit={handleCreate} style={{ background: "var(--card-bg)", border: "0.5px solid var(--border)", borderRadius: 12, padding: "1.25rem", marginBottom: "1.5rem" }}>
          <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 14px" }}>Agregar consultor</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "end" }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-tertiary)", display: "block", marginBottom: 4 }}>Nombre completo</label>
              <input required value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Ej: María González" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-tertiary)", display: "block", marginBottom: 4 }}>Email corporativo</label>
              <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="maria@empresa.com" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-tertiary)", display: "block", marginBottom: 4 }}>Rol</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={{ ...inputStyle, width: "auto" }}>
                <option value="consultant">Consultor</option>
                <option value="lead">Lead</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={saving} style={{ marginTop: 14, padding: "8px 20px", fontSize: 13, borderRadius: 8, border: "none", background: "#185FA5", color: "#fff", cursor: saving ? "not-allowed" : "pointer", fontWeight: 500, opacity: saving ? .7 : 1 }}>
            {saving ? "Guardando..." : "Agregar"}
          </button>
        </form>
      )}

      {loading
        ? <p style={{ fontSize: 13, color: "var(--text-tertiary)", textAlign: "center", padding: "2rem 0" }}>Cargando...</p>
        : (
          <div style={{ background: "var(--card-bg)", border: "0.5px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
            {consultants.length === 0
              ? <p style={{ fontSize: 14, color: "var(--text-tertiary)", textAlign: "center", padding: "2rem" }}>No hay consultores registrados.</p>
              : consultants.map((c, i) => {
                const [rl, rb, rc] = ROLES[c.role] || ROLES.consultant;
                return (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: i < consultants.length - 1 ? "0.5px solid var(--border)" : "none", opacity: c.active ? 1 : .45 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#E6F1FB", color: "#0C447C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, flexShrink: 0 }}>
                      {c.full_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{c.full_name} {!c.active && <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>(inactivo)</span>}</div>
                      <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{c.email}</div>
                    </div>
                    {editId === c.id
                      ? (
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <select value={editRole} onChange={e => setEditRole(e.target.value)} style={{ padding: "5px 8px", borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--surface)", color: "var(--text-primary)", fontSize: 12 }}>
                            <option value="consultant">Consultor</option>
                            <option value="lead">Lead</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button onClick={() => handleRoleChange(c.id, editRole)} style={{ fontSize: 12, padding: "5px 10px", borderRadius: 8, border: "none", background: "#185FA5", color: "#fff", cursor: "pointer" }}>Guardar</button>
                          <button onClick={() => setEditId(null)} style={{ fontSize: 12, padding: "5px 10px", borderRadius: 8, border: "0.5px solid var(--border)", background: "transparent", cursor: "pointer", color: "var(--text-secondary)" }}>Cancelar</button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 500, background: rb, color: rc }}>{rl}</span>
                          {c.active && (
                            <>
                              <button onClick={() => { setEditId(c.id); setEditRole(c.role); }} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 8, border: "0.5px solid var(--border)", background: "transparent", cursor: "pointer", color: "var(--text-secondary)" }}>Cambiar rol</button>
                              <button onClick={() => handleDeactivate(c.id, c.full_name)} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 8, border: "0.5px solid var(--border)", background: "transparent", cursor: "pointer", color: "var(--text-tertiary)" }}>Desactivar</button>
                            </>
                          )}
                        </div>
                      )
                    }
                  </div>
                );
              })
            }
          </div>
        )
      }
    </div>
  );
}
