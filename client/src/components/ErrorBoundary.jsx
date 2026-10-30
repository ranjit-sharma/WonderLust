import { Component } from "react";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          reset: this.handleReset,
        });
      }

      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 text-center shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <AlertTriangle className="size-7" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              We encountered an unexpected error while loading this page. Don't worry, your data is safe.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="btn-primary inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="size-4" /> Reload page
              </button>
              <a
                href="/"
                className="btn-ghost inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="size-4" /> Go to Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
