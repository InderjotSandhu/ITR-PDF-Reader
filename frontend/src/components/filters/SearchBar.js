import React, { useState, useEffect, useRef } from 'react';
import './SearchBar.css';

const SearchBar = ({ value, onChange, placeholder = "Search by scheme name...", debounceMs = 300, darkMode }) => {
  const [localValue, setLocalValue] = useState(value || '');
  const debounceTimerRef = useRef(null);

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      onChange(newValue);
    }, debounceMs);
  };

  const handleClear = () => {
    setLocalValue('');
    
    // Clear any pending debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Immediately call onChange with empty value
    onChange('');
  };

  const handleKeyDown = (e) => {
    // Allow Escape key to clear the search
    if (e.key === 'Escape' && localValue) {
      e.preventDefault();
      handleClear();
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className={`search-bar ${darkMode ? 'dark-mode' : ''}`} role="search">
      <label htmlFor="search-input" className="sr-only">Search transactions by scheme name</label>
      <div className="search-input-container">
        <span className="search-icon" aria-hidden="true">🔍</span>
        <input
          id="search-input"
          type="text"
          className="search-input"
          value={localValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Search transactions by scheme name"
          role="searchbox"
        />
        {localValue && (
          <button
            className="clear-button"
            onClick={handleClear}
            aria-label="Clear search"
            type="button"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
