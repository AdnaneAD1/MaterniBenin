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
  Baby,
  Plus,
  Download,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  XCircle,
  Heart,
  Activity,
  Users,
  TrendingUp
} from 'lucide-react';

export default function AccouchementPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('Tous');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Sample data for accouchements
    const [accouchementData, setAccouchementData] = useState([
        {
            id: 'ACC001',
            patientName: 'Colette BOCOVO',
            patientId: 'PT003',
            date: '2025-06-10',
            time: '08:45',
            gender: 'F',
            weight: '3.2',
            type: 'Voie basse',
            outcome: 'Vivant',
            complications: 'Aucune',
            avatar: 'CB',
            color: 'bg-green-100 text-green-600',
            doctor: 'Sage-femme Lulla Devi'
        },
        {
            id: 'ACC002',
            patientName: 'Francine YEHOUESSI',
            patientId: 'PT006',
            date: '2025-06-08',
            time: '14:30',
            gender: 'M',
            weight: '3.5',
            type: 'Voie basse',
            outcome: 'Vivant',
            complications: 'Aucune',
            avatar: 'FY',
            color: 'bg-blue-100 text-blue-600',
            doctor: 'Sage-femme Lulla Devi'
        },
        {
            id: 'ACC003',
            patientName: 'Gisèle AKPLOGAN',
            patientId: 'PT007',
            date: '2025-06-05',
            time: '23:15',
            gender: 'F',
            weight: '2.9',
            type: 'Césarienne',
            outcome: 'Vivant',
            complications: 'Prééclampsie',
            avatar: 'GA',
            color: 'bg-orange-100 text-orange-600',
            doctor: 'Sage-femme Lulla Devi'
        },
        {
            id: 'ACC004',
            patientName: 'Huguette TOGBADJA',
            patientId: 'PT008',
            date: '2025-06-02',
            time: '10:20',
            gender: 'M',
            weight: '3.1',
            type: 'Voie basse',
            outcome: 'Vivant',
            complications: 'Aucune',
            avatar: 'HT',
            color: 'bg-purple-100 text-purple-600',
            doctor: 'Sage-femme Lulla Devi'
        },
        {
            id: 'ACC005',
            patientName: 'Irène DOSSOU',
            patientId: 'PT009',
            date: '2025-06-01',
            time: '16:45',
            gender: 'F',
            weight: '3.4',
            type: 'Voie basse',
            outcome: 'Vivant',
            complications: 'Aucune',
            avatar: 'ID',
            color: 'bg-pink-100 text-pink-600',
            doctor: 'Sage-femme Lulla Devi'
        },
        {
            id: 'ACC006',
            patientName: 'Joséphine KPOHINTO',
            patientId: 'PT010',
            date: '2025-05-30',
            time: '12:30',
            gender: 'M',
            weight: '3.0',
            type: 'Césarienne',
            outcome: 'Vivant',
            complications: 'Détresse fœtale',
            avatar: 'JK',
            color: 'bg-indigo-100 text-indigo-600',
            doctor: 'Sage-femme Lulla Devi'
        }
    ]);

    const filters = ['Tous', 'Voie basse', 'Césarienne', 'Avec complications', 'Sans complications'];

    const getTypeBadge = (type) => {
        const typeConfig = {
            'Voie basse': 'bg-green-100 text-green-800',
            'Césarienne': 'bg-orange-100 text-orange-800'
        };
        return typeConfig[type] || 'bg-gray-100 text-gray-800';
    };

    const getTypeIcon = (type) => {
        switch(type) {
            case 'Voie basse': return <Heart className="w-4 h-4" />;
            case 'Césarienne': return <Activity className="w-4 h-4" />;
            default: return <Baby className="w-4 h-4" />;
        }
    };

    const getGenderIcon = (gender) => {
        return gender === 'M' ? '👶🏽' : '👶🏽';
    };

    const getComplicationsBadge = (complications) => {
        return complications === 'Aucune' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800';
    };

    // Filter the accouchement data based on search term and active filter
    const filteredAccouchements = accouchementData.filter(acc => {
        const matchesSearch = acc.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            acc.id.toLowerCase().includes(searchTerm.toLowerCase());
        
        let matchesFilter = true;
        if (activeFilter === 'Voie basse') matchesFilter = acc.type === 'Voie basse';
        else if (activeFilter === 'Césarienne') matchesFilter = acc.type === 'Césarienne';
        else if (activeFilter === 'Avec complications') matchesFilter = acc.complications !== 'Aucune';
        else if (activeFilter === 'Sans complications') matchesFilter = acc.complications === 'Aucune';
        
        return matchesSearch && matchesFilter;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredAccouchements.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedAccouchements = filteredAccouchements.slice(startIndex, startIndex + itemsPerPage);

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
        <DashboardLayout title="Gestion des Accouchements">
            <div className="p-6 space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Baby className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Total Accouchements</p>
                                <p className="text-2xl font-bold text-gray-900">{accouchementData.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <Heart className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Voie Basse</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {accouchementData.filter(a => a.type === 'Voie basse').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                <Activity className="w-6 h-6 text-orange-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Césariennes</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {accouchementData.filter(a => a.type === 'Césarienne').length}
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
                                <p className="text-sm text-gray-600">Avec Complications</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {accouchementData.filter(a => a.complications !== 'Aucune').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gestion des Accouchements</h1>
                        <p className="text-gray-500 mt-1">Suivez et gérez tous les accouchements</p>
                    </div>
                    
                    <div className="flex gap-3">
                        <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                            <Download className="w-5 h-5 mr-2" />
                            Exporter
                        </button>
                        <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                            <Plus className="w-5 h-5 mr-2" />
                            Nouvel Accouchement
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
                                placeholder="Rechercher un accouchement..."
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
                                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-900 bg-gradient-to-r from-pink-50 to-purple-50 border-b-2 border-pink-200">
                                        Patiente
                                    </th>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-900 bg-gradient-to-r from-pink-50 to-purple-50 border-b-2 border-pink-200">
                                        Date & Heure
                                    </th>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-900 bg-gradient-to-r from-pink-50 to-purple-50 border-b-2 border-pink-200">
                                        Bébé
                                    </th>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-900 bg-gradient-to-r from-pink-50 to-purple-50 border-b-2 border-pink-200">
                                        Type d&apos;accouchement
                                    </th>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-900 bg-gradient-to-r from-pink-50 to-purple-50 border-b-2 border-pink-200">
                                        Complications
                                    </th>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-900 bg-gradient-to-r from-pink-50 to-purple-50 border-b-2 border-pink-200">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedAccouchements.map((acc, index) => (
                                    <tr key={acc.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${acc.color}`}>
                                                    {acc.avatar}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{acc.patientName}</div>
                                                    <div className="text-sm text-gray-500">ID: {acc.patientId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {new Date(acc.date).toLocaleDateString('fr-FR')}
                                            </div>
                                            <div className="text-sm text-gray-500">{acc.time}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className="text-lg mr-2">{getGenderIcon(acc.gender)}</span>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {acc.gender === 'M' ? 'Garçon' : 'Fille'}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{acc.weight} kg</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(acc.type)}`}>
                                                {getTypeIcon(acc.type)}
                                                <span className="ml-1">{acc.type}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getComplicationsBadge(acc.complications)}`}>
                                                {acc.complications === 'Aucune' ? (
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                ) : (
                                                    <AlertCircle className="w-3 h-3 mr-1" />
                                                )}
                                                {acc.complications}
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
                    <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600 font-medium">
                                Affichage de {startIndex + 1} à {Math.min(startIndex + itemsPerPage, filteredAccouchements.length)} sur {filteredAccouchements.length} accouchements
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
                                                        ? 'bg-pink-500 text-white border-pink-500'
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
                {filteredAccouchements.length === 0 && (
                    <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Baby className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun accouchement trouvé</h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm ? 'Aucun accouchement ne correspond à votre recherche.' : 'Commencez par enregistrer votre premier accouchement.'}
                        </p>
                        <button className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                            <Plus className="w-5 h-5 mr-2" />
                            Nouvel Accouchement
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}