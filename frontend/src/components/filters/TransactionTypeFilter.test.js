import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TransactionTypeFilter from './TransactionTypeFilter';

describe('TransactionTypeFilter', () => {
  const mockOnChange = jest.fn();
  const availableTypes = ['Purchase', 'Redemption', 'SIP', 'Switch-In', 'Dividend'];

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  test('renders all available transaction types', () => {
    render(
      <TransactionTypeFilter
        value={[]}
        onChange={mockOnChange}
        availableTypes={availableTypes}
      />
    );

    availableTypes.forEach(type => {
      expect(screen.getByLabelText(`Filter by ${type}`)).toBeTruthy();
    });
  });

  test('displays checked state for selected types', () => {
    const selectedTypes = ['Purchase', 'SIP'];
    render(
      <TransactionTypeFilter
        value={selectedTypes}
        onChange={mockOnChange}
        availableTypes={availableTypes}
      />
    );

    const purchaseCheckbox = screen.getByLabelText('Filter by Purchase');
    const sipCheckbox = screen.getByLabelText('Filter by SIP');
    const redemptionCheckbox = screen.getByLabelText('Filter by Redemption');

    expect(purchaseCheckbox.checked).toBe(true);
    expect(sipCheckbox.checked).toBe(true);
    expect(redemptionCheckbox.checked).toBe(false);
  });

  test('calls onChange when checkbox is toggled', () => {
    render(
      <TransactionTypeFilter
        value={[]}
        onChange={mockOnChange}
        availableTypes={availableTypes}
      />
    );

    const purchaseCheckbox = screen.getByLabelText('Filter by Purchase');
    fireEvent.click(purchaseCheckbox);

    expect(mockOnChange).toHaveBeenCalledWith(['Purchase']);
  });

  test('removes type when unchecking', () => {
    const selectedTypes = ['Purchase', 'SIP'];
    render(
      <TransactionTypeFilter
        value={selectedTypes}
        onChange={mockOnChange}
        availableTypes={availableTypes}
      />
    );

    const purchaseCheckbox = screen.getByLabelText('Filter by Purchase');
    fireEvent.click(purchaseCheckbox);

    expect(mockOnChange).toHaveBeenCalledWith(['SIP']);
  });

  test('Select All button selects all types', () => {
    render(
      <TransactionTypeFilter
        value={[]}
        onChange={mockOnChange}
        availableTypes={availableTypes}
      />
    );

    const selectAllButton = screen.getByText('Select All');
    fireEvent.click(selectAllButton);

    // Component sorts types, so we need to check for sorted array
    const sortedTypes = [...availableTypes].sort();
    expect(mockOnChange).toHaveBeenCalledWith(sortedTypes);
  });

  test('Deselect All button clears all selections', () => {
    render(
      <TransactionTypeFilter
        value={availableTypes}
        onChange={mockOnChange}
        availableTypes={availableTypes}
      />
    );

    const deselectAllButton = screen.getByText('Deselect All');
    fireEvent.click(deselectAllButton);

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  test('Select All button is disabled when all types are selected', () => {
    render(
      <TransactionTypeFilter
        value={availableTypes}
        onChange={mockOnChange}
        availableTypes={availableTypes}
      />
    );

    const selectAllButton = screen.getByText('Select All');
    expect(selectAllButton.disabled).toBe(true);
  });

  test('Deselect All button is disabled when no types are selected', () => {
    render(
      <TransactionTypeFilter
        value={[]}
        onChange={mockOnChange}
        availableTypes={availableTypes}
      />
    );

    const deselectAllButton = screen.getByText('Deselect All');
    expect(deselectAllButton.disabled).toBe(true);
  });

  test('displays clear button when types are selected', () => {
    render(
      <TransactionTypeFilter
        value={['Purchase']}
        onChange={mockOnChange}
        availableTypes={availableTypes}
      />
    );

    const clearButton = screen.getByLabelText('Clear transaction type filter');
    expect(clearButton).toBeTruthy();
  });

  test('clear button calls onChange with empty array', () => {
    render(
      <TransactionTypeFilter
        value={['Purchase', 'SIP']}
        onChange={mockOnChange}
        availableTypes={availableTypes}
      />
    );

    const clearButton = screen.getByLabelText('Clear transaction type filter');
    fireEvent.click(clearButton);

    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  test('does not display clear button when no types are selected', () => {
    render(
      <TransactionTypeFilter
        value={[]}
        onChange={mockOnChange}
        availableTypes={availableTypes}
      />
    );

    const clearButton = screen.queryByLabelText('Clear transaction type filter');
    expect(clearButton).toBeNull();
  });

  test('displays message when no types are available', () => {
    render(
      <TransactionTypeFilter
        value={[]}
        onChange={mockOnChange}
        availableTypes={[]}
      />
    );

    expect(screen.getByText('No transaction types available')).toBeTruthy();
  });

  test('sorts transaction types alphabetically', () => {
    const unsortedTypes = ['Redemption', 'Purchase', 'SIP', 'Dividend'];
    render(
      <TransactionTypeFilter
        value={[]}
        onChange={mockOnChange}
        availableTypes={unsortedTypes}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    const labels = checkboxes.map(cb => cb.getAttribute('aria-label'));

    expect(labels).toEqual([
      'Filter by Dividend',
      'Filter by Purchase',
      'Filter by Redemption',
      'Filter by SIP'
    ]);
  });
});
