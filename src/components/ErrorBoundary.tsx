import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div
          style={{
            padding: "2rem",
            fontFamily: "system-ui, sans-serif",
            maxWidth: "600px",
            margin: "2rem auto",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
          }}
        >
          <h2 style={{ color: "#b91c1c", marginBottom: "1rem" }}>
            Something went wrong
          </h2>
          <pre
            style={{
              overflow: "auto",
              fontSize: "0.875rem",
              color: "#991b1b",
              whiteSpace: "pre-wrap",
            }}
          >
            {this.state.error.message}
          </pre>
          <p style={{ marginTop: "1rem", color: "#6b7280", fontSize: "0.875rem" }}>
            Open DevTools (F12) → Console for full stack trace.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
