import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';
interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}
export function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      {isOpen &&
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm" />


          <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
            y: 20
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0
          }}
          exit={{
            opacity: 0,
            scale: 0.95,
            y: 20
          }}
          className="relative bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">

            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>

              <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">
                Log out of your account?
              </h3>

              <p className="text-center text-gray-500 mb-6">
                Are you sure you want to log out? You will need to sign in again
                to access your medical records.
              </p>

              <div className="flex gap-3">
                <Button variant="secondary" onClick={onClose} fullWidth>
                  Cancel
                </Button>
                <Button variant="danger" onClick={onConfirm} fullWidth>
                  Logout
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      }
    </AnimatePresence>);

}