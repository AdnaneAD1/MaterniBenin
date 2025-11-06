"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useSettings } from "@/hooks/settings";
import { useAuth } from "@/hooks/auth";
import {
    User,
    Mail,
    Phone,
    Lock,
    Edit,
    Save,
    X,
    AlertCircle,
    CheckCircle,
    Shield,
    Calendar,
    ArrowLeft
} from "lucide-react";

export default function ParametresPage() {
    const router = useRouter();
    const { currentUser } = useAuth();
    const { getCurrentUserProfile, updateProfile, changePassword, changeEmail, loading } = useSettings();

    const [profile, setProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // États pour l'édition du profil
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        firstName: "",
        lastName: "",
        phoneNumber: "",
    });

    // États pour le changement de mot de passe
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordError, setPasswordError] = useState(null);

    // États pour le changement d'email
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailForm, setEmailForm] = useState({
        newEmail: "",
        currentPassword: "",
    });
    const [emailError, setEmailError] = useState(null);

    // Charger le profil au montage
    useEffect(() => {
        loadProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadProfile = async () => {
        setLoadingProfile(true);
        setError(null);
        try {
            const result = await getCurrentUserProfile();
            if (result.success) {
                setProfile(result.profile);
                setProfileForm({
                    firstName: result.profile.firstName || "",
                    lastName: result.profile.lastName || "",
                    phoneNumber: result.profile.phoneNumber || "",
                });
            } else {
                setError(result.error?.message || "Erreur lors du chargement du profil");
            }
        } catch (err) {
            setError(err.message || "Une erreur est survenue");
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleProfileEdit = () => {
        setIsEditingProfile(true);
        setSuccessMessage(null);
        setError(null);
    };

    const handleProfileCancel = () => {
        setIsEditingProfile(false);
        setProfileForm({
            firstName: profile.firstName || "",
            lastName: profile.lastName || "",
            phoneNumber: profile.phoneNumber || "",
        });
        setError(null);
    };

    const handleProfileSave = async () => {
        setError(null);
        setSuccessMessage(null);

        try {
            const result = await updateProfile(profileForm);
            if (result.success) {
                await loadProfile();
                setIsEditingProfile(false);
                setSuccessMessage("Profil mis à jour avec succès !");
                setTimeout(() => setSuccessMessage(null), 3000);
            } else {
                setError(result.error?.message || "Erreur lors de la mise à jour");
            }
        } catch (err) {
            setError(err.message || "Une erreur est survenue");
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordError(null);

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError("Les mots de passe ne correspondent pas");
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setPasswordError("Le mot de passe doit contenir au moins 6 caractères");
            return;
        }

        try {
            const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
            if (result.success) {
                setShowPasswordModal(false);
                setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                setSuccessMessage("Mot de passe modifié avec succès !");
                setTimeout(() => setSuccessMessage(null), 3000);
            } else {
                setPasswordError(result.error?.message || "Erreur lors du changement de mot de passe");
            }
        } catch (err) {
            setPasswordError(err.message || "Une erreur est survenue");
        }
    };

    const handleEmailChange = async (e) => {
        e.preventDefault();
        setEmailError(null);

        try {
            const result = await changeEmail(emailForm.newEmail, emailForm.currentPassword);
            if (result.success) {
                setShowEmailModal(false);
                setEmailForm({ newEmail: "", currentPassword: "" });
                await loadProfile();
                setSuccessMessage("Email modifié avec succès !");
                setTimeout(() => setSuccessMessage(null), 3000);
            } else {
                setEmailError(result.error?.message || "Erreur lors du changement d'email");
            }
        } catch (err) {
            setEmailError(err.message || "Une erreur est survenue");
        }
    };

    if (loadingProfile) {
        return (
            <DashboardLayout>
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto mb-6"></div>
                        <p className="text-gray-700 text-lg font-medium">Chargement du profil...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!profile || error) {
        return (
            <DashboardLayout>
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8">
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 p-10 max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Erreur de chargement</h2>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            {error || "Impossible de charger votre profil"}
                        </p>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Retour au tableau de bord
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen py-10 px-6 sm:px-12">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="bg-white/90 backdrop-blur rounded-2xl shadow-md border border-gray-200 p-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                                    <User className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-extrabold text-gray-900">Mon Profil</h1>
                                    <p className="text-gray-600 font-medium">Gérez vos informations personnelles</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Message de succès */}
                    {successMessage && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-green-800">{successMessage}</p>
                            </div>
                        </div>
                    )}

                    {/* Informations du profil */}
                    <div className="bg-white/90 backdrop-blur rounded-2xl shadow-md border border-gray-200 p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Informations personnelles</h2>
                            {!isEditingProfile ? (
                                <button
                                    onClick={handleProfileEdit}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-md hover:shadow-lg"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Modifier
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleProfileCancel}
                                        disabled={loading}
                                        className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium disabled:opacity-50"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleProfileSave}
                                        disabled={loading}
                                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-medium shadow-md hover:shadow-lg disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                                Enregistrement...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Enregistrer
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            {/* Prénom */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Prénom
                                </label>
                                {isEditingProfile ? (
                                    <input
                                        type="text"
                                        value={profileForm.firstName}
                                        onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="Votre prénom"
                                    />
                                ) : (
                                    <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                                        {profile.firstName || "Non renseigné"}
                                    </div>
                                )}
                            </div>

                            {/* Nom */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nom
                                </label>
                                {isEditingProfile ? (
                                    <input
                                        type="text"
                                        value={profileForm.lastName}
                                        onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="Votre nom"
                                    />
                                ) : (
                                    <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                                        {profile.lastName || "Non renseigné"}
                                    </div>
                                )}
                            </div>

                            {/* Téléphone */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Téléphone
                                </label>
                                {isEditingProfile ? (
                                    <input
                                        type="tel"
                                        value={profileForm.phoneNumber}
                                        onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                        placeholder="Ex: +229 97 00 00 00"
                                    />
                                ) : (
                                    <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                                        {profile.phoneNumber || "Non renseigné"}
                                    </div>
                                )}
                            </div>

                            {/* Email (non modifiable ici) */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email
                                </label>
                                <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium flex items-center justify-between">
                                    <span>{profile.email}</span>
                                    <button
                                        onClick={() => setShowEmailModal(true)}
                                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                        Modifier
                                    </button>
                                </div>
                            </div>

                            {/* Rôle */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Rôle
                                </label>
                                <div className="px-4 py-3 bg-gray-50 rounded-xl flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-blue-600" />
                                    <span className="text-gray-900 font-medium capitalize">
                                        {profile.role || "sage-femme"}
                                    </span>
                                </div>
                            </div>

                            {/* Date de création */}
                            {profile.createdAt && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Membre depuis
                                    </label>
                                    <div className="px-4 py-3 bg-gray-50 rounded-xl flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-gray-600" />
                                        <span className="text-gray-900 font-medium">
                                            {profile.createdAt?.toDate ? 
                                                profile.createdAt.toDate().toLocaleDateString('fr-FR', { 
                                                    year: 'numeric', 
                                                    month: 'long', 
                                                    day: 'numeric' 
                                                }) 
                                                : "Non disponible"}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sécurité */}
                    <div className="bg-white/90 backdrop-blur rounded-2xl shadow-md border border-gray-200 p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Sécurité</h2>
                        <div className="space-y-4">
                            <button
                                onClick={() => setShowPasswordModal(true)}
                                className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all border border-gray-200"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Lock className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-900">Changer le mot de passe</p>
                                        <p className="text-sm text-gray-600">Modifiez votre mot de passe actuel</p>
                                    </div>
                                </div>
                                <Edit className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal changement de mot de passe */}
            {showPasswordModal && (
                <PasswordModal
                    passwordForm={passwordForm}
                    setPasswordForm={setPasswordForm}
                    onClose={() => {
                        setShowPasswordModal(false);
                        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                        setPasswordError(null);
                    }}
                    onSubmit={handlePasswordChange}
                    loading={loading}
                    error={passwordError}
                />
            )}

            {/* Modal changement d'email */}
            {showEmailModal && (
                <EmailModal
                    emailForm={emailForm}
                    setEmailForm={setEmailForm}
                    onClose={() => {
                        setShowEmailModal(false);
                        setEmailForm({ newEmail: "", currentPassword: "" });
                        setEmailError(null);
                    }}
                    onSubmit={handleEmailChange}
                    loading={loading}
                    error={emailError}
                />
            )}
        </DashboardLayout>
    );
}

// Modal pour changer le mot de passe
function PasswordModal({ passwordForm, setPasswordForm, onClose, onSubmit, loading, error }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-5 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <Lock className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold">Changer le mot de passe</h2>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <form onSubmit={onSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Mot de passe actuel <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                            required
                            disabled={loading}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
                            placeholder="Votre mot de passe actuel"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Nouveau mot de passe <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            required
                            disabled={loading}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
                            placeholder="Minimum 6 caractères"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Confirmer le mot de passe <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            required
                            disabled={loading}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
                            placeholder="Confirmez le nouveau mot de passe"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium disabled:opacity-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Modification...
                                </>
                            ) : (
                                "Modifier"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Modal pour changer l'email
function EmailModal({ emailForm, setEmailForm, onClose, onSubmit, loading, error }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-5 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                <Mail className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold">Changer l&apos;email</h2>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <form onSubmit={onSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Nouvel email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={emailForm.newEmail}
                            onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                            required
                            disabled={loading}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
                            placeholder="nouveau@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Mot de passe actuel <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            value={emailForm.currentPassword}
                            onChange={(e) => setEmailForm({ ...emailForm, currentPassword: e.target.value })}
                            required
                            disabled={loading}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:bg-gray-100"
                            placeholder="Confirmez avec votre mot de passe"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium disabled:opacity-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Modification...
                                </>
                            ) : (
                                "Modifier"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
