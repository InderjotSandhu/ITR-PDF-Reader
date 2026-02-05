import React, { useRef, useState, useMemo, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';
import { aggregateTransactionsByPeriod } from '../utils/dashboardUtils';
import { useFilters } from '../context/FilterContext';
import { getColorPalette } from '../utils/darkModeColors';
import ChartDataTable from './ChartDataTable';
import './TransactionTimelineChart.css';

/**
 * TransactionTimelineChart component displays transaction history over time
 * @param {Object} props
 * @param {Array} props.transactions - Array of transaction objects
 * @param {boolean} props.darkMode - Whether dark mode is enabled
 */
const TransactionTimelineChart = ({ 
  transactions = [], 
  darkMode = false
}) => {
  const chartRef = useRef(null);
  const { filters, setFilters } = useFilters();
  const [zoomDomain, setZoomDomain] = useState(null);
  const [aggregationPeriod, setAggregationPeriod] = useState('monthly');
  const [hiddenSeries, setHiddenSeries] = useState({
    purchases: false,
    redemptions: false
  });

  // Memoize color palette to avoid recalculation
  const colors = useMemo(() => getColorPalette(darkMode), [darkMode]);

  // Memoize aggregation period determination
  const determineAggregationPeriod = useCallback((transactions) => {
    if (!transactions || transactions.length === 0) {
      return 'monthly';
    }

    // Calculate date range
    const dates = transactions.map(tx => new Date(tx.date));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    const daysDiff = (maxDate - minDate) / (1000 * 60 * 60 * 24);

    // Less than 3 months: monthly
    // 3 months to 2 years: monthly
    // More than 2 years: quarterly
    // More than 10 years: yearly
    if (daysDiff > 3650) { // > 10 years
      return 'yearly';
    } else if (daysDiff > 730) { // > 2 years
      return 'quarterly';
    } else {
      return 'monthly';
    }
  }, []);

  // Memoize effective period
  const effectivePeriod = useMemo(() => {
    return aggregationPeriod || determineAggregationPeriod(transactions);
  }, [aggregationPeriod, transactions, determineAggregationPeriod]);

  // Memoize aggregated timeline data
  const timelineData = useMemo(() => {
    return aggregateTransactionsByPeriod(transactions, effectivePeriod);
  }, [transactions, effectivePeriod]);

  // Memoize display data with zoom applied
  const displayData = useMemo(() => {
    return zoomDomain 
      ? timelineData.filter(item => item.date >= zoomDomain.start && item.date <= zoomDomain.end)
      : timelineData;
  }, [timelineData, zoomDomain]);

  // Memoize table data for screen readers
  const tableData = useMemo(() => {
    return displayData.map(item => ({
      period: item.date,
      purchases: `₹${item.purchases.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
      redemptions: `₹${item.redemptions.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
      net: `₹${item.net.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
      count: item.count.toString()
    }));
  }, [displayData]);

  // Table columns configuration
  const tableColumns = useMemo(() => [
    {
      header: 'Time Period',
      accessor: 'period',
      ariaLabel: 'Time period for aggregated data'
    },
    {
      header: 'Purchases',
      accessor: 'purchases',
      ariaLabel: 'Total purchase amount in rupees'
    },
    {
      header: 'Redemptions',
      accessor: 'redemptions',
      ariaLabel: 'Total redemption amount in rupees'
    },
    {
      header: 'Net Investment',
      accessor: 'net',
      ariaLabel: 'Net investment amount (purchases minus redemptions)'
    },
    {
      header: 'Transaction Count',
      accessor: 'count',
      ariaLabel: 'Number of transactions in this period'
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
        // Reset zoom or clear filters
        if (zoomDomain) {
          event.preventDefault();
          handleResetZoom();
        }
        break;
      case '+':
      case '=':
        // Zoom in
        event.preventDefault();
        handleZoomIn();
        break;
      case '-':
        // Zoom out
        event.preventDefault();
        handleZoomOut();
        break;
      default:
        break;
    }
  }, [zoomDomain, handleResetZoom, handleZoomIn, handleZoomOut]);

  /**
   * Handle data point click to filter by date range
   * @param {Object} data - The clicked data point
   */
  const handleDataPointClick = useCallback((data) => {
    if (!data || !data.activePayload || data.activePayload.length === 0) {
      return;
    }

    const clickedData = data.activePayload[0].payload;
    const clickedDate = clickedData.date;

    // Parse the date and determine the range based on aggregation period
    let startDate, endDate;

    if (effectivePeriod === 'yearly') {
      // Year format: "2023"
      const year = parseInt(clickedDate);
      startDate = `${year}-01-01`;
      endDate = `${year}-12-31`;
    } else if (effectivePeriod === 'quarterly') {
      // Quarter format: "2023-Q1"
      const [year, quarter] = clickedDate.split('-Q');
      const quarterNum = parseInt(quarter);
      const startMonth = (quarterNum - 1) * 3 + 1;
      const endMonth = quarterNum * 3;
      startDate = `${year}-${String(startMonth).padStart(2, '0')}-01`;
      
      // Calculate last day of end month
      const lastDay = new Date(parseInt(year), endMonth, 0).getDate();
      endDate = `${year}-${String(endMonth).padStart(2, '0')}-${lastDay}`;
    } else {
      // Monthly format: "2023-01"
      const [year, month] = clickedDate.split('-');
      startDate = `${year}-${month}-01`;
      
      // Calculate last day of month
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      endDate = `${year}-${month}-${lastDay}`;
    }

    // Apply date range filter
    setFilters({
      ...filters,
      dateRange: {
        start: startDate,
        end: endDate
      }
    });
  }, [effectivePeriod, filters, setFilters]);

  /**
   * Handle zoom in
   */
  const handleZoomIn = useCallback(() => {
    if (displayData.length === 0) return;

    const midIndex = Math.floor(displayData.length / 2);
    const quarterLength = Math.floor(displayData.length / 4);
    
    const start = Math.max(0, midIndex - quarterLength);
    const end = Math.min(displayData.length - 1, midIndex + quarterLength);

    setZoomDomain({
      start: displayData[start].date,
      end: displayData[end].date
    });
  }, [displayData]);

  /**
   * Handle zoom out
   */
  const handleZoomOut = useCallback(() => {
    if (!zoomDomain || displayData.length === 0) return;

    const currentStart = displayData[0].date;
    const currentEnd = displayData[displayData.length - 1].date;

    const startIndex = timelineData.findIndex(item => item.date === currentStart);
    const endIndex = timelineData.findIndex(item => item.date === currentEnd);

    const expansion = Math.floor((endIndex - startIndex) / 2);
    const newStart = Math.max(0, startIndex - expansion);
    const newEnd = Math.min(timelineData.length - 1, endIndex + expansion);

    if (newStart === 0 && newEnd === timelineData.length - 1) {
      // Fully zoomed out
      setZoomDomain(null);
    } else {
      setZoomDomain({
        start: timelineData[newStart].date,
        end: timelineData[newEnd].date
      });
    }
  }, [zoomDomain, displayData, timelineData]);

  /**
   * Reset zoom to show all data
   */
  const handleResetZoom = useCallback(() => {
    setZoomDomain(null);
  }, []);

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
        link.download = `transaction-timeline-${timestamp}.png`;
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
          <p className="tooltip-count" style={{ color: colors.text.secondary }}>
            Transactions: {data.count}
          </p>
        </div>
      );
    }
    return null;
  };

  // Empty state
  if (timelineData.length === 0) {
    return (
      <div className={`transaction-timeline-chart ${darkMode ? 'dark-mode' : ''}`}>
        <div className="chart-header">
          <h3>Transaction Timeline</h3>
        </div>
        <div className="chart-empty-state">
          <span className="empty-icon">📈</span>
          <p>No transaction data available</p>
        </div>
      </div>
    );
  }

  // Single data point case
  if (timelineData.length === 1) {
    const singlePoint = timelineData[0];
    return (
      <div className={`transaction-timeline-chart ${darkMode ? 'dark-mode' : ''}`} ref={chartRef}>
        <div className="chart-header">
          <h3>Transaction Timeline</h3>
          <div className="chart-controls">
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
          <div className="single-point-display">
            <div className="single-point-info">
              <h4>{singlePoint.date}</h4>
              <div className="single-point-metrics">
                <div className="metric">
                  <span className="label">Purchases:</span>
                  <span className="value positive">₹{singlePoint.purchases.toLocaleString('en-IN')}</span>
                </div>
                <div className="metric">
                  <span className="label">Redemptions:</span>
                  <span className="value negative">₹{singlePoint.redemptions.toLocaleString('en-IN')}</span>
                </div>
                <div className="metric">
                  <span className="label">Net:</span>
                  <span className={`value ${singlePoint.net >= 0 ? 'positive' : 'negative'}`}>
                    ₹{singlePoint.net.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="metric">
                  <span className="label">Transactions:</span>
                  <span className="value">{singlePoint.count}</span>
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
      className={`transaction-timeline-chart ${darkMode ? 'dark-mode' : ''}`} 
      ref={chartRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="img"
      aria-label="Transaction timeline line chart"
    >
      <div className="chart-header">
        <h3 id="timeline-chart-title">Transaction Timeline</h3>
        <div className="chart-controls">
          <select 
            value={aggregationPeriod} 
            onChange={(e) => setAggregationPeriod(e.target.value)}
            className="period-selector"
            aria-label="Select time period for aggregation"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
          <div className="zoom-controls" role="group" aria-label="Chart zoom controls">
            <button 
              className="zoom-button" 
              onClick={handleZoomIn}
              title="Zoom in (+ key)"
              aria-label="Zoom in on timeline chart"
              disabled={displayData.length <= 2}
            >
              🔍+
            </button>
            <button 
              className="zoom-button" 
              onClick={handleZoomOut}
              title="Zoom out (- key)"
              aria-label="Zoom out on timeline chart"
              disabled={!zoomDomain}
            >
              🔍-
            </button>
            <button 
              className="zoom-button" 
              onClick={handleResetZoom}
              title="Reset zoom (Escape key)"
              aria-label="Reset timeline chart zoom"
              disabled={!zoomDomain}
            >
              ↺
            </button>
          </div>
          <button 
            className="export-button" 
            onClick={handleExport}
            title="Export chart as PNG"
            aria-label="Export transaction timeline chart as PNG image"
          >
            📥 Export
          </button>
        </div>
      </div>
      <div 
        className="chart-container"
        role="img"
        aria-labelledby="timeline-chart-title"
        aria-describedby="timeline-chart-desc"
      >
        <div 
          id="timeline-chart-desc" 
          className="sr-only"
        >
          Transaction timeline showing {displayData.length} data points over time. 
          Aggregated by {effectivePeriod} periods. 
          {zoomDomain ? 'Currently zoomed in. Press Escape to reset zoom.' : 'Use zoom controls or +/- keys to zoom.'}
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart 
            data={displayData}
            onClick={handleDataPointClick}
            style={{ cursor: 'pointer' }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={colors.chart.grid} 
            />
            <XAxis 
              dataKey="date" 
              stroke={colors.chart.axis}
              tick={{ fill: colors.chart.axis }}
            />
            <YAxis 
              stroke={colors.chart.axis}
              tick={{ fill: colors.chart.axis }}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
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
              <Line 
                type="monotone" 
                dataKey="purchases" 
                stroke={colors.chart.positive} 
                strokeWidth={2}
                dot={{ r: 4, fill: colors.chart.positive }}
                activeDot={{ r: 6, fill: colors.chart.positive }}
                name="Purchases"
              />
            )}
            {!hiddenSeries.redemptions && (
              <Line 
                type="monotone" 
                dataKey="redemptions" 
                stroke={colors.chart.negative} 
                strokeWidth={2}
                dot={{ r: 4, fill: colors.chart.negative }}
                activeDot={{ r: 6, fill: colors.chart.negative }}
                name="Redemptions"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
        
        {/* Data table for screen readers */}
        <ChartDataTable
          data={tableData}
          columns={tableColumns}
          caption={`Transaction timeline data aggregated by ${effectivePeriod} periods${zoomDomain ? ' (zoomed view)' : ''}`}
          darkMode={darkMode}
          visible={false}
        />
      </div>
    </div>
  );
};

// Memoize TransactionTimelineChart component to prevent unnecessary re-renders
export default React.memo(TransactionTimelineChart);
