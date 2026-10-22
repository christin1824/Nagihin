import { createPortal } from 'react-dom';
import { IconX } from './Icons';

export const inputClass =
  'w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#5b738c] focus:ring-4 focus:ring-[#5b738c]/10 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 outline-none';

export const primaryBtn =
  'bg-gradient-to-r from-[#1d3557] to-[#3b5a82] hover:from-[#152740] hover:to-[#1d3557] text-white font-bold py-2.5 px-6 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2';

export function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
      {children}
    </div>
  );
}

export default function Modal({ title, subtitle, onClose, onSubmit, submitLabel, children }) {
  return createPortal(
    <div className="modal-backdrop fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="modal-card bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-extrabold text-[#1d3557]">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500 mt-1 font-medium">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-red-100 hover:text-red-600 text-slate-500 transition-colors"
          >
            <IconX className="w-4 h-4 mx-auto" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-8 space-y-4">
          {children}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#1d3557] to-[#3b5a82] hover:from-[#152740] hover:to-[#1d3557] text-white font-bold py-3.5 rounded-xl mt-4 shadow-lg transition-all active:scale-[0.98]"
          >
            {submitLabel || 'Simpan'}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}

