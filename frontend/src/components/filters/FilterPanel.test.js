/**
 * Unit tests for FilterPanel component
 * Feature: advanced-filtering-search
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import FilterPanel from './FilterPanel';
import { FilterProvider } from '../../context/FilterContext';

/**
 * Helper to render FilterPanel with FilterProvider
 */
const renderFilterPanel = (transactions = [], props = {}) => {
  return render(
    <FilterProvider transactions={transactions}>
      <FilterPanel {...props} />
    </FilterProvider>
  );
};

describe('FilterPanel Component', () => {
  test('renders filter panel with title', () => {
    renderFilterPanel();
    expect(screen.getByText('Filters')).toBeTruthy();
  });

  test('renders all filter components', () => {
    renderFilterPanel();
    
    // Check for search bar
    expect(screen.getByPlaceholderText('Search by scheme name...')).toBeTruthy();
    
    // Check for date range filter
    expect(screen.getByText('Date Range')).toBeTruthy();
    
    // Check for transaction type filter
    expect(screen.getByText('Transaction Type')).toBeTruthy();
    
    // Check for folio filter
    expect(screen.getByText('Folio Number')).toBeTruthy();
    
    // Check for amount range filter
    expect(screen.getByText('Amount Range')).toBeTruthy();
  });

  test('does not show clear all button when no filters are active', () => {
    renderFilterPanel();
    
    // Clear all button should not be visible when no filters are active
    expect(screen.queryByText('Clear All')).toBeNull();
  });

  test('applies dark mode class when darkMode prop is true', () => {
    const { container } = renderFilterPanel([], { darkMode: true });
    
    const filterPanel = container.querySelector('.filter-panel');
    expect(filterPanel.classList.contains('dark-mode')).toBe(true);
  });

  test('passes available types to TransactionTypeFilter', () => {
    const transactions = [
      {
        date: '2024-01-15',
        amount: 10000,
        transactionType: 'Purchase',
        schemeName: 'HDFC Equity Fund',
        folioNumber: '12345678',
        isin: 'INF123456789'
      },
      {
        date: '2024-01-16',
        amount: 5000,
        transactionType: 'SIP',
        schemeName: 'ICICI Debt Fund',
        folioNumber: '87654321',
        isin: 'INF987654321'
      }
    ];
    
    renderFilterPanel(transactions);
    
    // Transaction type filter should have checkboxes for available types
    expect(screen.getByText('Purchase')).toBeTruthy();
    expect(screen.getByText('SIP')).toBeTruthy();
  });

  test('passes available folios to FolioFilter', () => {
    const transactions = [
      {
        date: '2024-01-15',
        amount: 10000,
        transactionType: 'Purchase',
        schemeName: 'HDFC Equity Fund',
        folioNumber: '12345678',
        isin: 'INF123456789'
      },
      {
        date: '2024-01-16',
        amount: 5000,
        transactionType: 'SIP',
        schemeName: 'ICICI Debt Fund',
        folioNumber: '87654321',
        isin: 'INF987654321'
      }
    ];
    
    renderFilterPanel(transactions);
    
    // Folio filter should have options for available folios
    const folioSelect = screen.getByRole('combobox', { name: /folio number/i });
    expect(folioSelect).toBeTruthy();
    
    // Check that options include the folio numbers
    const options = Array.from(folioSelect.options).map(opt => opt.value);
    expect(options).toContain('12345678');
    expect(options).toContain('87654321');
  });
});
