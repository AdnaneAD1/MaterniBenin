"use client";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AddPregnantWomanModal from '@/components/AddPregnantWomanModal';
import { usePatiente } from '@/hooks/patientes';
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
  Plus,
  Users,
  Activity
} from 'lucide-react';

export default function PatientsPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingPatient, setEditingPatient] = useState(null);
    const [activeFilter, setActiveFilter] = useState('Toutes');
    const [currentPage, setCurrentPage] = useState(1);
    const [stats, setStats] = useState(null);
    const [refreshData, setRefreshData] = useState(0);
    const itemsPerPage = 3;
    
    const { getPatientsWithDetails, getPatientStats, addPatient, updatePatient, loading } = usePatiente();

    const [patients, setPatients] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // Load patients and stats
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const [patientsResult, statsResult] = await Promise.all([
                    getPatientsWithDetails(),
                    getPatientStats()
                ]);
                
                if (patientsResult.success && patientsResult.patients) {
                    const transformedPatients = patientsResult.patients.map(patient => ({
                        id: patient.patientId,
                        name: `${patient.prenom || ''} ${patient.nom || ''}`.trim(),
                        age: patient.age || 'N/A',
                        phone: patient.telephone || 'N/A',
                        adresse: patient.adresse || 'N/A',
                        nextVisit: patient.prochainRdv || 'Non planifié',
                        status: 'Normal', // Default status
                        gestationalAge: 'À renseigner',
                        lastVisit: '',
                        avatar: `${(patient.prenom || 'P').charAt(0)}${(patient.nom || 'P').charAt(0)}`,
                        color: getRandomColor(),
                        // Keep original data for editing
                        originalData: patient
                    }));
                    setPatients(transformedPatients);
                }
                
                if (statsResult.success) {
                    setStats(statsResult.stats);
                }
            } catch (error) {
                console.error('Erreur lors du chargement des données:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        loadData();
    }, [refreshData]); // Removed function dependencies to prevent infinite loop

    // Generate random color for avatar
    const getRandomColor = () => {
        const colors = [
            'bg-blue-100 text-blue-600',
            'bg-pink-100 text-pink-600',
            'bg-green-100 text-green-600',
            'bg-purple-100 text-purple-600',
            'bg-orange-100 text-orange-600',
            'bg-indigo-100 text-indigo-600',
            'bg-red-100 text-red-600',
            'bg-yellow-100 text-yellow-600'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    };
    
    // Use fallback data if no patients loaded
    const displayPatients = patients.length > 0 ? patients : [];

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
    const filteredPatients = displayPatients.filter(patient => {
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
    // Handle add patient
    const handleAddPatient = async (patientData) => {
        try {
            const result = await addPatient(patientData);
            if (result.success) {
                setRefreshData(prev => prev + 1); // Refresh data
                alert('Patiente ajoutée avec succès!');
            } else {
                throw new Error(result.error?.message || 'Erreur lors de l\'ajout');
            }
        } catch (error) {
            console.error('Erreur lors de l\'ajout:', error);
            throw error;
        }
    };

    // Handle edit patient
    const handleEditPatient = async (patientData) => {
        try {
            const result = await updatePatient(
                patientData.patientId,
                patientData.personneId,
                patientData
            );
            if (result.success) {
                setRefreshData(prev => prev + 1); // Refresh data
                setEditingPatient(null);
                alert('Patiente modifiée avec succès!');
            } else {
                throw new Error(result.error?.message || 'Erreur lors de la modification');
            }
        } catch (error) {
            console.error('Erreur lors de la modification:', error);
            throw error;
        }
    };

    // Handle edit button click
    const handleEditClick = (patient) => {
        if (patient.originalData) {
            setEditingPatient({
                ...patient.originalData,
                patientId: patient.originalData.patientId,
                personneId: patient.originalData.personneId
            });
            setShowAddModal(true);
        }
    };

    return (
        <DashboardLayout title="Gestion des Patientes">
            <div className="p-6 space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Total Patientes</p>
                                {isLoading ? (
                                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats?.totalPatients || displayPatients.length}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                                <Baby className="w-6 h-6 text-pink-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Grossesses actives</p>
                                {isLoading ? (
                                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats?.activePregnancies || '0'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-orange-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">RDV à venir</p>
                                {isLoading ? (
                                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats?.upcomingAppointments || '0'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <Activity className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">CPN ce mois</p>
                                {isLoading ? (
                                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats?.cpnThisMonth || '0'}
                                    </p>
                                )}
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
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            console.log('Edit clicked for patient:', patient);
                                            // Pass the original data with the correct field names for the modal
                                            const editData = {
                                                ...patient.originalData,
                                                patientId: patient.id,
                                                personneId: patient.originalData.personneId
                                            };
                                            setEditingPatient(editData);
                                        }}
                                        className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-50 transition-colors"
                                        title="Modifier la patiente"
                                    >
                                        <Edit className="w-4 h-4" />
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
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center text-sm">
                                    <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                                    <span className="text-gray-600">Prochaine CPN:</span>
                                    <span className="ml-2 font-medium text-blue-600">
                                        {patient.nextVisit && patient.nextVisit !== 'Non planifié' && patient.nextVisit !== 'null' && patient.nextVisit !== null
                                            ? new Date(patient.nextVisit).toLocaleDateString('fr-FR')
                                            : 'Aucun'
                                        }
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-4 flex">
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
                                {/* <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Handle edit
                                    }}
                                    className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <Edit className="w-4 h-4 mr-1" />
                                    Modifier
                                </button> */}
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
                {filteredPatients.length === 0 && !loading && (
                    <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Baby className="w-8 h-8 text-gray-400" />
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

                {/* Loading State */}
                {loading && (
                    <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Chargement des patientes...</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Patient Modal */}
            <AddPregnantWomanModal
                open={showAddModal || !!editingPatient}
                onClose={() => {
                    setShowAddModal(false);
                    setEditingPatient(null);
                }}
                onAdd={editingPatient ? handleEditPatient : handleAddPatient}
                editData={editingPatient}
                isEditing={!!editingPatient}
            />

            {/* Modal de détail patiente */}
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