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
          className="mx-auto my-8 max-w-xl rounded-lg border border-destructive/30 bg-destructive/5 p-8 font-sans"
        >
          <h2 className="mb-4 text-destructive">
            Something went wrong
          </h2>
          <pre
            className="overflow-auto whitespace-pre-wrap text-sm text-foreground"
          >
            {this.state.error.message}
          </pre>
          <p className="mt-4 text-sm text-muted-foreground">
            Open DevTools (F12) → Console for full stack trace.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
