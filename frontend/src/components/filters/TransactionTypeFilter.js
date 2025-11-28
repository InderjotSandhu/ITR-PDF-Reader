import React, { useMemo } from 'react';
import './TransactionTypeFilter.css';

const TransactionTypeFilter = ({ value = [], onChange, availableTypes = [], darkMode }) => {
  const selectedTypes = value || [];

  /**
   * Get unique transaction types from available types
   */
  const uniqueTypes = useMemo(() => {
    return [...new Set(availableTypes)].sort();
  }, [availableTypes]);

  /**
   * Check if all types are selected
   */
  const allSelected = useMemo(() => {
    return uniqueTypes.length > 0 && selectedTypes.length === uniqueTypes.length;
  }, [uniqueTypes, selectedTypes]);

  /**
   * Handle individual checkbox change
   */
  const handleTypeToggle = (type) => {
    const newSelectedTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    
    onChange(newSelectedTypes);
  };

  /**
   * Handle Select All
   */
  const handleSelectAll = () => {
    onChange([...uniqueTypes]);
  };

  /**
   * Handle Deselect All
   */
  const handleDeselectAll = () => {
    onChange([]);
  };

  const hasValue = selectedTypes.length > 0;

  return (
    <div className={`transaction-type-filter ${darkMode ? 'dark-mode' : ''}`} role="group" aria-labelledby="transaction-type-label">
      <div className="filter-header">
        <label id="transaction-type-label" className="filter-label">Transaction Type</label>
        {hasValue && (
          <button
            className="clear-button-small"
            onClick={handleDeselectAll}
            aria-label="Clear transaction type filter"
            type="button"
          >
            ✕
          </button>
        )}
      </div>
      
      <div className="bulk-actions" role="group" aria-label="Bulk transaction type selection">
        <button
          className="bulk-action-button"
          onClick={handleSelectAll}
          disabled={allSelected}
          type="button"
          aria-label="Select all transaction types"
        >
          Select All
        </button>
        <button
          className="bulk-action-button"
          onClick={handleDeselectAll}
          disabled={selectedTypes.length === 0}
          type="button"
          aria-label="Deselect all transaction types"
        >
          Deselect All
        </button>
      </div>

      <div className="checkbox-group" role="group" aria-label="Transaction type options">
        {uniqueTypes.length === 0 ? (
          <div className="no-types-message" role="status">No transaction types available</div>
        ) : (
          uniqueTypes.map(type => (
            <label key={type} className="checkbox-label">
              <input
                type="checkbox"
                className="checkbox-input"
                checked={selectedTypes.includes(type)}
                onChange={() => handleTypeToggle(type)}
                aria-label={`Filter by ${type}`}
                aria-checked={selectedTypes.includes(type)}
              />
              <span className="checkbox-text">{type}</span>
            </label>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionTypeFilter;
