"use client";

import { useState, useEffect } from 'react';
import { CheckCircle, X, FileText } from 'lucide-react';

/**
 * Composant de notification pour les rapports générés automatiquement
 */
export default function AutoReportNotification({ show, reports, onClose }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (show) {
            setIsVisible(true);
            // Auto-fermeture après 10 secondes
            const timer = setTimeout(() => {
                handleClose();
            }, 10000);
            
            return () => clearTimeout(timer);
        }
    }, [show]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
        }, 300); // Attendre la fin de l'animation
    };

    if (!show) return null;

    const successReports = reports?.filter(r => r.success) || [];
    const failedReports = reports?.filter(r => !r.success) || [];

    return (
        <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
            isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-6 max-w-sm w-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">
                                Rapports Mensuels
                            </h3>
                            <p className="text-xs text-gray-500">
                                Génération automatique
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Contenu */}
                <div className="space-y-3">
                    {successReports.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm font-medium text-green-700">
                                    {successReports.length} rapport(s) généré(s)
                                </span>
                            </div>
                            <div className="pl-6 space-y-1">
                                {successReports.map((report, index) => (
                                    <div key={index} className="text-xs text-gray-600">
                                        • Rapport {report.type}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {failedReports.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <X className="w-4 h-4 text-red-500" />
                                <span className="text-sm font-medium text-red-700">
                                    {failedReports.length} erreur(s)
                                </span>
                            </div>
                            <div className="pl-6 space-y-1">
                                {failedReports.map((report, index) => (
                                    <div key={index} className="text-xs text-gray-600">
                                        • Rapport {report.type} : {report.error}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {reports?.length === 0 && (
                        <div className="text-sm text-gray-600">
                            Tous les rapports du mois sont déjà générés.
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 text-center">
                        Génération automatique en fin de mois
                    </p>
                </div>
            </div>
        </div>
    );
}
