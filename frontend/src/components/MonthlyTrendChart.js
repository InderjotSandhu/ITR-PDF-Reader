import React, { useRef, useState, useMemo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';
import { calculateMonthlyTrends } from '../utils/dashboardUtils';
import { useFilters } from '../context/FilterContext';
import { getColorPalette } from '../utils/darkModeColors';
import ChartDataTable from './ChartDataTable';
import './MonthlyTrendChart.css';

/**
 * MonthlyTrendChart component displays monthly investment trends
 * @param {Object} props
 * @param {Array} props.transactions - Array of transaction objects
 * @param {boolean} props.darkMode - Whether dark mode is enabled
 */
const MonthlyTrendChart = ({ 
  transactions = [], 
  darkMode = false
}) => {
  const chartRef = useRef(null);
  const { filters, setFilters } = useFilters();
  const [selectedYear, setSelectedYear] = useState(null);
  const [hiddenSeries, setHiddenSeries] = useState({
    purchases: false,
    redemptions: false,
    net: false
  });

  // Memoize color palette to avoid recalculation
  const colors = useMemo(() => getColorPalette(darkMode), [darkMode]);

  // Get available years from transactions
  const availableYears = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    const years = new Set();
    transactions.forEach(transaction => {
      if (!transaction.isAdministrative) {
        const date = new Date(transaction.date);
        years.add(date.getFullYear());
      }
    });

    return Array.from(years).sort((a, b) => b - a); // Sort descending (newest first)
  }, [transactions]);

  // Calculate monthly trend data
  const monthlyData = useMemo(() => {
    return calculateMonthlyTrends(transactions, selectedYear);
  }, [transactions, selectedYear]);

  // Format data for display with month names
  const displayData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return monthlyData.map(item => ({
      ...item,
      monthLabel: selectedYear ? monthNames[item.month - 1] : `${monthNames[item.month - 1]} ${item.year}`
    }));
  }, [monthlyData, selectedYear]);

  // Memoize table data for screen readers
  const tableData = useMemo(() => {
    return displayData.map(item => ({
      month: item.monthLabel,
      purchases: `₹${item.purchases.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
      redemptions: `₹${item.redemptions.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
      net: `₹${item.net.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
    }));
  }, [displayData]);

  // Table columns configuration
  const tableColumns = useMemo(() => [
    {
      header: 'Month',
      accessor: 'month',
      ariaLabel: 'Month and year'
    },
    {
      header: 'Purchases',
      accessor: 'purchases',
      ariaLabel: 'Total purchase amount for the month in rupees'
    },
    {
      header: 'Redemptions',
      accessor: 'redemptions',
      ariaLabel: 'Total redemption amount for the month in rupees'
    },
    {
      header: 'Net Investment',
      accessor: 'net',
      ariaLabel: 'Net investment amount for the month (purchases minus redemptions)'
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
        if (event.target.tagName === 'BUTTON' || event.target.tagName === 'SELECT') {
          event.preventDefault();
          event.target.click();
        }
        break;
      case 'Escape':
        // Clear date filter
        if (filters.dateRange) {
          event.preventDefault();
          setFilters({
            ...filters,
            dateRange: null
          });
        }
        break;
      default:
        break;
    }
  }, [filters, setFilters]);

  /**
   * Handle year selection change
   * @param {Event} e - Change event
   */
  const handleYearChange = useCallback((e) => {
    const value = e.target.value;
    setSelectedYear(value === 'all' ? null : parseInt(value));
  }, []);

  /**
   * Handle bar click to filter by month
   * @param {Object} data - The clicked bar data
   */
  const handleBarClick = useCallback((data) => {
    if (!data || !data.activePayload || data.activePayload.length === 0) {
      return;
    }

    const clickedData = data.activePayload[0].payload;
    const year = clickedData.year;
    const month = clickedData.month;

    // Calculate start and end dates for the month
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    
    // Calculate last day of month
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    // Apply date range filter
    setFilters({
      ...filters,
      dateRange: {
        start: startDate,
        end: endDate
      }
    });
  }, [filters, setFilters]);

  /**
   * Handle legend click to toggle series visibility
   * @param {Object} data - The legend item data
   */
  const handleLegendClick = useCallback((data) => {
    if (data && data.dataKey) {
      setHiddenSeries(prev => ({
        ...prev,
        [data.dataKey]: !prev[data.dataKey]
      }));
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
        const yearSuffix = selectedYear ? `-${selectedYear}` : '';
        link.download = `monthly-trend${yearSuffix}-${timestamp}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      console.error('Error exporting chart:', error);
      alert('Failed to export chart. Please try again.');
    }
  }, [chartRef, darkMode, selectedYear]);

  /**
   * Custom tooltip component
   */
  const CustomTooltip = ({ active, payload, label }) => {
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
          <p className="tooltip-label" style={{ color: colors.text.primary }}>{label}</p>
          <p className="tooltip-value" style={{ color: colors.chart.positive }}>
            Purchases: ₹{data.purchases.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
          <p className="tooltip-value" style={{ color: colors.chart.negative }}>
            Redemptions: ₹{data.redemptions.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
          <p className="tooltip-value" style={{ color: colors.chart.neutral }}>
            Net: ₹{data.net.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  // Empty state
  if (displayData.length === 0) {
    return (
      <div className={`monthly-trend-chart ${darkMode ? 'dark-mode' : ''}`}>
        <div className="chart-header">
          <h3>Monthly Investment Trend</h3>
        </div>
        <div className="chart-empty-state">
          <span className="empty-icon">📈</span>
          <p>No transaction data available</p>
        </div>
      </div>
    );
  }

  // Single month case
  if (displayData.length === 1) {
    const singleMonth = displayData[0];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthName = monthNames[singleMonth.month - 1];
    
    return (
      <div className={`monthly-trend-chart ${darkMode ? 'dark-mode' : ''}`} ref={chartRef}>
        <div className="chart-header">
          <h3>Monthly Investment Trend</h3>
          <div className="chart-controls">
            <select 
              value={selectedYear || 'all'} 
              onChange={handleYearChange}
              className="year-selector"
              aria-label="Select year for monthly trend analysis"
            >
              <option value="all">All Years</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <button 
              className="export-button" 
              onClick={handleExport}
              title="Export chart as PNG"
              aria-label="Export monthly trend chart as PNG image"
            >
              📥 Export
            </button>
          </div>
        </div>
        <div className="chart-container">
          <div className="single-month-display">
            <div className="single-month-info">
              <h4>{monthName} {singleMonth.year}</h4>
              <div className="single-month-metrics">
                <div className="metric">
                  <span className="label">Purchases:</span>
                  <span className="value positive">₹{singleMonth.purchases.toLocaleString('en-IN')}</span>
                </div>
                <div className="metric">
                  <span className="label">Redemptions:</span>
                  <span className="value negative">₹{singleMonth.redemptions.toLocaleString('en-IN')}</span>
                </div>
                <div className="metric">
                  <span className="label">Net Investment:</span>
                  <span className={`value ${singleMonth.net >= 0 ? 'positive' : 'negative'}`}>
                    ₹{singleMonth.net.toLocaleString('en-IN')}
                  </span>
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
      className={`monthly-trend-chart ${darkMode ? 'dark-mode' : ''}`} 
      ref={chartRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="img"
      aria-label="Monthly investment trend bar chart"
    >
      <div className="chart-header">
        <h3 id="monthly-trend-title">Monthly Investment Trend</h3>
        <div className="chart-controls">
          <select 
            value={selectedYear || 'all'} 
            onChange={handleYearChange}
            className="year-selector"
            aria-label="Select year for monthly trend analysis"
          >
            <option value="all">All Years</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <button 
            className="export-button" 
            onClick={handleExport}
            title="Export chart as PNG"
            aria-label="Export monthly trend chart as PNG image"
          >
            📥 Export
          </button>
        </div>
      </div>
      <div 
        className="chart-container"
        role="img"
        aria-labelledby="monthly-trend-title"
        aria-describedby="monthly-trend-desc"
      >
        <div 
          id="monthly-trend-desc" 
          className="sr-only"
        >
          Monthly investment trend showing {displayData.length} months of data. 
          {selectedYear ? `Showing data for year ${selectedYear}.` : 'Showing data for all available years.'} 
          Chart displays purchases, redemptions, and net investment amounts.
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={displayData}
            onClick={handleBarClick}
            style={{ cursor: 'pointer' }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={colors.chart.grid} 
            />
            <XAxis 
              dataKey="monthLabel" 
              stroke={colors.chart.axis}
              tick={{ fill: colors.chart.axis, fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke={colors.chart.axis}
              tick={{ fill: colors.chart.axis }}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              label={{ 
                value: 'Amount', 
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
            {!hiddenSeries.purchases && (
              <Bar 
                dataKey="purchases" 
                fill={colors.chart.positive} 
                name="Purchases"
                radius={[4, 4, 0, 0]}
              />
            )}
            {!hiddenSeries.redemptions && (
              <Bar 
                dataKey="redemptions" 
                fill={colors.chart.negative} 
                name="Redemptions"
                radius={[4, 4, 0, 0]}
              />
            )}
            {!hiddenSeries.net && (
              <Bar 
                dataKey="net" 
                fill={colors.chart.neutral} 
                name="Net Investment"
                radius={[4, 4, 0, 0]}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
        
        {/* Data table for screen readers */}
        <ChartDataTable
          data={tableData}
          columns={tableColumns}
          caption={`Monthly investment trend data${selectedYear ? ` for year ${selectedYear}` : ' for all years'}`}
          darkMode={darkMode}
          visible={false}
        />
      </div>
    </div>
  );
};

// Memoize MonthlyTrendChart component to prevent unnecessary re-renders
export default React.memo(MonthlyTrendChart);
