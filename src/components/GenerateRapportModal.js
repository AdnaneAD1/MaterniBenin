import React, { useState } from "react";
import Button from "@/components/ui/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt } from "@fortawesome/free-solid-svg-icons";

const MOIS_OPTIONS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

export default function GenerateRapportModal({ open, onClose }) {
  const [type, setType] = useState("CPN");
  const [mois, setMois] = useState("");
  const [annee, setAnnee] = useState(2025);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const handleSubmit = e => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-primary text-xl"
          onClick={onClose}
          aria-label="Fermer"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
          <FontAwesomeIcon icon={faFileAlt} /> Générer un rapport
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de rapport</label>
            <select className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" value={type} onChange={e => setType(e.target.value)} required>
              <option value="CPN">CPN</option>
              <option value="Accouchement">Accouchement</option>
              <option value="Planification">Planification</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mois</label>
            <select className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2" value={mois} onChange={e => setMois(e.target.value)} required>
              <option value="">Sélectionner le mois</option>
              {MOIS_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Année</label>
            <input
              type="number"
              className="w-full rounded-lg border border-gray-400 focus:ring-2 focus:ring-primary/30 px-3 py-2"
              value={annee}
              onChange={e => setAnnee(e.target.value)}
              min="2020"
              max="2100"
              required
            />
          </div>
          {success && <div className="text-green-600 text-sm">Rapport généré avec succès !</div>}
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Génération..." : "Générer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
