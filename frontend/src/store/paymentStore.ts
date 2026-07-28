import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PaymentStatus = 'PENDING' | 'PAID' | 'REJECTED';

export interface Receipt {
  id: string;
  studentName: string;
  amount: string;
  month: string;
  status: PaymentStatus;
  fileName: string;
  fileData?: string; // base64 string for image display
  uploadDate: string;
  nextPaymentDate: string | null;
  branchId?: string; // added branchId
}

interface PaymentState {
  receipts: Receipt[];
  uploadReceipt: (receipt: Omit<Receipt, 'id' | 'status' | 'uploadDate' | 'nextPaymentDate'>) => void;
  approveReceipt: (id: string) => void;
  rejectReceipt: (id: string) => void;
}

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set) => ({
      receipts: [
        {
          id: 'mock-1',
          studentName: 'Ali Valiyev',
          amount: '720,000 UZS',
          month: 'July 2026',
          status: 'PAID',
          fileName: 'receipt_jun.pdf',
          uploadDate: '2026-06-15',
          nextPaymentDate: '2026-07-15'
        }
      ],
      uploadReceipt: (data) => set((state) => {
        const newReceipt: Receipt = {
          id: Date.now().toString(),
          ...data,
          status: 'PENDING',
          uploadDate: new Date().toISOString().split('T')[0],
          nextPaymentDate: null
        };
        return { receipts: [newReceipt, ...state.receipts] };
      }),
      approveReceipt: (id) => set((state) => ({
        receipts: state.receipts.map(r => {
          if (r.id === id) {
            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + 30);
            return { ...r, status: 'PAID', nextPaymentDate: nextDate.toISOString().split('T')[0] };
          }
          return r;
        })
      })),
      rejectReceipt: (id) => set((state) => ({
        receipts: state.receipts.map(r => r.id === id ? { ...r, status: 'REJECTED' } : r)
      }))
    }),
    {
      name: 'payment-storage'
    }
  )
);
