// Global types untuk Midtrans Snap
// File ini mendeklarasikan types yang digunakan di seluruh aplikasi

export interface MidtransSnapResult {
    status_code: string;
    status_message: string;
    transaction_id: string;
    order_id: string;
    gross_amount: string;
    payment_type: string;
    transaction_time: string;
    transaction_status: string;
    fraud_status?: string;
}

export interface SnapOptions {
    onSuccess?: (result: MidtransSnapResult) => void;
    onPending?: (result: MidtransSnapResult) => void;
    onError?: (result: MidtransSnapResult) => void;
    onClose?: () => void;
}

// Global Window declaration
declare global {
    interface Window {
        snap?: {
            pay: (token: string, options: SnapOptions) => void;
        };
    }
}

// This export is needed to make this a module
export { };