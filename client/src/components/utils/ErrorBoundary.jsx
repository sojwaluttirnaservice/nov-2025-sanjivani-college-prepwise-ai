import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
        // You can also log the error to an error reporting service
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        // Attempt to recover by reloading page or resetting state
        if (this.props.onReset) {
            this.props.onReset();
        } else {
            window.location.reload();
        }
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[400px] flex flex-col items-center justify-center p-8 bg-slate-50 rounded-3xl border border-slate-200 text-center">
                    <div className="bg-red-50 p-4 rounded-full mb-4">
                        <AlertTriangle className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
                    <p className="text-slate-500 mb-6 max-w-md">
                        We encountered an unexpected error while loading this component.
                        {this.state.error && (
                            <span className="block mt-2 text-xs font-mono bg-slate-100 p-2 rounded text-slate-600 overflow-auto max-w-full">
                                {this.state.error.toString()}
                            </span>
                        )}
                    </p>
                    <button
                        onClick={this.handleReset}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
