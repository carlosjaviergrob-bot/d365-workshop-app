import { useState } from "react";
import { backendName } from "../services/backend";

export default function LoginPage({ onSignIn }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAzure = backendName === "azure";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSignIn(email);
      if (!isAzure) setSent(true);
    } catch (err) {
      setError("No se pudo enviar el acceso. Verificá el email e intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface)" }}>
      <div style={{ background: "var(--card-bg)", border: "0.5px solid var(--border)", borderRadius: 16, padding: "2.5rem 2rem", width: "100%", maxWidth: 400 }}>
        <div style={{ marginBottom: "2rem" }}>
          <p style={{ fontSize: 22, fontWeight: 500, margin: "0 0 6px" }}>D365FO Workshop Tool</p>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0 }}>
            {isAzure ? "Iniciá sesión con tu cuenta corporativa de Microsoft." : "Ingresá tu email y te enviamos un link de acceso."}
          </p>
        </div>

        {sent ? (
          <div style={{ background: "var(--success-bg, #EAF3DE)", borderRadius: 10, padding: "1rem 1.25rem" }}>
            <p style={{ fontSize: 14, color: "#27500A", margin: 0, lineHeight: 1.6 }}>
              Revisá tu casilla de correo — te enviamos un link a <strong>{email}</strong>. Hacé clic en ese link para entrar.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {!isAzure && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, color: "var(--text-tertiary)", display: "block", marginBottom: 5 }}>Email corporativo</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@empresa.com"
                  style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px", borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--surface)", color: "var(--text-primary)", fontSize: 14 }}
                />
              </div>
            )}

            {error && (
              <p style={{ fontSize: 13, color: "#712B13", background: "#FAECE7", borderRadius: 8, padding: "8px 12px", margin: "0 0 12px" }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", padding: "10px", fontSize: 14, fontWeight: 500, borderRadius: 8, border: "none", background: "#185FA5", color: "#fff", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Enviando..." : isAzure ? "Ingresar con Microsoft" : "Enviar link de acceso"}
            </button>
          </form>
        )}

        <p style={{ fontSize: 11, color: "var(--text-tertiary)", margin: "1.5rem 0 0", textAlign: "center" }}>
          {isAzure ? "Azure Entra ID" : "Supabase Auth"} · D365FO BPC MAR 2026
        </p>
      </div>
    </div>
  );
}
