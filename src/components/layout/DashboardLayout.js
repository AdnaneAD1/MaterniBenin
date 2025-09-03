"use client";

import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Menu } from 'lucide-react';

const DashboardLayout = ({ children, title = 'Tableau de Bord' }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

            <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
                <Header title={title} onToggleSidebar={toggleSidebar} />

                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>

                {/* Bouton flottant pour ouvrir la sidebar sur mobile */}
                {!sidebarOpen && (
                    <button
                        onClick={toggleSidebar}
                        className="fixed bottom-6 left-6 z-20 lg:hidden p-3 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition-colors"
                        aria-label="Ouvrir le menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default DashboardLayout;