import React from 'react';
import EmptyState from './EmptyState';

/**
 * LimitedDataWarning component - Displays warning when data is limited
 * @param {Object} props
 * @param {number} props.transactionCount - Number of transactions available
 * @param {boolean} props.darkMode - Whether dark mode is enabled
 * @param {string} props.dataType - Type of limited data (e.g., 'single-transaction', 'same-type', 'short-range')
 */
const LimitedDataWarning = ({ 
  transactionCount = 0,
  darkMode = false,
  dataType = 'general'
}) => {
  const getWarningContent = () => {
    switch (dataType) {
      case 'single-transaction':
        return {
          title: 'Limited Data Available',
          message: 'Only one transaction found. Charts may not be representative of your investment patterns. Upload more CAS data for better insights.',
          icon: '⚠️'
        };
      case 'same-type':
        return {
          title: 'All Transactions Same Type',
          message: 'All transactions are of the same type. Some charts may show limited variation. This is normal if you only have one type of investment activity.',
          icon: '📊'
        };
      case 'short-range':
        return {
          title: 'Short Date Range',
          message: 'Transaction data spans a very short time period. Timeline charts may show limited trends. Consider uploading data from a longer period for better analysis.',
          icon: '📅'
        };
      case 'long-range':
        return {
          title: 'Long Date Range Detected',
          message: 'Transaction data spans many years. Charts have been aggregated by year for better visualization. Use filters to focus on specific periods.',
          icon: '📈'
        };
      default:
        return {
          title: 'Limited Data Available',
          message: `Only ${transactionCount} transaction${transactionCount === 1 ? '' : 's'} available. Charts may not be fully representative. Upload more CAS data for comprehensive insights.`,
          icon: '⚠️'
        };
    }
  };

  const { title, message, icon } = getWarningContent();

  return (
    <EmptyState
      type="limited-data"
      title={title}
      message={message}
      icon={icon}
      darkMode={darkMode}
    />
  );
};

export default LimitedDataWarning;