import React, { useMemo } from 'react';
import MetricCard from './MetricCard';
import {
  calculateTotalInvestment,
  calculateGainsLosses,
  calculatePercentageReturn
} from '../utils/dashboardUtils';
import './MetricsPanel.css';

/**
 * MetricsPanel component displays key performance metrics in a grid layout
 * @param {Object} props
 * @param {import('../types/filters').Transaction[]} props.transactions - Array of transactions
 * @param {Object} props.portfolioData - Portfolio data with summary information
 * @param {boolean} props.darkMode - Whether dark mode is enabled
 * @param {boolean} props.loading - Whether data is loading
 * @param {string} props.error - Error message if any
 */
const MetricsPanel = ({ transactions = [], portfolioData = null, darkMode = false, loading = false, error = null }) => {
  // Memoize metric calculations to avoid recalculation on every render
  const totalInvestment = useMemo(() => {
    return calculateTotalInvestment(transactions);
  }, [transactions]);
  
  // Memoize current value calculation
  const currentValue = useMemo(() => {
    if (portfolioData && portfolioData.portfolioSummary) {
      return portfolioData.portfolioSummary.reduce(
        (sum, scheme) => sum + (scheme.marketValue || 0),
        0
      );
    }
    return 0;
  }, [portfolioData]);

  // Memoize gains/losses calculation
  const absoluteGains = useMemo(() => {
    return calculateGainsLosses(currentValue, totalInvestment);
  }, [currentValue, totalInvestment]);

  // Memoize percentage return calculation
  const percentageReturn = useMemo(() => {
    return calculatePercentageReturn(currentValue, totalInvestment);
  }, [currentValue, totalInvestment]);

  // Handle loading state
  if (loading) {
    return (
      <div className={`metrics-panel ${darkMode ? 'dark-mode' : ''}`}>
        <div className="metrics-loading">
          <div className="loading-spinner"></div>
          <p>Loading metrics...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className={`metrics-panel ${darkMode ? 'dark-mode' : ''}`}>
        <div className="metrics-error">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`metrics-panel ${darkMode ? 'dark-mode' : ''}`}>
      <div 
        className="metrics-grid" 
        role="region" 
        aria-label="Key performance metrics"
      >
        <MetricCard
          label="Total Investment"
          value={totalInvestment}
          icon="💰"
          format="currency"
          colorType="neutral"
          darkMode={darkMode}
          ariaLabel={`Total investment: ₹${totalInvestment.toLocaleString('en-IN')}`}
        />
        <MetricCard
          label="Current Value"
          value={currentValue}
          icon="📊"
          format="currency"
          colorType="neutral"
          darkMode={darkMode}
          ariaLabel={`Current portfolio value: ₹${currentValue.toLocaleString('en-IN')}`}
        />
        <MetricCard
          label="Gains/Losses"
          value={absoluteGains}
          icon="📈"
          format="currency"
          colorType="auto"
          darkMode={darkMode}
          ariaLabel={`${absoluteGains >= 0 ? 'Gains' : 'Losses'}: ₹${Math.abs(absoluteGains).toLocaleString('en-IN')}`}
        />
        <MetricCard
          label="Return %"
          value={percentageReturn}
          icon="🎯"
          format="percentage"
          colorType="auto"
          darkMode={darkMode}
          ariaLabel={`Return percentage: ${percentageReturn.toFixed(2)}%`}
        />
      </div>
    </div>
  );
};

// Memoize MetricsPanel component to prevent unnecessary re-renders
export default React.memo(MetricsPanel);
