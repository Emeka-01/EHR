import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage } from '../types';
interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}
export function ToastContainer({ toasts, removeToast }: ToastProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) =>
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => removeToast(toast.id)} />

        )}
      </AnimatePresence>
    </div>);

}
function ToastItem({
  toast,
  onRemove



}: {toast: ToastMessage;onRemove: () => void;}) {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />
  };
  const bgColors = {
    success: 'bg-white border-green-100',
    error: 'bg-white border-red-100',
    info: 'bg-white border-blue-100'
  };
  return (
    <motion.div
      initial={{
        opacity: 0,
        x: 50,
        scale: 0.9
      }}
      animate={{
        opacity: 1,
        x: 0,
        scale: 1
      }}
      exit={{
        opacity: 0,
        x: 20,
        scale: 0.9
      }}
      layout
      className={`pointer-events-auto flex items-start p-4 rounded-lg shadow-lg border ${bgColors[toast.type]} relative overflow-hidden`}>

      <div className="flex-shrink-0 mr-3">{icons[toast.type]}</div>
      <div className="flex-1 mr-2">
        <p className="text-sm font-medium text-gray-900">{toast.message}</p>
      </div>
      <button
        onClick={onRemove}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors">

        <X className="h-4 w-4" />
      </button>

      {/* Progress bar for auto-dismiss */}
      <motion.div
        initial={{
          width: '100%'
        }}
        animate={{
          width: '0%'
        }}
        transition={{
          duration: 3,
          ease: 'linear'
        }}
        className={`absolute bottom-0 left-0 h-1 ${toast.type === 'success' ? 'bg-green-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`} />

    </motion.div>);

}