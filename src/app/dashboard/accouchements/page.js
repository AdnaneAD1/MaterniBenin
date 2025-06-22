"use client";

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SearchBar from '@/components/ui/SearchBar';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBaby,
    faFilter,
    faEye,
    faEdit,
    faFileDownload,
    faChevronDown
} from '@fortawesome/free-solid-svg-icons';

export default function AccouchementPage() {
    // State for search term
    const [searchTerm, setSearchTerm] = useState('');
    // State for filter dropdown
    const [showFilters, setShowFilters] = useState(false);

    // Sample data for accouchements
    const accouchementData = [
        {
            id: 'ACC001',
            patientName: 'Colette BOCOVO',
            patientId: 'PT003',
            date: '2025-06-10',
            time: '08:45',
            gender: 'F',
            weight: '3.2',
            type: 'Voie basse',
            outcome: 'Vivant',
            complications: 'Aucune'
        },
        {
            id: 'ACC002',
            patientName: 'Francine YEHOUESSI',
            patientId: 'PT006',
            date: '2025-06-08',
            time: '14:30',
            gender: 'M',
            weight: '3.5',
            type: 'Voie basse',
            outcome: 'Vivant',
            complications: 'Aucune'
        },
        {
            id: 'ACC003',
            patientName: 'Gisèle AKPLOGAN',
            patientId: 'PT007',
            date: '2025-06-05',
            time: '23:15',
            gender: 'F',
            weight: '2.9',
            type: 'Césarienne',
            outcome: 'Vivant',
            complications: 'Prééclampsie'
        },
        {
            id: 'ACC004',
            patientName: 'Huguette TOGBADJA',
            patientId: 'PT008',
            date: '2025-06-02',
            time: '10:20',
            gender: 'M',
            weight: '3.1',
            type: 'Voie basse',
            outcome: 'Vivant',
            complications: 'Aucune'
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
            key: 'time',
            header: 'Heure',
            sortable: true
        },
        {
            key: 'gender',
            header: 'Sexe',
            sortable: true,
            render: (row) => row.gender === 'M' ? 'Masculin' : 'Féminin'
        },
        {
            key: 'weight',
            header: 'Poids (kg)',
            sortable: true
        },
        {
            key: 'type',
            header: 'Type',
            sortable: true,
            render: (row) => {
                const typeStyles = {
                    'Voie basse': 'bg-green-100 text-green-800',
                    'Césarienne': 'bg-orange-100 text-orange-800'
                };

                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeStyles[row.type] || ''}`}>
                        {row.type}
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

    // Handle row click to view accouchement details
    const handleRowClick = (accouchement) => {
        console.log(`View accouchement details: ${accouchement.id}`);
        // In a real app, you would navigate to the accouchement detail page
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

    // Filter the accouchement data based on search term and period
    const filteredAccouchements = accouchementData.filter(acc =>
        (acc.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
        isInPeriod(acc.date, periodFilter)
    );

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
                            placeholder="Rechercher un accouchement..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
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
                    data={filteredAccouchements}
                    onRowClick={handleRowClick}
                    emptyMessage="Aucun accouchement trouvé"
                />
            </div>

            <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                    <p>Total des accouchements : <span className="font-medium">{accouchementData.length}</span></p>
                </div>
            </div>
        </DashboardLayout>
    );
}
