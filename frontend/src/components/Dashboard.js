import React, { useMemo, useRef, useEffect } from 'react';
import MetricsPanel from './MetricsPanel';
import PortfolioAllocationChart from './PortfolioAllocationChart';
import TransactionTimelineChart from './TransactionTimelineChart';
import TransactionTypeChart from './TransactionTypeChart';
import MonthlyTrendChart from './MonthlyTrendChart';
import EmptyState from './EmptyState';
import LimitedDataWarning from './LimitedDataWarning';
import NoResultsMessage from './NoResultsMessage';
import { useFilters } from '../context/FilterContext';
import './Dashboard.css';

/**
 * Dashboard component - Container for all visualization components
 * @param {Object} props
 * @param {Array} props.transactions - Array of transaction objects
 * @param {Object} props.portfolioData - Portfolio data with summary information
 * @param {boolean} props.darkMode - Whether dark mode is enabled
 * @param {boolean} props.loading - Whether data is loading
 * @param {boolean} props.isFiltered - Whether filters are currently applied
 */
const Dashboard = ({ 
  transactions = [], 
  portfolioData = null, 
  darkMode = false,
  loading = false,
  isFiltered = false
}) => {
  const { clearAllFilters } = useFilters();
  const dashboardRef = useRef(null);

  // Set up keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Skip if focus is in an input element
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      switch (event.key) {
        case 'Tab':
          // Let default tab behavior handle focus management
          break;
        case 'Enter':
        case ' ':
          // Activate focused element if it's interactive
          if (event.target.role === 'button' || event.target.tagName === 'BUTTON') {
            event.preventDefault();
            event.target.click();
          }
          break;
        case 'Escape':
          // Clear filters on Escape key
          if (isFiltered) {
            event.preventDefault();
            clearAllFilters();
          }
          break;
        default:
          break;
      }
    };

    const dashboardElement = dashboardRef.current;
    if (dashboardElement) {
      dashboardElement.addEventListener('keydown', handleKeyDown);
      return () => {
        dashboardElement.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isFiltered, clearAllFilters]);

  // Memoize transaction count to avoid recalculation
  const transactionCount = useMemo(() => transactions?.length || 0, [transactions]);

  // Memoize edge case detection
  const edgeCaseAnalysis = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return { type: 'empty', hasEdgeCase: true };
    }

    const nonAdminTransactions = transactions.filter(tx => !tx.isAdministrative);
    
    // Single transaction
    if (nonAdminTransactions.length === 1) {
      return { type: 'single-transaction', hasEdgeCase: true };
    }

    // All same type
    const uniqueTypes = new Set(nonAdminTransactions.map(tx => tx.transactionType));
    if (uniqueTypes.size === 1) {
      return { type: 'same-type', hasEdgeCase: true };
    }

    // Date range analysis
    if (nonAdminTransactions.length > 1) {
      const dates = nonAdminTransactions.map(tx => new Date(tx.date));
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));
      const daysDiff = (maxDate - minDate) / (1000 * 60 * 60 * 24);

      // Very short range (less than 30 days)
      if (daysDiff < 30) {
        return { type: 'short-range', hasEdgeCase: true };
      }

      // Very long range (more than 10 years)
      if (daysDiff > 3650) {
        return { type: 'long-range', hasEdgeCase: true };
      }
    }

    // Limited data (less than 5 transactions)
    if (nonAdminTransactions.length < 5) {
      return { type: 'limited-data', hasEdgeCase: true };
    }

    return { type: 'normal', hasEdgeCase: false };
  }, [transactions]);

  // Handle loading state
  if (loading) {
    return (
      <div className={`dashboard ${darkMode ? 'dark-mode' : ''}`}>
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Handle empty state
  if (!transactions || transactions.length === 0) {
    if (isFiltered) {
      return (
        <div className={`dashboard ${darkMode ? 'dark-mode' : ''}`}>
          <NoResultsMessage
            darkMode={darkMode}
            onClearFilters={clearAllFilters}
          />
        </div>
      );
    } else {
      return (
        <div className={`dashboard ${darkMode ? 'dark-mode' : ''}`}>
          <EmptyState
            type="no-data"
            title="No Data Available"
            message="No transaction data available. Upload a CAS PDF to get started."
            icon="📊"
            darkMode={darkMode}
          />
        </div>
      );
    }
  }

  // Handle edge cases with limited data warning
  const shouldShowWarning = edgeCaseAnalysis.hasEdgeCase && edgeCaseAnalysis.type !== 'empty';

  return (
    <div 
      className={`dashboard ${darkMode ? 'dark-mode' : ''}`}
      ref={dashboardRef}
      tabIndex={0}
      role="main"
      aria-label="Investment dashboard"
    >
      {/* Screen reader announcements */}
      <div 
        id="dashboard-announcements" 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      ></div>
      {/* Filter indicator */}
      {isFiltered && (
        <div 
          className="filter-indicator"
          role="status"
          aria-live="polite"
          aria-label={`Showing filtered data with ${transactionCount} transactions`}
        >
          <span className="indicator-icon" aria-hidden="true">🔍</span>
          <span>Showing filtered data ({transactionCount} transactions)</span>
          <button
            className="clear-filters-button"
            onClick={clearAllFilters}
            aria-label="Clear all filters"
            title="Press Escape or click to clear all filters"
          >
            ✕
          </button>
        </div>
      )}

      {/* Edge case warning */}
      {shouldShowWarning && (
        <div className="dashboard-section warning-section">
          <LimitedDataWarning
            transactionCount={transactionCount}
            darkMode={darkMode}
            dataType={edgeCaseAnalysis.type}
          />
        </div>
      )}

      {/* Metrics Panel at the top */}
      <div className="dashboard-section metrics-section">
        <MetricsPanel
          transactions={transactions}
          portfolioData={portfolioData}
          darkMode={darkMode}
          loading={false}
        />
      </div>

      {/* Charts Grid */}
      <div className="dashboard-grid" role="region" aria-label="Investment charts">
        {/* Portfolio Allocation Chart */}
        <div className="dashboard-chart" tabIndex={0}>
          <PortfolioAllocationChart
            portfolioData={portfolioData}
            darkMode={darkMode}
          />
        </div>

        {/* Transaction Timeline Chart */}
        <div className="dashboard-chart" tabIndex={0}>
          <TransactionTimelineChart
            transactions={transactions}
            darkMode={darkMode}
          />
        </div>

        {/* Transaction Type Chart */}
        <div className="dashboard-chart" tabIndex={0}>
          <TransactionTypeChart
            transactions={transactions}
            darkMode={darkMode}
          />
        </div>

        {/* Monthly Trend Chart */}
        <div className="dashboard-chart" tabIndex={0}>
          <MonthlyTrendChart
            transactions={transactions}
            darkMode={darkMode}
          />
        </div>
      </div>
    </div>
  );
};

// Memoize Dashboard component to prevent unnecessary re-renders
export default React.memo(Dashboard);
