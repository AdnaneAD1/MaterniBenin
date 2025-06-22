"use client";

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

const DataTable = ({
    columns,
    data,
    onRowClick,
    pagination = true,
    itemsPerPage = 10,
    emptyMessage = "Aucune donnée disponible"
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

    // Handle sorting
    const requestSort = (key) => {
        let direction = 'ascending';

        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
            direction = null;
        }

        setSortConfig({ key, direction });
    };

    // Apply sorting to data
    const sortedData = () => {
        if (!sortConfig.key || !sortConfig.direction) return data;

        return [...data].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    };

    // Pagination logic
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const paginatedData = pagination
        ? sortedData().slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        : sortedData();

    const nextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const prevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const goToPage = (page) => {
        setCurrentPage(page);
    };

    // Render sort icon
    const getSortIcon = (columnKey) => {
        if (sortConfig.key !== columnKey) return <FontAwesomeIcon icon={faSort} className="ml-1 text-gray-400" />;

        if (sortConfig.direction === 'ascending') {
            return <FontAwesomeIcon icon={faSortUp} className="ml-1 text-primary" />;
        }

        return <FontAwesomeIcon icon={faSortDown} className="ml-1 text-primary" />;
    };

    // Generate pagination buttons
    const renderPaginationButtons = () => {
        const buttons = [];
        const maxButtons = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxButtons - 1);

        if (endPage - startPage + 1 < maxButtons) {
            startPage = Math.max(1, endPage - maxButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <button
                    key={i}
                    onClick={() => goToPage(i)}
                    className={`px-3 py-1 rounded-md ${currentPage === i
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    {i}
                </button>
            );
        }

        return buttons;
    };

    return (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    scope="col"
                                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.sortable ? 'cursor-pointer select-none' : ''
                                        }`}
                                    onClick={column.sortable ? () => requestSort(column.key) : undefined}
                                >
                                    <div className="flex items-center">
                                        {column.header}
                                        {column.sortable && getSortIcon(column.key)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedData.length > 0 ? (
                            paginatedData.map((row, rowIndex) => (
                                <tr
                                    key={row.id || rowIndex}
                                    className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                                >
                                    {columns.map((column) => (
                                        <td
                                            key={`${row.id || rowIndex}-${column.key}`}
                                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-800"
                                        >
                                            {column.render ? column.render(row) : row[column.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-6 py-10 text-center text-sm text-gray-500"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {pagination && data.length > 0 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Affichage de <span className="font-medium">{Math.min(data.length, (currentPage - 1) * itemsPerPage + 1)}</span>{' '}
                                à <span className="font-medium">{Math.min(data.length, currentPage * itemsPerPage)}</span>{' '}
                                sur <span className="font-medium">{data.length}</span> résultats
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={prevPage}
                                    disabled={currentPage === 1}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="sr-only">Précédent</span>
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>

                                {renderPaginationButtons()}

                                <button
                                    onClick={nextPage}
                                    disabled={currentPage === totalPages}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    <span className="sr-only">Suivant</span>
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Mobile pagination */}
                    <div className="flex items-center justify-between sm:hidden">
                        <button
                            onClick={prevPage}
                            disabled={currentPage === 1}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === 1
                                ? 'text-gray-300 bg-white cursor-not-allowed'
                                : 'text-gray-700 bg-white hover:bg-gray-50'
                                }`}
                        >
                            Précédent
                        </button>
                        <div className="text-sm text-gray-700">
                            <span className="font-medium">{currentPage}</span> / <span className="font-medium">{totalPages}</span>
                        </div>
                        <button
                            onClick={nextPage}
                            disabled={currentPage === totalPages}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === totalPages
                                ? 'text-gray-300 bg-white cursor-not-allowed'
                                : 'text-gray-700 bg-white hover:bg-gray-50'
                                }`}
                        >
                            Suivant
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;
