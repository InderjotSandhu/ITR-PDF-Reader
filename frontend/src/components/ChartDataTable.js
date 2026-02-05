import React from 'react';
import './ChartDataTable.css';

/**
 * ChartDataTable component provides accessible data table fallback for charts
 * @param {Object} props
 * @param {Array} props.data - Array of data objects
 * @param {Array} props.columns - Array of column definitions
 * @param {string} props.caption - Table caption for screen readers
 * @param {boolean} props.darkMode - Whether dark mode is enabled
 * @param {boolean} props.visible - Whether table is visible (for screen readers only)
 */
const ChartDataTable = ({ 
  data = [], 
  columns = [], 
  caption, 
  darkMode = false, 
  visible = false 
}) => {
  if (!data.length || !columns.length) {
    return null;
  }

  return (
    <div className={`chart-data-table ${darkMode ? 'dark-mode' : ''} ${visible ? 'visible' : 'sr-only'}`}>
      <table role="table" aria-label={caption}>
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th 
                key={index} 
                scope="col"
                aria-label={column.ariaLabel || column.header}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <td 
                  key={colIndex}
                  aria-label={column.getCellAriaLabel ? column.getCellAriaLabel(row) : undefined}
                >
                  {column.accessor ? row[column.accessor] : column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ChartDataTable;