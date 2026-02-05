import React from 'react';
import './EmptyState.css';

/**
 * EmptyState component - Displays when no data is available
 * @param {Object} props
 * @param {string} props.type - Type of empty state ('no-data', 'no-results', 'limited-data')
 * @param {string} props.title - Title to display
 * @param {string} props.message - Message to display
 * @param {string} props.icon - Icon to display (emoji or icon class)
 * @param {boolean} props.darkMode - Whether dark mode is enabled
 * @param {React.ReactNode} props.children - Optional children (e.g., action buttons)
 */
const EmptyState = ({ 
  type = 'no-data',
  title,
  message,
  icon = '📊',
  darkMode = false,
  children
}) => {
  return (
    <div className={`empty-state ${type} ${darkMode ? 'dark-mode' : ''}`}>
      <div className="empty-state-content">
        <div className="empty-state-icon">
          {icon}
        </div>
        <h2 className="empty-state-title">
          {title}
        </h2>
        <p className="empty-state-message">
          {message}
        </p>
        {children && (
          <div className="empty-state-actions">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;