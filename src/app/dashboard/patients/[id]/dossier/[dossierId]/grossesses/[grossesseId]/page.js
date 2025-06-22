"use client";

import { useRouter, useParams } from "next/navigation";
import { useMemo, useState } from "react";
import ConsultationModal from "@/components/ui/ConsultationModal";
import AccouchementModal from "@/components/ui/AccouchementModal";
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Timeline from '@/components/ui/Timeline';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPlus } from '@fortawesome/free-solid-svg-icons';

// Mock local pour la grossesse, consultations et accouchement
const mockGrossesses = [
    {
        id: 'G001',
        id_dossier: 'DM001',
        statut: 'En cours',
        annee: 2025,
        consultations: [
            {
                id: 11,
                id_grossesse: 1,
                date_consultation: '2025-03-15',
                nom_medecin: 'Dr. A. Houngbédji',
                nom_sage_femme: 'Mme K. Dossou',
                terme: 12,
                age_gest: 28,
                sexe_enceinte: 'F',
                RDV: '2025-04-10'
            },
            {
                id: 12,
                id_grossesse: 1,
                date_consultation: '2025-05-10',
                nom_medecin: 'Dr. A. Houngbédji',
                nom_sage_femme: 'Mme K. Dossou',
                terme: 18,
                age_gest: 28,
                sexe_enceinte: 'F',
                RDV: '2025-06-10'
            }
        ],
        accouchement: {
            id: 'A002',
            id_dossier_maternite: 'DM002',
            nbr_enfant: 1,
            enfants: [
                {
                    nom_accouche: 'Agbo',
                    prenom_accouche: 'Clarisse',
                    nom_mari: 'Dossou',
                    prenom_mari: 'Paul',
                    sexe_accouche: 'F',
                    poids: '3.0kg',
                    note: 'Bébé en bonne santé'
                }
            ],
            nom_accouche: 'Agbo',
            prenom_accouche: 'Clarisse',
            nom_mari: 'Dossou',
            prenom_mari: 'Paul',
            heure_admission: '09:15',
            date_admission: '2023-05-12',
            heure_accouchement: '13:10',
            date_accouchement: '2023-05-13',
            mode_accouchement: 'Voie basse',
            sexe_accouche: '',
            poids: '',
            note: '',
            etat_sortie: 'Mère et bébé en bonne santé'
        }
    },
    {
        id: 'G002',
        id_dossier: 'DM001',
        statut: 'Terminée',
        annee: 2023,
        consultations: [
            {
                id: 21,
                id_grossesse: 2,
                date_consultation: '2023-01-10',
                nom_medecin: 'Dr. S. Kpogan',
                nom_sage_femme: 'Mme T. Gnonlonfoun',
                terme: 14,
                age_gest: 29,
                sexe_enceinte: 'F',
                RDV: '2023-02-10'
            }
        ],
        accouchement: {
            id: 'A001',
            id_dossier_maternite: 'DM001',
            nbr_enfant: 2,
            enfants: [
                {
                    nom_accouche: 'Kpogan',
                    prenom_accouche: 'Sophie',
                    nom_mari: 'Azon',
                    prenom_mari: 'Jean',
                    sexe_accouche: 'F',
                    poids: '2.8kg',
                    note: 'Bébé en bonne santé'
                },
                {
                    nom_accouche: 'Kpogan',
                    prenom_accouche: 'Sophie',
                    nom_mari: 'Azon',
                    prenom_mari: 'Jean',
                    sexe_accouche: 'M',
                    poids: '2.6kg',
                    note: 'Bébé en observation'
                }
            ],
            nom_accouche: 'Kpogan',
            prenom_accouche: 'Sophie',
            nom_mari: 'Azon',
            prenom_mari: 'Jean',
            heure_admission: '08:00',
            date_admission: '2023-07-04',
            heure_accouchement: '11:30',
            date_accouchement: '2023-07-07',
            mode_accouchement: 'Césarienne',
            sexe_accouche: '',
            poids: '',
            note: '',
            etat_sortie: 'Mère et jumeaux en bonne santé'
        }
    }
];

export default function GrossesseDetailPage() {
    const [consultationModalOpen, setConsultationModalOpen] = useState(false);
    const [selectedConsultation, setSelectedConsultation] = useState(null);
    const [accouchementModalOpen, setAccouchementModalOpen] = useState(false);
    const router = useRouter();
    const params = useParams();
    const { id, dossierId, grossesseId } = params;

    // Recherche de la grossesse dans le mock
    const grossesse = useMemo(() => mockGrossesses.find(g => g.id === grossesseId), [grossesseId]);

    if (!grossesse) {
        return (
            <DashboardLayout>
                <div className="p-8 text-center">
                    <p className="text-lg text-red-600 font-semibold">Grossesse introuvable</p>
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
                                    onClick={() => alert('Ajouter une consultation (à implémenter)')}
                                >
                                    Ajouter consultation
                                </Button>
                            )}
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
                    {grossesse.accouchement && (
                        <>
                        <div className="bg-white rounded-xl shadow p-6 mb-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base font-bold text-primary">Accouchement</h2>
                                {!(grossesse.statut?.toLowerCase() === 'terminée') && (
                                    <Button
                                        className="ml-2 px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded hover:bg-green-200"
                                        icon={<FontAwesomeIcon icon={faPlus} />} 
                                        onClick={() => alert('Ajouter un accouchement (à implémenter)')}
                                    >
                                        Ajouter accouchement
                                    </Button>
                                )}
                            </div>
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
                        </div>
                        </>
                    )}

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
