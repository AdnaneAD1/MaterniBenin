"use client";

import { useEffect, useCallback, useState } from 'react';
import { useAuth } from './auth';

/**
 * Hook personnalisé pour la génération automatique des rapports mensuels
 * Intégré dans le DashboardLayout pour s'exécuter automatiquement
 */
export function useAutoReports() {
    const { currentUser } = useAuth();
    const [notification, setNotification] = useState({ show: false, reports: [] });

    // Fonction pour appeler l'API de génération automatique
    const triggerAutoGeneration = useCallback(async () => {
        try {
            console.log('🔄 Déclenchement de la génération automatique des rapports...');
            
            const response = await fetch('/api/cron/monthly-reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Si vous avez configuré CRON_SECRET, ajoutez l'en-tête Authorization
                    // 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET}`
                }
            });

            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Génération automatique réussie:', result);
                
                // Afficher une notification si des rapports ont été générés ou s'il y a eu des erreurs
                if (result.reports && result.reports.length > 0) {
                    setNotification({
                        show: true,
                        reports: result.reports
                    });
                    
                    const successCount = result.reports.filter(r => r.success).length;
                    if (successCount > 0) {
                        console.log(`📊 ${successCount} rapport(s) mensuel(s) généré(s) automatiquement`);
                    }
                }
            } else {
                console.warn('⚠️ Génération automatique échouée:', result.error);
            }
        } catch (error) {
            console.error('❌ Erreur lors du déclenchement automatique:', error);
        }
    }, []);

    // Vérifier si c'est le moment de générer les rapports
    const checkAndGenerate = useCallback(async () => {
        if (!currentUser) return;

        const now = new Date();
        const isLastDayOfMonth = now.getDate() === new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        
        if (isLastDayOfMonth) {
            const currentHour = now.getHours();
            // Générer les rapports en fin de journée (après 22h)
            if (currentHour >= 22) {
                await triggerAutoGeneration();
            }
        }
    }, [currentUser, triggerAutoGeneration]);

    // Effet pour la vérification automatique
    useEffect(() => {
        if (!currentUser) return;

        // Vérifier immédiatement au chargement
        checkAndGenerate();

        // Puis vérifier toutes les heures
        const interval = setInterval(checkAndGenerate, 60 * 60 * 1000);
        
        return () => clearInterval(interval);
    }, [currentUser, checkAndGenerate]);

    // Fonction pour déclencher manuellement la génération (pour les tests)
    const manualTrigger = useCallback(async () => {
        if (!currentUser) {
            console.warn('⚠️ Utilisateur non connecté');
            return;
        }
        
        console.log('🔧 Déclenchement manuel de la génération des rapports...');
        await triggerAutoGeneration();
    }, [currentUser, triggerAutoGeneration]);

    // Fonction pour fermer la notification
    const closeNotification = useCallback(() => {
        setNotification({ show: false, reports: [] });
    }, []);

    return {
        manualTrigger,
        isEnabled: !!currentUser,
        notification,
        closeNotification
    };
}
