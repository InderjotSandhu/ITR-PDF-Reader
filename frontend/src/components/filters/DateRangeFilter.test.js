/**
 * Unit tests for DateRangeFilter component
 * Feature: advanced-filtering-search
 * Requirements: 1.1, 1.3
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DateRangeFilter from './DateRangeFilter';

describe('DateRangeFilter Component', () => {
  describe('Date validation', () => {
    test('should show error when end date is before start date', () => {
      const mockOnChange = jest.fn();
      render(<DateRangeFilter value={{ start: null, end: null }} onChange={mockOnChange} />);
      
      const startInput = screen.getByLabelText(/start date/i);
      const endInput = screen.getByLabelText(/end date/i);
      
      // Set start date to 2024-03-01
      fireEvent.change(startInput, { target: { value: '2024-03-01' } });
      
      // Set end date to 2024-02-01 (before start date)
      fireEvent.change(endInput, { target: { value: '2024-02-01' } });
      
      // Should show error message
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage.textContent).toBe('End date must be after start date');
    });

    test('should not show error when end date is after start date', () => {
      const mockOnChange = jest.fn();
      render(<DateRangeFilter value={{ start: null, end: null }} onChange={mockOnChange} />);
      
      const startInput = screen.getByLabelText(/start date/i);
      const endInput = screen.getByLabelText(/end date/i);
      
      // Set start date to 2024-01-01
      fireEvent.change(startInput, { target: { value: '2024-01-01' } });
      
      // Set end date to 2024-12-31 (after start date)
      fireEvent.change(endInput, { target: { value: '2024-12-31' } });
      
      // Should not show error message
      const errorMessage = screen.queryByRole('alert');
      expect(errorMessage).toBeNull();
    });

    test('should not show error when end date equals start date', () => {
      const mockOnChange = jest.fn();
      render(<DateRangeFilter value={{ start: null, end: null }} onChange={mockOnChange} />);
      
      const startInput = screen.getByLabelText(/start date/i);
      const endInput = screen.getByLabelText(/end date/i);
      
      // Set both dates to the same value
      fireEvent.change(startInput, { target: { value: '2024-06-15' } });
      fireEvent.change(endInput, { target: { value: '2024-06-15' } });
      
      // Should not show error message
      const errorMessage = screen.queryByRole('alert');
      expect(errorMessage).toBeNull();
    });

    test('should not show error when only start date is set', () => {
      const mockOnChange = jest.fn();
      render(<DateRangeFilter value={{ start: null, end: null }} onChange={mockOnChange} />);
      
      const startInput = screen.getByLabelText(/start date/i);
      
      // Set only start date
      fireEvent.change(startInput, { target: { value: '2024-01-01' } });
      
      // Should not show error message
      const errorMessage = screen.queryByRole('alert');
      expect(errorMessage).toBeNull();
    });

    test('should not show error when only end date is set', () => {
      const mockOnChange = jest.fn();
      render(<DateRangeFilter value={{ start: null, end: null }} onChange={mockOnChange} />);
      
      const endInput = screen.getByLabelText(/end date/i);
      
      // Set only end date
      fireEvent.change(endInput, { target: { value: '2024-12-31' } });
      
      // Should not show error message
      const errorMessage = screen.queryByRole('alert');
      expect(errorMessage).toBeNull();
    });

    test('should clear error when invalid range is corrected', () => {
      const mockOnChange = jest.fn();
      render(<DateRangeFilter value={{ start: null, end: null }} onChange={mockOnChange} />);
      
      const startInput = screen.getByLabelText(/start date/i);
      const endInput = screen.getByLabelText(/end date/i);
      
      // Create invalid range
      fireEvent.change(startInput, { target: { value: '2024-03-01' } });
      fireEvent.change(endInput, { target: { value: '2024-02-01' } });
      
      // Verify error is shown
      expect(screen.getByRole('alert')).toBeTruthy();
      
      // Correct the end date
      fireEvent.change(endInput, { target: { value: '2024-04-01' } });
      
      // Error should be cleared
      const errorMessage = screen.queryByRole('alert');
      expect(errorMessage).toBeNull();
    });
  });

  describe('Error message display', () => {
    test('should display error message with correct text', () => {
      const mockOnChange = jest.fn();
      render(<DateRangeFilter value={{ start: null, end: null }} onChange={mockOnChange} />);
      
      const startInput = screen.getByLabelText(/start date/i);
      const endInput = screen.getByLabelText(/end date/i);
      
      // Create invalid range
      fireEvent.change(startInput, { target: { value: '2024-05-01' } });
      fireEvent.change(endInput, { target: { value: '2024-04-01' } });
      
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage.textContent).toBe('End date must be after start date');
    });

    test('should add error class to inputs when validation fails', () => {
      const mockOnChange = jest.fn();
      render(<DateRangeFilter value={{ start: null, end: null }} onChange={mockOnChange} />);
      
      const startInput = screen.getByLabelText(/start date/i);
      const endInput = screen.getByLabelText(/end date/i);
      
      // Create invalid range
      fireEvent.change(startInput, { target: { value: '2024-03-01' } });
      fireEvent.change(endInput, { target: { value: '2024-02-01' } });
      
      // Both inputs should have error class
      expect(startInput.classList.contains('error')).toBe(true);
      expect(endInput.classList.contains('error')).toBe(true);
    });

    test('should set aria-invalid attribute when validation fails', () => {
      const mockOnChange = jest.fn();
      render(<DateRangeFilter value={{ start: null, end: null }} onChange={mockOnChange} />);
      
      const startInput = screen.getByLabelText(/start date/i);
      const endInput = screen.getByLabelText(/end date/i);
      
      // Create invalid range
      fireEvent.change(startInput, { target: { value: '2024-03-01' } });
      fireEvent.change(endInput, { target: { value: '2024-02-01' } });
      
      // Both inputs should have aria-invalid="true"
      expect(startInput.getAttribute('aria-invalid')).toBe('true');
      expect(endInput.getAttribute('aria-invalid')).toBe('true');
    });
  });

  describe('onChange callbacks', () => {
    test('should call onChange with Date objects when valid dates are entered', () => {
      const mockOnChange = jest.fn();
      render(<DateRangeFilter value={{ start: null, end: null }} onChange={mockOnChange} />);
      
      const startInput = screen.getByLabelText(/start date/i);
      
      // Set start date
      fireEvent.change(startInput, { target: { value: '2024-01-15' } });
      
      // Should call onChange with Date object
      expect(mockOnChange).toHaveBeenCalledWith({
        start: new Date('2024-01-15'),
        end: null
      });
    });

    test('should call onChange with both dates when both are set', () => {
      const mockOnChange = jest.fn();
      render(<DateRangeFilter value={{ start: null, end: null }} onChange={mockOnChange} />);
      
      const startInput = screen.getByLabelText(/start date/i);
      const endInput = screen.getByLabelText(/end date/i);
      
      // Set start date
      fireEvent.change(startInput, { target: { value: '2024-01-01' } });
      
      // Set end date
      fireEvent.change(endInput, { target: { value: '2024-12-31' } });
      
      // Should call onChange with both dates
      expect(mockOnChange).toHaveBeenLastCalledWith({
        start: new Date('2024-01-01'),
        end: new Date('2024-12-31')
      });
    });

    test('should not call onChange when validation fails', () => {
      const mockOnChange = jest.fn();
      render(<DateRangeFilter value={{ start: null, end: null }} onChange={mockOnChange} />);
      
      const startInput = screen.getByLabelText(/start date/i);
      const endInput = screen.getByLabelText(/end date/i);
      
      // Set valid start date
      fireEvent.change(startInput, { target: { value: '2024-03-01' } });
      expect(mockOnChange).toHaveBeenCalledTimes(1);
      
      // Set invalid end date (before start)
      fireEvent.change(endInput, { target: { value: '2024-02-01' } });
      
      // onChange should not be called again
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    test('should call onChange with null values when cleared', () => {
      const mockOnChange = jest.fn();
      render(<DateRangeFilter 
        value={{ start: new Date('2024-01-01'), end: new Date('2024-12-31') }} 
        onChange={mockOnChange} 
      />);
      
      const clearButton = screen.getByLabelText(/clear date range/i);
      fireEvent.click(clearButton);
      
      // Should call onChange with null values
      expect(mockOnChange).toHaveBeenCalledWith({
        start: null,
        end: null
      });
    });
  });

  describe('Clear functionality', () => {
    test('should show clear button when dates are set', () => {
      render(<DateRangeFilter 
        value={{ start: new Date('2024-01-01'), end: null }} 
        onChange={jest.fn()} 
      />);
      
      const clearButton = screen.getByLabelText(/clear date range/i);
      expect(clearButton).toBeTruthy();
    });

    test('should not show clear button when no dates are set', () => {
      render(<DateRangeFilter 
        value={{ start: null, end: null }} 
        onChange={jest.fn()} 
      />);
      
      const clearButton = screen.queryByLabelText(/clear date range/i);
      expect(clearButton).toBeNull();
    });

    test('should clear both inputs when clear button is clicked', () => {
      const mockOnChange = jest.fn();
      const { rerender } = render(<DateRangeFilter 
        value={{ start: new Date('2024-01-01'), end: new Date('2024-12-31') }} 
        onChange={mockOnChange} 
      />);
      
      const clearButton = screen.getByLabelText(/clear date range/i);
      fireEvent.click(clearButton);
      
      // Update with cleared values
      rerender(<DateRangeFilter 
        value={{ start: null, end: null }} 
        onChange={mockOnChange} 
      />);
      
      const startInput = screen.getByLabelText(/start date/i);
      const endInput = screen.getByLabelText(/end date/i);
      
      expect(startInput.value).toBe('');
      expect(endInput.value).toBe('');
    });

    test('should clear error message when clear button is clicked', () => {
      const mockOnChange = jest.fn();
      const { rerender } = render(<DateRangeFilter 
        value={{ start: null, end: null }} 
        onChange={mockOnChange} 
      />);
      
      const startInput = screen.getByLabelText(/start date/i);
      const endInput = screen.getByLabelText(/end date/i);
      
      // Create invalid range
      fireEvent.change(startInput, { target: { value: '2024-03-01' } });
      fireEvent.change(endInput, { target: { value: '2024-02-01' } });
      
      // Verify error is shown
      expect(screen.getByRole('alert')).toBeTruthy();
      
      // Update to show clear button
      rerender(<DateRangeFilter 
        value={{ start: new Date('2024-03-01'), end: new Date('2024-02-01') }} 
        onChange={mockOnChange} 
      />);
      
      // Clear
      const clearButton = screen.getByLabelText(/clear date range/i);
      fireEvent.click(clearButton);
      
      // Update with cleared values
      rerender(<DateRangeFilter 
        value={{ start: null, end: null }} 
        onChange={mockOnChange} 
      />);
      
      // Error should be cleared
      const errorMessage = screen.queryByRole('alert');
      expect(errorMessage).toBeNull();
    });
  });

  describe('Rendering', () => {
    test('should render with label', () => {
      render(<DateRangeFilter value={{ start: null, end: null }} onChange={jest.fn()} />);
      
      const label = screen.getByText('Date Range');
      expect(label).toBeTruthy();
    });

    test('should render start and end date inputs', () => {
      render(<DateRangeFilter value={{ start: null, end: null }} onChange={jest.fn()} />);
      
      const startInput = screen.getByLabelText(/start date/i);
      const endInput = screen.getByLabelText(/end date/i);
      
      expect(startInput).toBeTruthy();
      expect(endInput).toBeTruthy();
    });

    test('should render "From" and "To" labels', () => {
      render(<DateRangeFilter value={{ start: null, end: null }} onChange={jest.fn()} />);
      
      const fromLabel = screen.getByText('From');
      const toLabel = screen.getByText('To');
      
      expect(fromLabel).toBeTruthy();
      expect(toLabel).toBeTruthy();
    });

    test('should render date separator', () => {
      render(<DateRangeFilter value={{ start: null, end: null }} onChange={jest.fn()} />);
      
      const separator = screen.getByText('to');
      expect(separator).toBeTruthy();
    });

    test('should apply dark mode class when darkMode prop is true', () => {
      const { container } = render(<DateRangeFilter 
        value={{ start: null, end: null }} 
        onChange={jest.fn()} 
        darkMode={true} 
      />);
      
      const dateRangeFilter = container.querySelector('.date-range-filter');
      expect(dateRangeFilter.classList.contains('dark-mode')).toBe(true);
    });

    test('should not apply dark mode class when darkMode prop is false', () => {
      const { container } = render(<DateRangeFilter 
        value={{ start: null, end: null }} 
        onChange={jest.fn()} 
        darkMode={false} 
      />);
      
      const dateRangeFilter = container.querySelector('.date-range-filter');
      expect(dateRangeFilter.classList.contains('dark-mode')).toBe(false);
    });

    test('should display initial values from props', () => {
      render(<DateRangeFilter 
        value={{ start: new Date('2024-01-15'), end: new Date('2024-06-30') }} 
        onChange={jest.fn()} 
      />);
      
      const startInput = screen.getByLabelText(/start date/i);
      const endInput = screen.getByLabelText(/end date/i);
      
      expect(startInput.value).toBe('2024-01-15');
      expect(endInput.value).toBe('2024-06-30');
    });

    test('should update when prop values change', () => {
      const { rerender } = render(<DateRangeFilter 
        value={{ start: new Date('2024-01-01'), end: new Date('2024-12-31') }} 
        onChange={jest.fn()} 
      />);
      
      const startInput = screen.getByLabelText(/start date/i);
      const endInput = screen.getByLabelText(/end date/i);
      
      expect(startInput.value).toBe('2024-01-01');
      expect(endInput.value).toBe('2024-12-31');
      
      // Update props
      rerender(<DateRangeFilter 
        value={{ start: new Date('2024-03-01'), end: new Date('2024-09-30') }} 
        onChange={jest.fn()} 
      />);
      
      expect(startInput.value).toBe('2024-03-01');
      expect(endInput.value).toBe('2024-09-30');
    });
  });
});
