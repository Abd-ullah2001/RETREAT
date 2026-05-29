'use client';

import React, { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Error boundary caught:', error, info);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        this.props.fallback?.(this.state.error, this.reset) || (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-2xl rounded-2xl border border-ember-200 bg-ember-50 p-8 text-center"
          >
            <AlertTriangle className="mx-auto h-12 w-12 text-ember-500" />
            <h2 className="mt-4 text-2xl font-semibold text-navy-900">Something went wrong</h2>
            <p className="mt-2 text-slate-600">{this.state.error.message}</p>
            <button
              onClick={this.reset}
              className="mt-6 rounded-full bg-ember-500 px-6 py-2 font-semibold text-white hover:bg-ember-600"
            >
              Try again
            </button>
          </motion.div>
        )
      );
    }

    return this.props.children;
  }
}
