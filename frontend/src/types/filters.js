/**
 * @typedef {Object} DateRange
 * @property {Date|null} start - Start date of the range
 * @property {Date|null} end - End date of the range
 */

/**
 * @typedef {Object} AmountRange
 * @property {number|null} min - Minimum amount
 * @property {number|null} max - Maximum amount
 */

/**
 * @typedef {Object} FilterState
 * @property {DateRange} dateRange - Date range filter
 * @property {string[]} transactionTypes - Selected transaction types
 * @property {string} searchQuery - Search query string
 * @property {string|null} folioNumber - Selected folio number
 * @property {AmountRange} amountRange - Amount range filter
 */

/**
 * @typedef {Object} FilterMetadata
 * @property {string} appliedAt - ISO timestamp when filters were applied
 * @property {Object} filters - Applied filter values
 * @property {string} [filters.dateRange] - Date range as string
 * @property {string[]} [filters.transactionTypes] - Transaction types
 * @property {string} [filters.searchQuery] - Search query
 * @property {string} [filters.folioNumber] - Folio number
 * @property {string} [filters.amountRange] - Amount range as string
 * @property {number} originalCount - Original transaction count
 * @property {number} filteredCount - Filtered transaction count
 */

/**
 * @typedef {Object} Transaction
 * @property {string} date - Transaction date
 * @property {number} amount - Transaction amount
 * @property {number|null} nav - Net Asset Value
 * @property {number|null} units - Number of units
 * @property {string} transactionType - Type of transaction
 * @property {number|null} unitBalance - Unit balance after transaction
 * @property {string} description - Transaction description
 * @property {boolean} isAdministrative - Whether transaction is administrative
 * @property {string} folioNumber - Folio number
 * @property {string} schemeName - Scheme name
 * @property {string} isin - ISIN code
 */

/**
 * Creates an empty filter state
 * @returns {FilterState}
 */
export const createEmptyFilterState = () => ({
  dateRange: {
    start: null,
    end: null
  },
  transactionTypes: [],
  searchQuery: '',
  folioNumber: null,
  amountRange: {
    min: null,
    max: null
  }
});

/**
 * Checks if any filters are active
 * @param {FilterState} filters
 * @returns {boolean}
 */
export const hasActiveFilters = (filters) => {
  return (
    filters.dateRange.start !== null ||
    filters.dateRange.end !== null ||
    filters.transactionTypes.length > 0 ||
    filters.searchQuery !== '' ||
    filters.folioNumber !== null ||
    filters.amountRange.min !== null ||
    filters.amountRange.max !== null
  );
};

/**
 * Counts the number of active filters
 * @param {FilterState} filters
 * @returns {number}
 */
export const countActiveFilters = (filters) => {
  let count = 0;
  if (filters.dateRange.start !== null || filters.dateRange.end !== null) count++;
  if (filters.transactionTypes.length > 0) count++;
  if (filters.searchQuery !== '') count++;
  if (filters.folioNumber !== null) count++;
  if (filters.amountRange.min !== null || filters.amountRange.max !== null) count++;
  return count;
};
