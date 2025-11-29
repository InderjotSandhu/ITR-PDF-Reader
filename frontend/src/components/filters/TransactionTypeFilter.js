import React from 'react';
import './TransactionTypeFilter.css';

const TransactionTypeFilter = ({ value = [], onChange, darkMode }) => {
  const selectedTypes = value || [];

  // Define the two transaction categories
  const transactionCategories = [
    { id: 'administrative', label: 'Administrative' },
    { id: 'financial', label: 'Financial' }
  ];

  /**
   * Check if all categories are selected
   */
  const allSelected = selectedTypes.length === transactionCategories.length;

  /**
   * Handle individual checkbox change
   */
  const handleTypeToggle = (categoryId) => {
    const newSelectedTypes = selectedTypes.includes(categoryId)
      ? selectedTypes.filter(t => t !== categoryId)
      : [...selectedTypes, categoryId];
    
    onChange(newSelectedTypes);
  };

  /**
   * Handle Select All
   */
  const handleSelectAll = () => {
    onChange(transactionCategories.map(cat => cat.id));
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

      <div className="checkbox-group" role="group" aria-label="Transaction category options">
        {transactionCategories.map(category => (
          <label key={category.id} className="checkbox-label">
            <input
              type="checkbox"
              className="checkbox-input"
              checked={selectedTypes.includes(category.id)}
              onChange={() => handleTypeToggle(category.id)}
              aria-label={`Filter by ${category.label} transactions`}
              aria-checked={selectedTypes.includes(category.id)}
            />
            <span className="checkbox-text">{category.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default TransactionTypeFilter;
