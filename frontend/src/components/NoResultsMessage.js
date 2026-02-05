import React from 'react';
import EmptyState from './EmptyState';

/**
 * NoResultsMessage component - Displays when filters result in no data
 * @param {Object} props
 * @param {boolean} props.darkMode - Whether dark mode is enabled
 * @param {Object} props.activeFilters - Currently active filters
 * @param {Function} props.onClearFilters - Function to clear all filters
 */
const NoResultsMessage = ({ 
  darkMode = false,
  activeFilters = {},
  onClearFilters
}) => {
  const getFilterSummary = () => {
    const filters = [];
    
    if (activeFilters.dateRange) {
      filters.push('date range');
    }
    if (activeFilters.transactionType && activeFilters.transactionType.length > 0) {
      filters.push('transaction type');
    }
    if (activeFilters.folio && activeFilters.folio.length > 0) {
      filters.push('folio');
    }
    if (activeFilters.amountRange) {
      filters.push('amount range');
    }
    if (activeFilters.search) {
      filters.push('search term');
    }
    
    return filters.length > 0 ? filters.join(', ') : 'current filters';
  };

  const filterSummary = getFilterSummary();

  return (
    <EmptyState
      type="no-results"
      title="No Matching Transactions"
      message={`No transactions match your ${filterSummary}. Try adjusting your filter criteria or clearing some filters to see more results.`}
      icon="🔍"
      darkMode={darkMode}
    >
      {onClearFilters && (
        <button 
          className="clear-filters-btn"
          onClick={onClearFilters}
        >
          Clear All Filters
        </button>
      )}
    </EmptyState>
  );
};

export default NoResultsMessage;