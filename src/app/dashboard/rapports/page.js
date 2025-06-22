"use client";
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DataTable from "@/components/ui/DataTable";
import Button from "@/components/ui/Button";
import GenerateRapportModal from "@/components/GenerateRapportModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileDownload, faPlus, faFilter } from "@fortawesome/free-solid-svg-icons";

const MOCK_RAPPORTS = [
  {
    id: 1,
    type: "CPN",
    mois: "Juin",
    annee: 2025,
    statut: "Généré",
    date_generation: "2025-07-01",
    fichier: "/rapports/cpn_juin_2025.pdf"
  },
  {
    id: 2,
    type: "Accouchement",
    mois: "Mai",
    annee: 2025,
    statut: "Généré",
    date_generation: "2025-06-01",
    fichier: "/rapports/accouchement_mai_2025.pdf"
  },
  {
    id: 3,
    type: "Planification",
    mois: "Mai",
    annee: 2025,
    statut: "Généré",
    date_generation: "2025-06-01",
    fichier: "/rapports/planification_mai_2025.pdf"
  }
];

export default function RapportsPage() {
  const [rapports, setRapports] = useState(MOCK_RAPPORTS);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [moisFilter, setMoisFilter] = useState("");
  const [anneeFilter, setAnneeFilter] = useState("");

  const filteredRapports = rapports.filter(r =>
    (typeFilter === "" || r.type === typeFilter) &&
    (moisFilter === "" || r.mois === moisFilter) &&
    (anneeFilter === "" || String(r.annee) === anneeFilter)
  );

  return (
    <DashboardLayout>
      {/* Filtres */}
      <div className="flex flex-wrap gap-4 items-end mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
          <select className="rounded border-gray-300" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="">Tous</option>
            <option value="CPN">CPN</option>
            <option value="Accouchement">Accouchement</option>
            <option value="Planification">Planification</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Mois</label>
          <select className="rounded border-gray-300" value={moisFilter} onChange={e => setMoisFilter(e.target.value)}>
            <option value="">Tous</option>
            <option value="Janvier">Janvier</option>
            <option value="Février">Février</option>
            <option value="Mars">Mars</option>
            <option value="Avril">Avril</option>
            <option value="Mai">Mai</option>
            <option value="Juin">Juin</option>
            <option value="Juillet">Juillet</option>
            <option value="Août">Août</option>
            <option value="Septembre">Septembre</option>
            <option value="Octobre">Octobre</option>
            <option value="Novembre">Novembre</option>
            <option value="Décembre">Décembre</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Année</label>
          <input type="number" className="rounded border-gray-300" value={anneeFilter} onChange={e => setAnneeFilter(e.target.value)} placeholder="2025" min="2020" max="2100" />
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button variant="primary" icon={<FontAwesomeIcon icon={faPlus} />} onClick={() => setShowGenerateModal(true)}>
            Générer un rapport
          </Button>
          <GenerateRapportModal open={showGenerateModal} onClose={() => setShowGenerateModal(false)} />
        </div>
      </div>

      {/* Tableau des rapports */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <DataTable
          columns={[
            { key: 'id', header: 'N°', sortable: true },
            { key: 'type', header: 'Type', sortable: true },
            { key: 'mois', header: 'Mois', sortable: true },
            { key: 'annee', header: 'Année', sortable: true },
            { key: 'statut', header: 'Statut', sortable: true },
            { key: 'date_generation', header: 'Généré le', sortable: true },
            {
              key: 'fichier',
              header: 'Fichier',
              render: row => (
                <a href={row.fichier} download className="text-primary font-semibold hover:underline flex items-center gap-1">
                  <FontAwesomeIcon icon={faFileDownload} /> Télécharger
                </a>
              )
            }
          ]}
          data={filteredRapports}
          emptyMessage="Aucun rapport trouvé"
          itemsPerPage={8}
        />
      </div>
    </DashboardLayout>
  );
}
