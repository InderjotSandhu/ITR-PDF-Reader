import React, { useRef, useEffect } from 'react';
import { List } from 'react-window';
import './TransactionTable.css';

// Threshold for enabling virtual scrolling
const VIRTUAL_SCROLL_THRESHOLD = 10000; // Temporarily disabled - increased threshold
const ROW_HEIGHT = 50; // Height of each table row in pixels

/**
 * TransactionTable component - Displays filtered transactions in a table format
 * 
 * @param {Object} props
 * @param {import('../../types/filters').Transaction[]} props.transactions - Filtered transactions to display
 * @param {boolean} [props.isLoading] - Loading state indicator
 * @param {number} props.totalCount - Total number of transactions (unfiltered)
 * @param {number} props.filteredCount - Number of filtered transactions
 * @param {boolean} [props.darkMode] - Dark mode flag
 * @param {() => void} [props.onClearFilters] - Callback to clear all filters
 */
const TransactionTable = ({ 
  transactions = [], 
  isLoading = false, 
  totalCount = 0, 
  filteredCount = 0,
  darkMode = false,
  onClearFilters 
}) => {
  const tableWrapperRef = useRef(null);
  const [tableWidth, setTableWidth] = React.useState(1000); // Default to 1000px instead of 0

  // Update table width for virtual scrolling
  useEffect(() => {
    if (tableWrapperRef.current) {
      const width = tableWrapperRef.current.offsetWidth;
      if (width > 0) {
        setTableWidth(width);
      }
    }

    const handleResize = () => {
      if (tableWrapperRef.current) {
        const width = tableWrapperRef.current.offsetWidth;
        if (width > 0) {
          setTableWidth(width);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [transactions.length]);
  /**
   * Format date to DD-MMM-YY format
   */
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = String(date.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
  };

  /**
   * Format currency to Indian Rupee format
   */
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  /**
   * Format number with 4 decimal places for units
   */
  const formatUnits = (units) => {
    if (units === null || units === undefined) return '-';
    return Number(units).toFixed(4);
  };

  /**
   * Format NAV with 4 decimal places
   */
  const formatNAV = (nav) => {
    if (nav === null || nav === undefined) return '-';
    return Number(nav).toFixed(4);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div 
        className={`transaction-table-container ${darkMode ? 'dark-mode' : ''}`}
        role="region"
        aria-label="Transaction results"
      >
        <div className="loading-indicator" role="status" aria-live="polite">
          <div className="spinner" aria-hidden="true"></div>
          <p>Loading transactions...</p>
        </div>
      </div>
    );
  }

  // Show empty state when no transactions match filters
  const hasNoResults = transactions.length === 0 && totalCount > 0;

  // Determine if we should use virtual scrolling
  const useVirtualScrolling = transactions.length >= VIRTUAL_SCROLL_THRESHOLD;

  /**
   * Row renderer for virtual scrolling
   */
  const Row = ({ index, style, data }) => {
    const transaction = data[index];
    
    // Safety check: if transaction is undefined, return empty row
    if (!transaction) {
      return <div style={style} className="virtual-row" role="row" />;
    }
    
    return (
      <div style={style} className="virtual-row" role="row" aria-rowindex={index + 1}>
        <div className="virtual-cell date-cell" role="cell">{formatDate(transaction.date)}</div>
        <div className="virtual-cell scheme-cell" role="cell" title={transaction.schemeName}>
          {transaction.schemeName || '-'}
        </div>
        <div className="virtual-cell type-cell" role="cell">
          <span className={`type-badge ${transaction.transactionType.toLowerCase().replace(/\s+/g, '-')}`}>
            {transaction.transactionType}
          </span>
        </div>
        <div className="virtual-cell align-right amount-cell" role="cell">
          {formatCurrency(transaction.amount)}
        </div>
        <div className="virtual-cell align-right nav-cell" role="cell">
          {formatNAV(transaction.nav)}
        </div>
        <div className="virtual-cell align-right units-cell" role="cell">
          {formatUnits(transaction.units)}
        </div>
        <div className="virtual-cell align-right balance-cell" role="cell">
          {formatUnits(transaction.unitBalance)}
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`transaction-table-container ${darkMode ? 'dark-mode' : ''}`}
      role="region"
      aria-label="Transaction results"
    >
      {/* Result count header */}
      <div className="table-header">
        <h3 className="result-count" role="status" aria-live="polite">
          {hasNoResults ? (
            <>No transactions match your filters</>
          ) : (
            <>
              Showing <span className="count-highlight">{filteredCount}</span> of{' '}
              <span className="count-highlight">{totalCount}</span> transactions
            </>
          )}
        </h3>
      </div>

      {/* Empty state */}
      {hasNoResults && (
        <div className="empty-state" role="status">
          <div className="empty-icon" aria-hidden="true">🔍</div>
          <h4>No transactions match your filters</h4>
          <p>Try adjusting your filter criteria to see more results</p>
          {onClearFilters && (
            <button
              className="clear-filters-button"
              onClick={onClearFilters}
              aria-label="Clear all filters to show all transactions"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Table with virtual scrolling for large datasets */}
      {!hasNoResults && transactions.length > 0 && useVirtualScrolling && tableWidth > 0 && (
        <div className="table-wrapper" ref={tableWrapperRef}>
          <div 
            className="virtual-table"
            role="table"
            aria-label="Transaction data table with virtual scrolling"
            aria-rowcount={transactions.length}
          >
            {/* Table header */}
            <div className="virtual-table-header" role="row">
              <div className="virtual-cell date-cell" role="columnheader">Date</div>
              <div className="virtual-cell scheme-cell" role="columnheader">Scheme</div>
              <div className="virtual-cell type-cell" role="columnheader">Type</div>
              <div className="virtual-cell align-right amount-cell" role="columnheader">Amount</div>
              <div className="virtual-cell align-right nav-cell" role="columnheader">NAV</div>
              <div className="virtual-cell align-right units-cell" role="columnheader">Units</div>
              <div className="virtual-cell align-right balance-cell" role="columnheader">Balance</div>
            </div>
            {/* Virtual scrolling list */}
            <List
              height={600}
              itemCount={transactions.length}
              itemSize={ROW_HEIGHT}
              width={tableWidth}
              itemData={transactions}
            >
              {Row}
            </List>
          </div>
        </div>
      )}

      {/* Regular table for smaller datasets */}
      {!hasNoResults && transactions.length > 0 && !useVirtualScrolling && (
        <div className="table-wrapper">
          <table 
            className="transaction-table"
            role="table"
            aria-label="Transaction data table"
            aria-rowcount={transactions.length}
          >
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Scheme</th>
                <th scope="col">Type</th>
                <th scope="col" className="align-right">Amount</th>
                <th scope="col" className="align-right">NAV</th>
                <th scope="col" className="align-right">Units</th>
                <th scope="col" className="align-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr key={index}>
                  <td className="date-cell">{formatDate(transaction.date)}</td>
                  <td className="scheme-cell" title={transaction.schemeName}>
                    {transaction.schemeName || '-'}
                  </td>
                  <td className="type-cell">
                    <span className={`type-badge ${transaction.transactionType.toLowerCase().replace(/\s+/g, '-')}`}>
                      {transaction.transactionType}
                    </span>
                  </td>
                  <td className="align-right amount-cell">
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="align-right nav-cell">
                    {formatNAV(transaction.nav)}
                  </td>
                  <td className="align-right units-cell">
                    {formatUnits(transaction.units)}
                  </td>
                  <td className="align-right balance-cell">
                    {formatUnits(transaction.unitBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Show message when no transactions at all */}
      {totalCount === 0 && (
        <div className="empty-state" role="status">
          <div className="empty-icon" aria-hidden="true">📄</div>
          <h4>No transactions available</h4>
          <p>Upload a CAS PDF to extract and view transactions</p>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
