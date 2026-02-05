import React from 'react';
import './ViewToggle.css';

/**
 * ViewToggle component - Toggle between dashboard and table views
 * @param {Object} props
 * @param {'dashboard' | 'table'} props.currentView - Current active view
 * @param {(view: 'dashboard' | 'table') => void} props.onViewChange - Callback when view changes
 * @param {boolean} [props.darkMode=false] - Whether dark mode is enabled
 */
const ViewToggle = ({ currentView, onViewChange, darkMode = false }) => {
  const handleViewChange = (view) => {
    if (view !== currentView) {
      onViewChange(view);
    }
  };

  return (
    <div className={`view-toggle ${darkMode ? 'dark-mode' : ''}`}>
      <button
        className={`view-toggle-button ${currentView === 'dashboard' ? 'active' : ''}`}
        onClick={() => handleViewChange('dashboard')}
        aria-label="Switch to dashboard view"
        aria-pressed={currentView === 'dashboard'}
      >
        <span className="view-icon" role="img" aria-label="Dashboard icon">
          📊
        </span>
        <span className="view-label">Dashboard</span>
      </button>
      
      <button
        className={`view-toggle-button ${currentView === 'table' ? 'active' : ''}`}
        onClick={() => handleViewChange('table')}
        aria-label="Switch to table view"
        aria-pressed={currentView === 'table'}
      >
        <span className="view-icon" role="img" aria-label="Table icon">
          📋
        </span>
        <span className="view-label">Table</span>
      </button>
    </div>
  );
};

export default ViewToggle;
