import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Here you could send to an error monitoring service like Sentry
    // logErrorToService(error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
          <div className="rounded-full bg-destructive/10 p-4 mb-6">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Algo deu errado
          </h2>
          
          <p className="text-muted-foreground mb-6 max-w-md">
            Ocorreu um erro inesperado. Nossa equipe foi notificada e estamos trabalhando para resolver.
          </p>
          
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={this.handleRetry} variant="default">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
            
            <Button onClick={this.handleReload} variant="outline">
              Recarregar Página
            </Button>
            
            <Button onClick={this.handleGoHome} variant="ghost">
              <Home className="h-4 w-4 mr-2" />
              Voltar ao Início
            </Button>
          </div>
          
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-8 w-full max-w-2xl text-left">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                Detalhes do erro (desenvolvimento)
              </summary>
              <pre className="mt-4 p-4 bg-muted rounded-lg text-xs overflow-auto max-h-64">
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
