import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FolioFilter from './FolioFilter';

describe('FolioFilter', () => {
  const mockOnChange = jest.fn();
  const availableFolios = ['12345678', '87654321', '11111111', '99999999'];

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  test('renders dropdown with "All Folios" option', () => {
    render(
      <FolioFilter
        value={null}
        onChange={mockOnChange}
        availableFolios={availableFolios}
      />
    );

    const select = screen.getByRole('combobox', { name: /folio number/i });
    expect(select).toBeTruthy();
    expect(screen.getByText('All Folios')).toBeTruthy();
  });

  test('renders all available folio numbers', () => {
    render(
      <FolioFilter
        value={null}
        onChange={mockOnChange}
        availableFolios={availableFolios}
      />
    );

    availableFolios.forEach(folio => {
      expect(screen.getByText(folio)).toBeTruthy();
    });
  });

  test('displays selected folio value', () => {
    const selectedFolio = '12345678';
    render(
      <FolioFilter
        value={selectedFolio}
        onChange={mockOnChange}
        availableFolios={availableFolios}
      />
    );

    const select = screen.getByRole('combobox', { name: /folio number/i });
    expect(select.value).toBe(selectedFolio);
  });

  test('calls onChange with selected folio when option is selected', () => {
    render(
      <FolioFilter
        value={null}
        onChange={mockOnChange}
        availableFolios={availableFolios}
      />
    );

    const select = screen.getByRole('combobox', { name: /folio number/i });
    fireEvent.change(select, { target: { value: '12345678' } });

    expect(mockOnChange).toHaveBeenCalledWith('12345678');
  });

  test('calls onChange with null when "All Folios" is selected', () => {
    render(
      <FolioFilter
        value={'12345678'}
        onChange={mockOnChange}
        availableFolios={availableFolios}
      />
    );

    const select = screen.getByRole('combobox', { name: /folio number/i });
    fireEvent.change(select, { target: { value: '' } });

    expect(mockOnChange).toHaveBeenCalledWith(null);
  });

  test('displays clear button when folio is selected', () => {
    render(
      <FolioFilter
        value={'12345678'}
        onChange={mockOnChange}
        availableFolios={availableFolios}
      />
    );

    const clearButton = screen.getByLabelText('Clear folio filter');
    expect(clearButton).toBeTruthy();
  });

  test('clear button calls onChange with null', () => {
    render(
      <FolioFilter
        value={'12345678'}
        onChange={mockOnChange}
        availableFolios={availableFolios}
      />
    );

    const clearButton = screen.getByLabelText('Clear folio filter');
    fireEvent.click(clearButton);

    expect(mockOnChange).toHaveBeenCalledWith(null);
  });

  test('does not display clear button when no folio is selected', () => {
    render(
      <FolioFilter
        value={null}
        onChange={mockOnChange}
        availableFolios={availableFolios}
      />
    );

    const clearButton = screen.queryByLabelText('Clear folio filter');
    expect(clearButton).toBeNull();
  });

  test('displays message when no folios are available', () => {
    render(
      <FolioFilter
        value={null}
        onChange={mockOnChange}
        availableFolios={[]}
      />
    );

    expect(screen.getByText('No folios available')).toBeTruthy();
  });

  test('sorts folio numbers', () => {
    const unsortedFolios = ['99999999', '11111111', '87654321', '12345678'];
    render(
      <FolioFilter
        value={null}
        onChange={mockOnChange}
        availableFolios={unsortedFolios}
      />
    );

    const select = screen.getByRole('combobox', { name: /folio number/i });
    const options = Array.from(select.options).slice(1); // Skip "All Folios" option
    const optionValues = options.map(opt => opt.value);

    expect(optionValues).toEqual(['11111111', '12345678', '87654321', '99999999']);
  });

  test('handles empty availableFolios array', () => {
    render(
      <FolioFilter
        value={null}
        onChange={mockOnChange}
        availableFolios={[]}
      />
    );

    const select = screen.getByRole('combobox', { name: /folio number/i });
    expect(select).toBeTruthy();
    expect(screen.getByText('All Folios')).toBeTruthy();
  });

  test('removes duplicates from available folios', () => {
    const duplicateFolios = ['12345678', '12345678', '87654321', '87654321'];
    render(
      <FolioFilter
        value={null}
        onChange={mockOnChange}
        availableFolios={duplicateFolios}
      />
    );

    const select = screen.getByRole('combobox', { name: /folio number/i });
    const options = Array.from(select.options).slice(1); // Skip "All Folios" option
    
    expect(options.length).toBe(2);
    expect(options[0].value).toBe('12345678');
    expect(options[1].value).toBe('87654321');
  });

  test('applies dark mode class when darkMode prop is true', () => {
    const { container } = render(
      <FolioFilter
        value={null}
        onChange={mockOnChange}
        availableFolios={availableFolios}
        darkMode={true}
      />
    );

    const folioFilter = container.querySelector('.folio-filter');
    expect(folioFilter.classList.contains('dark-mode')).toBe(true);
  });

  test('does not apply dark mode class when darkMode prop is false', () => {
    const { container } = render(
      <FolioFilter
        value={null}
        onChange={mockOnChange}
        availableFolios={availableFolios}
        darkMode={false}
      />
    );

    const folioFilter = container.querySelector('.folio-filter');
    expect(folioFilter.classList.contains('dark-mode')).toBe(false);
  });
});
