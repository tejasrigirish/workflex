// src/components/common/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[WorkFlex Runtime Error]', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('workflex_active_session');
      localStorage.removeItem('workflex_db_jobs');
      localStorage.removeItem('workflex_saved_jobs');
      sessionStorage.clear();
    } catch {}
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col items-center justify-center p-4 select-none">
          <div className="max-w-md w-full bg-[#0F172A] border border-red-500/30 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-white tracking-tight">Something went wrong</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                WorkFlex encountered an unexpected issue while loading this view.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-[#070D19] border border-slate-800 rounded-xl p-3 text-left overflow-x-auto max-h-32 text-[11px] text-red-300 font-mono">
                {this.state.error.message || 'Unknown runtime error'}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 btn-floating-primary py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleReset}
                className="btn-floating-glass py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
