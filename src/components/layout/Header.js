"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  Settings, 
  MessageSquare, 
  Menu
} from 'lucide-react';
import { useAuth } from '@/hooks/auth';
import { useNotifications } from '@/hooks/useNotifications';

const Header = ({ title, onToggleSidebar }) => {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Hook de notifications
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const { currentUser, loading } = useAuth();
  
  // Fonction pour formater le temps
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'A l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins}min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };
  
  // Fonction pour gérer le clic sur une notification
  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    setShowNotifications(false);
  };
  
  // Fonction pour marquer toutes comme lues
  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };
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
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] sm:min-w-[20px] sm:h-[20px] bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
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
        <div className="fixed sm:absolute right-2 sm:right-6 top-14 sm:top-16 w-[calc(100vw-1rem)] sm:w-96 max-w-md bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-500">{unreadCount} non lue(s)</p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-blue-500 hover:text-blue-600 font-medium"
              >
                Tout marquer lu
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Aucune notification</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-3 sm:p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                      notification.priority === 'urgent' ? 'bg-red-500' :
                      notification.priority === 'high' ? 'bg-orange-500' :
                      'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatTime(notification.createdAt)}</p>
                    </div>
                    {!notification.read && (
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          {notifications.length > 0 && (
            <div className="p-3 sm:p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowNotifications(false);
                  router.push('/dashboard/notifications');
                }}
                className="w-full text-center text-sm text-blue-500 hover:text-blue-600 font-medium"
              >
                Voir toutes les notifications
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;