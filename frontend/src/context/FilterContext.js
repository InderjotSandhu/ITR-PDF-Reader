import React, { createContext, useContext, useState, useMemo } from 'react';
import { createEmptyFilterState } from '../types/filters';
import { applyFilters } from '../utils/filterUtils';

/**
 * @typedef {Object} FilterContextValue
 * @property {import('../types/filters').FilterState} filters - Current filter state
 * @property {(filters: import('../types/filters').FilterState) => void} setFilters - Set filter state
 * @property {import('../types/filters').Transaction[]} filteredTransactions - Filtered transactions
 * @property {() => void} clearFilters - Clear all filters
 * @property {(filterKey: string) => void} removeFilter - Remove a specific filter
 * @property {import('../types/filters').Transaction[]} allTransactions - All transactions (unfiltered)
 */

const FilterContext = createContext(undefined);

/**
 * FilterProvider component that manages filter state and filtered transactions
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {import('../types/filters').Transaction[]} props.transactions - All transactions to filter
 */
export const FilterProvider = ({ children, transactions = [] }) => {
  const [filters, setFilters] = useState(createEmptyFilterState());

  // Debug logging
  React.useEffect(() => {
    console.log('FilterProvider: Received transactions:', {
      hasTransactions: !!transactions,
      isArray: Array.isArray(transactions),
      count: transactions?.length,
      firstTransaction: transactions?.[0]
    });
  }, [transactions]);

  // Ensure transactions is always an array (memoized to prevent dependency issues)
  const safeTransactions = useMemo(() => {
    return Array.isArray(transactions) ? transactions : [];
  }, [transactions]);

  // Memoize filtered transactions to avoid unnecessary recalculations
  const filteredTransactions = useMemo(() => {
    return applyFilters(safeTransactions, filters);
  }, [safeTransactions, filters]);

  /**
   * Clear all filters and reset to empty state
   */
  const clearFilters = () => {
    setFilters(createEmptyFilterState());
  };

  /**
   * Remove a specific filter by key
   * @param {string} filterKey - The filter key to remove (dateRange, transactionTypes, searchQuery, folioNumber, amountRange)
   */
  const removeFilter = (filterKey) => {
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters };
      
      switch (filterKey) {
        case 'dateRange':
          newFilters.dateRange = { start: null, end: null };
          break;
        case 'transactionTypes':
          newFilters.transactionTypes = [];
          break;
        case 'searchQuery':
          newFilters.searchQuery = '';
          break;
        case 'folioNumber':
          newFilters.folioNumber = null;
          break;
        case 'amountRange':
          newFilters.amountRange = { min: null, max: null };
          break;
        default:
          console.warn(`Unknown filter key: ${filterKey}`);
      }
      
      return newFilters;
    });
  };

  const value = {
    filters,
    setFilters,
    filteredTransactions,
    clearFilters,
    removeFilter,
    allTransactions: safeTransactions
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};

/**
 * Custom hook to use the FilterContext
 * @returns {FilterContextValue}
 * @throws {Error} If used outside of FilterProvider
 */
export const useFilters = () => {
  const context = useContext(FilterContext);
  
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  
  return context;
};
