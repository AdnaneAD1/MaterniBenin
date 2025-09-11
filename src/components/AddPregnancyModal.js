"use client";
import { useState } from 'react';
import { X, Baby, Calendar } from 'lucide-react';

export default function AddPregnancyModal({ open, onClose, onSubmit, loading }) {
    const [formData, setFormData] = useState({
        moisGrossesse: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.moisGrossesse || formData.moisGrossesse < 1 || formData.moisGrossesse > 9) {
            alert('Veuillez entrer un nombre de mois valide (1-9)');
            return;
        }

        onSubmit(formData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetForm = () => {
        setFormData({
            moisGrossesse: ''
        });
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Baby className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Ajouter une grossesse</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre approximatif de mois de grossesse
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="number"
                                name="moisGrossesse"
                                value={formData.moisGrossesse}
                                onChange={handleChange}
                                min="1"
                                max="9"
                                step="1"
                                placeholder="Ex: 3"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                required
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Entrez un nombre entre 1 et 9 mois
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                    Ajout...
                                </>
                            ) : (
                                'Ajouter la grossesse'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
