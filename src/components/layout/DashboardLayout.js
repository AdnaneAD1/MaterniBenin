"use client";

import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

const DashboardLayout = ({ children, title = 'Tableau de Bord' }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };
    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

            <div
                className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''
                    }`}
            >
                <Header title={title} onToggleSidebar={toggleSidebar} />

                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    {children}
                </main>

                {/* Bouton flottant pour ouvrir la sidebar sur mobile quand elle est fermée */}
                {!sidebarOpen && (
                    <button
                        onClick={toggleSidebar}
                        className="fixed bottom-6 left-6 z-20 lg:hidden p-3 rounded-full bg-primary text-white shadow-lg hover:bg-primary-dark transition-colors"
                        aria-label="Ouvrir le menu"
                    >
                        <FontAwesomeIcon icon={faBars} className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default DashboardLayout;
