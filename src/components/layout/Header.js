"use client";

import { useState, useEffect } from 'react';
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

const Header = ({ title, onToggleSidebar }) => {
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Nouvelle patiente ajoutée', time: '10:30' },
    { id: 2, message: 'CPN à planifier pour Mme Koffi', time: 'Il y a 2h' },
    { id: 3, message: 'Rapport mensuel disponible', time: 'Il y a 1j' },
  ]);

  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTimeFilter, setActiveTimeFilter] = useState('Today');
  const [searchQuery, setSearchQuery] = useState('');

  const user = {
    name: 'Lulla Devi',
    role: 'Dept Admin',
    initials: 'LD'
  };

  
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
   
        {/* Center Section - Breadcrumb and Search */}
        <div className="flex-1 max-w-2xl mx-8">
 
    
        </div>

        {/* Right Section - Time Filters, Icons and User */}
        <div className="flex items-center space-x-4">
          
 

          {/* Action Icons */}
          <div className="flex items-center space-x-2">
 

            {/* Settings */}
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg relative">
              <Settings className="w-5 h-5" />
            </button>

            {/* Messages */}
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg relative">
              <MessageSquare className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></span>
            </button>

            {/* Notifications */}
            <button 
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* User Profile */}
            <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-sm font-medium">{user.initials}</span>
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-6 top-16 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.map((notification) => (
              <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                <p className="text-sm text-gray-900">{notification.message}</p>
                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
              </div>
            ))}
          </div>
          <div className="p-4">
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