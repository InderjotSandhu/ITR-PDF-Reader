import React, { useMemo } from 'react';
import './FilterPanel.css';
import SearchBar from './SearchBar';
import DateRangeFilter from './DateRangeFilter';
import TransactionTypeFilter from './TransactionTypeFilter';
import FolioFilter from './FolioFilter';
import AmountRangeFilter from './AmountRangeFilter';
import ActiveFilters from './ActiveFilters';
import { useFilters } from '../../context/FilterContext';
import { countActiveFilters } from '../../types/filters';
import { getUniqueFolioNumbers } from '../../utils/filterUtils';

/**
 * FilterPanel component - Container for all filter controls
 * Composes all individual filter components and provides clear all functionality
 * 
 * @param {Object} props
 * @param {boolean} [props.darkMode] - Dark mode flag
 * @param {boolean} [props.collapsible] - Whether the panel should be collapsible on mobile
 */
const FilterPanel = ({ darkMode = false, collapsible = true }) => {
  const { filters, setFilters, clearFilters, removeFilter, allTransactions } = useFilters();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // Add keyboard shortcut for clearing filters (Escape key)
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      // Check if Escape key is pressed and there are active filters
      if (event.key === 'Escape' && countActiveFilters(filters) > 0) {
        // Only clear if not typing in an input field
        const activeElement = document.activeElement;
        const isInputField = activeElement && (
          activeElement.tagName === 'INPUT' || 
          activeElement.tagName === 'TEXTAREA' ||
          activeElement.tagName === 'SELECT'
        );
        
        if (!isInputField) {
          event.preventDefault();
          clearFilters();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filters, clearFilters]);

  // Memoize unique folio numbers extraction
  const availableFolios = useMemo(() => {
    return getUniqueFolioNumbers(allTransactions);
  }, [allTransactions]);

  // Memoize active filter count calculation
  const activeFilterCount = useMemo(() => {
    return countActiveFilters(filters);
  }, [filters]);
  
  const hasActiveFilters = activeFilterCount > 0;

  /**
   * Handle date range filter change
   */
  const handleDateRangeChange = (dateRange) => {
    setFilters({
      ...filters,
      dateRange
    });
  };

  /**
   * Handle transaction type filter change
   */
  const handleTransactionTypesChange = (transactionTypes) => {
    setFilters({
      ...filters,
      transactionTypes
    });
  };

  /**
   * Handle search query change
   */
  const handleSearchQueryChange = (searchQuery) => {
    setFilters({
      ...filters,
      searchQuery
    });
  };

  /**
   * Handle folio number filter change
   */
  const handleFolioNumberChange = (folioNumber) => {
    setFilters({
      ...filters,
      folioNumber
    });
  };

  /**
   * Handle amount range filter change
   */
  const handleAmountRangeChange = (amountRange) => {
    setFilters({
      ...filters,
      amountRange
    });
  };

  /**
   * Toggle panel collapse state (mobile)
   */
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside 
      className={`filter-panel ${darkMode ? 'dark-mode' : ''} ${isCollapsed ? 'collapsed' : ''}`}
      role="region"
      aria-label="Transaction filters"
    >
      <div className="filter-panel-header">
        <h2 className="filter-panel-title" id="filter-panel-title">
          Filters
          {activeFilterCount > 0 && (
            <span className="filter-count-badge" aria-label={`${activeFilterCount} active filters`}>
              {activeFilterCount}
            </span>
          )}
        </h2>
        <div className="filter-panel-actions">
          {hasActiveFilters && (
            <button
              className="clear-all-filters-button"
              onClick={clearFilters}
              aria-label={`Clear all ${activeFilterCount} filters`}
            >
              Clear All
            </button>
          )}
          {collapsible && (
            <button
              className="collapse-toggle"
              onClick={toggleCollapse}
              aria-label={isCollapsed ? 'Expand filters panel' : 'Collapse filters panel'}
              aria-expanded={!isCollapsed}
              aria-controls="filter-panel-content"
            >
              {isCollapsed ? '▼' : '▲'}
            </button>
          )}
        </div>
      </div>

      <div 
        id="filter-panel-content"
        className="filter-panel-content"
        aria-labelledby="filter-panel-title"
      >
        {/* Active Filters Display */}
        <ActiveFilters
          filters={filters}
          onRemoveFilter={removeFilter}
          onClearAll={clearFilters}
          darkMode={darkMode}
        />

        {/* Search Bar */}
        <SearchBar
          value={filters.searchQuery}
          onChange={handleSearchQueryChange}
          placeholder="Search by scheme name..."
          debounceMs={300}
          darkMode={darkMode}
        />

        {/* Date Range Filter */}
        <DateRangeFilter
          value={filters.dateRange}
          onChange={handleDateRangeChange}
          darkMode={darkMode}
        />

        {/* Transaction Type Filter */}
        <TransactionTypeFilter
          value={filters.transactionTypes}
          onChange={handleTransactionTypesChange}
          darkMode={darkMode}
        />

        {/* Folio Filter */}
        <FolioFilter
          value={filters.folioNumber}
          onChange={handleFolioNumberChange}
          availableFolios={availableFolios}
          darkMode={darkMode}
        />

        {/* Amount Range Filter */}
        <AmountRangeFilter
          value={filters.amountRange}
          onChange={handleAmountRangeChange}
          darkMode={darkMode}
        />
      </div>
    </aside>
  );
};

export default FilterPanel;
