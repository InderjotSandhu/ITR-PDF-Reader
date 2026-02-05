/**
 * Dashboard utility functions for data processing and calculations
 */

/**
 * Calculates total investment from transactions
 * Sum of (purchases + SIPs) - redemptions
 * @param {import('../types/filters').Transaction[]} transactions - Array of transactions
 * @returns {number} Total investment amount
 */
export const calculateTotalInvestment = (transactions) => {
  if (!transactions || transactions.length === 0) {
    return 0;
  }

  return transactions.reduce((total, transaction) => {
    // Skip administrative transactions
    if (transaction.isAdministrative) {
      return total;
    }

    const amount = transaction.amount || 0;
    const type = (transaction.transactionType || '').toLowerCase();

    // Add purchases and SIPs
    if (type.includes('purchase') || type.includes('sip')) {
      return total + amount;
    }

    // Subtract redemptions
    if (type.includes('redemption')) {
      return total - amount;
    }

    return total;
  }, 0);
};

/**
 * Calculates gains/losses
 * Formula: currentValue - totalInvestment
 * @param {number} currentValue - Current market value
 * @param {number} totalInvestment - Total investment amount
 * @returns {number} Absolute gains or losses
 */
export const calculateGainsLosses = (currentValue, totalInvestment) => {
  return currentValue - totalInvestment;
};

/**
 * Calculates percentage return
 * Formula: ((currentValue - totalInvestment) / totalInvestment) × 100
 * @param {number} currentValue - Current market value
 * @param {number} totalInvestment - Total investment amount
 * @returns {number} Percentage return (returns 0 if totalInvestment is 0)
 */
export const calculatePercentageReturn = (currentValue, totalInvestment) => {
  if (totalInvestment === 0) {
    return 0;
  }
  return ((currentValue - totalInvestment) / totalInvestment) * 100;
};

/**
 * Gets color for a value based on whether it's positive, negative, or zero
 * @param {number} value - The value to get color for
 * @returns {string} Color code: 'green' for positive, 'red' for negative, 'blue' for zero
 */
export const getColorForValue = (value) => {
  if (value > 0) {
    return 'green';
  } else if (value < 0) {
    return 'red';
  } else {
    return 'blue';
  }
};

/**
 * Calculates portfolio allocation from portfolio data
 * Groups schemes with >10 schemes into "Others" category
 * @param {Array} portfolioSummary - Array of portfolio summary objects with fundName, costValue, marketValue
 * @returns {Array} Array of allocation objects with scheme, value, percentage, color
 */
export const calculatePortfolioAllocation = (portfolioSummary) => {
  if (!portfolioSummary || portfolioSummary.length === 0) {
    return [];
  }

  // Filter out schemes with zero market value
  const activeSchemes = portfolioSummary.filter(scheme => scheme.marketValue > 0);

  if (activeSchemes.length === 0) {
    return [];
  }

  // Calculate total market value
  const totalValue = activeSchemes.reduce((sum, scheme) => sum + scheme.marketValue, 0);

  // Sort by market value descending
  const sortedSchemes = [...activeSchemes].sort((a, b) => b.marketValue - a.marketValue);

  // If more than 10 schemes, group smaller ones into "Others"
  let allocationData;
  if (sortedSchemes.length > 10) {
    const top10 = sortedSchemes.slice(0, 10);
    const others = sortedSchemes.slice(10);
    
    const othersValue = others.reduce((sum, scheme) => sum + scheme.marketValue, 0);
    
    allocationData = [
      ...top10.map(scheme => ({
        scheme: scheme.fundName,
        value: scheme.marketValue,
        percentage: (scheme.marketValue / totalValue) * 100
      })),
      {
        scheme: 'Others',
        value: othersValue,
        percentage: (othersValue / totalValue) * 100
      }
    ];
  } else {
    allocationData = sortedSchemes.map(scheme => ({
      scheme: scheme.fundName,
      value: scheme.marketValue,
      percentage: (scheme.marketValue / totalValue) * 100
    }));
  }

  // Add colors (can be customized later)
  const colors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1',
    '#d084d0', '#ffb347', '#a4de6c', '#d0ed57', '#ffa07a', '#20b2aa'
  ];

  return allocationData.map((item, index) => ({
    ...item,
    color: colors[index % colors.length]
  }));
};

/**
 * Aggregates transactions by time period (monthly, quarterly, yearly)
 * @param {import('../types/filters').Transaction[]} transactions - Array of transactions
 * @param {string} period - Aggregation period: 'monthly', 'quarterly', or 'yearly'
 * @returns {Array} Array of aggregated data points with date, purchases, redemptions, net, count
 */
export const aggregateTransactionsByPeriod = (transactions, period = 'monthly') => {
  if (!transactions || transactions.length === 0) {
    return [];
  }

  // Group transactions by period
  const grouped = {};

  transactions.forEach(transaction => {
    // Skip administrative transactions
    if (transaction.isAdministrative) {
      return;
    }

    const date = new Date(transaction.date);
    let key;

    switch (period) {
      case 'yearly':
        key = `${date.getFullYear()}`;
        break;
      case 'quarterly':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        key = `${date.getFullYear()}-Q${quarter}`;
        break;
      case 'monthly':
      default:
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
    }

    if (!grouped[key]) {
      grouped[key] = {
        date: key,
        purchases: 0,
        redemptions: 0,
        count: 0
      };
    }

    const amount = transaction.amount || 0;
    const type = (transaction.transactionType || '').toLowerCase();

    // Add to purchases or redemptions
    if (type.includes('purchase') || type.includes('sip')) {
      grouped[key].purchases += amount;
    } else if (type.includes('redemption')) {
      grouped[key].redemptions += amount;
    }

    grouped[key].count += 1;
  });

  // Convert to array and calculate net
  const result = Object.values(grouped).map(item => ({
    ...item,
    net: item.purchases - item.redemptions
  }));

  // Sort by date
  return result.sort((a, b) => a.date.localeCompare(b.date));
};

/**
 * Calculates transaction type distribution
 * @param {import('../types/filters').Transaction[]} transactions - Array of transactions
 * @param {boolean} includeAdministrative - Whether to include administrative transactions
 * @returns {Array} Array of type distribution objects with type, count, amount, percentage
 */
export const calculateTypeDistribution = (transactions, includeAdministrative = false) => {
  if (!transactions || transactions.length === 0) {
    return [];
  }

  // Filter transactions based on includeAdministrative flag
  const filteredTransactions = includeAdministrative
    ? transactions
    : transactions.filter(tx => !tx.isAdministrative);

  if (filteredTransactions.length === 0) {
    return [];
  }

  // Group by transaction type
  const grouped = {};

  filteredTransactions.forEach(transaction => {
    const type = transaction.transactionType || 'Unknown';

    if (!grouped[type]) {
      grouped[type] = {
        type: type,
        count: 0,
        amount: 0
      };
    }

    grouped[type].count += 1;
    grouped[type].amount += transaction.amount || 0;
  });

  // Calculate total count for percentages
  const totalCount = filteredTransactions.length;

  // Convert to array and add percentages
  const result = Object.values(grouped).map(item => ({
    ...item,
    percentage: (item.count / totalCount) * 100
  }));

  // Sort by count descending
  return result.sort((a, b) => b.count - a.count);
};

/**
 * Calculates monthly investment trends
 * @param {import('../types/filters').Transaction[]} transactions - Array of transactions
 * @param {number|null} year - Optional year to filter by (null for all years)
 * @returns {Array} Array of monthly trend objects with month, year, purchases, redemptions, net
 */
export const calculateMonthlyTrends = (transactions, year = null) => {
  if (!transactions || transactions.length === 0) {
    return [];
  }

  // Group by month and year
  const grouped = {};

  transactions.forEach(transaction => {
    // Skip administrative transactions
    if (transaction.isAdministrative) {
      return;
    }

    const date = new Date(transaction.date);
    const txYear = date.getFullYear();
    const txMonth = date.getMonth() + 1; // 1-12

    // Filter by year if specified
    if (year !== null && txYear !== year) {
      return;
    }

    const key = `${txYear}-${String(txMonth).padStart(2, '0')}`;

    if (!grouped[key]) {
      grouped[key] = {
        month: txMonth,
        year: txYear,
        purchases: 0,
        redemptions: 0
      };
    }

    const amount = transaction.amount || 0;
    const type = (transaction.transactionType || '').toLowerCase();

    // Add to purchases or redemptions
    if (type.includes('purchase') || type.includes('sip')) {
      grouped[key].purchases += amount;
    } else if (type.includes('redemption')) {
      grouped[key].redemptions += amount;
    }
  });

  // Convert to array and calculate net
  const result = Object.values(grouped).map(item => ({
    ...item,
    net: item.purchases - item.redemptions
  }));

  // Sort by year and month
  return result.sort((a, b) => {
    if (a.year !== b.year) {
      return a.year - b.year;
    }
    return a.month - b.month;
  });
};
