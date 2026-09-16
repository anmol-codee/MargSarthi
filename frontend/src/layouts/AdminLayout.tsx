import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { 
  LayoutDashboard, 
  Users, 
  Ticket, 
  PhoneCall, 
  Bell, 
  CreditCard, 
  Settings,
  LogOut, 
  Menu, 
  X,
  FileCheck,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const queryClient = useQueryClient();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Students', href: '/admin/students', icon: Users },
    { name: 'Tickets', href: '/admin/tickets', icon: Ticket },
    { name: 'Quick Calls', href: '/admin/quick-calls', icon: PhoneCall },
    { name: 'Notices', href: '/admin/notices', icon: Bell },
    { name: 'Documents', href: '/admin/documents', icon: FileCheck },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 bg-gray-950">
          <Link to="/admin/dashboard" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-primary-200">
            MargSarthi Admin
          </Link>
          <button className="lg:hidden p-2 text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname.includes(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon
                  className={`flex-shrink-0 mr-3 h-5 w-5 ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 bg-gray-950">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-gray-800 text-gray-200 flex items-center justify-center font-bold border border-gray-700">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Administrator</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full mb-3 bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700 hover:text-white" 
            onClick={() => queryClient.invalidateQueries()} 
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh Data
          </Button>
          <Button variant="ghost" className="w-full text-red-400 hover:bg-gray-800 hover:text-red-300" onClick={logout} leftIcon={<LogOut className="w-4 h-4" />}>
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top navbar */}
        <header className="bg-white border-b border-gray-200 lg:hidden">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <Link to="/admin/dashboard" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500">
              Admin Panel
            </Link>
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-500 hover:text-gray-900 rounded-md"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </header>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6 px-4 sm:px-6 md:py-8 md:px-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
