import React, { useState, useEffect } from 'react';
import './DateRangeFilter.css';

const DateRangeFilter = ({ value, onChange, darkMode }) => {
  const [startDate, setStartDate] = useState(value?.start ? formatDateForInput(value.start) : '');
  const [endDate, setEndDate] = useState(value?.end ? formatDateForInput(value.end) : '');
  const [error, setError] = useState('');

  // Update local state when prop changes
  useEffect(() => {
    setStartDate(value?.start ? formatDateForInput(value.start) : '');
    setEndDate(value?.end ? formatDateForInput(value.end) : '');
    setError('');
  }, [value]);

  /**
   * Format Date object to YYYY-MM-DD string for input
   */
  function formatDateForInput(date) {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Parse input string to Date object
   */
  function parseInputDate(dateString) {
    if (!dateString) return null;
    return new Date(dateString);
  }

  /**
   * Validate date range (start <= end)
   */
  function validateDateRange(start, end) {
    if (!start || !end) {
      return { valid: true, error: '' };
    }

    const startDateObj = parseInputDate(start);
    const endDateObj = parseInputDate(end);

    if (startDateObj > endDateObj) {
      return { valid: false, error: 'End date must be after start date' };
    }

    return { valid: true, error: '' };
  }

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStartDate(newStartDate);

    // Validate range
    const validation = validateDateRange(newStartDate, endDate);
    setError(validation.error);

    // Only call onChange if validation passes
    if (validation.valid) {
      onChange({
        start: parseInputDate(newStartDate),
        end: parseInputDate(endDate)
      });
    }
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setEndDate(newEndDate);

    // Validate range
    const validation = validateDateRange(startDate, newEndDate);
    setError(validation.error);

    // Only call onChange if validation passes
    if (validation.valid) {
      onChange({
        start: parseInputDate(startDate),
        end: parseInputDate(newEndDate)
      });
    }
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    setError('');
    onChange({ start: null, end: null });
  };

  const handleKeyDown = (e) => {
    // Allow Escape key to clear the date range
    if (e.key === 'Escape' && (startDate || endDate)) {
      e.preventDefault();
      handleClear();
    }
  };

  const hasValue = startDate || endDate;

  return (
    <div className={`date-range-filter ${darkMode ? 'dark-mode' : ''}`} role="group" aria-labelledby="date-range-label">
      <label id="date-range-label" className="filter-label">Date Range</label>
      <div className="date-inputs-container">
        <div className="date-input-wrapper">
          <label htmlFor="start-date" className="input-label">From</label>
          <input
            id="start-date"
            type="date"
            className={`date-input ${error ? 'error' : ''}`}
            value={startDate}
            onChange={handleStartDateChange}
            onKeyDown={handleKeyDown}
            aria-label="Start date for filtering transactions"
            aria-invalid={!!error}
            aria-describedby={error ? 'date-range-error' : 'date-range-label'}
          />
        </div>
        <div className="date-input-wrapper">
          <label htmlFor="end-date" className="input-label">To</label>
          <input
            id="end-date"
            type="date"
            className={`date-input ${error ? 'error' : ''}`}
            value={endDate}
            onChange={handleEndDateChange}
            onKeyDown={handleKeyDown}
            aria-label="End date for filtering transactions"
            aria-invalid={!!error}
            aria-describedby={error ? 'date-range-error' : 'date-range-label'}
          />
        </div>
        {hasValue && (
          <button
            className="clear-button"
            onClick={handleClear}
            aria-label="Clear date range filter"
            type="button"
          >
            ✕
          </button>
        )}
      </div>
      {error && (
        <div id="date-range-error" className="error-message" role="alert" aria-live="polite">
          {error}
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;
