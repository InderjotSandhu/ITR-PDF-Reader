/**
 * Filter utility functions for transaction filtering
 */

/**
 * Applies all active filters to a list of transactions
 * @param {import('../types/filters').Transaction[]} transactions - Array of transactions to filter
 * @param {import('../types/filters').FilterState} filters - Filter state containing all filter criteria
 * @returns {import('../types/filters').Transaction[]} Filtered array of transactions
 */
export const applyFilters = (transactions, filters) => {
  if (!transactions || transactions.length === 0) {
    return [];
  }

  return transactions.filter(transaction => {
    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      const txDate = new Date(transaction.date);
      
      if (filters.dateRange.start) {
        const startDate = new Date(filters.dateRange.start);
        startDate.setHours(0, 0, 0, 0);
        txDate.setHours(0, 0, 0, 0);
        if (txDate < startDate) return false;
      }
      
      if (filters.dateRange.end) {
        const endDate = new Date(filters.dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        const txDateEnd = new Date(transaction.date);
        txDateEnd.setHours(23, 59, 59, 999);
        if (txDateEnd > endDate) return false;
      }
    }
    
    // Transaction type filter (Administrative vs Financial)
    if (filters.transactionTypes && filters.transactionTypes.length > 0) {
      const isAdministrative = transaction.isAdministrative === true;
      const categoryId = isAdministrative ? 'administrative' : 'financial';
      
      if (!filters.transactionTypes.includes(categoryId)) {
        return false;
      }
    }
    
    // Search query filter (case-insensitive substring match on scheme name)
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const query = filters.searchQuery.toLowerCase();
      const schemeName = (transaction.schemeName || '').toLowerCase();
      if (!schemeName.includes(query)) {
        return false;
      }
    }
    
    // Folio number filter (exact match)
    if (filters.folioNumber !== null && filters.folioNumber !== '') {
      if (transaction.folioNumber !== filters.folioNumber) {
        return false;
      }
    }
    
    // Amount range filter
    if (filters.amountRange.min !== null) {
      if (transaction.amount < filters.amountRange.min) {
        return false;
      }
    }
    
    if (filters.amountRange.max !== null) {
      if (transaction.amount > filters.amountRange.max) {
        return false;
      }
    }
    
    // All filters passed (AND logic)
    return true;
  });
};

/**
 * Extracts unique transaction types from a list of transactions
 * @param {import('../types/filters').Transaction[]} transactions
 * @returns {string[]} Array of unique transaction types
 */
export const getUniqueTransactionTypes = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return [];
  }
  
  const types = new Set();
  transactions.forEach(tx => {
    if (tx.transactionType) {
      types.add(tx.transactionType);
    }
  });
  
  return Array.from(types).sort();
};

/**
 * Extracts unique folio numbers from a list of transactions
 * @param {import('../types/filters').Transaction[]} transactions
 * @returns {string[]} Array of unique folio numbers
 */
export const getUniqueFolioNumbers = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return [];
  }
  
  const folios = new Set();
  transactions.forEach(tx => {
    if (tx.folioNumber) {
      folios.add(tx.folioNumber);
    }
  });
  
  return Array.from(folios).sort();
};
