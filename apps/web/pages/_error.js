/**
 * Minimal Pages Router _error.js so Next doesn't prerender the default one
 * (which can trigger "useContext of null" in monorepo/standalone builds).
 * Must not import app layout, AuthContext, or any context consumers.
 */
function Error({ statusCode }) {
  return (
    <div style={{ padding: "2rem", color: "#fff", background: "#0a0e13", minHeight: "100vh", fontFamily: "system-ui" }}>
      <h1>{statusCode ? `Error ${statusCode}` : "An error occurred"}</h1>
      <a href="/" style={{ color: "#6b7280", marginTop: "1rem", display: "inline-block" }}>
        Go home
      </a>
    </div>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
