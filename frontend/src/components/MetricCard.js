import React from 'react';
import { getColorPalette } from '../utils/darkModeColors';
import './MetricCard.css';

/**
 * MetricCard component displays a single metric with value, label, and color coding
 * @param {Object} props
 * @param {string} props.label - The label for the metric
 * @param {number} props.value - The numeric value to display
 * @param {string} props.icon - The emoji icon to display
 * @param {string} props.format - Format type: 'currency', 'percentage', or 'number'
 * @param {string} props.colorType - Color type: 'positive', 'negative', 'neutral', or 'auto'
 * @param {boolean} props.darkMode - Whether dark mode is enabled
 * @param {string} props.ariaLabel - Accessible label for screen readers
 */
const MetricCard = ({ label, value, icon, format = 'currency', colorType = 'auto', darkMode = false, ariaLabel }) => {
  // Get color palette based on dark mode
  const colors = getColorPalette(darkMode);

  // Determine color based on value if colorType is 'auto'
  let color = colorType;
  if (colorType === 'auto') {
    if (value > 0) {
      color = 'positive';
    } else if (value < 0) {
      color = 'negative';
    } else {
      color = 'neutral';
    }
  }

  // Get the appropriate color values from the palette
  const metricColors = colors.metrics[color];

  // Format the value based on format type
  const formatValue = (val) => {
    if (format === 'currency') {
      return `₹${Math.abs(val).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
    } else if (format === 'percentage') {
      return `${val.toFixed(2)}%`;
    } else {
      return val.toLocaleString('en-IN', { maximumFractionDigits: 2 });
    }
  };

  // Add sign for negative values in currency format
  const displayValue = format === 'currency' && value < 0 
    ? `-${formatValue(value)}`
    : formatValue(value);

  return (
    <div 
      className={`metric-card ${darkMode ? 'dark-mode' : ''} color-${color}`}
      style={{
        backgroundColor: darkMode ? colors.background.secondary : undefined,
        borderLeftColor: metricColors.border
      }}
      role="region"
      aria-label={ariaLabel || `${label}: ${displayValue}`}
    >
      <div className="metric-icon" aria-hidden="true">{icon}</div>
      <div className="metric-content">
        <div className="metric-label" style={{ color: colors.text.secondary }}>{label}</div>
        <div className="metric-value" style={{ color: metricColors.value }}>{displayValue}</div>
      </div>
    </div>
  );
};

export default MetricCard;
