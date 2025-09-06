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
import Button from '@/components/ui/Button';
import Timeline from '@/components/ui/Timeline';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPlus } from '@fortawesome/free-solid-svg-icons';

// Les données sont désormais chargées via Firestore (useDossier)

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
                <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement de la grossesse...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!grossesse || error) {
        return (
            <DashboardLayout>
                <div className="p-8 text-center">
                    <p className="text-lg text-red-600 font-semibold">{error ? (error.message || 'Erreur lors du chargement') : 'Grossesse introuvable'}</p>
                    <Button className="mt-4" onClick={() => router.back()} icon={<FontAwesomeIcon icon={faArrowLeft} />}>Retour</Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="bg-[#F8FAFC] min-h-screen py-6 px-2 sm:px-8">
                <div className="max-w-3xl mx-auto">
                    {/* Header + retour */}
                    <div className="flex items-center mb-4">
                        <Button variant="outline" onClick={() => router.back()} icon={<FontAwesomeIcon icon={faArrowLeft} />}>Retour</Button>
                        <h1 className="ml-6 text-2xl sm:text-3xl font-bold text-primary">Détail de la grossesse</h1>
                    </div>

                    {/* Informations principales Grossesse */}
                    <div className="bg-white rounded-2xl shadow p-6 mb-6 flex flex-col gap-4 sm:gap-8 border-l-4 border-blue-200">
                        <div className="flex flex-wrap gap-6">
                            <div><span className="font-semibold">ID :</span> {grossesse.id}</div>
                            <div><span className="font-semibold">ID dossier :</span> {grossesse.id_dossier}</div>
                            <div><span className="font-semibold">Statut :</span> <span className={`px-2 py-1 rounded-full text-xs font-medium ${grossesse.statut === 'En cours' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{grossesse.statut}</span></div>
                            <div><span className="font-semibold">Année :</span> {grossesse.annee}</div>
                        </div>
                    </div>

                    {/* Consultations prénatales liées */}
                    <div className="bg-white rounded-xl shadow p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold text-primary">Consultations prénatales</h2>
                            {!(grossesse.statut?.toLowerCase() === 'terminée') && (
                                <Button
                                    className="ml-2 px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded hover:bg-green-200"
                                    icon={<FontAwesomeIcon icon={faPlus} />} 
                                    onClick={() => setAddConsultationOpen(true)}
                                >
                                    Ajouter consultation
                                </Button>
                            )}
                            <AddConsultationModal
                                open={addConsultationOpen}
                                onClose={() => setAddConsultationOpen(false)}
                                onAdd={async (form) => {
                                    // Mapper les noms de champs pour correspondre à addCpn
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
                        </div>
                        <ul className="divide-y divide-gray-100">
                            {grossesse.consultations.map(c => (
                                <li
                                    key={c.id}
                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 cursor-pointer hover:bg-blue-50 rounded"
                                    onClick={() => {
                                        setSelectedConsultation(c);
                                        setConsultationModalOpen(true);
                                    }}
                                >
                                    <div className="flex flex-wrap gap-4 mb-1 sm:mb-0">
                                        <span className="text-xs text-gray-700"><b>ID : {c.id}</b></span>
                                        <span className="text-xs text-gray-700">Date : {new Date(c.date_consultation).toLocaleDateString('fr-FR')}</span>
                                        <span className="text-xs text-gray-700">Sage-femme : {c.nom_sage_femme}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                                        <div>Sexe enceinte : <span className="font-semibold text-gray-700">{c.sexe_enceinte}</span></div>
                                        <div>Prochain RDV : <span className="font-semibold text-gray-700">{c.RDV}</span></div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <ConsultationModal
                            open={consultationModalOpen}
                            onClose={() => setConsultationModalOpen(false)}
                            consultation={selectedConsultation}
                        />
                    </div>



                    {/* Accouchement lié à la grossesse */}
                    <div className="bg-white rounded-xl shadow p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold text-primary">Accouchement</h2>
                            {!(grossesse.statut?.toLowerCase() === 'terminée') && (
                                <Button
                                    className="ml-2 px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded hover:bg-green-200"
                                    icon={<FontAwesomeIcon icon={faPlus} />} 
                                    onClick={() => setAddAccouchementOpen(true)}
                                >
                                    Ajouter accouchement
                                </Button>
                            )}
                            <AddAccouchementModal
                                open={addAccouchementOpen}
                                onClose={() => setAddAccouchementOpen(false)}
                                onAdd={async (form) => {
                                    // addChildbirth attend enfants: [{nomEnfant, prenomEnfant, sexe, poids}], et autres champs
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
                        </div>
                        {grossesse.accouchement ? (
                            <>
                                <div className="flex flex-col gap-2 text-sm text-gray-700">
                                    <div><span className="font-semibold">Nombre d&apos;enfants :</span> {grossesse.accouchement.nbr_enfant ?? (grossesse.accouchement.enfants ? grossesse.accouchement.enfants.length : '-')}</div>
                                    {Array.isArray(grossesse.accouchement.enfants) && grossesse.accouchement.enfants.length > 0 ? (
                                        grossesse.accouchement.enfants.map((enfant, idx) => (
                                            <div key={idx} className="pl-2 border-l-2 border-blue-100 mb-2">
                                                <div><span className="font-semibold">Bébé {idx + 1}</span></div>
                                                <div><span className="font-semibold">Nom accouche :</span> {enfant.nom_accouche ?? '-'}</div>
                                                <div><span className="font-semibold">Prénom accouche :</span> {enfant.prenom_accouche ?? '-'}</div>
                                                <div><span className="font-semibold">Nom mari :</span> {enfant.nom_mari ?? '-'}</div>
                                                <div><span className="font-semibold">Prénom mari :</span> {enfant.prenom_mari ?? '-'}</div>
                                                <div><span className="font-semibold">Sexe :</span> {enfant.sexe_accouche ?? '-'}</div>
                                                <div><span className="font-semibold">Poids :</span> {enfant.poids ?? '-'}</div>
                                                <div><span className="font-semibold">Note :</span> {enfant.note ?? '-'}</div>
                                            </div>
                                        ))
                                    ) : (
                                        <>
                                            <div><span className="font-semibold">Nom accouche :</span> {grossesse.accouchement.nom_accouche ?? '-'}</div>
                                            <div><span className="font-semibold">Prénom accouche :</span> {grossesse.accouchement.prenom_accouche ?? '-'}</div>
                                            <div><span className="font-semibold">Nom mari :</span> {grossesse.accouchement.nom_mari ?? '-'}</div>
                                            <div><span className="font-semibold">Prénom mari :</span> {grossesse.accouchement.prenom_mari ?? '-'}</div>
                                            <div><span className="font-semibold">Sexe :</span> {grossesse.accouchement.sexe_accouche ?? '-'}</div>
                                            <div><span className="font-semibold">Poids :</span> {grossesse.accouchement.poids ?? '-'}</div>
                                            <div><span className="font-semibold">Note :</span> {grossesse.accouchement.note ?? '-'}</div>
                                        </>
                                    )}
                                    <div><span className="font-semibold">Heure admission :</span> {grossesse.accouchement.heure_admission ?? '-'}</div>
                                    <div><span className="font-semibold">Date admission :</span> {grossesse.accouchement.date_admission ? new Date(grossesse.accouchement.date_admission).toLocaleDateString('fr-FR') : '-'}</div>
                                    <div><span className="font-semibold">Heure accouchement :</span> {grossesse.accouchement.heure_accouchement ?? '-'}</div>
                                    <div><span className="font-semibold">Date accouchement :</span> {grossesse.accouchement.date_accouchement ? new Date(grossesse.accouchement.date_accouchement).toLocaleDateString('fr-FR') : '-'}</div>
                                    <div><span className="font-semibold">Mode accouchement :</span> {grossesse.accouchement.mode_accouchement ?? '-'}</div>
                                </div>
                                <AccouchementModal
                                    open={accouchementModalOpen}
                                    onClose={() => setAccouchementModalOpen(false)}
                                    accouchement={grossesse.accouchement}
                                />
                            </>
                        ) : (
                            <div className="text-xs text-gray-500">Aucun accouchement enregistré</div>
                        )}
                    </div>

                    {/* Bloc Observations générales */}
                    {grossesse.observations && grossesse.observations !== '' && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-300 rounded-xl shadow p-5 mb-6">
                            <h3 className="text-base font-bold text-yellow-800 mb-2 flex items-center gap-2">
                                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20.5c4.142 0 7.5-3.358 7.5-7.5s-3.358-7.5-7.5-7.5-7.5 3.358-7.5 7.5 3.358 7.5 7.5 7.5z" /></svg>
                                Observations générales
                            </h3>
                            <div className="text-sm text-gray-800">{grossesse.observations}</div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
