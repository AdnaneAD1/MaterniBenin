"use client";

import { useRouter, useParams } from "next/navigation";
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useEffect, useState, useCallback } from "react";
import { useDossier } from '@/hooks/dossier';
import { usePatiente } from '@/hooks/patientes';
import { 
    ArrowLeft, 
    AlertCircle, 
    Home, 
    ChevronRight, 
    Edit, 
    Calendar, 
    Clock, 
    FileText, 
    User, 
    Activity,
    Baby,
    Stethoscope,
    Heart,
    Plus,
    Eye
} from 'lucide-react';

export default function DossierMaternitePage() {
    const router = useRouter();
    const params = useParams();
    const { id, dossierId } = params;

    const { getDossierDetails } = useDossier();
    const { addPregnancy } = usePatiente();
    const [dossier, setDossier] = useState(null);
    const [interventions, setInterventions] = useState([]);
    const [recentConsultations, setRecentConsultations] = useState([]);
    const [accouchements, setAccouchements] = useState([]);
    const [hasActivePregnancy, setHasActivePregnancy] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddingPregnancy, setIsAddingPregnancy] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getDossierDetails(id, dossierId);
            if (res.success) {
                setDossier(res.dossier);
                setInterventions(res.interventions || []);
                setRecentConsultations(res.recentConsultations || []);
                setAccouchements(res.accouchements || []);
                setHasActivePregnancy(!!res.hasActivePregnancy);
                setError(null);
            } else {
                setError(res.error || new Error('Dossier maternité introuvable'));
            }
        } catch (e) {
            setError(e);
        } finally {
            setLoading(false);
        }
    }, [id, dossierId]);

    useEffect(() => {
        fetchData();
    }, [id, dossierId, fetchData]);

    const handleAddPregnancy = async () => {
        try {
            setIsAddingPregnancy(true);
            const res = await addPregnancy(dossierId);
            if (res.success) {
                await fetchData();
            } else {
                alert(res.error?.message || 'Erreur lors de la création de la grossesse');
            }
        } catch (e) {
            alert(e?.message || 'Erreur lors de la création de la grossesse');
        } finally {
            setIsAddingPregnancy(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto mb-6"></div>
                        <p className="text-gray-700 text-lg font-medium">Chargement du dossier...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!dossier || error) {
        return (
            <DashboardLayout>
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8">
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 p-10 max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            {error ? 'Erreur de chargement' : 'Dossier introuvable'}
                        </h2>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            {error ? (error.message || 'Une erreur est survenue') : 'Ce dossier maternité n\'existe pas dans la base de données.'}
                        </p>
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Retour
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen py-10 px-6 sm:px-12">
                <div className="max-w-6xl mx-auto space-y-10">
                    
                    {/* Header avec breadcrumb et actions */}
                    <div>
                        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
                            <Home className="w-4 h-4" />
                            <ChevronRight className="w-4 h-4" />
                            <span className="hover:text-blue-600 cursor-pointer transition-colors">Patients</span>
                            <ChevronRight className="w-4 h-4" />
                            <span className="hover:text-blue-600 cursor-pointer transition-colors">Profil</span>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-blue-600 font-semibold">Dossier maternité</span>
                        </nav>
                        
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-5">
                                <button
                                    onClick={() => router.back()}
                                    className="group flex items-center justify-center w-12 h-12 bg-white/90 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                                </button>
                                <div>
                                    <h1 className="text-4xl font-extrabold text-gray-900 mb-1">Dossier maternité</h1>
                                    <p className="text-gray-600 font-medium">Suivi complet de la patiente {dossier.nom_patiente ?? dossier.patient?.nom ?? 'Nom inconnu'}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button className="flex items-center px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium shadow-sm">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Planifier CPN
                                </button>
                                {!hasActivePregnancy && (
                                    <button
                                        onClick={handleAddPregnancy}
                                        disabled={isAddingPregnancy}
                                        className="flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg font-semibold disabled:opacity-50"
                                    >
                                        {isAddingPregnancy ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                                Ajout...
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Ajouter une grossesse
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Carte principale info dossier */}
                    <div className="bg-white/90 backdrop-blur rounded-2xl shadow-md border border-gray-200 p-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xl font-bold text-white shadow-md">
                                    <FileText className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Dossier #{dossier.id}</h2>
                                    <div className="mt-1 space-y-1 text-gray-600">
                                        <p className="text-sm">Patiente : <span className="font-semibold">{dossier.nom_patiente ?? dossier.patient?.nom ?? 'Nom inconnu'}</span></p>
                                        <p className="text-sm">Grossesses : <span className="font-semibold">{dossier.grossesses?.length || 0}</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contenu principal */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Timeline des interventions */}
                        <div className="lg:col-span-1">
                            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-md border border-gray-200 p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Historique des interventions</h3>
                                </div>
                                <div className="space-y-4">
                                    {interventions.length === 0 ? (
                                        <div className="text-center py-8">
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <Activity className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <p className="text-sm text-gray-500">Aucune intervention enregistrée</p>
                                        </div>
                                    ) : (
                                        interventions.map((intervention, index) => (
                                            <div key={intervention.id} className="relative">
                                                {index !== interventions.length - 1 && (
                                                    <div className="absolute left-4 top-8 w-0.5 h-12 bg-gray-200"></div>
                                                )}
                                                <div className="flex items-start gap-4">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-sm font-semibold text-gray-900">{intervention.type}</div>
                                                        <div className="text-xs text-gray-600 mb-1">
                                                            {new Date(intervention.date).toLocaleDateString('fr-FR')}
                                                        </div>
                                                        <div className="text-xs text-gray-500">{intervention.description}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Contenu principal */}
                        <div className="lg:col-span-2 space-y-8">
                            
                            {/* Liste des grossesses */}
                            <div className="bg-white/90 backdrop-blur rounded-2xl shadow-md border border-gray-200 p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Baby className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Grossesses</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {dossier.grossesses?.length > 0 ? dossier.grossesses.map((grossesse) => (
                                        <div key={grossesse.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all duration-200">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                    grossesse.statut === 'En cours' 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {grossesse.statut}
                                                </span>
                                                <span className="text-sm font-semibold text-gray-600">Année {grossesse.annee}</span>
                                            </div>
                                            <div className="space-y-2 mb-4">
                                                <InfoRow label="Consultations" value={grossesse.consultations} />
                                                <InfoRow label="Accouchements" value={grossesse.accouchements} />
                                            </div>
                                            <button
                                                onClick={() => router.push(`/dashboard/patients/${id}/dossier/${dossierId}/grossesses/${grossesse.id}`)}
                                                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                Voir détail
                                            </button>
                                        </div>
                                    )) : (
                                        <div className="col-span-full text-center py-8">
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <Baby className="w-6 h-6 text-gray-400" />
                                            </div>
                                            <p className="text-sm text-gray-500">Aucune grossesse enregistrée</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Consultations et Accouchements */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                
                                {/* Consultations récentes */}
                                <div className="bg-white/90 backdrop-blur rounded-2xl shadow-md border border-gray-200 p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Stethoscope className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Consultations récentes</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {recentConsultations.length === 0 ? (
                                            <div className="text-center py-8">
                                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Calendar className="w-6 h-6 text-gray-400" />
                                                </div>
                                                <p className="text-sm text-gray-500">Aucune consultation récente</p>
                                            </div>
                                        ) : (
                                            recentConsultations.slice(0, 5).map((consultation) => (
                                                <div key={consultation.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {new Date(consultation.date).toLocaleDateString('fr-FR')}
                                                    </span>
                                                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded font-medium">
                                                        {consultation.label}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Accouchements */}
                                <div className="bg-white/90 backdrop-blur rounded-2xl shadow-md border border-gray-200 p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Heart className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Accouchements</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {accouchements.length === 0 ? (
                                            <div className="text-center py-8">
                                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Baby className="w-6 h-6 text-gray-400" />
                                                </div>
                                                <p className="text-sm text-gray-500">Aucun accouchement enregistré</p>
                                            </div>
                                        ) : (
                                            accouchements.map((accouchement) => (
                                                <div key={accouchement.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {new Date(accouchement.date).toLocaleDateString('fr-FR')}
                                                    </span>
                                                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded font-medium">
                                                        {accouchement.mode}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function InfoRow({ label, value, mono }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{label}</span>
            <span className={`text-sm text-gray-900 font-medium ${mono ? 'font-mono bg-gray-100 px-2 py-1 rounded' : ''}`}>
                {value}
            </span>
        </div>
    );
}
