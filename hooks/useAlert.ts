"use client";

import { useState } from "react";

export interface AlertState {
  show: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  isConfirm?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const useAlert = () => {
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    type: 'info',
    title: '',
    message: '',
    isConfirm: false,
    onConfirm: () => {},
    onCancel: () => {}
  });

  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setAlert({
      show: true,
      type,
      title,
      message,
      isConfirm: false
    });
  };

  const showConfirm = (title: string, message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setAlert({
        show: true,
        type: 'info',
        title,
        message,
        isConfirm: true,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false)
      });
    });
  };

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, show: false }));
  };

  return {
    alert,
    showAlert,
    showConfirm,
    hideAlert
  };
};
