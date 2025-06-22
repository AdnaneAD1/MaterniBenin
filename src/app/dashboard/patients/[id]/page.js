"use client";

import { useRouter, useParams } from "next/navigation";
import DashboardLayout from '@/components/layout/DashboardLayout';
import Button from '@/components/ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useMemo } from "react";

// Mocks locaux pour suppression facile
const mockPatients = [
    {
        id: 'PT001',
        name: 'Afiavi HOUNSA',
        age: 28,
        gestationalAge: '24 semaines',
        lastVisit: '2025-06-01',
        nextVisit: '2025-06-20',
        status: 'Normal',
        phone: '97123456'
    },
    {
        id: 'PT002',
        name: 'Blandine AGOSSOU',
        age: 32,
        gestationalAge: '12 semaines',
        lastVisit: '2025-06-05',
        nextVisit: '2025-06-21',
        status: 'À surveiller',
        phone: '95789012'
    },
    {
        id: 'PT003',
        name: 'Colette BOCOVO',
        age: 24,
        gestationalAge: 'Post-partum',
        lastVisit: '2025-06-10',
        nextVisit: '2025-06-22',
        status: 'Normal',
        phone: '96234567'
    },
    {
        id: 'PT004',
        name: 'Danielle LOKONON',
        age: 30,
        gestationalAge: '34 semaines',
        lastVisit: '2025-06-12',
        nextVisit: '2025-06-23',
        status: 'À risque',
        phone: '94567890'
    },
    {
        id: 'PT005',
        name: 'Edwige DANSOU',
        age: 26,
        gestationalAge: '18 semaines',
        lastVisit: '2025-06-14',
        nextVisit: '2025-06-28',
        status: 'Normal',
        phone: '99876543'
    }
];

export default function PatientDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    // Recherche du patient dans le mock
    const patient = useMemo(() => mockPatients.find(p => p.id === id), [id]);

    if (!patient) {
        return (
            <DashboardLayout>
                <div className="p-8 text-center">
                    <p className="text-lg text-red-600 font-semibold">Patiente introuvable</p>
                    <Button className="mt-4" onClick={() => router.back()} icon={<FontAwesomeIcon icon={faArrowLeft} />}>
                        Retour
                    </Button>
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
                        <Button variant="outline" onClick={() => router.back()} icon={<FontAwesomeIcon icon={faArrowLeft} />}>
                            Retour
                        </Button>
                        <h1 className="ml-6 text-2xl sm:text-3xl font-bold text-primary">Détail de la patiente</h1>
                    </div>

                    {/* Carte principale info patiente */}
                    <div className="bg-white rounded-2xl shadow flex flex-col md:flex-row md:items-center md:justify-between p-6 mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-3xl font-bold text-primary border border-gray-200">
                                {patient.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xl font-semibold text-gray-900">{patient.name}</span>
                                </div>
                                <div className="text-sm text-gray-600">ID : {patient.id}</div>
                                <div className="text-sm text-gray-600">Âge : {patient.age} ans</div>
                                <div className="text-sm text-gray-600">Téléphone : {patient.phone}</div>
                            </div>
                        </div>
                        <div className="mt-4 md:mt-0 flex flex-col items-end gap-2">
                            <div className="flex gap-2">
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Dernière CPN : {new Date(patient.lastVisit).toLocaleDateString('fr-FR')}</span>
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">Prochaine CPN : {new Date(patient.nextVisit).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <Button
                                className="mt-4"
                                variant="primary"
                                onClick={() => router.push(`/dashboard/patients/${patient.id}/dossier/DM001`)}
                            >
                                Voir dossier maternité
                            </Button>
                        </div>
                    </div>

                    {/* Onglets (non-fonctionnels, juste pour l’UI) */}
                    <div className="flex gap-4 border-b border-gray-200 mb-6 overflow-x-auto">
                        {/* <button className="py-2 px-4 text-primary border-b-2 border-primary font-semibold bg-white">Informations</button>
                        <button className="py-2 px-4 text-gray-500 hover:text-primary">Consultations</button>
                        <button className="py-2 px-4 text-gray-500 hover:text-primary">Grossesses</button>
                        <button className="py-2 px-4 text-gray-500 hover:text-primary">Accouchements</button>
                        <button className="py-2 px-4 text-gray-500 hover:text-primary">Planification familiale</button>
                        <button className="py-2 px-4 text-gray-500 hover:text-primary">Documents</button> */}
                    </div>

                    {/* 2 cartes infos principales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Infos patiente */}
                        <div className="bg-white rounded-xl shadow p-6">
                            <h2 className="text-lg font-bold text-primary mb-4">Informations personnelles</h2>
                            <div className="space-y-2">
                                <div><span className="font-semibold">Nom :</span> {patient.name}</div>
                                <div><span className="font-semibold">ID :</span> {patient.id}</div>
                                <div><span className="font-semibold">Âge :</span> {patient.age} ans</div>
                                <div><span className="font-semibold">Téléphone :</span> {patient.phone}</div>
                            </div>
                        </div>
                        {/* Suivi médical */}
                        <div className="bg-white rounded-xl shadow p-6">
                            <h2 className="text-lg font-bold text-primary mb-4">Suivi médical</h2>
                            <div className="space-y-2">
                                <div><span className="font-semibold">Dernière CPN :</span> {new Date(patient.lastVisit).toLocaleDateString('fr-FR')}</div>
                                <div><span className="font-semibold">Prochaine CPN :</span> {new Date(patient.nextVisit).toLocaleDateString('fr-FR')}</div>
                                <div><span className="font-semibold">Dossier maternité :</span> <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">À venir</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
