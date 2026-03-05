import React from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}
export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{
          opacity: 0,
          y: 20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        transition={{
          duration: 0.5
        }}
        className="w-full max-w-[900px] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">

        {/* Left Panel - Branding */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-blue-600 to-blue-800 p-12 flex-col justify-between text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                MediPortal
              </span>
            </div>

            <h2 className="text-3xl font-bold leading-tight mb-4">
              Your Health,
              <br />
              Our Priority.
            </h2>
            <p className="text-blue-100 text-lg opacity-90">
              Secure access to your medical records, appointments, and doctors.
              Anytime, anywhere.
            </p>
          </div>

          <div className="relative z-10 text-sm text-blue-200">
            © 2026 MediPortal System. <br />
            Secure & HIPAA Compliant.
          </div>

          {/* Decorative circles */}
          <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
        </div>

        {/* Right Panel - Content */}
        <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center overflow-y-auto max-h-[90vh] md:max-h-none">
          <div className="max-w-md mx-auto w-full">
            <div className="md:hidden flex items-center gap-2 mb-8 justify-center">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                MediPortal
              </span>
            </div>

            <div className="mb-8 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {title}
              </h1>
              {subtitle && <p className="text-gray-500">{subtitle}</p>}
            </div>

            {children}
          </div>
        </div>
      </motion.div>
    </div>);

}