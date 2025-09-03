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
    const itemsPerPage = 5;

    // Sample data for CPN
    const [cpnData, setCpnData] = useState([
        {
            id: 'CPN001',
            patientName: 'Afiavi HOUNSA',
            patientId: 'PT001',
            date: '2025-06-01',
            time: '09:30',
            gestationalAge: '24 semaines',
            visitNumber: 2,
            doctor: 'Sage-femme Lulla Devi',
            status: 'Terminé',
            type: 'CPN - 2ème trimestre',
            avatar: 'AH',
            color: 'bg-blue-100 text-blue-600',
            notes: 'Consultation normale, développement satisfaisant'
        },
        {
            id: 'CPN002',
            patientName: 'Blandine AGOSSOU',
            patientId: 'PT002',
            date: '2025-06-05',
            time: '10:15',
            gestationalAge: '12 semaines',
            visitNumber: 1,
            doctor: 'Sage-femme Lulla Devi',
            status: 'Terminé',
            type: 'CPN - 1er trimestre',
            avatar: 'BA',
            color: 'bg-pink-100 text-pink-600',
            notes: 'Première consultation, examens de routine effectués'
        },
        {
            id: 'CPN003',
            patientName: 'Edwige DANSOU',
            patientId: 'PT005',
            date: '2025-06-14',
            time: '14:00',
            gestationalAge: '18 semaines',
            visitNumber: 1,
            doctor: 'Sage-femme Lulla Devi',
            status: 'Terminé',
            type: 'CPN - 2ème trimestre',
            avatar: 'ED',
            color: 'bg-orange-100 text-orange-600',
            notes: 'Échographie morphologique programmée'
        },
        {
            id: 'CPN004',
            patientName: 'Danielle LOKONON',
            patientId: 'PT004',
            date: '2025-06-23',
            time: '11:30',
            gestationalAge: '34 semaines',
            visitNumber: 3,
            doctor: 'Sage-femme Lulla Devi',
            status: 'Planifié',
            type: 'CPN - 3ème trimestre',
            avatar: 'DL',
            color: 'bg-purple-100 text-purple-600',
            notes: 'Suivi grossesse à risque'
        },
        {
            id: 'CPN005',
            patientName: 'Colette BOCOVO',
            patientId: 'PT003',
            date: '2025-06-22',
            time: '15:45',
            gestationalAge: 'Post-partum',
            visitNumber: 1,
            doctor: 'Sage-femme Lulla Devi',
            status: 'Planifié',
            type: 'Suivi post-accouchement',
            avatar: 'CB',
            color: 'bg-green-100 text-green-600',
            notes: 'Contrôle post-natal'
        },
        {
            id: 'CPN006',
            patientName: 'Estelle KOUDJO',
            patientId: 'PT006',
            date: '2025-06-24',
            time: '16:30',
            gestationalAge: '28 semaines',
            visitNumber: 2,
            doctor: 'Sage-femme Lulla Devi',
            status: 'En attente',
            type: 'CPN - 3ème trimestre',
            avatar: 'EK',
            color: 'bg-indigo-100 text-indigo-600',
            notes: 'Confirmation rendez-vous en attente'
        },
        {
            id: 'CPN007',
            patientName: 'Fatima ALASSANE',
            patientId: 'PT007',
            date: '2025-06-25',
            time: '08:00',
            gestationalAge: '16 semaines',
            visitNumber: 1,
            doctor: 'Sage-femme Lulla Devi',
            status: 'Planifié',
            type: 'CPN - 2ème trimestre',
            avatar: 'FA',
            color: 'bg-teal-100 text-teal-600',
            notes: 'Première consultation prénatale'
        },
        {
            id: 'CPN008',
            patientName: 'Grace MENSAH',
            patientId: 'PT008',
            date: '2025-06-26',
            time: '13:15',
            gestationalAge: '30 semaines',
            visitNumber: 3,
            doctor: 'Sage-femme Lulla Devi',
            status: 'En attente',
            type: 'CPN - 3ème trimestre',
            avatar: 'GM',
            color: 'bg-rose-100 text-rose-600',
            notes: 'Suivi de grossesse gémellaire'
        }
    ]);

    const filters = ['Toutes', 'Terminé', 'Planifié', 'En attente', 'Annulé'];

    const getStatusBadge = (status) => {
        const statusConfig = {
            'Terminé': 'bg-green-100 text-green-800',
            'Planifié': 'bg-blue-100 text-blue-800',
            'En attente': 'bg-yellow-100 text-yellow-800',
            'Annulé': 'bg-red-100 text-red-800'
        };
        return statusConfig[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'Terminé': return <CheckCircle className="w-4 h-4" />;
            case 'Planifié': return <Calendar className="w-4 h-4" />;
            case 'En attente': return <Clock className="w-4 h-4" />;
            case 'Annulé': return <XCircle className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    // Filter the CPN data based on search term and active filter
    const filteredCpn = cpnData.filter(cpn => {
        const matchesSearch = cpn.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            cpn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            cpn.type.toLowerCase().includes(searchTerm.toLowerCase());
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
                                <p className="text-2xl font-bold text-gray-900">{cpnData.length}</p>
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
                                    {cpnData.filter(c => c.status === 'Terminé').length}
                                </p>
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
                                <p className="text-2xl font-bold text-gray-900">
                                    {cpnData.filter(c => c.status === 'Planifié').length}
                                </p>
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
                                <p className="text-2xl font-bold text-gray-900">
                                    {cpnData.filter(c => c.status === 'En attente').length}
                                </p>
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
                    
                    <div className="flex gap-3">
                        <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                            <Download className="w-5 h-5 mr-2" />
                            Exporter
                        </button>
                        <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                            <Plus className="w-5 h-5 mr-2" />
                            Nouvelle CPN
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
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${cpn.color}`}>
                                                    {cpn.avatar}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{cpn.patientName}</div>
                                                    <div className="text-sm text-gray-500">ID: {cpn.patientId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{cpn.type}</div>
                                            <div className="text-sm text-gray-500">{cpn.doctor}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {new Date(cpn.date).toLocaleDateString('fr-FR')}
                                            </div>
                                            <div className="text-sm text-gray-500">{cpn.time}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{cpn.visitNumber}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{cpn.gestationalAge}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(cpn.status)}`}>
                                                {getStatusIcon(cpn.status)}
                                                <span className="ml-1">{cpn.status}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-50 transition-colors">
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
                        <button className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                            <Plus className="w-5 h-5 mr-2" />
                            Nouvelle CPN
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
