import React from 'react';
import './ActiveFilters.css';
import { countActiveFilters } from '../../types/filters';

/**
 * ActiveFilters component displays active filter tags with remove buttons
 * @param {Object} props
 * @param {import('../../types/filters').FilterState} props.filters - Current filter state
 * @param {(filterKey: string) => void} props.onRemoveFilter - Callback to remove a specific filter
 * @param {() => void} props.onClearAll - Callback to clear all filters
 * @param {boolean} [props.darkMode] - Dark mode flag
 */
const ActiveFilters = ({ filters, onRemoveFilter, onClearAll, darkMode = false }) => {
  const activeFilterCount = countActiveFilters(filters);

  // If no filters are active, don't render anything
  if (activeFilterCount === 0) {
    return null;
  }

  /**
   * Format date range for display
   * @param {Date|null} start
   * @param {Date|null} end
   * @returns {string}
   */
  const formatDateRange = (start, end) => {
    const formatDate = (date) => {
      if (!date) return null;
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const startStr = formatDate(start);
    const endStr = formatDate(end);

    if (startStr && endStr) {
      return `${startStr} - ${endStr}`;
    } else if (startStr) {
      return `From ${startStr}`;
    } else if (endStr) {
      return `Until ${endStr}`;
    }
    return '';
  };

  /**
   * Format amount range for display
   * @param {number|null} min
   * @param {number|null} max
   * @returns {string}
   */
  const formatAmountRange = (min, max) => {
    const formatAmount = (amount) => {
      if (amount === null) return null;
      return `₹${amount.toLocaleString('en-IN')}`;
    };

    const minStr = formatAmount(min);
    const maxStr = formatAmount(max);

    if (minStr && maxStr) {
      return `${minStr} - ${maxStr}`;
    } else if (minStr) {
      return `≥ ${minStr}`;
    } else if (maxStr) {
      return `≤ ${maxStr}`;
    }
    return '';
  };

  // Build array of active filter tags
  const filterTags = [];

  // Date range filter
  if (filters.dateRange.start || filters.dateRange.end) {
    filterTags.push({
      key: 'dateRange',
      label: 'Date',
      value: formatDateRange(filters.dateRange.start, filters.dateRange.end)
    });
  }

  // Transaction types filter
  if (filters.transactionTypes.length > 0) {
    const typeValue = filters.transactionTypes.length === 1
      ? filters.transactionTypes[0]
      : `${filters.transactionTypes.length} types`;
    filterTags.push({
      key: 'transactionTypes',
      label: 'Type',
      value: typeValue
    });
  }

  // Search query filter
  if (filters.searchQuery) {
    filterTags.push({
      key: 'searchQuery',
      label: 'Search',
      value: `"${filters.searchQuery}"`
    });
  }

  // Folio number filter
  if (filters.folioNumber) {
    filterTags.push({
      key: 'folioNumber',
      label: 'Folio',
      value: filters.folioNumber
    });
  }

  // Amount range filter
  if (filters.amountRange.min !== null || filters.amountRange.max !== null) {
    filterTags.push({
      key: 'amountRange',
      label: 'Amount',
      value: formatAmountRange(filters.amountRange.min, filters.amountRange.max)
    });
  }

  return (
    <div 
      className={`active-filters ${darkMode ? 'dark-mode' : ''}`}
      role="region"
      aria-label="Active filters"
      aria-live="polite"
    >
      <div className="active-filters-header">
        <span className="active-filters-title" id="active-filters-title">
          Active Filters ({activeFilterCount})
        </span>
        <button
          className="clear-all-button"
          onClick={onClearAll}
          aria-label={`Clear all ${activeFilterCount} active filters`}
        >
          Clear All
        </button>
      </div>
      <div 
        className="filter-tags"
        role="list"
        aria-labelledby="active-filters-title"
      >
        {filterTags.map((tag) => (
          <div 
            key={tag.key} 
            className="filter-tag"
            role="listitem"
          >
            <span className="filter-tag-label">{tag.label}:</span>
            <span className="filter-tag-value">{tag.value}</span>
            <button
              className="filter-tag-remove"
              onClick={() => onRemoveFilter(tag.key)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onRemoveFilter(tag.key);
                }
              }}
              aria-label={`Remove ${tag.label} filter: ${tag.value}`}
              type="button"
              tabIndex={0}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveFilters;
