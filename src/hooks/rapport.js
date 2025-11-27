"use client";
import { useState, useEffect, useCallback } from "react";
import { db } from '../firebase/firebase';
import { collection, addDoc, query, where, getDocs, Timestamp, orderBy, limit, setDoc, doc } from 'firebase/firestore';
import { useAuth } from './auth';
import { generateRapportId } from '@/utils/idGenerator';

export function useRapport() {
    const [rapports, setRapports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();

    // Fonction pour générer un rapport mensuel (via API route serveur)
    const generateMonthlyReport = async (type, mois, annee) => {
        try {
            setLoading(true);
            setError(null);

            if (!currentUser?.centreId) {
                throw new Error('Centre non défini');
            }

            // Générer un ID personnalisé pour le rapport
            const rapportId = await generateRapportId();

            const res = await fetch('/api/rapports/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, mois, annee, rapportId, centreId: currentUser.centreId })
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Échec de la génération du rapport');
            }
            return { ...data, reportId: rapportId }; // { success, reportId, data, pdfUrl, cloudinaryPublicId }
        } catch (error) {
            setError(error);
            return { success: false, error };
        } finally {
            setLoading(false);
        }
    };

    // Génération automatique des rapports de fin de mois
    const generateEndOfMonthReports = useCallback(async () => {
        try {
            setLoading(true);
            
            if (!currentUser?.centreId) {
                throw new Error('Centre non défini');
            }
            
            const now = new Date();
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const mois = getMonthName(lastMonth.getMonth());
            const annee = lastMonth.getFullYear();

            // Vérifier si les rapports du mois précédent existent déjà pour ce centre
            const existingReportsQuery = query(
                collection(db, "rapports"),
                where("centreId", "==", currentUser.centreId),
                where("mois", "==", mois),
                where("annee", "==", annee)
            );
            const existingReports = await getDocs(existingReportsQuery);
            
            const existingTypes = existingReports.docs.map(doc => doc.data().type);
            const typesToGenerate = ["CPN", "Accouchement", "Planification"]
                .filter(type => !existingTypes.includes(type));

            const results = [];
            for (const type of typesToGenerate) {
                const result = await generateMonthlyReport(type, mois, annee);
                results.push({ type, ...result });
            }

            setLoading(false);
            return { success: true, reports: results };

        } catch (error) {
            setError(error);
            setLoading(false);
            return { success: false, error };
        }
    }, []);

    // Récupérer tous les rapports
    const getAllReports = async () => {
        try {
            setLoading(true);
            
            if (!currentUser?.centreId) {
                setLoading(false);
                return { success: false, error: new Error('Centre non défini') };
            }
            
            const rapportsQuery = query(
                collection(db, "rapports"),
                where("centreId", "==", currentUser.centreId),
                orderBy("createdAt", "desc")
            );
            const rapportsSnapshot = await getDocs(rapportsQuery);
            
            const rapportsList = rapportsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            setRapports(rapportsList);
            setLoading(false);
            return { success: true, rapports: rapportsList };
            
        } catch (error) {
            setError(error);
            setLoading(false);
            return { success: false, error };
        }
    };

    const getMonthName = (monthIndex) => {
        const months = [
            "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
            "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
        ];
        return months[monthIndex];
    };

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    // Auto-génération en fin de mois (à appeler via un cron job ou scheduler)
    useEffect(() => {
        const checkAndGenerateReports = () => {
            const now = new Date();
            const isLastDayOfMonth = now.getDate() === new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            
            if (isLastDayOfMonth) {
                // Délai pour s'assurer que c'est bien la fin de journée
                const currentHour = now.getHours();
                if (currentHour >= 23) {
                    generateEndOfMonthReports();
                }
            }
        };

        // Vérifier toutes les heures
        const interval = setInterval(checkAndGenerateReports, 60 * 60 * 1000);
        
        return () => clearInterval(interval);
    }, [generateEndOfMonthReports, currentUser]);

    return {
        rapports,
        loading,
        error,
        generateMonthlyReport,
        generateEndOfMonthReports,
        getAllReports
    };
}