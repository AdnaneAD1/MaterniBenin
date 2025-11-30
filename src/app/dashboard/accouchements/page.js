"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth';
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
  Baby,
  Plus,
  Download,
  MoreVertical,
  XCircle,
  Heart,
  Activity,
  Users,
  TrendingUp
} from 'lucide-react';

export default function AccouchementPage() {
    const { currentUser } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('Tous');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [selectedAccouchement, setSelectedAccouchement] = useState(null);

    const { getAccouchements, getAccouchementStats, loading } = usePatiente();
    const [realAccouchements, setRealAccouchements] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(false);


    // Use real data if available, otherwise fallback
    const displayAccouchements = realAccouchements.length > 0 ? realAccouchements : [];

    // Load accouchements and stats
    useEffect(() => {
        const loadData = async () => {
            try {
                // Attendre que currentUser soit chargé
                if (!currentUser) {
                    return;
                }

                setIsLoading(true);
                const [accResult, statsResult] = await Promise.all([
                    getAccouchements(),
                    getAccouchementStats()
                ]);

                if (accResult.success && accResult.accouchements) {
                    const transformed = accResult.accouchements.map((acc) => {
                        const patientName = `${acc.patient?.prenom || ''} ${acc.patient?.nom || ''}`.trim();
                        const enfants = Array.isArray(acc.enfants) ? acc.enfants : [];
                        const childCount = enfants.length;
                        const firstChild = childCount > 0 ? enfants[0] : null;
                        const rawSex = firstChild?.sexeEnfant?.toString().toLowerCase() || '';
                        const gender = childCount === 1
                            ? (rawSex.includes('m') || rawSex.includes('mascul') || rawSex.includes('gar') ? 'M' : 'F')
                            : 'Multiple';
                        const weight = childCount === 1 ? (firstChild?.poids || null) : null;
                        const initials = `${(acc.patient?.prenom || 'P').charAt(0)}${(acc.patient?.nom || 'P').charAt(0)}`;

                        return {
                            id: acc.id,
                            patientName,
                            patientId: acc.patient?.patientId,
                            date: acc.dateAccouchement || (acc.createdAt?.seconds ? new Date(acc.createdAt.seconds * 1000).toISOString().split('T')[0] : null),
                            time: acc.heureAccouchement || '',
                            gender,
                            weight,
                            type: acc.modeAccouchement || 'Inconnu',
                            avatar: initials,
                            color: getRandomColor(),
                            doctor: 'Sage-femme',
                            childCount,
                            children: enfants,
                            original: acc
                        };
                    });
                    setRealAccouchements(transformed);
                }

                if (statsResult.success) {
                    setStats(statsResult.stats);
                }
            } catch (error) {
                console.error('Erreur lors du chargement des accouchements:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser?.uid]);

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

    const filters = ['Tous', 'Voie basse', 'Césarienne'];

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

    

    // Filter the accouchement data based on search term and active filter
    const filteredAccouchements = displayAccouchements.filter(acc => {
        const matchesSearch = acc.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            acc.id.toLowerCase().includes(searchTerm.toLowerCase());
        
        let matchesFilter = true;
        if (activeFilter === 'Voie basse') matchesFilter = acc.type === 'Voie basse';
        else if (activeFilter === 'Césarienne') matchesFilter = acc.type === 'Césarienne';
        
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Baby className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Total Accouchements</p>
                                {isLoading ? (
                                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900">{stats?.totalAccouchements || displayAccouchements.length}</p>
                                )}
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
                                {isLoading ? (
                                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats?.modesAccouchement?.voieBasse ?? displayAccouchements.filter(a => a.type === 'Voie basse').length}
                                    </p>
                                )}
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
                                {isLoading ? (
                                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats?.modesAccouchement?.cesarienne ?? displayAccouchements.filter(a => a.type === 'Césarienne').length}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    
                </div>

                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gestion des accouchements</h1>
                        <p className="text-gray-500 mt-1">Suivez et gérez tous les accouchements</p>
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
                                                {acc.date ? new Date(acc.date).toLocaleDateString('fr-FR') : 'Non définie'}
                                            </div>
                                            <div className="text-sm text-gray-500">{acc.time || '--:--'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className="text-lg mr-2">{getGenderIcon(acc.gender)}</span>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {acc.childCount && acc.childCount > 1 ? `${acc.childCount} bébés` : (acc.gender === 'M' ? 'Garçon' : 'Fille')}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{acc.weight ? `${acc.weight} kg` : '-'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(acc.type)}`}>
                                                {getTypeIcon(acc.type)}
                                                <span className="ml-1">{acc.type}</span>
                                            </span>
                                        </td>
                                        
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => setSelectedAccouchement(acc)}
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
                    </div>
                )}

                {/* Détails Accouchement Modal */}
                {selectedAccouchement && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
                            <button
                                className="absolute top-3 right-3 text-gray-500 hover:text-pink-600 text-xl"
                                onClick={() => setSelectedAccouchement(null)}
                                aria-label="Fermer"
                            >
                                &times;
                            </button>
                            <h2 className="text-xl font-bold text-pink-600 mb-6">Détails de l&apos;accouchement</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Patient Information */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-800 border-b pb-2">Informations Patiente</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium ${selectedAccouchement.color}`}>
                                                {selectedAccouchement.avatar}
                                            </div>
                                            <div className="ml-3">
                                                <div className="font-medium text-gray-900">{selectedAccouchement.patientName}</div>
                                                <div className="text-sm text-gray-500">ID: {selectedAccouchement.patientId}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Accouchement Information */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-800 border-b pb-2">Informations</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-700">ID :</span>
                                            <span>{selectedAccouchement.id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-700">Date :</span>
                                            <span>{selectedAccouchement.date ? new Date(selectedAccouchement.date).toLocaleDateString('fr-FR') : 'Non définie'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium text-gray-700">Heure :</span>
                                            <span>{selectedAccouchement.time || '--:--'}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-gray-700">Type :</span>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(selectedAccouchement.type)}`}>
                                                {getTypeIcon(selectedAccouchement.type)}
                                                <span className="ml-1">{selectedAccouchement.type}</span>
                                            </span>
                                        </div>
                                        
                                    </div>
                                </div>
                            </div>

                            {/* Enfants */}
                            {selectedAccouchement.children && selectedAccouchement.children.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="font-semibold text-gray-800 border-b pb-2 mb-3">Enfant(s)</h3>
                                    <div className="space-y-2">
                                        {selectedAccouchement.children.map((enfant, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="text-gray-700">
                                                    {enfant.prenomEnfant || enfant.nomEnfant ? `${enfant.prenomEnfant || ''} ${enfant.nomEnfant || ''}`.trim() : `Enfant ${idx + 1}`}
                                                </div>
                                                <div className="text-gray-600 flex items-center gap-4">
                                                    <span>Sexe: {enfant.sexeEnfant || 'N/A'}</span>
                                                    <span>Poids: {enfant.poids ? `${enfant.poids} kg` : 'N/A'}</span>
                                                </div>
                                            </div>
                                        ))}
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

/* Modal moved inside component return */