import { useState } from "react";
import { useNotes } from "../services/useApi";

const FIT = { fit: ["Estándar", "#EAF3DE", "#27500A"], cfg: ["Configurable", "#FAEEDA", "#633806"], gap: ["Gap probable", "#FAECE7", "#712B13"] };
const ANS = { si: ["Fit confirmado", "#EAF3DE", "#27500A", "#3B6D11"], dif: ["Con diferencias", "#FAEEDA", "#633806", "#854F0B"], gap: ["Gap identificado", "#FAECE7", "#712B13", "#993C1D"], no: ["No aplica", "#F1EFE8", "#444441", "#5F5E5A"] };

export default function ScenarioCard({ scenario: s, projectId, response: r, onUpsert }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(r?.note || "");
  const [teamInput, setTeamInput] = useState("");
  const { notes, addNote, deleteNote } = useNotes(open ? projectId : null, open ? s.id : null);

  const [fl, fb, fc] = FIT[s.fit] || FIT.cfg;
  const ans = r?.answer ? ANS[r.answer] : null;

  // Normalize fields — handle both array and string forms, missing fields, etc.
  const forms = Array.isArray(s.forms)
    ? s.forms.filter(Boolean)
    : (s.forms ? String(s.forms).split(' | ').filter(Boolean) : []);
  const biz = s.biz || s.biz_question || '';
  const key = s.key || s.key_points || '';
  const tip = s.tip || '';
  const menu = s.menu || '';
  const bpcE2e = (s.bpc_e2e && s.bpc_e2e !== 'nan') ? s.bpc_e2e : '';
  const bpcProcess = (s.bpc_process && s.bpc_process !== 'nan') ? s.bpc_process : '';
  const description = s.description || '';

  const handleAnswer = (val) => onUpsert(s.id, val, note);
  const handleNoteBlur = () => { if (r?.answer) onUpsert(s.id, r.answer, note); };
  const handleAddNote = async () => {
    if (!teamInput.trim()) return;
    await addNote(teamInput);
    setTeamInput("");
  };

  return (
    <div style={{ background: "var(--card-bg)", border: open ? "1px solid #185FA5" : "0.5px solid var(--border)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: 10 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, cursor: "pointer" }} onClick={() => setOpen(v => !v)}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "var(--text-tertiary)", fontFamily: "monospace" }}>{s.id}</span>
            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 500, background: fb, color: fc }}>{fl}</span>
            {ans && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 500, background: ans[1], color: ans[2] }}>{ans[0]}</span>}
            {r?.consultant && <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{r.consultant} · {r.updated_at ? new Date(r.updated_at).toLocaleDateString("es-AR") : ""}</span>}
            {notes.length > 0 && <span style={{ fontSize: 11, color: "#185FA5" }}>💬 {notes.length}</span>}
          </div>
          <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 3px" }}>{s.t}</p>
          {biz
            ? <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>{biz}</p>
            : description
              ? <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>{description}</p>
              : null
          }
        </div>
        <span style={{ color: "var(--text-tertiary)", fontSize: 16, flexShrink: 0 }}>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div style={{ marginTop: 12 }}>
          <div style={{ background: "var(--surface)", borderRadius: 8, padding: "12px 14px", marginBottom: 10 }}>

            {/* BPC Hierarchy */}
            {(bpcE2e || bpcProcess) && (
              <div style={{ display: "flex", gap: 8, padding: "5px 0", borderBottom: "0.5px solid var(--border)", fontSize: 13 }}>
                <span style={{ color: "var(--text-tertiary)", minWidth: 110, flexShrink: 0, fontSize: 12 }}>Proceso BPC</span>
                <span style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  {bpcE2e && <span style={{ background: "#F1EFE8", borderRadius: 4, padding: "2px 8px", fontSize: 11 }}>{bpcE2e}</span>}
                  {bpcE2e && bpcProcess && <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>›</span>}
                  {bpcProcess && <span style={{ background: "#E6F1FB", borderRadius: 4, padding: "2px 8px", color: "#0C447C", fontSize: 11 }}>{bpcProcess}</span>}
                </span>
              </div>
            )}

            {/* Forms */}
            {forms.length > 0 && (
              <div style={{ display: "flex", gap: 8, padding: "5px 0", borderBottom: "0.5px solid var(--border)", fontSize: 13 }}>
                <span style={{ color: "var(--text-tertiary)", minWidth: 110, flexShrink: 0, fontSize: 12 }}>Formularios clave</span>
                <span style={{ color: "var(--text-primary)" }}>{forms.join(" · ")}</span>
              </div>
            )}

            {/* Menu */}
            {menu && (
              <div style={{ display: "flex", gap: 8, padding: "5px 0", borderBottom: "0.5px solid var(--border)", fontSize: 13 }}>
                <span style={{ color: "var(--text-tertiary)", minWidth: 110, flexShrink: 0, fontSize: 12 }}>Ruta de menú</span>
                <span style={{ color: "var(--text-primary)", fontFamily: "monospace", fontSize: 11 }}>{menu}</span>
              </div>
            )}

            {/* Key points */}
            {key && (
              <div style={{ display: "flex", gap: 8, padding: "5px 0", borderBottom: tip ? "0.5px solid var(--border)" : "none", fontSize: 13 }}>
                <span style={{ color: "var(--text-tertiary)", minWidth: 110, flexShrink: 0, fontSize: 12 }}>Qué mostrar</span>
                <span style={{ color: "var(--text-primary)" }}>{key}</span>
              </div>
            )}

            {/* Tip */}
            {tip && (
              <div style={{ display: "flex", gap: 8, padding: "5px 0", fontSize: 13 }}>
                <span style={{ color: "var(--text-tertiary)", minWidth: 110, flexShrink: 0, fontSize: 12 }}>Tip</span>
                <span style={{ color: "#633806", background: "#FAEEDA", borderRadius: 6, padding: "3px 10px", fontSize: 12 }}>{tip}</span>
              </div>
            )}

            {/* Description fallback when no enrichment */}
            {!forms.length && !key && !tip && description && (
              <div style={{ display: "flex", gap: 8, padding: "5px 0", fontSize: 13 }}>
                <span style={{ color: "var(--text-tertiary)", minWidth: 110, flexShrink: 0, fontSize: 12 }}>Descripción BPC</span>
                <span style={{ color: "var(--text-secondary)" }}>{description}</span>
              </div>
            )}
          </div>

          {/* Answer buttons */}
          <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 8px" }}>¿El cliente reconoce este proceso?</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            {[["si", "✓ Sí, fit"], ["dif", "≈ Similar, con diferencias"], ["gap", "✗ Gap"], ["no", "— No aplica"]].map(([val, label]) => {
              const a = ANS[val];
              const sel = r?.answer === val;
              return (
                <button key={val} onClick={() => handleAnswer(val)} style={{ flex: 1, minWidth: 100, padding: "8px 8px", fontSize: 12, borderRadius: 8, border: sel ? `1px solid ${a[3]}` : "0.5px solid var(--border)", background: sel ? a[1] : "transparent", color: sel ? a[2] : "var(--text-secondary)", cursor: "pointer", fontWeight: sel ? 500 : 400 }}>
                  {label}
                </button>
              );
            })}
          </div>

          {/* Workshop note */}
          <textarea rows={2} placeholder="Notas del workshop (variantes, excepciones, decisiones pendientes)..." value={note} onChange={e => setNote(e.target.value)} onBlur={handleNoteBlur}
            style={{ width: "100%", boxSizing: "border-box", fontSize: 13, padding: "8px 10px", borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--surface)", color: "var(--text-primary)", resize: "none", marginBottom: 10 }} />

          {/* Team notes */}
          {notes.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 12, color: "var(--text-tertiary)", margin: "0 0 6px" }}>Notas del equipo</p>
              {notes.map(n => (
                <div key={n.id} style={{ background: "var(--surface)", borderRadius: 8, padding: "6px 10px", marginBottom: 4, fontSize: 13 }}>
                  <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 2 }}>{n.author} · {new Date(n.created_at).toLocaleDateString("es-AR")}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ color: "var(--text-secondary)" }}>{n.text}</span>
                    <button onClick={() => deleteNote(n.id)} style={{ fontSize: 11, color: "var(--text-tertiary)", background: "none", border: "none", cursor: "pointer" }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: 6 }}>
            <input type="text" placeholder="Agregar nota del equipo..." value={teamInput} onChange={e => setTeamInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddNote()}
              style={{ flex: 1, padding: "6px 10px", borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--surface)", color: "var(--text-primary)", fontSize: 13 }} />
            <button onClick={handleAddNote} style={{ padding: "6px 12px", fontSize: 12, borderRadius: 8, border: "0.5px solid var(--border)", background: "transparent", cursor: "pointer", color: "var(--text-secondary)" }}>Agregar</button>
          </div>
        </div>
      )}
    </div>
  );
}
