import React, { useRef, useState, useMemo, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import html2canvas from 'html2canvas';
import { calculatePortfolioAllocation } from '../utils/dashboardUtils';
import { useFilters } from '../context/FilterContext';
import { getColorPalette } from '../utils/darkModeColors';
import ChartDataTable from './ChartDataTable';
import './PortfolioAllocationChart.css';

/**
 * PortfolioAllocationChart component displays portfolio distribution across schemes
 * @param {Object} props
 * @param {Object} props.portfolioData - Portfolio data with summary information
 * @param {boolean} props.darkMode - Whether dark mode is enabled
 */
const PortfolioAllocationChart = ({ 
  portfolioData = null, 
  darkMode = false
}) => {
  const chartRef = useRef(null);
  const { filters, setFilters } = useFilters();
  const [hiddenSchemes, setHiddenSchemes] = useState([]);

  // Memoize color palette to avoid recalculation
  const colors = useMemo(() => getColorPalette(darkMode), [darkMode]);

  // Memoize allocation data calculation
  const allocationData = useMemo(() => {
    return portfolioData && portfolioData.portfolioSummary
      ? calculatePortfolioAllocation(portfolioData.portfolioSummary)
      : [];
  }, [portfolioData]);

  // Memoize filtered display data
  const displayData = useMemo(() => {
    return allocationData.filter(item => !hiddenSchemes.includes(item.scheme));
  }, [allocationData, hiddenSchemes]);

  // Memoize table data for screen readers
  const tableData = useMemo(() => {
    return allocationData.map(item => ({
      scheme: item.scheme,
      value: `₹${item.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
      percentage: `${item.percentage.toFixed(2)}%`
    }));
  }, [allocationData]);

  // Table columns configuration
  const tableColumns = useMemo(() => [
    {
      header: 'Scheme Name',
      accessor: 'scheme',
      ariaLabel: 'Mutual fund scheme name'
    },
    {
      header: 'Market Value',
      accessor: 'value',
      ariaLabel: 'Current market value in rupees'
    },
    {
      header: 'Allocation %',
      accessor: 'percentage',
      ariaLabel: 'Percentage allocation of total portfolio'
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
        // If focused on a chart segment, trigger click
        if (event.target.getAttribute('data-scheme')) {
          event.preventDefault();
          const scheme = event.target.getAttribute('data-scheme');
          handleSegmentClick({ scheme });
        }
        break;
      case 'Escape':
        // Clear scheme filter
        if (filters.searchQuery) {
          event.preventDefault();
          setFilters({
            ...filters,
            searchQuery: ''
          });
        }
        break;
      default:
        break;
    }
  }, [filters, setFilters, handleSegmentClick]);

  /**
   * Handle segment click to filter by scheme
   * Uses searchQuery filter to filter transactions by scheme name
   * @param {Object} data - The clicked segment data
   */
  const handleSegmentClick = useCallback((data) => {
    if (data && data.scheme) {
      // Don't filter if clicking on "Others" category
      if (data.scheme === 'Others') {
        return;
      }
      
      // Apply scheme filter using searchQuery
      setFilters({
        ...filters,
        searchQuery: data.scheme
      });
    }
  }, [filters, setFilters]);

  /**
   * Handle legend click to toggle scheme visibility
   * @param {Object} data - The legend item data
   */
  const handleLegendClick = useCallback((data) => {
    if (data && data.value) {
      const scheme = data.value;
      setHiddenSchemes(prev => {
        if (prev.includes(scheme)) {
          return prev.filter(s => s !== scheme);
        } else {
          return [...prev, scheme];
        }
      });
    }
  }, []);

  /**
   * Export chart as PNG image with title and timestamp
   */
  const handleExport = useCallback(async () => {
    if (!chartRef.current) {
      console.error('Chart reference not found');
      return;
    }

    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
        scale: 2 // Higher quality
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        link.download = `portfolio-allocation-${timestamp}.png`;
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
   * Custom tooltip component with enhanced accessibility
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
          role="tooltip"
          aria-live="polite"
        >
          <p className="tooltip-label" style={{ color: colors.text.primary }}>
            <strong>{data.scheme}</strong>
          </p>
          <p className="tooltip-value" style={{ color: colors.text.secondary }}>
            Market Value: ₹{data.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </p>
          <p className="tooltip-percentage" style={{ color: colors.chart.positive }}>
            Portfolio Allocation: {data.percentage.toFixed(2)}%
          </p>
          <p className="tooltip-instruction" style={{ color: colors.text.secondary, fontSize: '0.8rem' }}>
            Click to filter transactions by this scheme
          </p>
        </div>
      );
    }
    return null;
  };

  /**
   * Custom label for pie chart
   */
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
    // Only show label if percentage is > 5%
    if (percentage < 5) {
      return null;
    }

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill={colors.text.primary}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${percentage.toFixed(1)}%`}
      </text>
    );
  };

  // Empty state
  if (allocationData.length === 0) {
    return (
      <div className={`portfolio-allocation-chart ${darkMode ? 'dark-mode' : ''}`}>
        <div className="chart-header">
          <h3>Portfolio Allocation</h3>
        </div>
        <div className="chart-empty-state">
          <span className="empty-icon">📊</span>
          <p>No portfolio data available</p>
        </div>
      </div>
    );
  }

  // Single scheme case
  if (allocationData.length === 1) {
    const singleScheme = allocationData[0];
    return (
      <div className={`portfolio-allocation-chart ${darkMode ? 'dark-mode' : ''}`} ref={chartRef}>
        <div className="chart-header">
          <h3>Portfolio Allocation</h3>
          <button 
            className="export-button" 
            onClick={handleExport}
            title="Export chart as PNG"
          >
            📥 Export
          </button>
        </div>
        <div className="chart-container">
          <div className="single-scheme-display">
            <div className="single-scheme-circle" style={{ backgroundColor: singleScheme.color }}>
              <span className="single-scheme-percentage">100%</span>
            </div>
            <div className="single-scheme-info">
              <h4>{singleScheme.scheme}</h4>
              <p>₹{singleScheme.value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`portfolio-allocation-chart ${darkMode ? 'dark-mode' : ''}`} 
      ref={chartRef}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="img"
      aria-label="Portfolio allocation pie chart"
    >
      <div className="chart-header">
        <h3 id="portfolio-allocation-title">Portfolio Allocation</h3>
        <button 
          className="export-button" 
          onClick={handleExport}
          title="Export chart as PNG"
          aria-label="Export portfolio allocation chart as PNG image"
        >
          📥 Export
        </button>
      </div>
      <div 
        className="chart-container"
        role="img"
        aria-labelledby="portfolio-allocation-title"
        aria-describedby="portfolio-allocation-desc"
      >
        <div 
          id="portfolio-allocation-desc" 
          className="sr-only"
        >
          Portfolio allocation showing distribution of investments across {allocationData.length} schemes. 
          Total portfolio value: ₹{allocationData.reduce((sum, item) => sum + item.value, 0).toLocaleString('en-IN')}
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={displayData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              onClick={handleSegmentClick}
              style={{ cursor: 'pointer' }}
            >
              {displayData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  data-scheme={entry.scheme}
                  tabIndex={0}
                  role="button"
                  aria-label={`${entry.scheme}: ₹${entry.value.toLocaleString('en-IN')} (${entry.percentage.toFixed(1)}%). Click to filter transactions.`}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              wrapperStyle={{
                color: colors.text.primary,
                cursor: 'pointer'
              }}
              iconType="circle"
              onClick={handleLegendClick}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Data table for screen readers */}
        <ChartDataTable
          data={tableData}
          columns={tableColumns}
          caption="Portfolio allocation data showing investment distribution across mutual fund schemes"
          darkMode={darkMode}
          visible={false}
        />
      </div>
    </div>
  );
};

// Memoize PortfolioAllocationChart component to prevent unnecessary re-renders
export default React.memo(PortfolioAllocationChart);
