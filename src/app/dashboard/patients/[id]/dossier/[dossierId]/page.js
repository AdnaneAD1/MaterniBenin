"use client";

import { useRouter, useParams } from "next/navigation";
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import Timeline from '@/components/ui/Timeline';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useMemo } from "react";

// Mock local pour suppression facile
const mockDossiers = [
    {
        id: 'DM001',
        id_patient: 'PT001',
        date: '2024-09-01',
        nom_patiente: 'Afiavi HOUNSA',
        age: 28,
        phone: '97123456',
        grossesses: [
            {
                id: 'G001',
                statut: 'En cours',
                annee: 2025,
                consultations: 3,
                accouchements: 0
            },
            {
                id: 'G002',
                statut: 'Terminée',
                annee: 2023,
                consultations: 5,
                accouchements: 1
            }
        ]
    }
];

export default function DossierMaternitePage() {
    const router = useRouter();
    const params = useParams();
    const { id, dossierId } = params;

    // Recherche du dossier dans le mock
    const dossier = useMemo(() => mockDossiers.find(d => d.id === dossierId && d.id_patient === id), [dossierId, id]);

    if (!dossier) {
        return (
            <DashboardLayout>
                <div className="p-8 text-center">
                    <p className="text-lg text-red-600 font-semibold">Dossier maternité introuvable</p>
                    <Button className="mt-4" onClick={() => router.back()} icon={<FontAwesomeIcon icon={faArrowLeft} />}>Retour</Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="bg-[#F8FAFC] min-h-screen py-6 px-2 sm:px-8">
                <div className="max-w-5xl mx-auto">
                    {/* Header + retour */}
                    <div className="flex items-center mb-4">
                        <Button variant="outline" onClick={() => router.back()} icon={<FontAwesomeIcon icon={faArrowLeft} />}>Retour</Button>
                        <h1 className="ml-6 text-2xl sm:text-3xl font-bold text-primary">Dossier maternité</h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Timeline (mock, DossierMaternite) */}
                        <div className="md:col-span-1 flex flex-col gap-6">
                            <div className="bg-white rounded-2xl shadow p-6">
                                <Timeline />
                            </div>
                            {/* Section patient liée (mock Patient) */}
                            {/* <div className="bg-white rounded-2xl shadow p-6">
                                <h2 className="text-base font-bold text-primary mb-4">Patiente liée</h2> */}
                            {/* Correspond à la future classe Patient */}
                            {/* <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-primary border border-gray-200">{dossier.nom_patiente.charAt(0) + dossier.nom_patiente.charAt(1)}</div>
                                    <div>
                                        <div className="font-semibold text-gray-900">{dossier.nom_patiente}</div>
                                        <div className="text-xs text-gray-500">ID : {id}</div>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-600 mb-2">Âge : {dossier.age} ans</div>
                                <div className="text-xs text-gray-600">Téléphone : {dossier.phone}</div> */}
                            {/* </div> */}

                        </div>
                        {/* Infos dossier + grossesses + consultations + accouchements */}
                        <div className="md:col-span-2 flex flex-col gap-6">
                            {/* Infos dossier */}
                            <div className="bg-white rounded-2xl shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                                {/* Infos principales dossier */}
                                {/* <div className="bg-white rounded-xl shadow p-6 mb-6"> */}
                                <div className="text-lg font-semibold text-primary mb-1">Dossier #{dossier.id}</div>
                                <div className="text-base font-medium text-gray-800 mb-1">Patiente : {dossier.nom_patiente ?? dossier.patient?.nom ?? 'Nom inconnu'}</div>
                                <div className="text-sm text-gray-600 mb-1">Nombre de grossesses : {dossier.grossesses.length}</div>
                                {/* </div> */}
                                {/* <div className="mt-4 md:mt-0">
                                    <Button variant="primary">Ajouter une grossesse</Button>
                                </div> */}
                            </div>
                            {/* Liste des grossesses (Grossesse) */}
                            <div className="overflow-x-auto py-2 px-4">
                                <div className="flex flex-row md:flex-wrap gap-8">
                                    {dossier.grossesses.map((grossesse, idx) => (
                                        <div
                                            key={grossesse.id}
                                            className={
                                                `min-w-[280px] bg-white rounded-xl shadow p-5 flex flex-col justify-between border border-blue-50` +
                                                (idx !== dossier.grossesses.length - 1 ? ' mr-8 md:mr-0' : '')
                                            }
                                        >
                                            {/* Correspond à la future classe Grossesse */}
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${grossesse.statut === 'En cours' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{grossesse.statut}</span>
                                                <span className="ml-auto text-xs text-gray-400">Année {grossesse.annee}</span>
                                            </div>
                                            <div className="text-sm text-gray-700 mb-2">Consultations : <span className="font-semibold text-primary">{grossesse.consultations}</span></div>
                                            <div className="text-sm text-gray-700 mb-4">Accouché : <span className="font-semibold text-primary">{grossesse.accouchements}</span> enfant(s)</div>
                                            <Button size="sm" variant="outline" onClick={() => router.push(`/dashboard/patients/${id}/dossier/${dossierId}/grossesses/${grossesse.id}`)}>Voir détail</Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Consultations récentes (Consultation) */}
                            <div className="bg-white rounded-xl shadow p-6">
                                <h2 className="text-base font-bold text-primary mb-4">Consultations récentes</h2>
                                {/* Correspond à la future classe Consultation */}
                                <ul className="divide-y divide-gray-100">
                                    <li className="flex items-center justify-between py-2">
                                        <span className="text-xs text-gray-700">12/06/2025</span>
                                        <span className="text-xs text-gray-500">CPN 4</span>
                                    </li>
                                    <li className="flex items-center justify-between py-2">
                                        <span className="text-xs text-gray-700">20/03/2025</span>
                                        <span className="text-xs text-gray-500">CPN 3</span>
                                    </li>
                                </ul>
                            </div>
                            {/* Résumé accouchements (Accouchement) */}
                            <div className="bg-white rounded-xl shadow p-6">
                                <h2 className="text-base font-bold text-primary mb-4">Accouchements</h2>
                                {/* Correspond à la future classe Accouchement */}
                                <ul className="divide-y divide-gray-100">
                                    <li className="flex items-center justify-between py-2">
                                        <span className="text-xs text-gray-700">05/07/2023</span>
                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Voie basse</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
