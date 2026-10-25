import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 text-slate-900">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl shadow-xl p-6 text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Đã xảy ra sự cố hiển thị</h2>
            <p className="text-xs text-slate-500">
              {this.state.error?.message || 'Không thể tải dữ liệu trang. Vui lòng tải lại hoặc đăng nhập lại.'}
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/login';
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Xóa cache & Đăng nhập lại
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Tải lại trang</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
