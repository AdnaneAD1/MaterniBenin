"use client";

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Calendar,
  Clock,
  User,
  Heart,
  Plus,
  Download,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  XCircle,
  Users,
  Activity,
  Shield
} from 'lucide-react';

export default function PlanificationPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('Toutes');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Sample data for planification familiale
    const [planificationData, setPlanificationData] = useState([
        {
            id: 'PF001',
            patientName: 'Awa YACOUBOU',
            patientId: 'PT001',
            age: 27,
            method: 'Implant',
            date: '2025-06-15',
            time: '09:30',
            status: 'En cours',
            nextVisit: '2025-09-15',
            avatar: 'AY',
            color: 'bg-purple-100 text-purple-600',
            doctor: 'Sage-femme Lulla Devi',
            notes: 'Pose d\'implant contraceptif'
        },
        {
            id: 'PF002',
            patientName: 'Bénédicte KOFFI',
            patientId: 'PT002',
            age: 32,
            method: 'Pilule',
            date: '2025-06-10',
            time: '14:15',
            status: 'Terminé',
            nextVisit: '2025-09-10',
            avatar: 'BK',
            color: 'bg-pink-100 text-pink-600',
            doctor: 'Sage-femme Lulla Devi',
            notes: 'Prescription pilule contraceptive'
        },
        {
            id: 'PF003',
            patientName: 'Célestine ADJOVI',
            patientId: 'PT003',
            age: 24,
            method: 'Injectable',
            date: '2025-06-01',
            time: '11:00',
            status: 'Terminé',
            nextVisit: '2025-09-01',
            avatar: 'CA',
            color: 'bg-rose-100 text-rose-600',
            doctor: 'Sage-femme Lulla Devi',
            notes: 'Injection contraceptive trimestrielle'
        },
        {
            id: 'PF004',
            patientName: 'Diane SOGLO',
            patientId: 'PT004',
            age: 29,
            method: 'DIU',
            date: '2025-06-20',
            time: '10:30',
            status: 'Planifié',
            nextVisit: '2025-07-20',
            avatar: 'DS',
            color: 'bg-indigo-100 text-indigo-600',
            doctor: 'Sage-femme Lulla Devi',
            notes: 'Pose de dispositif intra-utérin'
        },
        {
            id: 'PF005',
            patientName: 'Estelle HOUNGBO',
            patientId: 'PT005',
            age: 26,
            method: 'Préservatif',
            date: '2025-06-18',
            time: '15:45',
            status: 'En cours',
            nextVisit: '2025-12-18',
            avatar: 'EH',
            color: 'bg-teal-100 text-teal-600',
            doctor: 'Sage-femme Lulla Devi',
            notes: 'Conseil et distribution préservatifs'
        },
        {
            id: 'PF006',
            patientName: 'Fatou IBRAHIM',
            patientId: 'PT006',
            age: 35,
            method: 'Stérilisation',
            date: '2025-06-25',
            time: '08:00',
            status: 'Planifié',
            nextVisit: '2025-07-25',
            avatar: 'FI',
            color: 'bg-orange-100 text-orange-600',
            doctor: 'Sage-femme Lulla Devi',
            notes: 'Consultation pré-stérilisation'
        }
    ]);

    const filters = ['Toutes', 'En cours', 'Terminé', 'Planifié', 'Annulé'];

    const getStatusBadge = (status) => {
        const statusConfig = {
            'En cours': 'bg-blue-100 text-blue-800',
            'Terminé': 'bg-green-100 text-green-800',
            'Planifié': 'bg-purple-100 text-purple-800',
            'Annulé': 'bg-red-100 text-red-800'
        };
        return statusConfig[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'En cours': return <Activity className="w-4 h-4" />;
            case 'Terminé': return <CheckCircle className="w-4 h-4" />;
            case 'Planifié': return <Calendar className="w-4 h-4" />;
            case 'Annulé': return <XCircle className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    const getMethodBadge = (method) => {
        const methodConfig = {
            'Implant': 'bg-purple-100 text-purple-800',
            'Pilule': 'bg-pink-100 text-pink-800',
            'Injectable': 'bg-blue-100 text-blue-800',
            'DIU': 'bg-green-100 text-green-800',
            'Préservatif': 'bg-orange-100 text-orange-800',
            'Stérilisation': 'bg-red-100 text-red-800'
        };
        return methodConfig[method] || 'bg-gray-100 text-gray-800';
    };

    // Filter the planification data based on search term and active filter
    const filteredPlanification = planificationData.filter(pf => {
        const matchesSearch = pf.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            pf.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            pf.method.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === 'Toutes' || pf.status === activeFilter;
        return matchesSearch && matchesFilter;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredPlanification.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedPlanification = filteredPlanification.slice(startIndex, startIndex + itemsPerPage);

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
        <DashboardLayout title="Planification Familiale">
            <div className="p-6 space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <Shield className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Total Planifications</p>
                                <p className="text-2xl font-bold text-gray-900">{planificationData.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Activity className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">En Cours</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {planificationData.filter(p => p.status === 'En cours').length}
                                </p>
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
                                <p className="text-2xl font-bold text-gray-900">
                                    {planificationData.filter(p => p.status === 'Terminé').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Planifiées</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {planificationData.filter(p => p.status === 'Planifié').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Planification Familiale</h1>
                        <p className="text-gray-500 mt-1">Gérez et suivez toutes les consultations de planification familiale</p>
                    </div>
                    
                    <div className="flex gap-3">
                        <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                            <Download className="w-5 h-5 mr-2" />
                            Exporter
                        </button>
                        <button className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                            <Plus className="w-5 h-5 mr-2" />
                            Nouvelle Planification
                        </button>
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
                                placeholder="Rechercher une planification..."
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                                            ? 'bg-purple-500 text-white'
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
                                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-900 bg-gradient-to-r from-pink-50 to-purple-50 border-b-2 border-pink-200">
                                        Patiente
                                    </th>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-900 bg-gradient-to-r from-pink-50 to-purple-50 border-b-2 border-pink-200">
                                        Âge
                                    </th>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-900 bg-gradient-to-r from-pink-50 to-purple-50 border-b-2 border-pink-200">
                                        Méthode
                                    </th>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-900 bg-gradient-to-r from-pink-50 to-purple-50 border-b-2 border-pink-200">
                                        Date & Heure
                                    </th>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-900 bg-gradient-to-r from-pink-50 to-purple-50 border-b-2 border-pink-200">
                                        Statut
                                    </th>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-900 bg-gradient-to-r from-pink-50 to-purple-50 border-b-2 border-pink-200">
                                        Prochaine Visite
                                    </th>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-900 bg-gradient-to-r from-pink-50 to-purple-50 border-b-2 border-pink-200">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedPlanification.map((pf, index) => (
                                    <tr key={pf.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${pf.color}`}>
                                                    {pf.avatar}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{pf.patientName}</div>
                                                    <div className="text-sm text-gray-500">ID: {pf.patientId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{pf.age} ans</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodBadge(pf.method)}`}>
                                                <Shield className="w-3 h-3 mr-1" />
                                                {pf.method}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {new Date(pf.date).toLocaleDateString('fr-FR')}
                                            </div>
                                            <div className="text-sm text-gray-500">{pf.time}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(pf.status)}`}>
                                                {getStatusIcon(pf.status)}
                                                <span className="ml-1">{pf.status}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {new Date(pf.nextVisit).toLocaleDateString('fr-FR')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button className="text-purple-600 hover:text-purple-900 p-1 rounded-lg hover:bg-purple-50 transition-colors">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="text-gray-600 hover:text-gray-900 p-1 rounded-lg hover:bg-gray-50 transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 transition-colors">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600 font-medium">
                                Affichage de {startIndex + 1} à {Math.min(startIndex + itemsPerPage, filteredPlanification.length)} sur {filteredPlanification.length} planifications
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
                                                        ? 'bg-purple-500 text-white border-purple-500'
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
                {filteredPlanification.length === 0 && (
                    <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune planification trouvée</h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm ? 'Aucune planification ne correspond à votre recherche.' : 'Commencez par ajouter votre première planification familiale.'}
                        </p>
                        <button className="inline-flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
                            <Plus className="w-5 h-5 mr-2" />
                            Nouvelle Planification
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}