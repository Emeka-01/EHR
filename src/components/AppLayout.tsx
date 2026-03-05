import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  User,
  Calendar,
  FileText,
  Upload,
  LogOut,
  Menu,
  X,
  Activity,
  Bell } from
'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useInactivityTimer } from '../hooks/useInactivityTimer';
import { LogoutModal } from './LogoutModal';
import { ViewState } from '../types';
interface AppLayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}
export function AppLayout({
  children,
  currentView,
  onNavigate
}: AppLayoutProps) {
  const { currentUser, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  // Auto-logout after 10 minutes of inactivity
  useInactivityTimer(10 * 60 * 1000, () => {
    logout();
    // In a real app, we'd show a "Session Expired" toast here via a global toast manager
    alert('Session expired due to inactivity');
  });
  const handleLogoutConfirm = () => {
    logout();
    setIsLogoutModalOpen(false);
  };
  const navItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard
  },
  {
    id: 'profile',
    label: 'My Profile',
    icon: User
  },
  {
    id: 'appointments',
    label: 'Appointments',
    icon: Calendar
  },
  {
    id: 'medical-results',
    label: 'Medical Results',
    icon: Upload
  },
  {
    id: 'upload-history',
    label: 'Upload History',
    icon: FileText
  }];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-30">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">
            MediPortal
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as ViewState)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>

                <Icon
                  className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />

                {item.label}
              </button>);

          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
              {currentUser?.profilePicture ?
              <img
                src={currentUser.profilePicture}
                alt={currentUser.name}
                className="h-full w-full object-cover" /> :


              currentUser?.name.charAt(0)
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {currentUser?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {currentUser?.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">

            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">MediPortal</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">

          {isMobileMenuOpen ?
          <X className="h-6 w-6" /> :

          <Menu className="h-6 w-6" />
          }
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen &&
      <div
        className="lg:hidden fixed inset-0 z-30 bg-gray-800/50 backdrop-blur-sm"
        onClick={() => setIsMobileMenuOpen(false)}>

          <div
          className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-xl flex flex-col pt-16"
          onClick={(e) => e.stopPropagation()}>

            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id as ViewState);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>

                    <Icon
                    className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />

                    {item.label}
                  </button>);

            })}
            </nav>
            <div className="p-4 border-t border-gray-100">
              <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg">

                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      }

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">{children}</div>
      </main>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm} />

    </div>);

}