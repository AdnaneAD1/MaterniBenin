"use client";

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useRapport } from '@/hooks/rapport';
import GenerateRapportModal from '@/components/GenerateRapportModal';

import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Calendar,
  Clock,
  User,
  FileText,
  Plus,
  Download,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  XCircle,
  BarChart3,
  TrendingUp,
  Activity
} from 'lucide-react';

export default function RapportsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('Tous');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const { getAllReports, generateMonthlyReport, loading } = useRapport();
    const [rapportsData, setRapportsData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showGenerate, setShowGenerate] = useState(false);
    const [selected, setSelected] = useState(null);

    const filters = ['Tous', 'Généré'];

    const formatBytes = (bytes) => {
        if (!bytes && bytes !== 0) return 'N/A';
        const sizes = ['B','KB','MB','GB'];
        if (bytes === 0) return '0 B';
        const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1);
        const val = bytes / Math.pow(1024, i);
        return `${val.toFixed(1)} ${sizes[i]}`;
    };

    const colorByType = (type) => ({
        'CPN': 'bg-blue-100 text-blue-600',
        'Accouchement': 'bg-pink-100 text-pink-600',
        'Planification': 'bg-purple-100 text-purple-600',
    })[type] || 'bg-indigo-100 text-indigo-600';

    const avatarByType = (type) => ({
        'CPN': 'CPN',
        'Accouchement': 'ACC',
        'Planification': 'PF',
    })[type] || 'RPT';

    const mapReport = (r) => {
        return {
            id: r.id,
            type: r.type,
            titre: `Rapport mensuel ${r.type} - ${r.mois} ${r.annee}`,
            mois: r.mois,
            annee: r.annee,
            statut: r.pdfUrl ? 'Généré' : 'Planifié',
            date_generation: r.createdAt?.toDate ? r.createdAt.toDate().toISOString() : (r.createdAt || null),
            generateur: r.generatedBy || 'Système',
            taille: formatBytes(r.fileSize),
            pages: r.data?.pages || 0,
            fichier: r.pdfUrl || '',
            avatar: avatarByType(r.type),
            color: colorByType(r.type),
            original: r,
        };
    };

    const loadReports = async () => {
        try {
            setIsLoading(true);
            const res = await getAllReports();
            if (res.success) {
                setRapportsData(res.rapports.map(mapReport));
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadReports();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getStatusBadge = (status) => {
        const statusConfig = {
            'Généré': 'bg-green-100 text-green-800',
            'En cours': 'bg-blue-100 text-blue-800',
            'Planifié': 'bg-yellow-100 text-yellow-800',
            'Erreur': 'bg-red-100 text-red-800'
        };
        return statusConfig[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'Généré': return <CheckCircle className="w-4 h-4" />;
            case 'En cours': return <Clock className="w-4 h-4" />;
            case 'Planifié': return <Calendar className="w-4 h-4" />;
            case 'Erreur': return <XCircle className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    const getTypeBadge = (type) => {
        const typeConfig = {
            'CPN': 'bg-blue-100 text-blue-800',
            'Accouchement': 'bg-pink-100 text-pink-800',
            'Planification': 'bg-purple-100 text-purple-800',
            'Statistiques': 'bg-green-100 text-green-800',
            'Annuel': 'bg-orange-100 text-orange-800'
        };
        return typeConfig[type] || 'bg-gray-100 text-gray-800';
    };

    // Filter the rapports data based on search term and active filter
    const filteredRapports = rapportsData.filter(rapport => {
        const matchesSearch = rapport.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            rapport.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            rapport.type.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === 'Tous' || rapport.statut === activeFilter;
        return matchesSearch && matchesFilter;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredRapports.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedRapports = filteredRapports.slice(startIndex, startIndex + itemsPerPage);

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
        <DashboardLayout title="Rapports et Statistiques">
            <div className="p-6 space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                <FileText className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Total Rapports</p>
                                {isLoading ? (
                                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900">{rapportsData.length}</p>
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
                                <p className="text-sm text-gray-600">Générés</p>
                                {isLoading ? (
                                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                                ) : (
                                    <p className="text-2xl font-bold text-gray-900">
                                        {rapportsData.filter(r => r.statut === 'Généré').length}
                                    </p>
                                )}
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
                                <p className="text-2xl font-bold text-gray-900">0</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Planifiés</p>
                                <p className="text-2xl font-bold text-gray-900">{rapportsData.filter(r => r.statut === 'Planifié').length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Rapports et Statistiques</h1>
                        <p className="text-gray-500 mt-1">Générez et consultez tous vos rapports d&apos;activité</p>
                    </div>
                    
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowGenerate(true)}
                            className="flex items-center px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">
                            <Plus className="w-5 h-5 mr-2" />
                            Nouveau Rapport
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
                                placeholder="Rechercher un rapport..."
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                                            ? 'bg-indigo-500 text-white'
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
                                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-900 bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-200">
                                        Rapport
                                    </th>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-900 bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-200">
                                        Type
                                    </th>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-900 bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-200">
                                        Période
                                    </th>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-900 bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-200">
                                        Statut
                                    </th>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-900 bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-200">
                                        Détails
                                    </th>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-900 bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-200">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedRapports.map((rapport, index) => (
                                    <tr key={rapport.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium ${rapport.color}`}>
                                                    {rapport.avatar}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{rapport.titre}</div>
                                                    <div className="text-sm text-gray-500">ID: {rapport.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(rapport.type)}`}>
                                                <BarChart3 className="w-3 h-3 mr-1" />
                                                {rapport.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{rapport.mois} {rapport.annee}</div>
                                            <div className="text-sm text-gray-500">
                                                {rapport.date_generation ? `Généré le ${new Date(rapport.date_generation).toLocaleDateString('fr-FR')}` : '—'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(rapport.statut)}`}>
                                                {getStatusIcon(rapport.statut)}
                                                <span className="ml-1">{rapport.statut}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {rapport.pages > 0 ? `${rapport.pages} pages` : 'N/A'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {rapport.taille && rapport.taille !== '0 B' ? rapport.taille : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                {rapport.statut === 'Généré' && rapport.fichier && (
                                                    <a
                                                        href={rapport.fichier}
                                                        download
                                                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded-lg hover:bg-indigo-50 transition-colors"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </a>
                                                )}
                                                <button onClick={() => setSelected(rapport)} className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-50 transition-colors">
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
                    <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600 font-medium">
                                Affichage de {startIndex + 1} à {Math.min(startIndex + itemsPerPage, filteredRapports.length)} sur {filteredRapports.length} rapports
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
                                                        ? 'bg-indigo-500 text-white border-indigo-500'
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
                {filteredRapports.length === 0 && (
                    <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun rapport trouvé</h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm ? 'Aucun rapport ne correspond à votre recherche.' : 'Commencez par générer votre premier rapport.'}
                        </p>
                        <button onClick={() => setShowGenerate(true)} className="inline-flex items-center px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">
                            <Plus className="w-5 h-5 mr-2" />
                            Nouveau Rapport
                        </button>
                    </div>
                )}

                {/* Generate Report Modal */}
                {showGenerate && (
                    <GenerateRapportModal
                        open={showGenerate}
                        onClose={() => setShowGenerate(false)}
                        onGenerate={async ({ type, mois, annee }) => {
                            const res = await generateMonthlyReport(type, mois, annee);
                            if (res?.success) {
                                await loadReports();
                            }
                            return res;
                        }}
                    />
                )}

                {/* Details Modal */}
                {selected && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
                            <button
                                className="absolute top-3 right-3 text-gray-500 hover:text-indigo-600 text-xl"
                                onClick={() => setSelected(null)}
                                aria-label="Fermer"
                            >
                                &times;
                            </button>
                            <h2 className="text-xl font-bold text-indigo-600 mb-6">Détails du rapport</h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between"><span className="font-medium text-gray-700">Titre:</span><span>{selected.titre}</span></div>
                                <div className="flex justify-between"><span className="font-medium text-gray-700">Type:</span><span>{selected.type}</span></div>
                                <div className="flex justify-between"><span className="font-medium text-gray-700">Période:</span><span>{selected.mois} {selected.annee}</span></div>
                                <div className="flex justify-between"><span className="font-medium text-gray-700">Statut:</span><span>{selected.statut}</span></div>
                                <div className="flex justify-between"><span className="font-medium text-gray-700">Taille:</span><span>{selected.taille}</span></div>
                                <div className="flex justify-between"><span className="font-medium text-gray-700">Généré le:</span><span>{selected.date_generation ? new Date(selected.date_generation).toLocaleDateString('fr-FR') : '—'}</span></div>
                            </div>
                            {selected.fichier && (
                                <div className="mt-4 flex gap-2">
                                    <a href={selected.fichier} target="_blank" rel="noreferrer" className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">Ouvrir</a>
                                    <a href={selected.fichier} download className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Télécharger</a>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}