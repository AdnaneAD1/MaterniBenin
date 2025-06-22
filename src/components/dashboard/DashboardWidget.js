"use client";

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';

const DashboardWidget = ({
    title,
    subtitle = '',
    children,
    className = '',
    actions = [],
    collapsible = false,
    initiallyCollapsed = false,
    footerContent = null
}) => {
    const [collapsed, setCollapsed] = useState(initiallyCollapsed);
    const [showActionsMenu, setShowActionsMenu] = useState(false);

    return (
        <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <div>
                    <h3 className="text-lg font-medium text-text-primary">{title}</h3>
                    {subtitle && <p className="text-sm text-text-secondary mt-1">{subtitle}</p>}
                </div>

                <div className="flex items-center space-x-2">
                    {collapsible && (
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="p-1 text-text-secondary hover:text-text-primary rounded-full hover:bg-gray-100"
                        >
                            <svg
                                className={`h-5 w-5 transform transition-transform ${collapsed ? 'rotate-180' : ''}`}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                    )}

                    {actions.length > 0 && (<div className="relative">
                        <button
                            onClick={() => setShowActionsMenu(!showActionsMenu)}
                            className="p-1 text-text-secondary hover:text-text-primary rounded-full hover:bg-gray-100"
                        >
                            <FontAwesomeIcon icon={faEllipsisV} className="h-5 w-5" />
                        </button>

                        {showActionsMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                <div className="py-1">
                                    {actions.map((action, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                action.onClick();
                                                setShowActionsMenu(false);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-gray-100"
                                        >
                                            {action.icon && (
                                                <FontAwesomeIcon icon={action.icon} className="mr-2 h-4 w-4" />
                                            )}
                                            {action.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    )}
                </div>
            </div>

            {!collapsed && (
                <>
                    <div className="p-6">
                        {children}
                    </div>

                    {footerContent && (
                        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                            {footerContent}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default DashboardWidget;
