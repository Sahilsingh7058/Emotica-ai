import { Component, ReactNode } from "react";

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; message: string }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="min-h-screen flex flex-col items-center justify-center px-4"
          style={{ background: "linear-gradient(135deg, #0d0f1e 0%, #1a0533 50%, #0d1a3a 100%)" }}>
          <div className="text-5xl mb-6">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-3">Something went wrong</h2>
          <p className="text-white/40 text-sm mb-6 text-center max-w-sm">{this.state.message}</p>
          <button onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-xl font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}>
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
