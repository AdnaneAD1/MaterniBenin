"use client";

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBell,
    faMoon,
    faSun,
    faBars,
    faSearch
} from '@fortawesome/free-solid-svg-icons';
import { useTheme } from 'next-themes';

const Header = ({ title, onToggleSidebar }) => {
    const [notifications, setNotifications] = useState([
        { id: 1, message: 'Nouvelle patiente ajoutée', time: '10:30' },
        { id: 2, message: 'CPN à planifier pour Mme Koffi', time: 'Il y a 2h' },
        { id: 3, message: 'Rapport mensuel disponible', time: 'Il y a 1j' },]);

    const [showNotifications, setShowNotifications] = useState(false);
    const [formattedDate, setFormattedDate] = useState('');
    const { theme, setTheme } = useTheme();
    const user = {
        name: 'Kokou',
    };
    // Utiliser useEffect pour s'assurer que le formatage de date
    // se produit uniquement côté client
    useEffect(() => {
        const date = new Date();
        setFormattedDate(date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }));
    }, []);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };
    return (
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
            <div className="flex items-center">
                <button
                    onClick={onToggleSidebar}
                    className="lg:hidden mr-4 text-text-secondary hover:text-text-primary"
                    aria-label="Toggle menu"
                >
                    <FontAwesomeIcon icon={faBars} className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
                    <p className="text-sm text-text-secondary">{formattedDate}</p>
                </div>
            </div>

            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                {/* Image placeholder for user avatar */}
                <div className="w-full h-full bg-primary flex items-center justify-center text-white text-lg font-medium">
                    {user.name.charAt(0)}
                </div>
            </div>
        </header>
    );
};

export default Header;
