import React, { useMemo } from 'react';
import './FolioFilter.css';

const FolioFilter = ({ value, onChange, availableFolios = [], darkMode }) => {
  const selectedFolio = value || null;

  /**
   * Get unique folio numbers from available folios, sorted
   */
  const uniqueFolios = useMemo(() => {
    return [...new Set(availableFolios)].sort();
  }, [availableFolios]);

  /**
   * Handle dropdown selection change
   */
  const handleFolioChange = (e) => {
    const selectedValue = e.target.value;
    // If "All Folios" is selected, pass null to clear the filter
    onChange(selectedValue === '' ? null : selectedValue);
  };

  /**
   * Handle clear button click
   */
  const handleClear = () => {
    onChange(null);
  };

  const hasValue = selectedFolio !== null;

  return (
    <div className={`folio-filter ${darkMode ? 'dark-mode' : ''}`} role="group" aria-labelledby="folio-label">
      <div className="filter-header">
        <label id="folio-label" htmlFor="folio-select" className="filter-label">Folio Number</label>
        {hasValue && (
          <button
            className="clear-button-small"
            onClick={handleClear}
            aria-label="Clear folio filter"
            type="button"
          >
            ✕
          </button>
        )}
      </div>
      
      <div className="select-wrapper">
        <select
          id="folio-select"
          className="folio-select"
          value={selectedFolio || ''}
          onChange={handleFolioChange}
          aria-label="Select folio number to filter transactions"
          aria-describedby="folio-label"
        >
          <option value="">All Folios</option>
          {uniqueFolios.length === 0 ? (
            <option disabled>No folios available</option>
          ) : (
            uniqueFolios.map(folio => (
              <option key={folio} value={folio}>
                {folio}
              </option>
            ))
          )}
        </select>
        <span className="select-arrow" aria-hidden="true">▼</span>
      </div>
    </div>
  );
};

export default FolioFilter;
