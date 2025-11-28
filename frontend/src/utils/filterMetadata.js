/**
 * Utility functions for serializing filter metadata for exports
 */

/**
 * Formats a date to a readable string
 * @param {Date|null} date
 * @returns {string}
 */
const formatDate = (date) => {
  if (!date) return '';
  return date.toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
};

/**
 * Serializes filter state into human-readable metadata
 * @param {import('../types/filters').FilterState} filters - Current filter state
 * @returns {Object} Serialized filter criteria
 */
export const serializeFilters = (filters) => {
  const serialized = {};

  // Date range
  if (filters.dateRange.start || filters.dateRange.end) {
    const start = formatDate(filters.dateRange.start);
    const end = formatDate(filters.dateRange.end);
    
    if (start && end) {
      serialized.dateRange = `${start} to ${end}`;
    } else if (start) {
      serialized.dateRange = `From ${start}`;
    } else if (end) {
      serialized.dateRange = `Until ${end}`;
    }
  }

  // Transaction types
  if (filters.transactionTypes && filters.transactionTypes.length > 0) {
    serialized.transactionTypes = [...filters.transactionTypes];
  }

  // Search query
  if (filters.searchQuery && filters.searchQuery.trim() !== '') {
    serialized.searchQuery = filters.searchQuery.trim();
  }

  // Folio number
  if (filters.folioNumber) {
    serialized.folioNumber = filters.folioNumber;
  }

  // Amount range
  if (filters.amountRange.min !== null || filters.amountRange.max !== null) {
    const min = filters.amountRange.min;
    const max = filters.amountRange.max;
    
    if (min !== null && max !== null) {
      serialized.amountRange = `₹${min.toLocaleString('en-IN')} to ₹${max.toLocaleString('en-IN')}`;
    } else if (min !== null) {
      serialized.amountRange = `≥ ₹${min.toLocaleString('en-IN')}`;
    } else if (max !== null) {
      serialized.amountRange = `≤ ₹${max.toLocaleString('en-IN')}`;
    }
  }

  return serialized;
};

/**
 * Creates filter metadata for export
 * @param {import('../types/filters').FilterState} filters - Current filter state
 * @param {number} originalCount - Original transaction count
 * @param {number} filteredCount - Filtered transaction count
 * @returns {import('../types/filters').FilterMetadata}
 */
export const createFilterMetadata = (filters, originalCount, filteredCount) => {
  return {
    appliedAt: new Date().toISOString(),
    filters: serializeFilters(filters),
    originalCount,
    filteredCount
  };
};

/**
 * Formats filter metadata as a human-readable text summary
 * @param {import('../types/filters').FilterMetadata} metadata
 * @returns {string}
 */
export const formatFilterSummary = (metadata) => {
  const lines = [];
  
  lines.push('=== FILTER SUMMARY ===');
  lines.push(`Applied At: ${new Date(metadata.appliedAt).toLocaleString('en-IN')}`);
  lines.push(`Results: ${metadata.filteredCount} of ${metadata.originalCount} transactions`);
  lines.push('');
  
  if (Object.keys(metadata.filters).length === 0) {
    lines.push('No filters applied');
  } else {
    lines.push('Active Filters:');
    
    if (metadata.filters.dateRange) {
      lines.push(`  • Date Range: ${metadata.filters.dateRange}`);
    }
    
    if (metadata.filters.transactionTypes) {
      lines.push(`  • Transaction Types: ${metadata.filters.transactionTypes.join(', ')}`);
    }
    
    if (metadata.filters.searchQuery) {
      lines.push(`  • Search: "${metadata.filters.searchQuery}"`);
    }
    
    if (metadata.filters.folioNumber) {
      lines.push(`  • Folio Number: ${metadata.filters.folioNumber}`);
    }
    
    if (metadata.filters.amountRange) {
      lines.push(`  • Amount Range: ${metadata.filters.amountRange}`);
    }
  }
  
  lines.push('======================');
  lines.push('');
  
  return lines.join('\n');
};
