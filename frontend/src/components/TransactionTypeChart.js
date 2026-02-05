import React, { useRef, useState, useMemo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import html2canvas from 'html2canvas';
import { calculateTypeDistribution } from '../utils/dashboardUtils';
import { useFilters } from '../context/FilterContext';
import { getColorPalette, getChartColor } from '../utils/darkModeColors';
import ChartDataTable from './ChartDataTable';
import './TransactionTypeChart.css';

/**
 * TransactionTypeChart component displays distribution of transaction types
 * @param {Object} props
 * @param {Array} props.transactions - Array of transaction objects
 * @param {boolean} props.darkMode - Whether dark mode is enabled
 */
const TransactionTypeChart = ({ 
  transactions = [], 
  darkMode = false
}) => {
  const chartRef = useRef(null);
  const { filters, setFilters } = useFilters();
  const [showAdministrative, setShowAdministrative] = useState(false);
  const [hiddenTypes, setHiddenTypes] = useState([]);

  // Memoize color palette to avoid recalculation
  const colors = useMemo(() => getColorPalette(darkMode), [darkMode]);

  // Memoize type distribution data calculation
  const typeDistributionData = useMemo(() => {
    return calculateTypeDistribution(transactions, showAdministrative);
  }, [transactions, showAdministrative]);

  // Memoize filtered display data
  const displayData = useMemo(() => {
    return typeDistributionData.filter(item => !hiddenTypes.includes(item.type));
  }, [typeDistributionData, hiddenTypes]);

  // Memoize table data for screen readers
  const tableData = useMemo(() => {
    return displayData.map(item => ({
      type: item.type,
      count: item.count.toString(),
      amount: `₹${item.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
      percentage: `${item.percentage.toFixed(2)}%`
    }));
  }, [displayData]);

  // Table columns configuration
  const tableColumns = useMemo(() => [
    {
      header: 'Transaction Type',
      accessor: 'type',
      ariaLabel: 'Type of transaction'
    },
    {
      header: 'Count',
      accessor: 'count',
      ariaLabel: 'Number of transactions of this type'
    },
    {
      header: 'Total Amount',
      accessor: 'amount',
      ariaLabel: 'Total amount for this transaction type in rupees'
    },
    {
      header: 'Percentage',
      accessor: 'percentage',
      ariaLabel: 'Percentage of total transactions'
    }
  ], []);

  /**
   * Handle keyboard events for chart interactions
   * @param {KeyboardEvent} event - Keyboard event
   */
  const handleKeyDown = useCallback((event) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        // Activate focused button or control
        if (event.target.tagName === 'BUTTON' || event.target.tagName === 'INPUT') {
          event.preventDefault();
          event.target.click();
        }
        break;
      case 'Escape':
        // Clear type filter
        if (filters.transactionTypes && filters.transactionTypes.length > 0) {
          event.preventDefault();
          setFilters({
            ...filters,
            transactionTypes: []
          });
        }
        break;
      default:
        break;
    }
  }, [filters, setFilters]);

  /**
   * Get color for a transaction type using the chart color palette
   * @param {number} index - Index of the transaction type
   * @returns {string} Color code
   */
  const getColorForType = useCallback((index) => {
    return getChartColor(index, darkMode);
  }, [darkMode]);

  /**
   * Handle bar click to filter by transaction type
   * @param {Object} data - The clicked bar data
   */
  const handleBarClick = useCallback((data) => {
    if (data && data.type) {
      // Apply transaction type filter
      setFilters({
        ...filters,
        transactionTypes: [data.type]
      });
    }
  }, [filters, setFilters]);

  /**
   * Toggle administrative transactions visibility
   */
  const handleToggleAdministrative = useCallback(() => {
    setShowAdministrative(!showAdministrative);
  }, [showAdministrative]);

  /**
   * Handle legend click to toggle type visibility
   * @param {Object} data - The legend item data
   */
  const handleLegendClick = useCallback((data) => {
    if (data && data.value) {
      const type = data.value;
      setHiddenTypes(prev => {
        if (prev.includes(type)) {
          return prev.filter(t => t !== type);
        } else {
          return [...prev, type];
        }
      });
    }
  }, []);

  /**
   * Export chart as PNG image
   */
  const handleExport = useCallback(async () => {
    if (!chartRef.current) {
      console.error('Chart reference not found');
      return;
    }

    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
        scale: 2
      });

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        link.download = `transaction-type-distribution-${timestamp}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      console.error('Error exporting chart:', error);
      alert('Failed to export chart. Please try again.');
    }
  }, [chartRef, darkMode]);

  /**
   * Custom tooltip component
   */
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div 
          className={`custom-tooltip ${darkMode ? 'dark-mode' : ''}`}
          style={{
            backgroundColor: colors.chart.tooltipBg,
            borderColor: colors.chart.tooltipBorder,
            color: colors.chart.tooltipText
          }}
        >
          <p className="tooltip-label" style={{ color: colors.text.primary }}>{data.type}</p>
          <p className="tooltip-value" style={{ color: colors.text.secondary }}>
            Count: {data.count}
          </p>
          <p className="tooltip-value" style={{ color: colors.text.secondary }}>
            Amount: ₹{data.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
          <p className="tooltip-percentage" style={{ color: colors.chart.neutral }}>
            {data.percentage.toFixed(2)}% of transactions
          </p>
        </div>
      );
    }
    return null;
  };

  // Empty state
  if (typeDistributionData.length === 0) {
    return (
      <div className={`transaction-type-chart ${darkMode ? 'dark-mode' : ''}`}>
        <div className="chart-header">
          <h3>Transaction Type Distribution</h3>
        </div>
        <div className="chart-empty-state">
          <span className="empty-icon">📊</span>
          <p>No transaction data available</p>
        </div>
      </div>
    );
  }

  // Single type case
  if (typeDistributionData.length === 1) {
    const singleType = typeDistributionData[0];
    return (
      <div className={`transaction-type-chart ${darkMode ? 'dark-mode' : ''}`} ref={chartRef}>
        <div className="chart-header">
          <h3>Transaction Type Distribution</h3>
          <div className="chart-controls">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={showAdministrative}
                onChange={handleToggleAdministrative}
              />
              <span>Show Administrative</span>
            </label>
            <button 
              className="export-button" 
              onClick={handleExport}
              title="Export chart as PNG"
            >
              📥 Export
            </button>
          </div>
        </div>
        <div className="chart-container">
          <div className="single-type-display">
            <div className="single-type-circle" style={{ backgroundColor: singleType.color }}>
              <span className="single-type-percentage">100%</span>
            </div>
            <div className="single-type-info">
              <h4>{singleType.type}</h4>
              <div className="single-type-metrics">
                <div className="metric">
                  <span className="label">Count:</span>
                  <span className="value">{singleType.count}</span>
                </div>
                <div className="metric">
                  <span className="label">Amount:</span>
                  <span className="value">₹{singleType.amount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`transaction-type-chart ${darkMode ? 'dark-mode' : ''}`} 
      ref={chartRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="img"
      aria-label="Transaction type distribution bar chart"
    >
      <div className="chart-header">
        <h3 id="type-chart-title">Transaction Type Distribution</h3>
        <div className="chart-controls">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={showAdministrative}
              onChange={handleToggleAdministrative}
              aria-label="Toggle administrative transactions visibility"
            />
            <span>Show Administrative</span>
          </label>
          <button 
            className="export-button" 
            onClick={handleExport}
            title="Export chart as PNG"
            aria-label="Export transaction type chart as PNG image"
          >
            📥 Export
          </button>
        </div>
      </div>
      <div 
        className="chart-container"
        role="img"
        aria-labelledby="type-chart-title"
        aria-describedby="type-chart-desc"
      >
        <div 
          id="type-chart-desc" 
          className="sr-only"
        >
          Transaction type distribution showing {displayData.length} different transaction types. 
          Total transactions: {displayData.reduce((sum, item) => sum + item.count, 0)}. 
          {showAdministrative ? 'Including administrative transactions.' : 'Excluding administrative transactions.'}
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={displayData}
            onClick={(data) => {
              if (data && data.activePayload && data.activePayload.length > 0) {
                handleBarClick(data.activePayload[0].payload);
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={colors.chart.grid} 
            />
            <XAxis 
              dataKey="type" 
              stroke={colors.chart.axis}
              tick={{ fill: colors.chart.axis, fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis 
              stroke={colors.chart.axis}
              tick={{ fill: colors.chart.axis }}
              label={{ 
                value: 'Count', 
                angle: -90, 
                position: 'insideLeft',
                fill: colors.chart.axis
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{
                color: colors.text.primary,
                cursor: 'pointer'
              }}
              onClick={handleLegendClick}
            />
            <Bar 
              dataKey="count" 
              name="Transaction Count"
              radius={[8, 8, 0, 0]}
            >
              {displayData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColorForType(index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        {/* Data table for screen readers */}
        <ChartDataTable
          data={tableData}
          columns={tableColumns}
          caption={`Transaction type distribution data${showAdministrative ? ' including administrative transactions' : ' excluding administrative transactions'}`}
          darkMode={darkMode}
          visible={false}
        />
      </div>
    </div>
  );
};

// Memoize TransactionTypeChart component to prevent unnecessary re-renders
export default React.memo(TransactionTypeChart);
