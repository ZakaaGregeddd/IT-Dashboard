import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';

interface DeletePeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  periodText: string;
  isDeleting?: boolean;
}

export const DeletePeriodModal: React.FC<DeletePeriodModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  periodText,
  isDeleting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 max-w-sm w-full p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-red-100 text-red-600 rounded-lg shrink-0 border border-red-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Konfirmasi Hapus Data Periode</h4>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Apakah Anda yakin ingin menghapus data untuk periode <strong className="font-bold text-red-600">{periodText}</strong> dari database? Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 mt-2 pt-3 border-t border-slate-150">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-3.5 py-1.5 rounded border border-slate-300 text-slate-700 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-red-700 disabled:opacity-50 transition-all shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {isDeleting ? 'Menghapus...' : 'Ya, Hapus Data'}
          </button>
        </div>
      </div>
    </div>
  );
};
