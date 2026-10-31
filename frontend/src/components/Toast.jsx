import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const bgMap = {
    success: 'bg-emerald-900/90 border-emerald-500/50 text-emerald-100',
    error: 'bg-rose-900/90 border-rose-500/50 text-rose-100',
    info: 'bg-indigo-900/90 border-indigo-500/50 text-indigo-100',
  };

  const IconMap = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  };

  const Icon = IconMap[toast.type] || Info;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200 min-w-[320px] max-w-md ${bgMap[toast.type] || bgMap.info}">
      <div className={`p-1.5 rounded-lg ${toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-300' : toast.type === 'error' ? 'bg-rose-500/20 text-rose-300' : 'bg-indigo-500/20 text-indigo-300'}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 text-sm font-medium leading-snug">
        {toast.message}
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
