import React, { useState, useEffect } from 'react';
import './AmountRangeFilter.css';

const AmountRangeFilter = ({ value, onChange, darkMode }) => {
  const [minAmount, setMinAmount] = useState(value?.min !== null ? String(value.min) : '');
  const [maxAmount, setMaxAmount] = useState(value?.max !== null ? String(value.max) : '');
  const [error, setError] = useState('');

  // Update local state when prop changes
  useEffect(() => {
    setMinAmount(value?.min !== null ? String(value.min) : '');
    setMaxAmount(value?.max !== null ? String(value.max) : '');
    setError('');
  }, [value]);

  /**
   * Parse input string to number
   * @param {string} amountString - The amount string to parse
   * @returns {number|null} - Parsed number or null if empty/invalid
   */
  function parseAmount(amountString) {
    if (!amountString || amountString.trim() === '') return null;
    const parsed = parseFloat(amountString);
    return isNaN(parsed) ? null : parsed;
  }

  /**
   * Validate that input is numeric
   * @param {string} amountString - The amount string to validate
   * @returns {boolean} - True if valid or empty, false if invalid
   */
  function isValidNumeric(amountString) {
    if (!amountString || amountString.trim() === '') return true;
    const parsed = parseFloat(amountString);
    return !isNaN(parsed);
  }

  /**
   * Validate amount range (min <= max)
   * @param {string} min - Minimum amount string
   * @param {string} max - Maximum amount string
   * @returns {{valid: boolean, error: string}} - Validation result
   */
  function validateAmountRange(min, max) {
    // Check if both inputs are numeric
    if (!isValidNumeric(min)) {
      return { valid: false, error: 'Please enter a valid number for minimum amount' };
    }
    if (!isValidNumeric(max)) {
      return { valid: false, error: 'Please enter a valid number for maximum amount' };
    }

    // If both are empty, that's valid
    if ((!min || min.trim() === '') && (!max || max.trim() === '')) {
      return { valid: true, error: '' };
    }

    // Parse the amounts
    const minNum = parseAmount(min);
    const maxNum = parseAmount(max);

    // If both are provided, check that min <= max
    if (minNum !== null && maxNum !== null && minNum > maxNum) {
      return { valid: false, error: 'Maximum amount must be greater than minimum amount' };
    }

    return { valid: true, error: '' };
  }

  const handleMinAmountChange = (e) => {
    const newMinAmount = e.target.value;
    setMinAmount(newMinAmount);

    // Validate range
    const validation = validateAmountRange(newMinAmount, maxAmount);
    setError(validation.error);

    // Only call onChange if validation passes
    if (validation.valid) {
      onChange({
        min: parseAmount(newMinAmount),
        max: parseAmount(maxAmount)
      });
    }
  };

  const handleMaxAmountChange = (e) => {
    const newMaxAmount = e.target.value;
    setMaxAmount(newMaxAmount);

    // Validate range
    const validation = validateAmountRange(minAmount, newMaxAmount);
    setError(validation.error);

    // Only call onChange if validation passes
    if (validation.valid) {
      onChange({
        min: parseAmount(minAmount),
        max: parseAmount(newMaxAmount)
      });
    }
  };

  const handleClear = () => {
    setMinAmount('');
    setMaxAmount('');
    setError('');
    onChange({ min: null, max: null });
  };

  const handleKeyDown = (e) => {
    // Allow Escape key to clear the amount range
    if (e.key === 'Escape' && (minAmount || maxAmount)) {
      e.preventDefault();
      handleClear();
    }
  };

  const hasValue = minAmount || maxAmount;

  return (
    <div className={`amount-range-filter ${darkMode ? 'dark-mode' : ''}`} role="group" aria-labelledby="amount-range-label">
      <label id="amount-range-label" className="filter-label">Amount Range</label>
      <div className="amount-inputs-container">
        <div className="amount-input-wrapper">
          <label htmlFor="min-amount" className="input-label">Min (₹)</label>
          <input
            id="min-amount"
            type="text"
            inputMode="decimal"
            className={`amount-input ${error ? 'error' : ''}`}
            value={minAmount}
            onChange={handleMinAmountChange}
            onKeyDown={handleKeyDown}
            placeholder="0"
            aria-label="Minimum amount for filtering transactions"
            aria-invalid={!!error}
            aria-describedby={error ? 'amount-range-error' : 'amount-range-label'}
          />
        </div>
        <span className="amount-separator" aria-hidden="true">to</span>
        <div className="amount-input-wrapper">
          <label htmlFor="max-amount" className="input-label">Max (₹)</label>
          <input
            id="max-amount"
            type="text"
            inputMode="decimal"
            className={`amount-input ${error ? 'error' : ''}`}
            value={maxAmount}
            onChange={handleMaxAmountChange}
            onKeyDown={handleKeyDown}
            placeholder="∞"
            aria-label="Maximum amount for filtering transactions"
            aria-invalid={!!error}
            aria-describedby={error ? 'amount-range-error' : 'amount-range-label'}
          />
        </div>
        {hasValue && (
          <button
            className="clear-button"
            onClick={handleClear}
            aria-label="Clear amount range filter"
            type="button"
          >
            ✕
          </button>
        )}
      </div>
      {error && (
        <div id="amount-range-error" className="error-message" role="alert" aria-live="polite">
          {error}
        </div>
      )}
    </div>
  );
};

export default AmountRangeFilter;
