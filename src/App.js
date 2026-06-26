import { useState } from "react";
import { useAuth } from "./services/useApi";
import LoginPage from "./pages/LoginPage";
import ProjectsPage from "./pages/ProjectsPage";
import WorkshopPage from "./pages/WorkshopPage";
import AdminPage from "./pages/AdminPage";
import ScenarioCatalogPage from "./pages/ScenarioCatalogPage";

const css = `
  :root { --card-bg:#fff; --surface:#f5f4f0; --border:rgba(0,0,0,.12); --text-primary:#1a1a18; --text-secondary:#5c5c58; --text-tertiary:#9c9a92; }
  @media (prefers-color-scheme:dark) { :root { --card-bg:#1e1e1c; --surface:#2a2a28; --border:rgba(255,255,255,.12); --text-primary:#e8e6de; --text-secondary:#a8a69e; --text-tertiary:#6a6860; } }
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:var(--surface);color:var(--text-primary);}
  button,input,select,textarea{font-family:inherit;}
  input:focus,textarea:focus,select:focus{outline:none;border-color:#185FA5 !important;}
`;

const ROLE_LABELS = { admin: ["Admin", "#FAECE7", "#712B13"], lead: ["Lead", "#FAEEDA", "#633806"], consultant: ["Consultor", "#E6F1FB", "#0C447C"] };

export default function App() {
  const { user, loading, signIn, signOut } = useAuth();
  const [project, setProject] = useState(null);
  const [page, setPage] = useState("projects"); // "projects" | "admin"

  if (loading) {
    return (
      <>
        <style>{css}</style>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ fontSize: 14, color: "var(--text-tertiary)" }}>Cargando...</p>
        </div>
      </>
    );
  }

  if (!user) return <><style>{css}</style><LoginPage onSignIn={signIn} /></>;

  // Bloquear acceso si el usuario no está en el maestro de consultores
  if (user.role === "consultant" && user.active === false) {
    return (
      <>
        <style>{css}</style>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "var(--card-bg)", border: "0.5px solid var(--border)", borderRadius: 16, padding: "2rem", maxWidth: 400, textAlign: "center" }}>
            <p style={{ fontSize: 16, fontWeight: 500, margin: "0 0 8px" }}>Acceso no autorizado</p>
            <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "0 0 16px" }}>Tu cuenta no está registrada en el sistema. Contactá al administrador.</p>
            <button onClick={signOut} style={{ fontSize: 13, padding: "7px 16px", borderRadius: 8, border: "0.5px solid var(--border)", background: "transparent", cursor: "pointer" }}>Salir</button>
          </div>
        </div>
      </>
    );
  }

  const isLeadOrAdmin = user.role === "admin" || user.role === "lead";
  const [rl, rb, rc] = ROLE_LABELS[user.role] || ROLE_LABELS.consultant;

  return (
    <>
      <style>{css}</style>
      <nav style={{ background: "var(--card-bg)", borderBottom: "0.5px solid var(--border)", padding: "10px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={() => { setProject(null); setPage("projects"); }} style={{ fontSize: 15, fontWeight: 500, background: "none", border: "none", cursor: "pointer", color: "var(--text-primary)", padding: 0 }}>
            D365FO Workshops
          </button>
          {project && (
            <>
              <span style={{ color: "var(--text-tertiary)" }}>›</span>
              <button onClick={() => setProject(null)} style={{ fontSize: 13, color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer" }}>Proyectos</button>
              <span style={{ color: "var(--text-tertiary)" }}>›</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{project.name}</span>
            </>
          )}
          {!project && isLeadOrAdmin && (
            <div style={{ display: "flex", gap: 4, marginLeft: 16 }}>
              {["projects", "admin", "catalog"].map(p => (
                <button key={p} onClick={() => setPage(p)} style={{ fontSize: 12, padding: "4px 12px", borderRadius: 8, border: page === p ? "1px solid #185FA5" : "0.5px solid var(--border)", background: page === p ? "#E6F1FB" : "transparent", color: page === p ? "#0C447C" : "var(--text-secondary)", cursor: "pointer" }}>
                  {p === "projects" ? "Proyectos" : p === "admin" ? "Consultores" : "Catálogo BPC"}
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#E6F1FB", color: "#0C447C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 500 }}>
            {user.name?.slice(0, 2).toUpperCase()}
          </div>
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{user.name}</span>
          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 500, background: rb, color: rc }}>{rl}</span>
          <button onClick={signOut} style={{ fontSize: 12, color: "var(--text-tertiary)", background: "none", border: "none", cursor: "pointer" }}>Salir</button>
        </div>
      </nav>
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1rem" }}>
        {project
          ? <WorkshopPage project={project} currentUser={user} />
          : page === "catalog" && isLeadOrAdmin
            ? <ScenarioCatalogPage />
          : page === "admin" && isLeadOrAdmin
            ? <AdminPage />
            : <ProjectsPage onSelect={setProject} currentUser={user} />
        }
      </main>
    </>
  );
}
