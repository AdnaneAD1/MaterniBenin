"use client";

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SearchBar from '@/components/ui/SearchBar';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faStethoscope,
    faFilter,
    faEye,
    faEdit,
    faTrash,
    faFileDownload
} from '@fortawesome/free-solid-svg-icons';

export default function CPNPage() {
    // State for search term
    const [searchTerm, setSearchTerm] = useState('');
    // State for filter dropdown
    const [showFilters, setShowFilters] = useState(false);

    // Sample data for CPN
    const cpnData = [
        {
            id: 'CPN001',
            patientName: 'Afiavi HOUNSA',
            patientId: 'PT001',
            date: '2025-06-01',
            gestationalAge: '24 semaines',
            visitNumber: 2,
            doctor: 'Dr. Kokou',
            status: 'Terminé'
        },
        {
            id: 'CPN002',
            patientName: 'Blandine AGOSSOU',
            patientId: 'PT002',
            date: '2025-06-05',
            gestationalAge: '12 semaines',
            visitNumber: 1,
            doctor: 'Dr. Kokou',
            status: 'Terminé'
        },
        {
            id: 'CPN003',
            patientName: 'Edwige DANSOU',
            patientId: 'PT005',
            date: '2025-06-14',
            gestationalAge: '18 semaines',
            visitNumber: 1,
            doctor: 'Dr. Kokou',
            status: 'Terminé'
        },
        {
            id: 'CPN004',
            patientName: 'Danielle LOKONON',
            patientId: 'PT004',
            date: '2025-06-23',
            gestationalAge: '34 semaines',
            visitNumber: 3,
            doctor: 'Dr. Kokou',
            status: 'Planifié'
        }
    ];

    // Define columns for the table
    const columns = [
        {
            key: 'id',
            header: 'ID',
            sortable: true
        },
        {
            key: 'patientName',
            header: 'Patiente',
            sortable: true
        },
        {
            key: 'date',
            header: 'Date',
            sortable: true,
            render: (row) => new Date(row.date).toLocaleDateString('fr-FR')
        },
        {
            key: 'visitNumber',
            header: 'Visite N°',
            sortable: true
        },
        {
            key: 'status',
            header: 'Statut',
            sortable: true,
            render: (row) => {
                const statusStyles = {
                    'Terminé': 'bg-green-100 text-green-800',
                    'Planifié': 'bg-blue-100 text-blue-800',
                    'Annulé': 'bg-red-100 text-red-800'
                };

                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[row.status] || ''}`}>
                        {row.status}
                    </span>
                );
            }
        }
    ];

    // Handle search
    const handleSearch = (term) => {
        setSearchTerm(term);
        // In a real app, you would filter the data or call an API
        console.log(`Searching for: ${term}`);
    };

    // Handle row click to view CPN details
    const handleRowClick = (cpn) => {
        console.log(`View CPN details: ${cpn.id}`);
        // In a real app, you would navigate to the CPN detail page
    };

    // State for period filter
    const [periodFilter, setPeriodFilter] = useState("");

    // Helper for period filtering
    function isInPeriod(date, period) {
        const now = new Date();
        const d = new Date(date);
        if (!period || period === "") return true;
        if (period === "today") {
            return d.toDateString() === now.toDateString();
        }
        if (period === "week") {
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            return d >= weekStart && d <= weekEnd;
        }
        if (period === "month") {
            return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
        }
        return true;
    }

    // Filter the CPN data based on search term and period
    const filteredCpn = cpnData.filter(cpn =>
        (cpn.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cpn.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
        isInPeriod(cpn.date, periodFilter)
    );

    return (
        <DashboardLayout>
            {/* Barre de recherche et filtres modernes */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div className="w-full md:w-1/2">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0Z" /></svg>
                        </span>
                        <input
                            type="text"
                            className="pl-10 pr-4 py-2 w-full rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/30 text-base shadow-sm"
                            placeholder="Rechercher une consultation..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-2 md:mt-0">
                    <Button
                        variant="outline"
                        icon={<FontAwesomeIcon icon={faFilter} />}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        Filtres avancés
                    </Button>
                </div>
            </div>

            {showFilters && (
                <div className="mb-4 bg-white p-4 rounded-lg shadow flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Période</label>
                        <select
                            className="rounded border-gray-300"
                            value={periodFilter}
                            onChange={e => setPeriodFilter(e.target.value)}
                        >
                            <option value="">Toutes dates</option>
                            <option value="today">Aujourd'hui</option>
                            <option value="week">Cette semaine</option>
                            <option value="month">Ce mois</option>
                        </select>
                    </div>
                    <div>
                        <Button size="sm" variant="primary" onClick={() => setShowFilters(false)}>Appliquer</Button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow">
                <DataTable
                    columns={columns}
                    data={filteredCpn}
                    onRowClick={handleRowClick}
                    emptyMessage="Aucune consultation trouvée"
                />
            </div>
        </DashboardLayout>
    );
}
