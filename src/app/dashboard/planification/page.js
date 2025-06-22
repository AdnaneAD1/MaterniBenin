"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import DataTable from "@/components/ui/DataTable";
import AddPlanificationModal from "@/components/AddPlanificationModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCalendarCheck,
    faFilter,
    faPlus,
    faFileDownload
} from "@fortawesome/free-solid-svg-icons";

// Données mockées pour la planification familiale
const initialData = [
    {
        id: "PF001",
        nom: "YACOUBOU",
        prenom: "Awa",
        age: 27,
        method: "Implant",
        date: "2025-06-15",
        sexe: "Féminin"
    },
    {
        id: "PF002",
        nom: "YACOUBOU",
        prenom: "Awa",
        age: 27,
        method: "Pilule",
        date: "2025-06-10",
        sexe: "Féminin"
    },
    {
        id: "PF003",
        nom: "YACOUBOU",
        prenom: "Awa",
        age: 27,
        method: "Injectable",
        date: "2025-06-01",
        sexe: "Féminin"
    }
];

const statusStyles = {
    "En cours": "bg-blue-100 text-blue-800",
    "Terminé": "bg-green-100 text-green-800",
    "Annulé": "bg-red-100 text-red-800"
};

export default function PlanificationPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [planifications, setPlanifications] = useState(initialData);
    const [showAddModal, setShowAddModal] = useState(false);

    const handleAddPlanification = (planif) => {
        setPlanifications(prev => [planif, ...prev]);
    };

    return (
        <DashboardLayout>
            {/* Barre de recherche et filtre période */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div className="w-full md:w-1/2">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z" /></svg>
                        </span>
                        <input
                            type="text"
                            className="pl-10 pr-4 py-2 w-full rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/30 text-base shadow-sm"
                            placeholder="Rechercher une planification..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex gap-2 mt-4 md:mt-0">
                    <Button
                        variant="primary"
                        icon={<FontAwesomeIcon icon={faPlus} />}
                        onClick={() => setShowAddModal(true)}
                    >
                        Nouvelle planification
                    </Button>
                    <AddPlanificationModal
                        open={showAddModal}
                        onClose={() => setShowAddModal(false)}
                        onAdd={handleAddPlanification}
                    />
                </div>
            </div>

            {/* Tableau moderne avec DataTable */}
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <DataTable
                    columns={[
                        {
                            key: 'id',
                            header: 'ID',
                            className: 'font-mono text-sm',
                            sortable: true,
                        },
                        {
                            key: 'nom',
                            header: 'Nom',
                            sortable: true,
                        },
                        {
                            key: 'prenom',
                            header: 'Prénom',
                            sortable: true,
                        },
                        {
                            key: 'age',
                            header: 'Age',
                            sortable: true,
                        },
                        {
                            key: 'sexe',
                            header: 'Sexe',
                            sortable: true,
                        },
                        {
                            key: 'method',
                            header: 'Méthode',
                            sortable: true,
                        },
                        {
                            key: 'date',
                            header: 'Date',
                            sortable: true,
                        }
                    ]}
                    data={planifications}
                    emptyMessage="Aucune planification trouvée"
                    itemsPerPage={8}
                />
            </div>

            <p>Total des actes de planification : <span className="font-medium">{planifications.length}</span></p>
        </DashboardLayout>
    );
}
