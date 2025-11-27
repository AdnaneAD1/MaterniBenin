import { NextResponse } from 'next/server';
import { db } from '@/firebase/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { generateRapportId } from '@/utils/idGenerator';

// Fonction utilitaire pour obtenir le nom du mois
function getMonthName(monthIndex) {
    const months = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return months[monthIndex];
}

// Fonction pour générer un rapport mensuel pour un centre
async function generateMonthlyReport(type, mois, annee, centreId) {
    try {
        const rapportId = await generateRapportId();

        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/rapports/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, mois, annee, rapportId, centreId })
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
            throw new Error(data.error || 'Échec de la génération du rapport');
        }

        return { ...data, reportId: rapportId };
    } catch (error) {
        console.error(`Erreur génération rapport ${type}:`, error);
        return { success: false, error: error.message };
    }
}

// API Route pour la génération automatique des rapports mensuels
export async function POST(request) {
    try {
        // Vérifier l'authentification du cron job (optionnel)
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;
        
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { success: false, error: 'Non autorisé' },
                { status: 401 }
            );
        }

        console.log('🔄 Début de la génération automatique des rapports mensuels...');

        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const mois = getMonthName(lastMonth.getMonth());
        const annee = lastMonth.getFullYear();

        console.log(`📅 Génération des rapports pour ${mois} ${annee}`);

        // Récupérer tous les centres
        const centresSnapshot = await getDocs(collection(db, "centres"));
        const centres = centresSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(`🏥 ${centres.length} centre(s) trouvé(s)`);

        const results = [];
        
        // Pour chaque centre, générer les rapports
        for (const centre of centres) {
            console.log(`\n📍 Génération des rapports pour le centre: ${centre.nom || centre.id}`);
            
            // Vérifier si les rapports du mois précédent existent déjà pour ce centre
            const existingReportsQuery = query(
                collection(db, "rapports"),
                where("centreId", "==", centre.id),
                where("mois", "==", mois),
                where("annee", "==", annee)
            );
            const existingReports = await getDocs(existingReportsQuery);
            
            const existingTypes = existingReports.docs.map(doc => doc.data().type);
            const typesToGenerate = ["CPN", "Accouchement", "Planification"]
                .filter(type => !existingTypes.includes(type));

            if (typesToGenerate.length === 0) {
                console.log(`ℹ️ Tous les rapports existent déjà pour ce centre`);
                continue;
            }

            console.log(`📊 Types de rapports à générer: ${typesToGenerate.join(', ')}`);

            for (const type of typesToGenerate) {
                console.log(`🔄 Génération du rapport ${type} pour ${centre.nom || centre.id}...`);
                const result = await generateMonthlyReport(type, mois, annee, centre.id);
                results.push({ 
                    centreId: centre.id,
                    centreName: centre.nom || centre.id,
                    type, 
                    ...result 
                });
                
                if (result.success) {
                    console.log(`✅ Rapport ${type} généré avec succès`);
                } else {
                    console.error(`❌ Erreur génération rapport ${type}:`, result.error);
                }
            }
        }

        const successCount = results.filter(r => r.success).length;
        const totalCount = results.length;

        console.log(`📈 Résultats: ${successCount}/${totalCount} rapports générés avec succès`);

        return NextResponse.json({
            success: true,
            message: `${successCount}/${totalCount} rapports générés avec succès`,
            reports: results,
            mois,
            annee
        });

    } catch (error) {
        console.error('❌ Erreur lors de la génération automatique des rapports:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error.message || 'Erreur interne du serveur' 
            },
            { status: 500 }
        );
    }
}

// GET endpoint pour tester manuellement
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const test = searchParams.get('test');
        
        if (test === 'true') {
            // Mode test - génère les rapports pour le mois en cours
            const now = new Date();
            const mois = getMonthName(now.getMonth());
            const annee = now.getFullYear();
            
            return NextResponse.json({
                success: true,
                message: 'Test endpoint actif',
                currentMonth: mois,
                currentYear: annee,
                info: 'Utilisez POST pour déclencher la génération automatique'
            });
        }
        
        return NextResponse.json({
            success: true,
            message: 'Endpoint de génération automatique des rapports mensuels',
            usage: 'POST /api/cron/monthly-reports pour déclencher la génération',
            test: 'GET /api/cron/monthly-reports?test=true pour tester'
        });
        
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
