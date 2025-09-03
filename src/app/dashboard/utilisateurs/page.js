"use client";

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  UserPlus,
  Plus,
  Download,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  XCircle,
  Users,
  Mail,
  Phone,
  Trash2,
  X
} from 'lucide-react';

export default function UtilisateursPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('Tous');
    const [currentPage, setCurrentPage] = useState(1);
    const [showAddModal, setShowAddModal] = useState(false);
    const [form, setForm] = useState({ nom: "", prenom: "", telephone: "", email: "", role: "Sage-femme" });
    const [error, setError] = useState("");
    const itemsPerPage = 5;

    // Sample data for users
    const [users, setUsers] = useState([
        {
            id: 1,
            nom: "Agossou",
            prenom: "Marie",
            telephone: "97000001",
            email: "marie.agossou@hopital.bj",
            role: "Sage-femme",
            status: "Actif",
            dateCreation: "2025-01-15",
            avatar: "MA",
            color: "bg-blue-100 text-blue-600"
        },
        {
            id: 2,
            nom: "Kpoviessi",
            prenom: "Clarisse",
            telephone: "97000002",
            email: "clarisse.kpoviessi@hopital.bj",
            role: "Sage-femme",
            status: "Actif",
            dateCreation: "2025-02-10",
            avatar: "CK",
            color: "bg-pink-100 text-pink-600"
        },
        {
            id: 3,
            nom: "Dansou",
            prenom: "Edwige",
            telephone: "97000003",
            email: "edwige.dansou@hopital.bj",
            role: "Sage-femme",
            status: "Inactif",
            dateCreation: "2025-03-05",
            avatar: "ED",
            color: "bg-green-100 text-green-600"
        },
        {
            id: 4,
            nom: "Lokonon",
            prenom: "Danielle",
            telephone: "97000004",
            email: "danielle.lokonon@hopital.bj",
            role: "Administrateur",
            status: "Actif",
            dateCreation: "2025-01-20",
            avatar: "DL",
            color: "bg-purple-100 text-purple-600"
        },
        {
            id: 5,
            nom: "Bocovo",
            prenom: "Colette",
            telephone: "97000005",
            email: "colette.bocovo@hopital.bj",
            role: "Sage-femme",
            status: "Actif",
            dateCreation: "2025-02-28",
            avatar: "CB",
            color: "bg-orange-100 text-orange-600"
        }
    ]);

    const filters = ['Tous', 'Actif', 'Inactif', 'Sage-femme', 'Administrateur'];

    const getStatusBadge = (status) => {
        const statusConfig = {
            'Actif': 'bg-green-100 text-green-800',
            'Inactif': 'bg-red-100 text-red-800'
        };
        return statusConfig[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'Actif': return <CheckCircle className="w-4 h-4" />;
            case 'Inactif': return <XCircle className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    const getRoleBadge = (role) => {
        const roleConfig = {
            'Sage-femme': 'bg-blue-100 text-blue-800',
            'Administrateur': 'bg-purple-100 text-purple-800'
        };
        return roleConfig[role] || 'bg-gray-100 text-gray-800';
    };

    // Filter the users data based on search term and active filter
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        let matchesFilter = true;
        if (activeFilter === 'Actif') matchesFilter = user.status === 'Actif';
        else if (activeFilter === 'Inactif') matchesFilter = user.status === 'Inactif';
        else if (activeFilter === 'Sage-femme') matchesFilter = user.role === 'Sage-femme';
        else if (activeFilter === 'Administrateur') matchesFilter = user.role === 'Administrateur';
        
        return matchesSearch && matchesFilter;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

    // Reset to first page when filters change
    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
        setCurrentPage(1);
    };

    const handleSearchChange = (term) => {
        setSearchTerm(term);
        setCurrentPage(1);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAdd = (e) => {
        e.preventDefault();
        if (!form.nom || !form.prenom || !form.telephone || !form.email) {
            setError("Tous les champs sont obligatoires");
            return;
        }
        
        const newUser = {
            id: Date.now(),
            ...form,
            status: "Actif",
            dateCreation: new Date().toISOString().split('T')[0],
            avatar: `${form.prenom.charAt(0)}${form.nom.charAt(0)}`,
            color: "bg-gray-100 text-gray-600"
        };
        
        setUsers([newUser, ...users]);
        setForm({ nom: "", prenom: "", telephone: "", email: "", role: "Sage-femme" });
        setError("");
        setShowAddModal(false);
    };

    const handleRemove = (id) => {
        setUsers(users.filter(u => u.id !== id));
    };

    return (
        <DashboardLayout title="Gestion des Utilisateurs">
            <div className="p-6 space-y-6">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Total Utilisateurs</p>
                                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Actifs</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {users.filter(u => u.status === 'Actif').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <UserPlus className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Sages-femmes</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {users.filter(u => u.role === 'Sage-femme').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Administrateurs</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {users.filter(u => u.role === 'Administrateur').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
                        <p className="text-gray-500 mt-1">Gérez les comptes utilisateurs et leurs permissions</p>
                    </div>
                    
                    <div className="flex gap-3">
                        <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                            <Download className="w-5 h-5 mr-2" />
                            Exporter
                        </button>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Nouvel Utilisateur
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
                                placeholder="Rechercher un utilisateur..."
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
                                        Utilisateur
                                    </th>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-900 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                                        Contact
                                    </th>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-900 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                                        Rôle
                                    </th>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-900 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                                        Statut
                                    </th>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-900 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                                        Date de création
                                    </th>
                                    <th className="px-6 py-5 text-left text-sm font-bold text-gray-900 bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedUsers.map((user, index) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${user.color}`}>
                                                    {user.avatar}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{user.prenom} {user.nom}</div>
                                                    <div className="text-sm text-gray-500">ID: {user.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-900 mb-1">
                                                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                                {user.email}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                                {user.telephone}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                                                <Users className="w-3 h-3 mr-1" />
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(user.status)}`}>
                                                {getStatusIcon(user.status)}
                                                <span className="ml-1">{user.status}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {new Date(user.dateCreation).toLocaleDateString('fr-FR')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-50 transition-colors">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="text-gray-600 hover:text-gray-900 p-1 rounded-lg hover:bg-gray-50 transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleRemove(user.id)}
                                                    className="text-red-600 hover:text-red-900 p-1 rounded-lg hover:bg-red-50 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600 font-medium">
                                Affichage de {startIndex + 1} à {Math.min(startIndex + itemsPerPage, filteredUsers.length)} sur {filteredUsers.length} utilisateurs
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
                {filteredUsers.length === 0 && (
                    <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm ? 'Aucun utilisateur ne correspond à votre recherche.' : 'Commencez par ajouter votre premier utilisateur.'}
                        </p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Nouvel Utilisateur
                        </button>
                    </div>
                )}
            </div>

            {/* Modal d'ajout */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 relative max-h-[90vh] overflow-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                                    <UserPlus className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Ajouter un utilisateur</h2>
                            </div>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAdd} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                                <input
                                    type="text"
                                    name="nom"
                                    value={form.nom}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                                <input
                                    type="text"
                                    name="prenom"
                                    value={form.prenom}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                                <input
                                    type="tel"
                                    name="telephone"
                                    value={form.telephone}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Rôle *</label>
                                <select
                                    name="role"
                                    value={form.role}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="Sage-femme">Sage-femme</option>
                                    <option value="Administrateur">Administrateur</option>
                                </select>
                            </div>
                            
                            {error && (
                                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                                    {error}
                                </div>
                            )}
                            
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                                >
                                    Ajouter
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}