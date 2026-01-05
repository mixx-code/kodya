"use client";

import Alert from "./Alert";
import type { AlertProps } from "./Alert";
import { useAlert } from "@/hooks/useAlert";

// Example component showing how to use the Alert system
export default function AlertExample() {
  const { alert, showAlert, showConfirm, hideAlert } = useAlert();

  const handleShowSuccess = () => {
    showAlert('success', 'Berhasil!', 'Operasi telah berhasil dilakukan.');
  };

  const handleShowError = () => {
    showAlert('error', 'Error', 'Terjadi kesalahan saat memproses permintaan.');
  };

  const handleShowWarning = () => {
    showAlert('warning', 'Peringatan', 'Pastikan data yang Anda masukkan sudah benar.');
  };

  const handleShowInfo = () => {
    showAlert('info', 'Informasi', 'Sistem akan melakukan maintenance dalam 1 jam.');
  };

  const handleShowConfirm = async () => {
    const confirmed = await showConfirm(
      'Konfirmasi Hapus',
      'Apakah Anda yakin ingin menghapus data ini?'
    );
    
    if (confirmed) {
      showAlert('success', 'Terhapus', 'Data telah berhasil dihapus.');
    } else {
      showAlert('info', 'Dibatalkan', 'Operasi pembatalan berhasil.');
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Alert Component Examples</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <button
          onClick={handleShowSuccess}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Show Success
        </button>
        
        <button
          onClick={handleShowError}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Show Error
        </button>
        
        <button
          onClick={handleShowWarning}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Show Warning
        </button>
        
        <button
          onClick={handleShowInfo}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Show Info
        </button>
        
        <button
          onClick={handleShowConfirm}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Show Confirm
        </button>
      </div>

      {/* Alert Component */}
      <Alert
        show={alert.show}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        isConfirm={alert.isConfirm}
        onConfirm={alert.onConfirm}
        onCancel={alert.onCancel}
        onClose={hideAlert}
      />
    </div>
  );
}
