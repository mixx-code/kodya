"use client";

import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export interface AlertProps {
  show: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  isConfirm?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
}

export default function Alert({
  show,
  type,
  title,
  message,
  isConfirm = false,
  onConfirm,
  onCancel,
  onClose
}: AlertProps) {
  if (!show) return null;

  const getAlertColor = () => {
    switch (type) {
      case 'success':
        return 'var(--success)';
      case 'error':
        return 'var(--error)';
      case 'warning':
        return 'var(--warning)';
      case 'info':
      default:
        return 'var(--info)';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6" style={{ color: 'var(--text-inverse)' }} />;
      case 'error':
        return <AlertCircle className="w-6 h-6" style={{ color: 'var(--text-inverse)' }} />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6" style={{ color: 'var(--text-inverse)' }} />;
      case 'info':
      default:
        return <Info className="w-6 h-6" style={{ color: 'var(--text-inverse)' }} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 scale-100"
        style={{
          backgroundColor: 'var(--card-background)',
          border: `2px solid ${getAlertColor()}`
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="p-2 rounded-full"
            style={{
              backgroundColor: getAlertColor()
            }}
          >
            {getIcon()}
          </div>
          <div className="flex-grow">
            <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
              {title}
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              {message}
            </p>

            {isConfirm ? (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    onCancel?.();
                    onClose?.();
                  }}
                  className="px-4 py-2 rounded-lg font-semibold transition-colors"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary)',
                    border: `1px solid var(--border-primary)`
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    onConfirm?.();
                    onClose?.();
                  }}
                  className="px-4 py-2 rounded-lg font-semibold transition-colors"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'var(--text-inverse)'
                  }}
                >
                  Ya, Lanjutkan
                </button>
              </div>
            ) : (
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg font-semibold transition-colors"
                style={{
                  backgroundColor: getAlertColor(),
                  color: 'var(--text-inverse)'
                }}
              >
                OK
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
