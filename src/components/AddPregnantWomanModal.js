import React, { useState, useEffect } from 'react';
import Button from './ui/Button';
import { X, Edit, UserPlus, User, Calendar, MapPin, Phone, AlertCircle, Plus, Info } from 'lucide-react';

export default function AddPregnantWomanModal({ open, onClose, onAdd, editData = null, isEditing = false }) {
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    age: '',
    adresse: '',
    telephone: ''
  });

  // Update form when editData changes
  useEffect(() => {
    if (editData && isEditing) {
      setForm({
        nom: editData.nom || '',
        prenom: editData.prenom || '',
        age: editData.age || '',
        adresse: editData.adresse || '',
        telephone: editData.telephone || ''
      });
    } else {
      setForm({
        nom: '',
        prenom: '',
        age: '',
        adresse: '',
        telephone: ''
      });
    }
  }, [editData, isEditing]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nom || !form.prenom || !form.age || !form.adresse || !form.telephone) {
      setError('Tous les champs sont obligatoires.');
      return;
    }
    if (isNaN(parseInt(form.age))) {
      setError('L\'âge doit être un nombre.');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      const patientData = { 
        ...form, 
        age: parseInt(form.age), 
        telephone: form.telephone 
      };
      
      if (isEditing && editData) {
        patientData.patientId = editData.patientId;
        patientData.personneId = editData.personneId;
      }
      
      await onAdd(patientData);
      onClose();
      setForm({ nom: '', prenom: '', age: '', adresse: '', telephone: '' });
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'opération');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full relative transform transition-all duration-300 scale-100 animate-in fade-in-0 zoom-in-95 max-h-[90vh] overflow-auto">
{/* Header avec style simple et élégant */}
<div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-3xl p-6 text-white relative">
    <button
        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
        onClick={onClose}
        disabled={isSubmitting}
        aria-label="Fermer"
    >
        <X className="w-4 h-4" />
    </button>
    
    <div className="flex items-center space-x-4">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
            {isEditing ? (
                <Edit className="w-8 h-8 text-white" />
            ) : (
                <UserPlus className="w-8 h-8 text-white" />
            )}
        </div>
        <div>
        <h2 className="text-2xl font-bold" style={{ color: "white" }}>
  {isEditing ? 'Modifier la patiente' : 'Ajouter une femme enceinte'}
</h2>

            <p className="text-white/80 text-sm">
                {isEditing ? 'Mettre à jour les informations' : 'Remplissez les informations requises'}
            </p>
        </div>
    </div>
</div>


            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Nom */}
                <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                        <User className="w-4 h-4 mr-2 text-gray-500" />
                        Nom *
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            name="nom"
                            value={form.nom}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                            required
                            disabled={isSubmitting}
                            placeholder="Entrez le nom de famille"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <div className="w-2 h-2 bg-blue-500 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity duration-200"></div>
                        </div>
                    </div>
                </div>

                {/* Prénom */}
                <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                        <User className="w-4 h-4 mr-2 text-gray-500" />
                        Prénom *
                    </label>
                    <input
                        type="text"
                        name="prenom"
                        value={form.prenom}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                        required
                        disabled={isSubmitting}
                        placeholder="Entrez le prénom"
                    />
                </div>

                {/* Âge */}
                <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                        Âge *
                    </label>
                    <input
                        type="number"
                        name="age"
                        value={form.age}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                        required
                        disabled={isSubmitting}
                        min="10"
                        max="60"
                        placeholder="Âge en années"
                    />
                </div>

                {/* Adresse */}
                <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                        <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                        Adresse *
                    </label>
                    <input
                        type="text"
                        name="adresse"
                        value={form.adresse}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                        required
                        disabled={isSubmitting}
                        placeholder="Adresse complète"
                    />
                </div>

                {/* Téléphone */}
                <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                        <Phone className="w-4 h-4 mr-2 text-gray-500" />
                        Téléphone *
                    </label>
                    <input
                        type="tel"
                        name="telephone"
                        value={form.telephone}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400"
                        required
                        disabled={isSubmitting}
                        pattern="[0-9]{8,15}"
                        placeholder="Numéro de téléphone"
                    />
                </div>

                {/* Message d'erreur */}
                {error && (
                    <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                {/* Boutons d'action */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex-1 flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 hover:scale-105 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X className="w-5 h-5 mr-2" />
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-200 hover:scale-105 hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                                {isEditing ? 'Modification...' : 'Ajout...'}
                            </>
                        ) : (
                            <>
                                {isEditing ? (
                                    <Edit className="w-5 h-5 mr-2" />
                                ) : (
                                    <Plus className="w-5 h-5 mr-2" />
                                )}
                                {isEditing ? 'Modifier' : 'Ajouter'}
                            </>
                        )}
                    </button>
                </div>

                {/* Note informative */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-start space-x-3">
                        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-blue-800 mb-1">Information importante</p>
                            <p className="text-xs text-blue-600">
                                Tous les champs marqués d&apos;un astérisque (*) sont obligatoires. 
                                Les informations seront utilisées pour le suivi médical de la patiente.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
);

}
