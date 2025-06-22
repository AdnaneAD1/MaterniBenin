"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTachometerAlt,
    faUsers,
    faStethoscope,
    faBaby,
    faCalendarAlt,
    faChartBar,
    faCog,
    faSignOutAlt,
    faTimes
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({
    user = { name: 'Kokou', role: 'Sage-femme', avatar: '/images/avatar-placeholder.jpg' },
    isOpen,
    onClose
}) => {
    const pathname = usePathname();

    const menuItems = [
        { name: 'Tableau de Bord', href: '/dashboard', icon: faTachometerAlt },
        { name: 'Patientes', href: '/dashboard/patients', icon: faUsers },
        { name: 'CPN', href: '/dashboard/cpn', icon: faStethoscope },
        { name: 'Accouchements', href: '/dashboard/accouchements', icon: faBaby },
        { name: 'Planification', href: '/dashboard/planification', icon: faCalendarAlt },
        { name: 'Rapports', href: '/dashboard/rapports', icon: faChartBar },
        { name: 'Utilisateurs', href: '/dashboard/utilisateurs', icon: faUsers },
        { name: 'Paramètres', href: '/dashboard/parametres', icon: faCog },
    ];

    return (
        <>
            {/* Overlay pour fermer le menu sur mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={onClose}
                ></div>
            )}

            <aside
                className={`fixed inset-y-0 left-0 w-64 bg-white shadow-md z-30 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <Link href="/dashboard" className="flex items-center">
                            <span className="text-primary text-2xl font-bold">MaterniBénin</span>
                        </Link>
                        <button
                            onClick={onClose}
                            className="lg:hidden p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-gray-100"
                        >
                            <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                        </button>
                    </div>

                    <nav className="flex-1 px-2 py-4 overflow-y-auto">
                        <ul className="space-y-1">
                            {menuItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <li key={item.name}>
                                        <Link
                                            href={item.href}
                                            className={`flex items-center px-4 py-3 text-sm rounded-md transition-colors ${isActive
                                                ? 'bg-primary text-white'
                                                : 'text-text-primary hover:bg-gray-100'
                                                }`}
                                        >
                                            <FontAwesomeIcon icon={item.icon} className={`w-5 h-5 mr-3 ${isActive ? '' : 'text-primary'}`} />
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>

                    <div className="border-t border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                {/* Image placeholder for user avatar */}
                                <div className="w-full h-full bg-primary flex items-center justify-center text-white text-lg font-medium">
                                    {user.name.charAt(0)}
                                </div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-text-primary">Dr. {user.name}</p>
                                <p className="text-xs text-text-secondary">{user.role}</p>
                            </div>
                        </div>
                        <Link
                            href="/login"
                            className="flex items-center mt-4 px-4 py-2 text-sm text-red-600 rounded-md hover:bg-gray-100"
                        >
                            <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5 mr-3" />
                            <span>Déconnexion</span>
                        </Link>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
