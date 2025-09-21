"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDossier } from '@/hooks/dossier';
import { usePatiente } from '@/hooks/patientes';
import ConsultationModal from "@/components/ui/ConsultationModal";
import AccouchementModal from "@/components/ui/AccouchementModal";
import AddConsultationModal from "@/components/ui/AddConsultationModal";
import AddAccouchementModal from "@/components/ui/AddAccouchementModal";
import DashboardLayout from '@/components/layout/DashboardLayout';
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
    Eye,
    Info
} from 'lucide-react';

export default function GrossesseDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { id, dossierId, grossesseId } = params;

    const { getGrossesseDetails } = useDossier();
    const { addCpn, addChildbirth } = usePatiente();
    const [consultationModalOpen, setConsultationModalOpen] = useState(false);
    const [selectedConsultation, setSelectedConsultation] = useState(null);
    const [accouchementModalOpen, setAccouchementModalOpen] = useState(false);
    const [addConsultationOpen, setAddConsultationOpen] = useState(false);
    const [addAccouchementOpen, setAddAccouchementOpen] = useState(false);
    const [grossesseState, setGrossesseState] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const res = await getGrossesseDetails(dossierId, grossesseId);
                if (!mounted) return;
                if (res.success) {
                    setGrossesseState(res.grossesse);
                    setError(null);
                } else {
                    setError(res.error || new Error('Grossesse introuvable'));
                }
            } catch (e) {
                if (mounted) setError(e);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [dossierId, grossesseId]);

    const refresh = async () => {
        setLoading(true);
        const res = await getGrossesseDetails(dossierId, grossesseId);
        if (res.success) {
            setGrossesseState(res.grossesse);
            setError(null);
        } else {
            setError(res.error || new Error('Grossesse introuvable'));
        }
        setLoading(false);
    };

    const grossesse = grossesseState;

    if (loading) {
        return (
            <DashboardLayout>
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto mb-6"></div>
                        <p className="text-gray-700 text-lg font-medium">Chargement de la grossesse...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!grossesse || error) {
        return (
            <DashboardLayout>
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8">
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 p-10 max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                            {error ? 'Erreur de chargement' : 'Grossesse introuvable'}
                        </h2>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            {error ? (error.message || 'Une erreur est survenue') : 'Cette grossesse n\'existe pas dans la base de données.'}
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
                            <span className="hover:text-blue-600 cursor-pointer transition-colors">Dossier</span>
                            <ChevronRight className="w-4 h-4" />
                            <span className="text-blue-600 font-semibold">Grossesse</span>
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
                                    <h1 className="text-4xl font-extrabold text-gray-900 mb-1">Détail de la grossesse</h1>
                                    <p className="text-gray-600 font-medium">Suivi complet et consultations prénatales</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Carte principale info grossesse */}
                    <div className="bg-white/90 backdrop-blur rounded-2xl shadow-md border border-gray-200 p-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xl font-bold text-white shadow-md">
                                    <Baby className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Grossesse #{grossesse.id}</h2>
                                    <div className="mt-1 space-y-1 text-gray-600">
                                        <p className="text-sm">Dossier : <span className="font-semibold">{grossesse.id_dossier}</span></p>
                                        <p className="text-sm">Année : <span className="font-semibold">{grossesse.annee}</span></p>
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                grossesse.statut === 'En cours' 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {grossesse.statut}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contenu principal */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* Consultations prénatales */}
                        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-md border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Stethoscope className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Consultations prénatales</h3>
                                </div>
                                {!(grossesse.statut?.toLowerCase() === 'terminée') && (
                                    <button
                                        onClick={() => setAddConsultationOpen(true)}
                                        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm text-sm"
                                    >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Ajouter
                                    </button>
                                )}
                            </div>
                            
                            <div className="space-y-3">
                                {grossesse.consultations?.length > 0 ? (
                                    grossesse.consultations.map(c => (
                                        <div
                                            key={c.id}
                                            className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                                            onClick={() => {
                                                setSelectedConsultation(c);
                                                setConsultationModalOpen(true);
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-semibold text-gray-900">Consultation #{c.id}</span>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(c.date_consultation).toLocaleDateString('fr-FR')}
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                <InfoRow label="Prochain RDV" value={c.RDV} />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Calendar className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <p className="text-sm text-gray-500">Aucune consultation enregistrée</p>
                                    </div>
                                )}
                            </div>

                        </div>

                        {/* Accouchement */}
                        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-md border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Heart className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Accouchement</h3>
                                </div>
                                {!(grossesse.statut?.toLowerCase() === 'terminée') && !grossesse.accouchement && (
                                    <button
                                        onClick={() => setAddAccouchementOpen(true)}
                                        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm text-sm"
                                    >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Ajouter
                                    </button>
                                )}
                            </div>

                            {grossesse.accouchement ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <div className="space-y-3">
                                            <InfoRow label="Nombre d'enfants" value={grossesse.accouchement.nbr_enfant ?? (grossesse.accouchement.enfants ? grossesse.accouchement.enfants.length : '-')} />
                                            <InfoRow label="Mode accouchement" value={grossesse.accouchement.mode_accouchement ?? '-'} />
                                            <InfoRow label="Date admission" value={grossesse.accouchement.date_admission ? new Date(grossesse.accouchement.date_admission).toLocaleDateString('fr-FR') : '-'} />
                                            <InfoRow label="Heure admission" value={grossesse.accouchement.heure_admission ?? '-'} />
                                            <InfoRow label="Date accouchement" value={grossesse.accouchement.date_accouchement ? new Date(grossesse.accouchement.date_accouchement).toLocaleDateString('fr-FR') : '-'} />
                                            <InfoRow label="Heure accouchement" value={grossesse.accouchement.heure_accouchement ?? '-'} />
                                        </div>
                                    </div>

                                    {/* Enfants */}
                                    {Array.isArray(grossesse.accouchement.enfants) && grossesse.accouchement.enfants.length > 0 ? (
                                        <div className="space-y-3">
                                            <h4 className="font-semibold text-gray-900">Enfants :</h4>
                                            {grossesse.accouchement.enfants.map((enfant, idx) => (
                                                <div key={idx} className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                                    <h5 className="font-semibold text-blue-900 mb-2">Bébé {idx + 1}</h5>
                                                    <div className="space-y-2">
                                                        <InfoRow label="Nom" value={enfant.nom_accouche ?? '-'} />
                                                        <InfoRow label="Prénom" value={enfant.prenom_accouche ?? '-'} />
                                                        <InfoRow label="Sexe" value={enfant.sexe_accouche ?? '-'} />
                                                        <InfoRow label="Poids" value={enfant.poids ?? '-'} />
                                                        {enfant.note && <InfoRow label="Note" value={enfant.note} />}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                            <div className="space-y-2">
                                                <InfoRow label="Nom accouche" value={grossesse.accouchement.nom_accouche ?? '-'} />
                                                <InfoRow label="Prénom accouche" value={grossesse.accouchement.prenom_accouche ?? '-'} />
                                                <InfoRow label="Sexe" value={grossesse.accouchement.sexe_accouche ?? '-'} />
                                                <InfoRow label="Poids" value={grossesse.accouchement.poids ?? '-'} />
                                                {grossesse.accouchement.note && <InfoRow label="Note" value={grossesse.accouchement.note} />}
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => setAccouchementModalOpen(true)}
                                        className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        Voir détails complets
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Baby className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-500">Aucun accouchement enregistré</p>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Observations générales */}
                    {grossesse.observations && grossesse.observations !== '' && (
                        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-md border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                    <Info className="w-5 h-5 text-amber-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Observations générales</h3>
                            </div>
                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                                <p className="text-sm text-gray-800">{grossesse.observations}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals - Placés en dehors de la structure des cards pour un positionnement correct */}
            <AddConsultationModal
                open={addConsultationOpen}
                onClose={() => setAddConsultationOpen(false)}
                onAdd={async (form) => {
                    const payload = {
                        dormirsurmild: !!form.dormirsurmild,
                        sulphadoxine: form.sulfadoxine ?? form.sp_nbr ?? '',
                        mebendazole: form.mebendazole ?? form.meben ?? '',
                        ferfoldine: form.ferfoldine ?? form.fer_foldine ?? '',
                        vat: form.vat ?? '',
                        garedepiste: !!form.garedepiste ?? !!form.gare_depiste,
                        garerefere: !!form.garerefere ?? !!form.gare_refere,
                        diagnostique: form.diagnostique ?? form.diagnostique_associe ?? '',
                        conduiteTenue: form.conduiteTenue ?? form.conduite_tenue ?? '',
                        rdv: form.RDV,
                    };
                    const res = await addCpn(grossesseId, payload);
                    if (res.success) {
                        await refresh();
                        setAddConsultationOpen(false);
                    } else {
                        alert(res.error?.message || 'Erreur lors de la création de la consultation');
                    }
                }}
            />

            <ConsultationModal
                open={consultationModalOpen}
                onClose={() => setConsultationModalOpen(false)}
                consultation={selectedConsultation}
            />

            <AddAccouchementModal
                open={addAccouchementOpen}
                onClose={() => setAddAccouchementOpen(false)}
                onAdd={async (form) => {
                    const payload = {
                        nomMari: form.nomMari,
                        prenomMari: form.prenomMari,
                        heureAdmission: form.heureAdmission,
                        dateAdmission: form.dateAdmission,
                        heureAccouchement: form.heureAccouchement,
                        dateAccouchement: form.dateAccouchement,
                        modeAccouchement: form.modeAccouchement,
                        note: form.note,
                        enfants: Array.isArray(form.enfants) ? form.enfants.map(e => ({
                            nomEnfant: e.nomEnfant,
                            prenomEnfant: e.prenomEnfant,
                            sexe: e.sexe,
                            poids: e.poids,
                        })) : [],
                    };
                    const res = await addChildbirth(grossesseId, payload);
                    if (res.success) {
                        await refresh();
                        setAddAccouchementOpen(false);
                    } else {
                        alert(res.error?.message || "Erreur lors de l'ajout de l'accouchement");
                    }
                }}
            />

            <AccouchementModal
                open={accouchementModalOpen}
                onClose={() => setAccouchementModalOpen(false)}
                accouchement={grossesse.accouchement}
            />
        </DashboardLayout>
    );
}

function InfoRow({ label, value, mono }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">{label}</span>
            <span className={`text-xs text-gray-900 font-medium ${mono ? 'font-mono bg-gray-100 px-2 py-1 rounded' : ''}`}>
                {value}
            </span>
        </div>
    );
}
