import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Menu, X, Home, BookOpen, Sparkles, Settings, LogOut,
  User, Shield, Calendar, ThumbsUp
} from 'lucide-react';

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const { user, logout, isManager, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Главная', path: '/' },
    { icon: Sparkles, label: 'Рекомендации', path: '/recommendations' },
    { icon: BookOpen, label: 'Мои бронирования', path: '/bookings' },
    { icon: Calendar, label: 'Создать бронирование', path: '/create-booking' },
  ];

  if (isManager || isAdmin) {
    menuItems.push({ icon: Shield, label: 'Админ панель', path: '/admin' });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <Link to="/" className="flex items-center space-x-2 ml-2 lg:ml-0">
                <ThumbsUp className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">HotelBooking</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative group">
                <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.first_name?.[0] || user?.username?.[0]}
                  </div>
                  <span className="hidden sm:inline text-gray-700">{user?.first_name} {user?.last_name}</span>
                </button>

                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 rounded-t-lg"
                  >
                    <User size={18} />
                    <span>Профиль</span>
                  </button>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 rounded-b-lg text-red-600"
                  >
                    <LogOut size={18} />
                    <span>Выйти</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] bg-white border-r
          transform transition-transform duration-200 ease-in-out z-20 w-64
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;