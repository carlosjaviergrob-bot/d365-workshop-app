import { useState } from "react";
import { useConsultants } from "../services/useApi";

const ROLES = { admin: ["Admin", "#FAECE7", "#712B13"], lead: ["Lead", "#FAEEDA", "#633806"], consultant: ["Consultor", "#E6F1FB", "#0C447C"] };
const SPECIALTIES = { finanzas: ["Finanzas", "#E6F1FB", "#0C447C"], operaciones: ["Operaciones", "#EAF3DE", "#27500A"], ambas: ["Ambas", "#F1EFE8", "#444441"] };

export default function AdminPage() {
  const { consultants, loading, create, update, remove } = useConsultants();
  const [form, setForm] = useState({ email: "", full_name: "", role: "consultant", specialty: "ambas" });
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editFields, setEditFields] = useState({});

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.full_name.trim()) return;
    setSaving(true);
    try {
      await create(form);
      setForm({ email: "", full_name: "", role: "consultant", specialty: "ambas" });
      setShowNew(false);
    } catch (err) {
      alert("Error: " + err.message);
    } finally { setSaving(false); }
  };

  const handleSaveEdit = async (id) => {
    await update(id, editFields);
    setEditId(null);
  };

  const handleDeactivate = async (id, name) => {
    if (!window.confirm(`¿Desactivar a ${name}?`)) return;
    await remove(id);
  };

  const inputStyle = { width: "100%", boxSizing: "border-box", padding: "7px 10px", borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--surface)", color: "var(--text-primary)", fontSize: 13 };
  const selectStyle = { padding: "5px 8px", borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--surface)", color: "var(--text-primary)", fontSize: 12 };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 500, margin: "0 0 4px" }}>Maestro de consultores</h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>Gestioná los roles y especialidades del equipo.</p>
        </div>
        <button onClick={() => setShowNew(v => !v)} style={{ fontSize: 13, padding: "7px 16px", borderRadius: 8, border: "0.5px solid var(--border)", background: showNew ? "#E6F1FB" : "transparent", color: showNew ? "#0C447C" : "var(--text-secondary)", cursor: "pointer", whiteSpace: "nowrap" }}>
          {showNew ? "Cancelar" : "+ Nuevo consultor"}
        </button>
      </div>

      {showNew && (
        <form onSubmit={handleCreate} style={{ background: "var(--card-bg)", border: "0.5px solid var(--border)", borderRadius: 12, padding: "1.25rem", marginBottom: "1.5rem" }}>
          <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 14px" }}>Agregar consultor</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-tertiary)", display: "block", marginBottom: 4 }}>Nombre completo</label>
              <input required value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Ej: María González" style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-tertiary)", display: "block", marginBottom: 4 }}>Email corporativo</label>
              <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="maria@empresa.com" style={inputStyle} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-tertiary)", display: "block", marginBottom: 4 }}>Rol</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={selectStyle}>
                <option value="consultant">Consultor</option>
                <option value="lead">Lead</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--text-tertiary)", display: "block", marginBottom: 4 }}>Especialidad</label>
              <select value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })} style={selectStyle}>
                <option value="finanzas">Finanzas</option>
                <option value="operaciones">Operaciones</option>
                <option value="ambas">Ambas</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={saving} style={{ padding: "8px 20px", fontSize: 13, borderRadius: 8, border: "none", background: "#185FA5", color: "#fff", cursor: saving ? "not-allowed" : "pointer", fontWeight: 500, opacity: saving ? .7 : 1 }}>
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
                const [sl, sb, sc2] = SPECIALTIES[c.specialty] || SPECIALTIES.ambas;
                const isEditing = editId === c.id;
                return (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: i < consultants.length - 1 ? "0.5px solid var(--border)" : "none", opacity: c.active ? 1 : .45, flexWrap: "wrap" }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#E6F1FB", color: "#0C447C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 500, flexShrink: 0 }}>
                      {c.full_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 140 }}>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{c.full_name} {!c.active && <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>(inactivo)</span>}</div>
                      <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{c.email}</div>
                    </div>
                    {isEditing ? (
                      <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                        <select value={editFields.role} onChange={e => setEditFields({ ...editFields, role: e.target.value })} style={selectStyle}>
                          <option value="consultant">Consultor</option>
                          <option value="lead">Lead</option>
                          <option value="admin">Admin</option>
                        </select>
                        <select value={editFields.specialty} onChange={e => setEditFields({ ...editFields, specialty: e.target.value })} style={selectStyle}>
                          <option value="finanzas">Finanzas</option>
                          <option value="operaciones">Operaciones</option>
                          <option value="ambas">Ambas</option>
                        </select>
                        <button onClick={() => handleSaveEdit(c.id)} style={{ fontSize: 12, padding: "5px 10px", borderRadius: 8, border: "none", background: "#185FA5", color: "#fff", cursor: "pointer" }}>Guardar</button>
                        <button onClick={() => setEditId(null)} style={{ fontSize: 12, padding: "5px 10px", borderRadius: 8, border: "0.5px solid var(--border)", background: "transparent", cursor: "pointer", color: "var(--text-secondary)" }}>Cancelar</button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 500, background: rb, color: rc }}>{rl}</span>
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 500, background: sb, color: sc2 }}>{sl}</span>
                        {c.active && (
                          <>
                            <button onClick={() => { setEditId(c.id); setEditFields({ role: c.role, specialty: c.specialty || "ambas" }); }} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 8, border: "0.5px solid var(--border)", background: "transparent", cursor: "pointer", color: "var(--text-secondary)" }}>Editar</button>
                            <button onClick={() => handleDeactivate(c.id, c.full_name)} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 8, border: "0.5px solid var(--border)", background: "transparent", cursor: "pointer", color: "var(--text-tertiary)" }}>Desactivar</button>
                          </>
                        )}
                      </div>
                    )}
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
