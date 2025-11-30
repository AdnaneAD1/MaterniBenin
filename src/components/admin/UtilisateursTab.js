"use client";

import { useState, useEffect } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { Plus, Edit2, Trash2, Shield, AlertCircle } from "lucide-react";
import CreateUserModal from "./modals/CreateUserModal";
import ChangeRoleModal from "./modals/ChangeRoleModal";

export default function UtilisateursTab() {
  const { listCentres, listUsersByCentre, removeUserFromCentre, loading } = useAdmin();
  const [centres, setCentres] = useState([]);
  const [selectedCentreId, setSelectedCentreId] = useState(null);
  const [users, setUsers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showChangeRoleModal, setShowChangeRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingCentres, setLoadingCentres] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Charger les centres
  useEffect(() => {
    loadCentres();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Charger les utilisateurs quand le centre change
  useEffect(() => {
    if (selectedCentreId) {
      loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCentreId]);

  const loadCentres = async () => {
    setLoadingCentres(true);
    const result = await listCentres();
    if (result.success) {
      setCentres(result.centres || []);
      if (result.centres && result.centres.length > 0) {
        setSelectedCentreId(result.centres[0].id);
      }
    }
    setLoadingCentres(false);
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    const result = await listUsersByCentre(selectedCentreId);
    if (result.success) {
      setUsers(result.users || []);
    }
    setLoadingUsers(false);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    loadUsers();
  };

  const handleChangeRoleSuccess = () => {
    setShowChangeRoleModal(false);
    setSelectedUser(null);
    loadUsers();
  };

  const handleDeleteUser = async (userId) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      const result = await removeUserFromCentre(userId);
      if (result.success) {
        loadUsers();
      }
    }
  };

  const handleChangeRole = (user) => {
    setSelectedUser(user);
    setShowChangeRoleModal(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Utilisateurs</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Nouvel Utilisateur
        </button>
      </div>

      {/* Sélection du centre */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Sélectionner un centre
        </label>
        <select
          value={selectedCentreId || ""}
          onChange={(e) => setSelectedCentreId(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Choisir un centre --</option>
          {centres.map((centre) => (
            <option key={centre.id} value={centre.id}>
              {centre.nom}
            </option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {loadingUsers && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Liste des utilisateurs */}
      {!loadingUsers && selectedCentreId && users.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Nom</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Téléphone</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Rôle</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{user.email}</td>
                  <td className="py-3 px-4 text-slate-600">{user.phoneNumber || "-"}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`flex items-center gap-1 px-2 py-1 rounded text-sm font-medium w-fit ${
                        user.role === "responsable"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role === "responsable" && <Shield size={16} />}
                      {user.role === "responsable" ? "Responsable" : "Sage-femme"}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <button
                      onClick={() => handleChangeRole(user)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                      title="Changer le rôle"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Aucun utilisateur */}
      {!loadingUsers && selectedCentreId && users.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600 font-medium">Aucun utilisateur pour ce centre</p>
          <p className="text-slate-500 text-sm mt-1">Cliquez sur &quot;Nouvel Utilisateur&quot; pour en ajouter</p>
        </div>
      )}

      {/* Sélectionner un centre */}
      {!loadingUsers && !selectedCentreId && (
        <div className="text-center py-12">
          <AlertCircle size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600 font-medium">Sélectionnez un centre</p>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateUserModal
          centreId={selectedCentreId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {showChangeRoleModal && selectedUser && (
        <ChangeRoleModal
          user={selectedUser}
          centreId={selectedCentreId}
          onClose={() => {
            setShowChangeRoleModal(false);
            setSelectedUser(null);
          }}
          onSuccess={handleChangeRoleSuccess}
        />
      )}
    </div>
  );
}
