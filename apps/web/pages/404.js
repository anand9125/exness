/**
 * Minimal 404 for Pages Router so static prerender doesn't use default (useContext null).
 */
export default function Custom404() {
  return (
    <div style={{ padding: "2rem", color: "#fff", background: "#0a0e13", minHeight: "100vh", fontFamily: "system-ui" }}>
      <h1>404 - Page not found</h1>
      <a href="/" style={{ color: "#6b7280", marginTop: "1rem", display: "inline-block" }}>
        Go home
      </a>
    </div>
  );
}
