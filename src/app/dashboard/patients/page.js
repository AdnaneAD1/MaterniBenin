"use client";
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  UserPlus, 
  Phone, 
  MapPin,
  Calendar,
  Baby,
  Heart,
  AlertCircle,
  MoreVertical,
  Plus
} from 'lucide-react';

export default function PatientsPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeFilter, setActiveFilter] = useState('Toutes');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

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
            adresse: 'Cotonou, Zogbo',
            avatar: 'AH',
            color: 'bg-blue-100 text-blue-600'
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
            adresse: 'Porto-Novo, Ouando',
            avatar: 'BA',
            color: 'bg-pink-100 text-pink-600'
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
            adresse: 'Abomey-Calavi, Tankpè',
            avatar: 'CB',
            color: 'bg-green-100 text-green-600'
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
            adresse: 'Cotonou, Fidjrossè',
            avatar: 'DL',
            color: 'bg-purple-100 text-purple-600'
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
            adresse: 'Ouidah, Centre-ville',
            avatar: 'ED',
            color: 'bg-orange-100 text-orange-600'
        }
    ]);

    const filters = ['Toutes', 'Normal', 'À surveiller', 'À risque', 'Post-partum'];

    const getStatusBadge = (status) => {
        const statusConfig = {
            'Normal': 'bg-green-100 text-green-800',
            'À surveiller': 'bg-yellow-100 text-yellow-800',
            'À risque': 'bg-red-100 text-red-800',
            'Post-partum': 'bg-blue-100 text-blue-800'
        };
        return statusConfig[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'Normal': return <Heart className="w-4 h-4" />;
            case 'À surveiller': return <AlertCircle className="w-4 h-4" />;
            case 'À risque': return <AlertCircle className="w-4 h-4" />;
            case 'Post-partum': return <Baby className="w-4 h-4" />;
            default: return <Heart className="w-4 h-4" />;
        }
    };

    // Filter the patients based on search term and active filter
    const filteredPatients = patients.filter(patient => {
        const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            patient.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === 'Toutes' || patient.status === activeFilter;
        return matchesSearch && matchesFilter;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedPatients = filteredPatients.slice(startIndex, startIndex + itemsPerPage);

    // Reset to first page when filters change
    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
        setCurrentPage(1);
    };

    const handleSearchChange = (term) => {
        setSearchTerm(term);
        setCurrentPage(1);
    };
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
                adresse: newPatient.adresse,
                avatar: `${newPatient.prenom.charAt(0)}${newPatient.nom.charAt(0)}`,
                color: 'bg-gray-100 text-gray-600'
            }
        ]);
    };

    return (
        <DashboardLayout title="Gestion des Patientes">
            <div className="p-6 space-y-6">
                {/* Statistics Cards - Moved to top */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <UserPlus className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Total Patientes</p>
                                <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <Heart className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Statut Normal</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {patients.filter(p => p.status === 'Normal').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">À Surveiller</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {patients.filter(p => p.status === 'À surveiller').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">À Risque</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {patients.filter(p => p.status === 'À risque').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gestion des Patientes</h1>
                        <p className="text-gray-500 mt-1">Gérez et suivez vos patientes enceintes</p>
                    </div>
                    
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Ajouter une patiente
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search Bar */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher une patiente..."
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex flex-wrap gap-2">
                            {filters.map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => handleFilterChange(filter)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        activeFilter === filter
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Patients Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedPatients.map((patient) => (
                        <div
                            key={patient.id}
                            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => router.push(`/dashboard/patients/${patient.id}`)}
                        >
                            {/* Patient Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium ${patient.color}`}>
                                        {patient.avatar}
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                                        <p className="text-sm text-gray-500">ID: {patient.id}</p>
                                    </div>
                                </div>
                                
                                <div className="relative">
                                    <button className="p-1 text-gray-400 hover:text-gray-600">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Patient Info */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Âge</span>
                                    <span className="text-sm font-medium">{patient.age} ans</span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Grossesse</span>
                                    <span className="text-sm font-medium">{patient.gestationalAge}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Statut</span>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(patient.status)}`}>
                                        {getStatusIcon(patient.status)}
                                        <span className="ml-1">{patient.status}</span>
                                    </span>
                                </div>

                                <div className="flex items-center text-sm text-gray-600">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    <span>{patient.adresse}</span>
                                </div>

                                <div className="flex items-center text-sm text-gray-600">
                                    <Phone className="w-4 h-4 mr-2" />
                                    <span>{patient.phone}</span>
                                </div>
                            </div>

                            {/* Next Appointment */}
                            {patient.nextVisit && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="flex items-center text-sm">
                                        <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                                        <span className="text-gray-600">Prochaine CPN:</span>
                                        <span className="ml-2 font-medium text-blue-600">
                                            {new Date(patient.nextVisit).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="mt-4 flex gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/dashboard/patients/${patient.id}`);
                                    }}
                                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Voir
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Handle edit
                                    }}
                                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <Edit className="w-4 h-4 mr-1" />
                                    Modifier
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-600">
                            Affichage de {startIndex + 1} à {Math.min(startIndex + itemsPerPage, filteredPatients.length)} sur {filteredPatients.length} patientes
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Précédent
                            </button>
                            
                            <div className="flex space-x-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                                            currentPage === page
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Suivant
                            </button>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {filteredPatients.length === 0 && (
                    <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UserPlus className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune patiente trouvée</h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm ? 'Aucune patiente ne correspond à votre recherche.' : 'Commencez par ajouter votre première patiente.'}
                        </p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Ajouter une patiente
                        </button>
                    </div>
                )}
            </div>

            {/* Modal de détail patiente (mock) */}
            {selectedPatient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
                        <button
                            className="absolute top-3 right-3 text-gray-500 hover:text-blue-600 text-xl"
                            onClick={() => setSelectedPatient(null)}
                            aria-label="Fermer"
                        >
                            &times;
                        </button>
                        <h2 className="text-xl font-bold text-blue-600 mb-4">Détail patiente</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="font-semibold text-gray-700">ID :</span>
                                <span>{selectedPatient.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-gray-700">Nom :</span>
                                <span>{selectedPatient.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-gray-700">Âge :</span>
                                <span>{selectedPatient.age} ans</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-gray-700">Téléphone :</span>
                                <span>{selectedPatient.phone}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-700">Statut :</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedPatient.status)}`}>
                                    {selectedPatient.status}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold text-gray-700">Grossesse :</span>
                                <span>{selectedPatient.gestationalAge}</span>
                            </div>
                            {selectedPatient.lastVisit && (
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-700">Dernière CPN :</span>
                                    <span>{new Date(selectedPatient.lastVisit).toLocaleDateString('fr-FR')}</span>
                                </div>
                            )}
                            {selectedPatient.nextVisit && (
                                <div className="flex justify-between">
                                    <span className="font-semibold text-gray-700">Prochaine CPN :</span>
                                    <span>{new Date(selectedPatient.nextVisit).toLocaleDateString('fr-FR')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}