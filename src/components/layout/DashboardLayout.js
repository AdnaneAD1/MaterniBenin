"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import AutoReportNotification from '@/components/ui/AutoReportNotification';
import { Menu } from 'lucide-react';
import { useAuth } from '@/hooks/auth';
import { useAutoReports } from '@/hooks/useAutoReports';

const DashboardLayout = ({ children, title = 'Tableau de Bord' }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { currentUser, loading } = useAuth();
    const router = useRouter();
    
    // Hook pour la génération automatique des rapports mensuels
    const { notification, closeNotification } = useAutoReports();

    // Vérifier l'authentification et rediriger selon le rôle
    useEffect(() => {
        if (!loading && !currentUser) {
            router.push('/login');
        }
    }, [currentUser, loading, router]);

    // Redirection de secours basée sur le rôle
    useEffect(() => {
        if (currentUser && currentUser.uid) {
            const currentPath = window.location.pathname;
            
            // Si l'utilisateur est admin et n'est pas sur la page admin, le rediriger
            if (currentUser.role === 'admin' && !currentPath.includes('/admin')) {
                router.push('/dashboard/admin');
            }
            
            // Si l'utilisateur n'est pas admin et est sur la page admin, le rediriger
            if (currentUser.role !== 'admin' && currentPath.includes('/admin')) {
                router.push('/dashboard');
            }
        }
    }, [currentUser, router]);


    // Ne pas afficher le contenu si l'utilisateur n'est pas authentifié
    if (!currentUser && !loading) {
        return null;
    }

    // Afficher le loader seulement si on charge ET qu'on n'a pas encore d'utilisateur
    if (loading && !currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Vérification de l&apos;authentification...</p>
                </div>
            </div>
        );
    }

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

                {/* Notification pour les rapports générés automatiquement */}
                <AutoReportNotification
                    show={notification.show}
                    reports={notification.reports}
                    onClose={closeNotification}
                />
            </div>
        </div>
    );
};

export default DashboardLayout;