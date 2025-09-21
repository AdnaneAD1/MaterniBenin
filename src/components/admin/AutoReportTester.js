"use client";

import { useState } from 'react';
import { useAutoReports } from '@/hooks/useAutoReports';
import { Play, Settings, Clock, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Composant de test pour la génération automatique des rapports
 * À utiliser uniquement par les administrateurs
 */
export default function AutoReportTester() {
    const { manualTrigger, isEnabled } = useAutoReports();
    const [isLoading, setIsLoading] = useState(false);
    const [lastResult, setLastResult] = useState(null);

    const handleManualTrigger = async () => {
        if (!isEnabled) {
            alert('Vous devez être connecté pour tester la génération des rapports');
            return;
        }

        setIsLoading(true);
        setLastResult(null);

        try {
            await manualTrigger();
            setLastResult({
                success: true,
                message: 'Test de génération lancé avec succès. Vérifiez les logs de la console.',
                timestamp: new Date().toLocaleString('fr-FR')
            });
        } catch (error) {
            setLastResult({
                success: false,
                message: `Erreur lors du test: ${error.message}`,
                timestamp: new Date().toLocaleString('fr-FR')
            });
        } finally {
            setIsLoading(false);
        }
    };

    const checkEndpoint = async () => {
        try {
            const response = await fetch('/api/cron/monthly-reports?test=true');
            const data = await response.json();
            
            if (data.success) {
                alert(`Endpoint actif ✅\n\nMois actuel: ${data.currentMonth} ${data.currentYear}\n\nInfo: ${data.info}`);
            } else {
                alert(`Erreur endpoint ❌\n\n${data.error}`);
            }
        } catch (error) {
            alert(`Erreur de connexion ❌\n\n${error.message}`);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Test Génération Automatique
                    </h3>
                    <p className="text-sm text-gray-500">
                        Outils de test pour les rapports mensuels
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Status */}
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-medium text-gray-700">
                        Système {isEnabled ? 'activé' : 'désactivé'}
                    </span>
                </div>

                {/* Boutons de test */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                        onClick={handleManualTrigger}
                        disabled={!isEnabled || isLoading}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                Test en cours...
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4" />
                                Tester Génération
                            </>
                        )}
                    </button>

                    <button
                        onClick={checkEndpoint}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        <Clock className="w-4 h-4" />
                        Vérifier Endpoint
                    </button>
                </div>

                {/* Résultat du dernier test */}
                {lastResult && (
                    <div className={`p-4 rounded-lg border ${
                        lastResult.success 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                    }`}>
                        <div className="flex items-start gap-3">
                            {lastResult.success ? (
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                                <p className={`text-sm font-medium ${
                                    lastResult.success ? 'text-green-800' : 'text-red-800'
                                }`}>
                                    {lastResult.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {lastResult.timestamp}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Instructions */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">
                        Instructions de test :
                    </h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                        <li>• <strong>Tester Génération</strong> : Lance manuellement la génération des rapports</li>
                        <li>• <strong>Vérifier Endpoint</strong> : Teste la connectivité de l&apos;API</li>
                        <li>• Consultez la console du navigateur pour les logs détaillés</li>
                        <li>• Les rapports sont générés automatiquement le dernier jour du mois après 22h</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
