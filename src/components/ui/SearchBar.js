"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

const SearchBar = ({
    placeholder = 'Rechercher...',
    onSearch,
    className = '',
    initialValue = ''
}) => {
    const [searchTerm, setSearchTerm] = useState(initialValue);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(searchTerm);
    };

    const clearSearch = () => {
        setSearchTerm('');
        onSearch('');
    };

    return (
        <form onSubmit={handleSubmit} className={`relative ${className}`}>
            <div className="relative">
                <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md 
                     bg-white text-gray-900 
                     placeholder-gray-500
                     focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />

                {searchTerm && (
                    <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                )}
            </div>
        </form>
    );
};

export default SearchBar;
