import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NoResultsMessage from './NoResultsMessage';

describe('NoResultsMessage Component', () => {
  test('renders with default message', () => {
    render(<NoResultsMessage />);
    
    expect(screen.getByText('No Matching Transactions')).toBeInTheDocument();
    expect(screen.getByText(/No transactions match your current filters/)).toBeInTheDocument();
    expect(screen.getByText('🔍')).toBeInTheDocument();
  });

  test('renders with active filters summary', () => {
    const activeFilters = {
      dateRange: { start: '2023-01-01', end: '2023-12-31' },
      transactionType: ['Purchase'],
      folio: ['123456'],
      amountRange: { min: 1000, max: 5000 },
      search: 'test'
    };
    
    render(
      <NoResultsMessage 
        activeFilters={activeFilters}
      />
    );
    
    expect(screen.getByText(/date range, transaction type, folio, amount range, search term/)).toBeInTheDocument();
  });

  test('renders clear filters button when onClearFilters is provided', () => {
    const mockClearFilters = jest.fn();
    
    render(
      <NoResultsMessage 
        onClearFilters={mockClearFilters}
      />
    );
    
    const clearButton = screen.getByText('Clear All Filters');
    expect(clearButton).toBeInTheDocument();
  });

  test('calls onClearFilters when clear button is clicked', () => {
    const mockClearFilters = jest.fn();
    
    render(
      <NoResultsMessage 
        onClearFilters={mockClearFilters}
      />
    );
    
    const clearButton = screen.getByText('Clear All Filters');
    fireEvent.click(clearButton);
    
    expect(mockClearFilters).toHaveBeenCalledTimes(1);
  });

  test('does not render clear button when onClearFilters is not provided', () => {
    render(<NoResultsMessage />);
    
    expect(screen.queryByText('Clear All Filters')).not.toBeInTheDocument();
  });

  test('applies dark mode when specified', () => {
    const { container } = render(
      <NoResultsMessage 
        darkMode={true}
      />
    );
    
    expect(container.querySelector('.dark-mode')).toBeInTheDocument();
  });

  test('handles empty active filters object', () => {
    render(
      <NoResultsMessage 
        activeFilters={{}}
      />
    );
    
    expect(screen.getByText(/current filters/)).toBeInTheDocument();
  });

  test('handles partial active filters', () => {
    const activeFilters = {
      dateRange: { start: '2023-01-01', end: '2023-12-31' },
      search: 'test'
    };
    
    render(
      <NoResultsMessage 
        activeFilters={activeFilters}
      />
    );
    
    expect(screen.getByText(/date range, search term/)).toBeInTheDocument();
  });
});