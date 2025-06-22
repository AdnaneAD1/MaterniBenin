"use client";

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCircle,
    faSwatchbook,
    faPalette,
    faMoon,
    faSun
} from '@fortawesome/free-solid-svg-icons';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export default function ColorsPreview() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Une fois que le composant est monté, on peut afficher l'UI
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const colorPalette = [
        { name: 'primary', color: '#1E88E5', description: 'Bleu médical dominant' },
        { name: 'secondary', color: '#4CAF50', description: 'Accent vert' },
        { name: 'light', color: '#FFFFFF', description: 'Blanc' },
        { name: 'dark', color: '#0A1929', description: 'Bleu foncé pour le mode sombre' },
        { name: 'primary-light', color: '#64B5F6', description: 'Version plus claire du bleu principal' },
        { name: 'primary-dark', color: '#1565C0', description: 'Version plus foncée du bleu principal' },
        { name: 'secondary-light', color: '#81C784', description: 'Version plus claire du vert' },
        { name: 'secondary-dark', color: '#2E7D32', description: 'Version plus foncée du vert' },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-dark p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-text-primary">Palette de couleurs MaterniBénin</h1>
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="p-2 rounded-full bg-gray-light dark:bg-gray-medium"
                    >
                        <FontAwesomeIcon
                            icon={theme === 'dark' ? faSun : faMoon}
                            className="h-6 w-6 text-primary"
                        />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {colorPalette.map((color) => (
                        <div
                            key={color.name}
                            className="p-6 rounded-lg bg-gray-light dark:bg-gray-700 flex items-center"
                        >
                            <div
                                className="w-16 h-16 rounded-full shadow-md mr-4 flex-shrink-0"
                                style={{ backgroundColor: color.color }}
                            ></div>
                            <div>
                                <h3 className="text-lg font-medium text-text-primary mb-1">{color.name}</h3>
                                <p className="text-text-secondary text-sm">{color.description}</p>
                                <p className="text-text-secondary text-sm mt-1">{color.color}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <h2 className="text-2xl font-bold text-text-primary mb-6">Exemples de composants</h2>

                <div className="space-y-8">
                    {/* Boutons */}
                    <div className="p-6 rounded-lg bg-gray-light dark:bg-gray-700">
                        <h3 className="text-lg font-medium text-text-primary mb-4">Boutons</h3>
                        <div className="flex flex-wrap gap-4">
                            <button className="px-4 py-2 bg-primary text-white rounded-md shadow-sm hover:bg-primary-dark">
                                Bouton Primaire
                            </button>
                            <button className="px-4 py-2 bg-secondary text-white rounded-md shadow-sm hover:bg-secondary-dark">
                                Bouton Secondaire
                            </button>
                            <button className="px-4 py-2 border border-primary text-primary rounded-md shadow-sm hover:bg-primary hover:text-white">
                                Bouton Outline
                            </button>
                        </div>
                    </div>

                    {/* Cartes */}
                    <div className="p-6 rounded-lg bg-gray-light dark:bg-gray-700">
                        <h3 className="text-lg font-medium text-text-primary mb-4">Cartes</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                                <h4 className="text-primary font-medium mb-2">Titre de la carte</h4>
                                <p className="text-text-secondary">Contenu de la carte avec le texte par défaut.</p>
                            </div>
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-secondary">
                                <h4 className="text-secondary font-medium mb-2">Carte avec accent</h4>
                                <p className="text-text-secondary">Carte avec un accent de couleur secondaire.</p>
                            </div>
                        </div>
                    </div>

                    {/* Texte */}
                    <div className="p-6 rounded-lg bg-gray-light dark:bg-gray-700">
                        <h3 className="text-lg font-medium text-text-primary mb-4">Typographie</h3>
                        <div className="space-y-3">
                            <h1 className="text-3xl font-bold text-text-primary">Titre de niveau 1</h1>
                            <h2 className="text-2xl font-bold text-text-primary">Titre de niveau 2</h2>
                            <h3 className="text-xl font-medium text-text-primary">Titre de niveau 3</h3>
                            <p className="text-text-primary">Texte principal pour les paragraphes importants.</p>
                            <p className="text-text-secondary">Texte secondaire pour les informations moins importantes.</p>
                            <a href="#" className="text-primary hover:text-primary-dark">Lien textuel</a>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
                    >
                        Retour au tableau de bord
                    </Link>
                </div>
            </div>
        </div>
    );
}
