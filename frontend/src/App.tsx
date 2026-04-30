import { useEffect, useState } from "react";

type HealthResponse = {
  status: string;
  service: string;
};

type AppStatus =
  | { loading: true; ok: false; error: string; data?: undefined }
  | { loading: false; ok: true; error: string; data: HealthResponse }
  | { loading: false; ok: false; error: string; data?: undefined };

export default function App() {
  const [status, setStatus] = useState<AppStatus>({
    loading: true,
    ok: false,
    error: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function loadStatus(attempt = 1) {
      try {
        const response = await fetch("/api/health/");
        if (!response.ok) {
          throw new Error(`Unexpected status: ${response.status}`);
        }
        const data: HealthResponse = await response.json();
        if (!cancelled) {
          setStatus({ loading: false, ok: true, error: "", data });
        }
      } catch {
        if (cancelled) {
          return;
        }

        if (attempt < 5) {
          window.setTimeout(() => {
            loadStatus(attempt + 1);
          }, 1500);
          return;
        }

        if (!cancelled) {
          setStatus({
            loading: false,
            ok: false,
            error: "The API is not reachable through nginx.",
          });
        }
      }
    }

    loadStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Docker Compose Stack</p>
        <h1>My Video Games Shelf</h1>
        <p className="summary">
          React is served by nginx, Django answers under <code>/api/</code>,
          PostgreSQL persists the data and pgAdmin is available for database
          inspection.
        </p>
        <div className="status-card">
          <span className={`status-dot ${status.ok ? "ok" : ""}`} />
          <div>
            <strong>
              {status.loading
                ? "Checking API connection..."
                : status.ok
                  ? "API connection is healthy"
                  : "API connection failed"}
            </strong>
            <p>
              {status.loading
                ? "The frontend is waiting for Django to answer."
                : status.ok
                  ? `Response: ${JSON.stringify(status.data)}`
                  : status.error}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
