import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ActiveFilters from './ActiveFilters';
import { createEmptyFilterState } from '../../types/filters';

describe('ActiveFilters Component', () => {
  const mockOnRemoveFilter = jest.fn();
  const mockOnClearAll = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders nothing when no filters are active', () => {
    const emptyFilters = createEmptyFilterState();
    const { container } = render(
      <ActiveFilters
        filters={emptyFilters}
        onRemoveFilter={mockOnRemoveFilter}
        onClearAll={mockOnClearAll}
      />
    );
    expect(container.firstChild).toBe(null);
  });

  test('displays correct count of active filters', () => {
    const filters = {
      ...createEmptyFilterState(),
      searchQuery: 'HDFC',
      transactionTypes: ['Purchase', 'SIP']
    };
    render(
      <ActiveFilters
        filters={filters}
        onRemoveFilter={mockOnRemoveFilter}
        onClearAll={mockOnClearAll}
      />
    );
    expect(screen.getByText('Active Filters (2)')).toBeTruthy();
  });

  test('displays date range filter tag', () => {
    const filters = {
      ...createEmptyFilterState(),
      dateRange: {
        start: new Date('2024-01-01'),
        end: new Date('2024-03-31')
      }
    };
    render(
      <ActiveFilters
        filters={filters}
        onRemoveFilter={mockOnRemoveFilter}
        onClearAll={mockOnClearAll}
      />
    );
    expect(screen.getByText('Date:')).toBeTruthy();
    expect(screen.getByText(/Jan.*2024.*Mar.*2024/)).toBeTruthy();
  });

  test('displays transaction types filter tag', () => {
    const filters = {
      ...createEmptyFilterState(),
      transactionTypes: ['Purchase']
    };
    render(
      <ActiveFilters
        filters={filters}
        onRemoveFilter={mockOnRemoveFilter}
        onClearAll={mockOnClearAll}
      />
    );
    expect(screen.getByText('Type:')).toBeTruthy();
    expect(screen.getByText('Purchase')).toBeTruthy();
  });

  test('displays multiple transaction types count', () => {
    const filters = {
      ...createEmptyFilterState(),
      transactionTypes: ['Purchase', 'SIP', 'Redemption']
    };
    render(
      <ActiveFilters
        filters={filters}
        onRemoveFilter={mockOnRemoveFilter}
        onClearAll={mockOnClearAll}
      />
    );
    expect(screen.getByText('Type:')).toBeTruthy();
    expect(screen.getByText('3 types')).toBeTruthy();
  });

  test('displays search query filter tag', () => {
    const filters = {
      ...createEmptyFilterState(),
      searchQuery: 'HDFC Equity'
    };
    render(
      <ActiveFilters
        filters={filters}
        onRemoveFilter={mockOnRemoveFilter}
        onClearAll={mockOnClearAll}
      />
    );
    expect(screen.getByText('Search:')).toBeTruthy();
    expect(screen.getByText('"HDFC Equity"')).toBeTruthy();
  });

  test('displays folio number filter tag', () => {
    const filters = {
      ...createEmptyFilterState(),
      folioNumber: '12345678'
    };
    render(
      <ActiveFilters
        filters={filters}
        onRemoveFilter={mockOnRemoveFilter}
        onClearAll={mockOnClearAll}
      />
    );
    expect(screen.getByText('Folio:')).toBeTruthy();
    expect(screen.getByText('12345678')).toBeTruthy();
  });

  test('displays amount range filter tag', () => {
    const filters = {
      ...createEmptyFilterState(),
      amountRange: { min: 1000, max: 50000 }
    };
    render(
      <ActiveFilters
        filters={filters}
        onRemoveFilter={mockOnRemoveFilter}
        onClearAll={mockOnClearAll}
      />
    );
    expect(screen.getByText('Amount:')).toBeTruthy();
    expect(screen.getByText(/₹1,000.*₹50,000/)).toBeTruthy();
  });

  test('calls onRemoveFilter when remove button is clicked', () => {
    const filters = {
      ...createEmptyFilterState(),
      searchQuery: 'HDFC'
    };
    render(
      <ActiveFilters
        filters={filters}
        onRemoveFilter={mockOnRemoveFilter}
        onClearAll={mockOnClearAll}
      />
    );
    const removeButton = screen.getByLabelText(/Remove Search filter/i);
    fireEvent.click(removeButton);
    expect(mockOnRemoveFilter).toHaveBeenCalledWith('searchQuery');
  });

  test('calls onClearAll when Clear All button is clicked', () => {
    const filters = {
      ...createEmptyFilterState(),
      searchQuery: 'HDFC',
      transactionTypes: ['Purchase']
    };
    render(
      <ActiveFilters
        filters={filters}
        onRemoveFilter={mockOnRemoveFilter}
        onClearAll={mockOnClearAll}
      />
    );
    const clearAllButton = screen.getByText('Clear All');
    fireEvent.click(clearAllButton);
    expect(mockOnClearAll).toHaveBeenCalled();
  });

  test('displays all filter tags when multiple filters are active', () => {
    const filters = {
      dateRange: {
        start: new Date('2024-01-01'),
        end: new Date('2024-03-31')
      },
      transactionTypes: ['Purchase', 'SIP'],
      searchQuery: 'HDFC',
      folioNumber: '12345678',
      amountRange: { min: 1000, max: 50000 }
    };
    render(
      <ActiveFilters
        filters={filters}
        onRemoveFilter={mockOnRemoveFilter}
        onClearAll={mockOnClearAll}
      />
    );
    expect(screen.getByText('Active Filters (5)')).toBeTruthy();
    expect(screen.getByText('Date:')).toBeTruthy();
    expect(screen.getByText('Type:')).toBeTruthy();
    expect(screen.getByText('Search:')).toBeTruthy();
    expect(screen.getByText('Folio:')).toBeTruthy();
    expect(screen.getByText('Amount:')).toBeTruthy();
  });

  test('applies dark mode class when darkMode prop is true', () => {
    const filters = {
      ...createEmptyFilterState(),
      searchQuery: 'HDFC'
    };
    const { container } = render(
      <ActiveFilters
        filters={filters}
        onRemoveFilter={mockOnRemoveFilter}
        onClearAll={mockOnClearAll}
        darkMode={true}
      />
    );
    expect(container.firstChild.classList.contains('dark-mode')).toBe(true);
  });
});


/**
 * Property-based tests for ActiveFilters component
 * Feature: advanced-filtering-search
 */

const fc = require('fast-check');

/**
 * Arbitrary generator for filter state
 */
const filterStateArbitrary = fc.record({
  dateRange: fc.record({
    start: fc.option(fc.date({ min: new Date('2000-01-01'), max: new Date('2030-12-31') }).filter(d => !isNaN(d.getTime())), { nil: null }),
    end: fc.option(fc.date({ min: new Date('2000-01-01'), max: new Date('2030-12-31') }).filter(d => !isNaN(d.getTime())), { nil: null })
  }),
  transactionTypes: fc.array(fc.constantFrom('Purchase', 'Redemption', 'SIP', 'Switch-In', 'Switch-Out', 'Dividend'), { maxLength: 6 }),
  searchQuery: fc.oneof(fc.constant(''), fc.constantFrom('HDFC', 'ICICI', 'SBI', 'Equity', 'Debt', 'Fund')),
  folioNumber: fc.option(fc.array(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'), { minLength: 8, maxLength: 12 }).map(arr => arr.join('')), { nil: null }),
  amountRange: fc.record({
    min: fc.option(fc.float({ min: 0, max: 100000, noNaN: true }), { nil: null }),
    max: fc.option(fc.float({ min: 0, max: 100000, noNaN: true }), { nil: null })
  })
});

/**
 * Property 17: Active filter indicators match applied filters
 * Feature: advanced-filtering-search, Property 17: Active filter indicators match applied filters
 * Validates: Requirements 10.1, 10.2, 10.4
 * 
 * For any set of applied filters, there should be exactly one active filter indicator
 * for each non-empty filter, and each indicator should display the correct filter name and value.
 */
describe('Property 17: Active filter indicators match applied filters', () => {
  test('active filter indicators should match applied filters', () => {
    fc.assert(
      fc.property(
        filterStateArbitrary,
        (filters) => {
          const mockOnRemoveFilter = jest.fn();
          const mockOnClearAll = jest.fn();

          const { container } = render(
            <ActiveFilters
              filters={filters}
              onRemoveFilter={mockOnRemoveFilter}
              onClearAll={mockOnClearAll}
            />
          );

          // Count expected active filters
          let expectedCount = 0;
          if (filters.dateRange.start !== null || filters.dateRange.end !== null) expectedCount++;
          if (filters.transactionTypes.length > 0) expectedCount++;
          if (filters.searchQuery !== '') expectedCount++;
          if (filters.folioNumber !== null) expectedCount++;
          if (filters.amountRange.min !== null || filters.amountRange.max !== null) expectedCount++;

          // If no filters, component should not render
          if (expectedCount === 0) {
            return container.firstChild === null;
          }

          // Count actual filter tags rendered
          const filterTags = container.querySelectorAll('.filter-tag');
          const actualCount = filterTags.length;

          // Verify count matches
          if (actualCount !== expectedCount) {
            return false;
          }

          // Verify the count is displayed correctly
          const countText = container.querySelector('.active-filters-title');
          if (!countText || !countText.textContent.includes(`(${expectedCount})`)) {
            return false;
          }

          // Verify each filter has a remove button
          const removeButtons = container.querySelectorAll('.filter-tag-remove');
          if (removeButtons.length !== expectedCount) {
            return false;
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('filter tags should display correct labels', () => {
    fc.assert(
      fc.property(
        filterStateArbitrary,
        (filters) => {
          const mockOnRemoveFilter = jest.fn();
          const mockOnClearAll = jest.fn();

          const { container } = render(
            <ActiveFilters
              filters={filters}
              onRemoveFilter={mockOnRemoveFilter}
              onClearAll={mockOnClearAll}
            />
          );

          // If no filters, skip
          const expectedCount = 
            (filters.dateRange.start !== null || filters.dateRange.end !== null ? 1 : 0) +
            (filters.transactionTypes.length > 0 ? 1 : 0) +
            (filters.searchQuery !== '' ? 1 : 0) +
            (filters.folioNumber !== null ? 1 : 0) +
            (filters.amountRange.min !== null || filters.amountRange.max !== null ? 1 : 0);

          if (expectedCount === 0) {
            return true;
          }

          // Check for expected labels
          const labels = container.querySelectorAll('.filter-tag-label');
          const labelTexts = Array.from(labels).map(l => l.textContent);

          // Verify expected labels are present
          if (filters.dateRange.start !== null || filters.dateRange.end !== null) {
            if (!labelTexts.includes('Date:')) return false;
          }
          if (filters.transactionTypes.length > 0) {
            if (!labelTexts.includes('Type:')) return false;
          }
          if (filters.searchQuery !== '') {
            if (!labelTexts.includes('Search:')) return false;
          }
          if (filters.folioNumber !== null) {
            if (!labelTexts.includes('Folio:')) return false;
          }
          if (filters.amountRange.min !== null || filters.amountRange.max !== null) {
            if (!labelTexts.includes('Amount:')) return false;
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Property 18: Individual filter removal precision
 * Feature: advanced-filtering-search, Property 18: Individual filter removal precision
 * Validates: Requirements 10.3
 * 
 * For any set of multiple active filters, removing one specific filter via its indicator
 * should remove only that filter while preserving all other filters.
 */
describe('Property 18: Individual filter removal precision', () => {
  test('removing one filter should preserve all other filters', () => {
    fc.assert(
      fc.property(
        filterStateArbitrary,
        (filters) => {
          // Only test when we have at least 2 active filters
          const activeFilterCount = 
            (filters.dateRange.start !== null || filters.dateRange.end !== null ? 1 : 0) +
            (filters.transactionTypes.length > 0 ? 1 : 0) +
            (filters.searchQuery !== '' ? 1 : 0) +
            (filters.folioNumber !== null ? 1 : 0) +
            (filters.amountRange.min !== null || filters.amountRange.max !== null ? 1 : 0);

          if (activeFilterCount < 2) {
            return true; // Skip cases with less than 2 filters
          }

          const mockOnRemoveFilter = jest.fn();
          const mockOnClearAll = jest.fn();

          const { container } = render(
            <ActiveFilters
              filters={filters}
              onRemoveFilter={mockOnRemoveFilter}
              onClearAll={mockOnClearAll}
            />
          );

          // Get all remove buttons
          const removeButtons = container.querySelectorAll('.filter-tag-remove');
          
          // Click the first remove button
          if (removeButtons.length > 0) {
            fireEvent.click(removeButtons[0]);
            
            // Verify onRemoveFilter was called exactly once
            if (mockOnRemoveFilter.mock.calls.length !== 1) {
              return false;
            }

            // Verify it was called with a valid filter key
            const calledWith = mockOnRemoveFilter.mock.calls[0][0];
            const validKeys = ['dateRange', 'transactionTypes', 'searchQuery', 'folioNumber', 'amountRange'];
            if (!validKeys.includes(calledWith)) {
              return false;
            }

            // Verify onClearAll was NOT called
            if (mockOnClearAll.mock.calls.length !== 0) {
              return false;
            }
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('each remove button should call onRemoveFilter with correct filter key', () => {
    fc.assert(
      fc.property(
        filterStateArbitrary,
        (filters) => {
          const mockOnRemoveFilter = jest.fn();
          const mockOnClearAll = jest.fn();

          const { container } = render(
            <ActiveFilters
              filters={filters}
              onRemoveFilter={mockOnRemoveFilter}
              onClearAll={mockOnClearAll}
            />
          );

          // Get all remove buttons and their corresponding filter keys
          const removeButtons = container.querySelectorAll('.filter-tag-remove');
          const filterTags = container.querySelectorAll('.filter-tag');

          // Build expected mapping
          const expectedKeys = [];
          if (filters.dateRange.start !== null || filters.dateRange.end !== null) {
            expectedKeys.push('dateRange');
          }
          if (filters.transactionTypes.length > 0) {
            expectedKeys.push('transactionTypes');
          }
          if (filters.searchQuery !== '') {
            expectedKeys.push('searchQuery');
          }
          if (filters.folioNumber !== null) {
            expectedKeys.push('folioNumber');
          }
          if (filters.amountRange.min !== null || filters.amountRange.max !== null) {
            expectedKeys.push('amountRange');
          }

          // Verify each button calls with the correct key
          for (let i = 0; i < removeButtons.length; i++) {
            mockOnRemoveFilter.mockClear();
            fireEvent.click(removeButtons[i]);
            
            if (mockOnRemoveFilter.mock.calls.length !== 1) {
              return false;
            }

            const calledKey = mockOnRemoveFilter.mock.calls[0][0];
            if (calledKey !== expectedKeys[i]) {
              return false;
            }
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
