// midtrans.d.ts atau types/midtrans.d.ts
interface MidtransSnapResult {
    status_code: string;
    status_message: string;
    transaction_id: string;
    order_id: string;
    gross_amount: string;
    payment_type: string;
    transaction_time: string;
    transaction_status: string;
}

interface SnapOptions {
    onSuccess?: (result: MidtransSnapResult) => void;
    onPending?: (result: MidtransSnapResult) => void;
    onError?: (result: MidtransSnapResult) => void;
    onClose?: () => void;
}

declare global {
    interface Window {
        snap?: {
            pay: (token: string, options: SnapOptions) => void;
        };
    }
}

export { };