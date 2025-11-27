"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth';
import { useUser } from '@/hooks/user';
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
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [form, setForm] = useState({ nom: "", prenom: "", telephone: "", email: "", role: "sage-femme" });
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { createUser, loading, currentUser } = useAuth();
    const { getUsersWithDetails, loading: usersLoading, deleteUser } = useUser();
    const [users, setUsers] = useState([]);
    const [refreshUsers, setRefreshUsers] = useState(0);
    const itemsPerPage = 5;

    const filters = ['Tous', 'Actif', 'Inactif', 'Sage-femme', 'Responsable'];

    // Charger les utilisateurs depuis Firestore
    useEffect(() => {
        const loadUsers = async () => {
            try {
                // Attendre que currentUser soit chargé
                if (!currentUser) {
                    return;
                }

                const result = await getUsersWithDetails();
                if (result.success) {
                    // Filtrer : uniquement les sages-femmes du même centre
                    const transformedUsers = result.users
                        .filter(user => 
                            user.role === 'sage-femme' && 
                            user.centreId === currentUser.centreId
                        )
                        .map(user => ({
                            id: user.id,
                            nom: user.lastName || '',
                            prenom: user.firstName || '',
                            telephone: user.phoneNumber || '',
                            email: user.email || '',
                            role: 'Sage-femme',
                            status: user.statut || 'Actif',
                            dateCreation: user.createdAt ? user.createdAt.toDate().toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                            avatar: `${(user.firstName || 'U').charAt(0)}${(user.lastName || 'U').charAt(0)}`,
                            color: getRandomColor()
                        }));
                    setUsers(transformedUsers);
                }
            } catch (error) {
                console.error('Erreur lors du chargement des utilisateurs:', error);
            }
        };

        loadUsers();
    }, [currentUser?.uid, refreshUsers]);

    // Fonction pour générer une couleur aléatoire pour l'avatar
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
            'Responsable': 'bg-purple-100 text-purple-800'
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
        else if (activeFilter === 'Responsable') matchesFilter = user.role === 'Responsable';
        
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

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!form.nom || !form.prenom || !form.telephone || !form.email) {
            setError("Tous les champs sont obligatoires");
            return;
        }
        
        setIsSubmitting(true);
        setError("");
        
        try {
            // Utiliser la fonction createUser du hook useAuth
            const result = await createUser({
                email: form.email,
                firstName: form.prenom,
                lastName: form.nom,
                phoneNumber: form.telephone,
                centreId: currentUser?.centreId,
                role: 'sage-femme'
            });
            
            if (result && result.uid) {
                // Ajouter l'utilisateur créé à la liste locale pour affichage immédiat
                const newUser = {
                    id: result.uid,
                    nom: form.nom,
                    prenom: form.prenom,
                    telephone: form.telephone,
                    email: form.email,
                    role: form.role === "sage-femme" ? "Sage-femme" : "Responsable",
                    status: "Actif",
                    dateCreation: new Date().toISOString().split('T')[0],
                    avatar: `${form.prenom.charAt(0)}${form.nom.charAt(0)}`,
                    color: "bg-green-100 text-green-600"
                };
                
                // Recharger la liste des utilisateurs
                setRefreshUsers(prev => prev + 1);
                setForm({ nom: "", prenom: "", telephone: "", email: "", role: "sage-femme" });
                setShowAddModal(false);
                
                // Afficher un message de succès avec le mot de passe généré
                if (result.generatedPassword) {
                    alert(`Utilisateur créé avec succès!\n\nEmail: ${result.email}\nMot de passe temporaire: ${result.generatedPassword}\n\nVeuillez communiquer ces informations à l'utilisateur.`);
                }
            }
        } catch (err) {
            console.error('Erreur lors de la création de l\'utilisateur:', err);
            setError(err.message || "Erreur lors de la création de l'utilisateur");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemove = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            try {
                const result = await deleteUser(id);
                if (result.success) {
                    setUsers(users.filter(user => user.id !== id));
                    alert('Utilisateur supprimé avec succès');
                } else {
                    alert('Erreur lors de la suppression: ' + result.error);
                }
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                alert('Erreur lors de la suppression de l\'utilisateur');
            }
        }
    };

    const handleView = (user) => {
        setSelectedUser(user);
        setShowViewModal(true);
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
                                <p className="text-sm text-gray-600">Responsables</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {users.filter(u => u.role === 'Responsable').length}
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
                        {/* <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                            <Download className="w-5 h-5 mr-2" />
                            Exporter
                        </button> */}
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
                                                <button 
                                                    onClick={() => handleView(user)}
                                                    className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-50 transition-colors"
                                                    title="Voir les détails"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleRemove(user.id)}
                                                    className="text-red-600 hover:text-red-900 p-1 rounded-lg hover:bg-red-50 transition-colors"
                                                    title="Supprimer l'utilisateur"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
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
                                    placeholder="Ex: 97000001 ou +22997000001"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                                {/* <p className="text-xs text-gray-500 mt-1">
                                    Format accepté: numéro local (97000001) ou international (+22997000001)
                                </p> */}
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
                                    disabled={isSubmitting || loading}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    {isSubmitting || loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Création...
                                        </>
                                    ) : (
                                        'Ajouter'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de visualisation */}
            {showViewModal && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 relative max-h-[90vh] overflow-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                            <div className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mr-3 ${selectedUser.color}`}>
                                    {selectedUser.avatar}
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Détails de l&apos;utilisateur</h2>
                            </div>
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Informations personnelles */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Users className="w-5 h-5 mr-2 text-blue-500" />
                                    Informations personnelles
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Nom complet</label>
                                        <p className="text-lg font-semibold text-gray-900">{selectedUser.prenom} {selectedUser.nom}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Rôle</label>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleBadge(selectedUser.role)}`}>
                                            <Users className="w-3 h-3 mr-1" />
                                            {selectedUser.role}
                                        </span>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Statut</label>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(selectedUser.status)}`}>
                                            {getStatusIcon(selectedUser.status)}
                                            <span className="ml-1">{selectedUser.status}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Informations de contact */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Phone className="w-5 h-5 mr-2 text-green-500" />
                                    Contact
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                                        <div className="flex items-center">
                                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                            <p className="text-gray-900">{selectedUser.email}</p>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Téléphone</label>
                                        <div className="flex items-center">
                                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                            <p className="text-gray-900">{selectedUser.telephone}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Informations système */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
                                    Informations système
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">ID utilisateur</label>
                                        <p className="text-gray-900 font-mono text-sm">{selectedUser.id}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Date de création</label>
                                        <p className="text-gray-900">{new Date(selectedUser.dateCreation).toLocaleDateString('fr-FR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}