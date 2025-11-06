"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Bell, 
  Settings, 
  MessageSquare, 
  User,
  Menu,
  Home,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/hooks/auth';

const Header = ({ title, onToggleSidebar }) => {
  const router = useRouter();
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Nouvelle patiente ajoutée', time: '10:30' },
    { id: 2, message: 'CPN à planifier pour Mme Koffi', time: 'Il y a 2h' },
    { id: 3, message: 'Rapport mensuel disponible', time: 'Il y a 1j' },
  ]);

  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTimeFilter, setActiveTimeFilter] = useState('Today');
  const [searchQuery, setSearchQuery] = useState('');

  const { currentUser, loading } = useAuth();
  const displayName = (currentUser?.displayName 
    || `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() 
    || currentUser?.email 
    || 'Utilisateur').trim();
  const role = currentUser?.role || 'Utilisateur';
  const initials = displayName
    ? displayName.split(' ').filter(Boolean).map(p => p[0]?.toUpperCase()).join('').slice(0,2)
    : 'U';

  return (
    <header className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        
        {/* Left Section - Menu Button (Mobile) */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Center Section - Title (Mobile) */}
        <div className="flex-1 lg:hidden text-center">
          <h1 className="text-base font-semibold text-gray-900 truncate px-2">{title}</h1>
        </div>

        {/* Spacer for desktop - push content to right */}
        <div className="hidden lg:block flex-1"></div>

        {/* Right Section - Icons and User */}
        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
          
          {/* Action Icons */}
          <div className="flex items-center space-x-1 sm:space-x-2">

            {/* Settings - Hidden on very small screens */}
            <button 
              onClick={() => router.push('/dashboard/parametres')}
              className="hidden sm:block p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg relative"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Messages - Hidden on mobile */}
            <button className="hidden md:block p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg relative">
              <MessageSquare className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></span>
            </button>

            {/* Notifications */}
            <button 
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* User Profile */}
            <div className="flex items-center space-x-2 sm:space-x-3 pl-2 sm:pl-3 border-l border-gray-200">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-medium">{loading ? '…' : initials}</span>
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-gray-900">{loading ? 'Connexion…' : displayName}</p>
                <p className="text-xs text-gray-500">{loading ? '' : role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="fixed sm:absolute right-2 sm:right-6 top-14 sm:top-16 w-[calc(100vw-1rem)] sm:w-80 max-w-md bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-3 sm:p-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Notifications</h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50">
                <p className="text-sm text-gray-900">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
              </div>
            ))}
          </div>
          <div className="p-3 sm:p-4">
            <button className="w-full text-center text-sm text-blue-500 hover:text-blue-600 font-medium">
              Voir toutes les notifications
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;