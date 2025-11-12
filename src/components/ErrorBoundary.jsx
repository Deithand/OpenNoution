import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Log to external service if needed
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white dark:bg-black-900 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full">
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-red-900 dark:text-red-200 mb-2">
                    Что-то пошло не так
                  </h1>
                  <p className="text-red-800 dark:text-red-300 mb-4">
                    Произошла непредвиденная ошибка. Вы можете попробовать продолжить работу или
                    перезагрузить приложение.
                  </p>

                  {this.state.error && (
                    <details className="mb-4">
                      <summary className="cursor-pointer text-sm font-medium text-red-700 dark:text-red-400 mb-2">
                        Детали ошибки (для разработчиков)
                      </summary>
                      <div className="bg-black-900 dark:bg-black text-white dark:text-black-100 p-4 rounded-lg overflow-auto text-xs font-mono">
                        <p className="font-bold mb-2">{this.state.error.toString()}</p>
                        {this.state.errorInfo && (
                          <pre className="whitespace-pre-wrap">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        )}
                      </div>
                    </details>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={this.handleReset}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Попробовать снова</span>
                    </button>
                    <button
                      onClick={this.handleReload}
                      className="flex items-center gap-2 px-4 py-2 bg-black-200 dark:bg-black-700 hover:bg-black-300 dark:hover:bg-black-600 rounded-lg transition-colors"
                    >
                      <span>Перезагрузить приложение</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center text-black-600 dark:text-black-400 text-sm">
              <p>
                Если проблема повторяется, попробуйте экспортировать данные и очистить хранилище.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
