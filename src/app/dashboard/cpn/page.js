"use client";

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { usePatiente } from '@/hooks/patientes';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Calendar,
  Clock,
  User,
  Stethoscope,
  Plus,
  Download,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  XCircle,
  Baby,
  Heart
} from 'lucide-react';

export default function CPNPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('Toutes');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCpn, setSelectedCpn] = useState(null);
    const itemsPerPage = 5;

    const { getCpnConsultations, getCpnStats, loading } = usePatiente();
    const [cpnData, setCpnData] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Load CPN data and stats
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const [cpnResult, statsResult] = await Promise.all([
                    getCpnConsultations(),
                    getCpnStats()
                ]);
                
                if (cpnResult.success && cpnResult.cpnConsultations) {
                    const transformedCpn = cpnResult.cpnConsultations.map(cpn => ({
                        id: cpn.id,
                        patientName: `${cpn.patient.prenom || ''} ${cpn.patient.nom || ''}`.trim(),
                        patientId: cpn.patient.patientId,
                        date: cpn.dateConsultation,
                        visitNumber: cpn.visitNumber,
                        gestationalAge: cpn.ageGestationnel,
                        status: cpn.status,
                        diagnostique: cpn.diagnostique,
                        rdv: cpn.rdv,
                        userId: cpn.userId,
                        moisGrossesse: cpn.ageGestationnel,
                        patient: cpn.patient,
                        avatar: `${(cpn.patient.prenom || 'P').charAt(0)}${(cpn.patient.nom || 'P').charAt(0)}`,
                        color: getRandomColor(),
                        // Nouveaux champs pour les CPN virtuelles
                        isVirtual: cpn.isVirtual || false,
                        cpnLabel: cpn.cpnLabel || null,
                        scheduledWeeks: cpn.scheduledWeeks || null,
                        currentWeeks: cpn.currentWeeks || null,
                        grossesseId: cpn.grossesseId
                    }));
                    setCpnData(transformedCpn);
                }
                
                if (statsResult.success) {
                    setStats(statsResult.stats);
                }
            } catch (error) {
                console.error('Erreur lors du chargement des données CPN:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        loadData();
    }, []);

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


    // Use real data if available, otherwise fallback
    const displayCpnData = cpnData.length > 0 ? cpnData : [];

    const filters = ['Toutes', 'Terminé', 'Planifié', 'En attente', 'En retard'];

    const getStatusBadge = (status) => {
        const statusConfig = {
            'Terminé': 'bg-green-100 text-green-800',
            'Planifié': 'bg-blue-100 text-blue-800',
            'En attente': 'bg-yellow-100 text-yellow-800',
            'En retard': 'bg-red-100 text-red-800',
            'Annulé': 'bg-gray-100 text-gray-800'
        };
        return statusConfig[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'Terminé': return <CheckCircle className="w-4 h-4" />;
            case 'Planifié': return <Calendar className="w-4 h-4" />;
            case 'En attente': return <Clock className="w-4 h-4" />;
            case 'En retard': return <AlertCircle className="w-4 h-4" />;
            case 'Annulé': return <XCircle className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    // Filter the CPN data based on search term and active filter
    const filteredCpn = displayCpnData.filter(cpn => {
        const matchesSearch = cpn.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            cpn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (cpn.type && cpn.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (cpn.diagnostique && cpn.diagnostique.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesFilter = activeFilter === 'Toutes' || cpn.status === activeFilter;
        return matchesSearch && matchesFilter;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredCpn.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedCpn = filteredCpn.slice(startIndex, startIndex + itemsPerPage);

    // Reset to first page when filters change
    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
        setCurrentPage(1);
    };

    const handleSearchChange = (term) => {
        setSearchTerm(term);
        setCurrentPage(1);
    };

    return (
        <DashboardLayout title="Consultations Prénatales">
            <div className="p-6 space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Stethoscope className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Total CPN</p>
                                {isLoading ? (
                                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900">{stats?.totalCpnConsultations || displayCpnData.length}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Terminées</p>
                                {isLoading ? (
                                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats?.completedCpns || displayCpnData.filter(c => c.status === 'Terminé').length}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Planifiées</p>
                                {isLoading ? (
                                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats?.plannedCpns || displayCpnData.filter(c => c.status === 'Planifié').length}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                <Clock className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">En Attente</p>
                                {isLoading ? (
                                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats?.pendingCpns || displayCpnData.filter(c => c.status === 'En attente').length}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Consultations Prénatales</h1>
                        <p className="text-gray-500 mt-1">Gérez et suivez toutes les consultations CPN</p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search Bar */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher une consultation..."
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

                {/* Modern Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-900 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                                        Patiente
                                    </th>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-900 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                                        Type de consultation
                                    </th>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-900 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                                        Date & Heure
                                    </th>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-900 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                                        Visite N°
                                    </th>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-900 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                                        Âge gestationnel
                                    </th>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-900 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                                        Statut
                                    </th>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-900 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedCpn.map((cpn, index) => (
                                    <tr key={cpn.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                        <User className="h-5 w-5 text-indigo-600" />
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {cpn.patientName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {cpn.patientInfo?.telephone && (
                                                            <div>Tél: {cpn.patientInfo.telephone}</div>
                                                        )}
                                                        {cpn.patientInfo?.age && (
                                                            <div>Âge: {cpn.patientInfo.age} ans</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                <div className="text-sm text-gray-900">
                                                    {cpn.visitNumber || 'CPN'}
                                                </div>
                                                {cpn.isVirtual && (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                        Virtuelle
                                                    </span>
                                                )}
                                            </div>
                                            {cpn.scheduledWeeks && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Semaines {cpn.scheduledWeeks}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {(() => {
                                                    // Pour les CPN terminées (non virtuelles), afficher dateConsultation
                                                    // Pour les CPN virtuelles, afficher rdv
                                                    const dateToDisplay = cpn.isVirtual ? cpn.rdv : cpn.date;
                                                    
                                                    if (!dateToDisplay) {
                                                        return 'Non définie';
                                                    }
                                                    
                                                    try {
                                                        // Gérer les dates Firestore (avec toDate) et les dates normales
                                                        const dateObj = dateToDisplay.toDate ? dateToDisplay.toDate() : new Date(dateToDisplay);
                                                        const dateStr = dateObj.toLocaleDateString('fr-FR');
                                                        const timeStr = dateObj.toLocaleTimeString('fr-FR', { 
                                                            hour: '2-digit', 
                                                            minute: '2-digit' 
                                                        });
                                                        return `${dateStr} à ${timeStr}`;
                                                    } catch (error) {
                                                        return 'Date invalide';
                                                    }
                                                })()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{cpn.visitNumber || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{cpn.moisGrossesse || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(cpn.status)}`}>
                                                {getStatusIcon(cpn.status)}
                                                <span className="ml-1">{cpn.status}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button 
                                                    onClick={() => setSelectedCpn(cpn)}
                                                    className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-50 transition-colors"
                                                    title="Voir les détails"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600 font-medium">
                                Affichage de {startIndex + 1} à {Math.min(startIndex + itemsPerPage, filteredCpn.length)} sur {filteredCpn.length} consultations
                            </div>
                            {totalPages > 1 && (
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 text-sm bg-white text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-200 font-medium shadow-sm"
                                    >
                                        Précédent
                                    </button>
                                    
                                    <div className="flex space-x-1">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`px-4 py-2 text-sm rounded-lg transition-colors border font-medium shadow-sm ${
                                                    currentPage === page
                                                        ? 'bg-blue-500 text-white border-blue-500'
                                                        : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-200'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                    
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 text-sm bg-white text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-200 font-medium shadow-sm"
                                    >
                                        Suivant
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Empty State */}
                {filteredCpn.length === 0 && (
                    <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Stethoscope className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune consultation trouvée</h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm ? 'Aucune consultation ne correspond à votre recherche.' : 'Commencez par planifier votre première consultation.'}
                        </p>
                    </div>
                )}

                {/* CPN Details Modal */}
                {selectedCpn && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
                            <button
                                className="absolute top-3 right-3 text-gray-500 hover:text-blue-600 text-xl"
                                onClick={() => setSelectedCpn(null)}
                                aria-label="Fermer"
                            >
                                &times;
                            </button>
                            <h2 className="text-xl font-bold text-blue-600 mb-6">Détails de la consultation CPN</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Patient Information */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-800 border-b pb-2">Informations Patiente</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium ${selectedCpn.color}`}>
                                                {selectedCpn.avatar}
                                            </div>
                                            <div className="ml-3">
                                                <div className="font-medium text-gray-900">{selectedCpn.patientName}</div>
                                                <div className="text-sm text-gray-500">ID: {selectedCpn.patientId}</div>
                                            </div>
                                        </div>
                                        {selectedCpn.patientInfo && (
                                            <>
                                                {selectedCpn.patientInfo.age && (
                                                    <div className="flex justify-between">
                                                        <span className="font-medium text-gray-700">Âge :</span>
                                                        <span>{selectedCpn.patientInfo.age} ans</span>
                                                    </div>
                                                )}
                                                {selectedCpn.patientInfo.telephone && (
                                                    <div className="flex justify-between">
                                                        <span className="font-medium text-gray-700">Téléphone :</span>
                                                        <span>{selectedCpn.patientInfo.telephone}</span>
                                                    </div>
                                                )}
                                                {selectedCpn.patientInfo.adresse && (
                                                    <div className="flex justify-between">
                                                        <span className="font-medium text-gray-700">Adresse :</span>
                                                        <span>{selectedCpn.patientInfo.adresse}</span>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Consultation Information */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-800 border-b pb-2">Informations Consultation</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-700">ID Consultation :</span>
                                            <span>{selectedCpn.id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-700">{selectedCpn.isVirtual ? 'Date RDV :' : 'Date consultation :'}</span>
                                            <span>{(() => {
                                                const dateToDisplay = selectedCpn.isVirtual ? selectedCpn.rdv : selectedCpn.date;
                                                if (!dateToDisplay) return 'Non définie';
                                                try {
                                                    const dateObj = dateToDisplay.toDate ? dateToDisplay.toDate() : new Date(dateToDisplay);
                                                    return dateObj.toLocaleDateString('fr-FR') + ' à ' + dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                                                } catch (error) {
                                                    return 'Date invalide';
                                                }
                                            })()}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-gray-700">Statut :</span>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedCpn.status)}`}>
                                                {getStatusIcon(selectedCpn.status)}
                                                <span className="ml-1">{selectedCpn.status}</span>
                                            </span>
                                        </div>
                                        {selectedCpn.visitNumber && (
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-700">Numéro de visite :</span>
                                                <span>{selectedCpn.visitNumber}</span>
                                            </div>
                                        )}
                                        {selectedCpn.moisGrossesse && (
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-700">Âge gestationnel :</span>
                                                <span>{selectedCpn.moisGrossesse}</span>
                                            </div>
                                        )}
                                        {selectedCpn.diagnostique && (
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-700">Diagnostic :</span>
                                                <span>{selectedCpn.diagnostique}</span>
                                            </div>
                                        )}
                                        {selectedCpn.traitement && (
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-700">Traitement :</span>
                                                <span>{selectedCpn.traitement}</span>
                                            </div>
                                        )}
                                        {selectedCpn.observations && (
                                            <div className="flex justify-between">
                                                <span className="font-medium text-gray-700">Observations :</span>
                                                <span>{selectedCpn.observations}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {selectedCpn.diagnostique && (
                                <div className="mt-6">
                                    <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">Diagnostic</h3>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-gray-700">{selectedCpn.diagnostique}</p>
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
                            {selectedCpn.notes && (
                                <div className="mt-6">
                                    <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">Notes</h3>
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="text-gray-700">{selectedCpn.notes}</p>
                                    </div>
                                </div>
                            )}

                            {/* Date de consultation */}
                            {selectedCpn.dateConsultation && (
                                <div className="mt-6">
                                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                        <span className="font-medium text-gray-700">Date de consultation effectuée :</span>
                                        <span className="text-green-600 font-medium">
                                            {new Date(selectedCpn.dateConsultation.seconds * 1000).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
