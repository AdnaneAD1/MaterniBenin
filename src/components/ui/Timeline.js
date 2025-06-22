import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircle } from '@fortawesome/free-solid-svg-icons';

// Exemple de données fictives (à remplacer par un vrai fetch ou props)
const mockInterventions = [
  {
    id: 1,
    id_utilisateur: 101,
    type: 'Consultation',
    action: 'Ajout consultation prénatale',
    date_action: '2025-06-01T09:30:00',
    utilisateur: 'Mme K. Dossou',
  },
  {
    id: 2,
    id_utilisateur: 101,
    type: 'Accouchement',
    action: 'Ajout accouchement (jumeaux)',
    date_action: '2025-06-15T14:10:00',
    utilisateur: 'Mme K. Dossou',
  },
  {
    id: 3,
    id_utilisateur: 102,
    type: 'Suivi',
    action: 'Modification dossier maternité',
    date_action: '2025-06-20T11:45:00',
    utilisateur: 'Dr. A. Houngbédji',
  },
];

export default function Timeline({ interventions = mockInterventions }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-base font-bold text-primary mb-4">Historique des interventions</h2>
      <ul className="relative border-l-2 border-blue-100 ml-4">
        {interventions
          .sort((a, b) => new Date(a.date_action) - new Date(b.date_action))
          .map((item, idx) => (
            <li key={item.id} className="mb-8 ml-4">
              <div className="absolute -left-5 top-0">
                <FontAwesomeIcon icon={faCircle} className="text-blue-400 w-3 h-3" />
              </div>
              <div className="text-xs text-gray-400 mb-1">
                {new Date(item.date_action).toLocaleString('fr-FR', {
                  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </div>
              <div className="text-sm text-gray-700">
                <span className="font-semibold text-primary">{item.type}</span> — {item.action}
              </div>
              <div className="text-xs text-gray-500">Par : {item.utilisateur}</div>
            </li>
        ))}
      </ul>
    </div>
  );
}
