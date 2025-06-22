"use client";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SearchBar from '@/components/ui/SearchBar';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import AddPregnantWomanModal from '@/components/AddPregnantWomanModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faUserPlus,
    faFilter,
    faEye,
    faEdit,
    faStethoscope,
    faCalendarPlus
} from '@fortawesome/free-solid-svg-icons';

export default function PatientsPage() {
    const router = useRouter();
    // State for search term
    const [searchTerm, setSearchTerm] = useState('');
    // State for filter dropdown
    const [showFilters, setShowFilters] = useState(false);
    // State for selected patient (for modal)
    const [selectedPatient, setSelectedPatient] = useState(null);

    // State for modal
    const [showAddModal, setShowAddModal] = useState(false);
    // Sample data for patients
    const [patients, setPatients] = useState([
        {
            id: 'PT001',
            name: 'Afiavi HOUNSA',
            age: 28,
            gestationalAge: '24 semaines',
            lastVisit: '2025-06-01',
            nextVisit: '2025-06-20',
            status: 'Normal',
            phone: '97123456',
            adresse: 'Cotonou, Zogbo'
        },
        {
            id: 'PT002',
            name: 'Blandine AGOSSOU',
            age: 32,
            gestationalAge: '12 semaines',
            lastVisit: '2025-06-05',
            nextVisit: '2025-06-21',
            status: 'À surveiller',
            phone: '95789012',
            adresse: 'Porto-Novo, Ouando'
        },
        {
            id: 'PT003',
            name: 'Colette BOCOVO',
            age: 24,
            gestationalAge: 'Post-partum',
            lastVisit: '2025-06-10',
            nextVisit: '2025-06-22',
            status: 'Normal',
            phone: '96234567',
            adresse: 'Abomey-Calavi, Tankpè'
        },
        {
            id: 'PT004',
            name: 'Danielle LOKONON',
            age: 30,
            gestationalAge: '34 semaines',
            lastVisit: '2025-06-12',
            nextVisit: '2025-06-23',
            status: 'À risque',
            phone: '94567890',
            adresse: 'Cotonou, Fidjrossè'
        },
        {
            id: 'PT005',
            name: 'Edwige DANSOU',
            age: 26,
            gestationalAge: '18 semaines',
            lastVisit: '2025-06-14',
            nextVisit: '2025-06-28',
            status: 'Normal',
            phone: '99876543',
            adresse: 'Ouidah, Centre-ville'
        }
    ]);

    // Define columns for the table
    const columns = [
        {
            key: 'id',
            header: 'ID',
            sortable: true
        },
        {
            key: 'name',
            header: 'Nom',
            sortable: true
        },
        {
            key: 'age',
            header: 'Âge',
            sortable: true
        },
        {
            key: 'adresse',
            header: 'Adresse',
            sortable: true
        },
        {
            key: 'gestationalAge',
            header: 'Grossesse',
            sortable: true
        },
        {
            key: 'lastVisit',
            header: 'Dernière CPN',
            sortable: true,
            render: (row) => row.lastVisit ? new Date(row.lastVisit).toLocaleDateString('fr-FR') : '--'
        },
        {
            key: 'nextVisit',
            header: 'Prochaine CPN',
            sortable: true,
            render: (row) => row.nextVisit ? new Date(row.nextVisit).toLocaleDateString('fr-FR') : '--'
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (row) => (
                <div className="flex space-x-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/patients/${row.id}`);
                        }}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Voir le dossier"
                    >
                        <FontAwesomeIcon icon={faEye} />
                    </button>
                </div>
            )
        }
    ];

    // Handle search
    const handleSearch = (term) => {
        setSearchTerm(term);
        // In a real app, you would filter the data or call an API
        console.log(`Searching for: ${term}`);
    };

    // Handle row click to view patient details
    const handleRowClick = (patient) => {
        console.log(`View patient details: ${patient.name}`);
        // In a real app, you would navigate to the patient detail page
    };

    // Filter the patients based on search term
    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handler for adding a new pregnant woman
    const handleAddPregnantWoman = (newPatient) => {
        setPatients([
            ...patients,
            {
                id: `PT${(patients.length + 1).toString().padStart(3, '0')}`,
                name: `${newPatient.prenom} ${newPatient.nom}`,
                age: newPatient.age,
                gestationalAge: 'À renseigner',
                lastVisit: '',
                nextVisit: '',
                status: 'Normal',
                phone: newPatient.telephone,
                adresse: newPatient.adresse
            }
        ]);
    };

    return (
        <DashboardLayout title="Gestion des Patientes">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div className="w-full sm:w-auto flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    <SearchBar
                        placeholder="Rechercher une patiente..."
                        onSearch={handleSearch}
                        className="w-full sm:w-96"
                    />

                </div>

            </div>

            <div className="flex justify-end mb-4">
                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                    Ajouter une femme enceinte
                </Button>
            </div>
            <div className="bg-white rounded-lg shadow">
                <DataTable
                    columns={columns}
                    data={filteredPatients}
                    onRowClick={handleRowClick}
                    emptyMessage="Aucune patiente trouvée"
                />
            </div>
            <AddPregnantWomanModal
                open={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={handleAddPregnantWoman}
            />
        {/* Modal de détail patiente (mock) */}
        {selectedPatient && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
                    <button
                        className="absolute top-3 right-3 text-gray-500 hover:text-primary text-xl"
                        onClick={() => setSelectedPatient(null)}
                        aria-label="Fermer"
                    >
                        &times;
                    </button>
                    <h2 className="text-xl font-bold text-primary mb-2">Détail patiente</h2>
                    <div className="mb-2">
                        <span className="font-semibold">ID :</span> {selectedPatient.id}
                    </div>
                    <div className="mb-2">
                        <span className="font-semibold">Nom :</span> {selectedPatient.name}
                    </div>
                    <div className="mb-2">
                        <span className="font-semibold">Âge :</span> {selectedPatient.age} ans
                    </div>
                    <div className="mb-2">
                        <span className="font-semibold">Téléphone :</span> {selectedPatient.phone}
                    </div>
                    <div className="mb-2">
                        <span className="font-semibold">Statut :</span> <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{selectedPatient.status}</span>
                    </div>
                    <div className="mb-2">
                        <span className="font-semibold">Grossesse :</span> {selectedPatient.gestationalAge}
                    </div>
                    <div className="mb-2">
                        <span className="font-semibold">Dernière CPN :</span> {new Date(selectedPatient.lastVisit).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="mb-2">
                        <span className="font-semibold">Prochaine CPN :</span> {new Date(selectedPatient.nextVisit).toLocaleDateString('fr-FR')}
                    </div>
                </div>
            </div>
        )}
        </DashboardLayout>
    );
}
