"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth";
import { useAdmin } from "@/hooks/useAdmin";
import { Building2, Users, BarChart3, User, LogOut, Mail, Phone, MapPin, Calendar, Edit2, Save, X, AlertCircle, CheckCircle } from "lucide-react";
import CentresTab from "@/components/admin/CentresTab";
import UtilisateursTab from "@/components/admin/UtilisateursTab";
import StatistiquesTab from "@/components/admin/StatistiquesTab";

export default function AdminPage() {
  const { currentUser, logout } = useAuth();
  const { loading, error } = useAdmin();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("centres");

  // Vérifier que l'utilisateur est admin
  useEffect(() => {
    if (currentUser && currentUser.role !== "admin") {
      // Rediriger vers le dashboard
      window.location.href = "/dashboard";
    }
  }, [currentUser]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: currentUser?.firstName || "",
    lastName: currentUser?.lastName || "",
    phoneNumber: currentUser?.phoneNumber || "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSave = async () => {
    try {
      setProfileLoading(true);
      setProfileMessage(null);

      if (!profileForm.firstName || !profileForm.lastName) {
        setProfileMessage({ type: "error", text: "Le prénom et le nom sont obligatoires" });
        setProfileLoading(false);
        return;
      }

      // Mettre à jour le profil dans Firestore
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erreur lors de la mise à jour");
      }

      setProfileMessage({ type: "success", text: "Profil mis à jour avec succès !" });
      setIsEditingProfile(false);

      setTimeout(() => setProfileMessage(null), 3000);
    } catch (err) {
      setProfileMessage({ type: "error", text: err.message });
    } finally {
      setProfileLoading(false);
    }
  };

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Accès Refusé</h1>
          <p className="text-gray-600 mt-2">Vous n'avez pas les permissions pour accéder à cette page</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "centres", label: "Centres", icon: Building2 },
    { id: "utilisateurs", label: "Utilisateurs", icon: Users },
    { id: "statistiques", label: "Statistiques", icon: BarChart3 },
    { id: "profil", label: "Profil", icon: User },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      {/* Header avec Profil et Déconnexion */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Panneau Admin
            </h1>
            <p className="text-slate-600 mt-2">Gérez les centres, utilisateurs et consultez les statistiques</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            <LogOut size={20} />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white rounded-xl shadow-md p-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon size={20} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium">
          ✗ Erreur : {error}
        </div>
      )}

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-lg">
        {activeTab === "centres" && <CentresTab />}
        {activeTab === "utilisateurs" && <UtilisateursTab />}
        {activeTab === "statistiques" && <StatistiquesTab />}
        {activeTab === "profil" && (
          <div className="p-6 sm:p-8">
            {/* Profil Header */}
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Mon Profil</h2>
                <p className="text-slate-600">Informations personnelles et compte</p>
              </div>
              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  <Edit2 size={18} />
                  Modifier
                </button>
              )}
            </div>

            {/* Messages */}
            {profileMessage && (
              <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
                profileMessage.type === "error"
                  ? "bg-red-50 border border-red-200"
                  : "bg-green-50 border border-green-200"
              }`}>
                {profileMessage.type === "error" ? (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                )}
                <p className={profileMessage.type === "error" ? "text-red-700" : "text-green-700"}>
                  {profileMessage.text}
                </p>
              </div>
            )}

            {/* Profil Card */}
            <div className="max-w-2xl">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 sm:p-8 border border-blue-100">
                {/* Avatar et Nom */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 pb-8 border-b border-blue-200">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {profileForm.firstName?.[0]?.toUpperCase()}{profileForm.lastName?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    {isEditingProfile ? (
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <input
                            type="text"
                            name="firstName"
                            value={profileForm.firstName}
                            onChange={handleProfileChange}
                            placeholder="Prénom"
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            name="lastName"
                            value={profileForm.lastName}
                            onChange={handleProfileChange}
                            placeholder="Nom"
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-2xl font-bold text-slate-900">
                          {currentUser?.firstName} {currentUser?.lastName}
                        </h3>
                        <p className="text-slate-600 mt-1">Administrateur Système</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Informations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Mail size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Email</p>
                      <p className="text-slate-900 font-semibold">{currentUser?.email}</p>
                    </div>
                  </div>

                  {/* Téléphone */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <Phone size={20} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Téléphone</p>
                      {isEditingProfile ? (
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={profileForm.phoneNumber}
                          onChange={handleProfileChange}
                          placeholder="Téléphone"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-slate-900 font-semibold">{currentUser?.phoneNumber || "Non renseigné"}</p>
                      )}
                    </div>
                  </div>

                  {/* Rôle */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <User size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Rôle</p>
                      <p className="text-slate-900 font-semibold capitalize bg-purple-100 text-purple-700 px-3 py-1 rounded-lg w-fit">
                        {currentUser?.role}
                      </p>
                    </div>
                  </div>

                  {/* Statut */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <User size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Statut</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <p className="text-slate-900 font-semibold">Connecté et actif</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                {isEditingProfile && (
                  <div className="flex gap-3 pt-6 mt-6 border-t border-blue-200">
                    <button
                      onClick={handleProfileSave}
                      disabled={profileLoading}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save size={18} />
                      {profileLoading ? "Sauvegarde..." : "Enregistrer"}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingProfile(false);
                        setProfileForm({
                          firstName: currentUser?.firstName || "",
                          lastName: currentUser?.lastName || "",
                          phoneNumber: currentUser?.phoneNumber || "",
                        });
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-300 hover:bg-slate-400 text-slate-900 rounded-lg transition-colors font-medium"
                    >
                      <X size={18} />
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
