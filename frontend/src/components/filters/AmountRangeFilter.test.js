/**
 * Unit tests for AmountRangeFilter component
 * Feature: advanced-filtering-search
 * Requirements: 5.1, 5.2, 5.3, 5.5
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AmountRangeFilter from './AmountRangeFilter';

describe('AmountRangeFilter Component', () => {
  describe('Numeric validation', () => {
    test('should show error when non-numeric value is entered in min field', () => {
      const mockOnChange = jest.fn();
      render(<AmountRangeFilter value={{ min: null, max: null }} onChange={mockOnChange} />);
      
      const minInput = screen.getByLabelText(/minimum amount/i);
      
      // Enter non-numeric value
      fireEvent.change(minInput, { target: { value: 'abc' } });
      
      // Should show error message
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage.textContent).toBe('Please enter a valid number for minimum amount');
    });

    test('should show error when non-numeric value is entered in max field', () => {
      const mockOnChange = jest.fn();
      render(<AmountRangeFilter value={{ min: null, max: null }} onChange={mockOnChange} />);
      
      const maxInput = screen.getByLabelText(/maximum amount/i);
      
      // Enter non-numeric value
      fireEvent.change(maxInput, { target: { value: 'xyz' } });
      
      // Should show error message
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage.textContent).toBe('Please enter a valid number for maximum amount');
    });

    test('should accept valid numeric values', () => {
      const mockOnChange = jest.fn();
      render(<AmountRangeFilter value={{ min: null, max: null }} onChange={mockOnChange} />);
      
      const minInput = screen.getByLabelText(/minimum amount/i);
      const maxInput = screen.getByLabelText(/maximum amount/i);
      
      // Enter valid numeric values
      fireEvent.change(minInput, { target: { value: '1000' } });
      fireEvent.change(maxInput, { target: { value: '5000' } });
      
      // Should not show error message
      const errorMessage = screen.queryByRole('alert');
      expect(errorMessage).toBeNull();
    });

    test('should accept decimal values', () => {
      const mockOnChange = jest.fn();
      render(<AmountRangeFilter value={{ min: null, max: null }} onChange={mockOnChange} />);
      
      const minInput = screen.getByLabelText(/minimum amount/i);
      
      // Enter decimal value
      fireEvent.change(minInput, { target: { value: '1000.50' } });
      
      // Should not show error message
      const errorMessage = screen.queryByRole('alert');
      expect(errorMessage).toBeNull();
    });

    test('should accept negative values', () => {
      const mockOnChange = jest.fn();
      render(<AmountRangeFilter value={{ min: null, max: null }} onChange={mockOnChange} />);
      
      const minInput = screen.getByLabelText(/minimum amount/i);
      
      // Enter negative value
      fireEvent.change(minInput, { target: { value: '-500' } });
      
      // Should not show error message
      const errorMessage = screen.queryByRole('alert');
      expect(errorMessage).toBeNull();
    });
  });

  describe('Range validation', () => {
    test('should show error when max is less than min', () => {
      const mockOnChange = jest.fn();
      render(<AmountRangeFilter value={{ min: null, max: null }} onChange={mockOnChange} />);
      
      const minInput = screen.getByLabelText(/minimum amount/i);
      const maxInput = screen.getByLabelText(/maximum amount/i);
      
      // Set min to 5000
      fireEvent.change(minInput, { target: { value: '5000' } });
      
      // Set max to 1000 (less than min)
      fireEvent.change(maxInput, { target: { value: '1000' } });
      
      // Should show error message
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage.textContent).toBe('Maximum amount must be greater than minimum amount');
    });

    test('should not show error when max equals min', () => {
      const mockOnChange = jest.fn();
      render(<AmountRangeFilter value={{ min: null, max: null }} onChange={mockOnChange} />);
      
      const minInput = screen.getByLabelText(/minimum amount/i);
      const maxInput = screen.getByLabelText(/maximum amount/i);
      
      // Set both to the same value
      fireEvent.change(minInput, { target: { value: '3000' } });
      fireEvent.change(maxInput, { target: { value: '3000' } });
      
      // Should not show error message
      const errorMessage = screen.queryByRole('alert');
      expect(errorMessage).toBeNull();
    });

    test('should not show error when max is greater than min', () => {
      const mockOnChange = jest.fn();
      render(<AmountRangeFilter value={{ min: null, max: null }} onChange={mockOnChange} />);
      
      const minInput = screen.getByLabelText(/minimum amount/i);
      const maxInput = screen.getByLabelText(/maximum amount/i);
      
      // Set min to 1000
      fireEvent.change(minInput, { target: { value: '1000' } });
      
      // Set max to 5000 (greater than min)
      fireEvent.change(maxInput, { target: { value: '5000' } });
      
      // Should not show error message
      const errorMessage = screen.queryByRole('alert');
      expect(errorMessage).toBeNull();
    });

    test('should not show error when only min is set', () => {
      const mockOnChange = jest.fn();
      render(<AmountRangeFilter value={{ min: null, max: null }} onChange={mockOnChange} />);
      
      const minInput = screen.getByLabelText(/minimum amount/i);
      
      // Set only min
      fireEvent.change(minInput, { target: { value: '1000' } });
      
      // Should not show error message
      const errorMessage = screen.queryByRole('alert');
      expect(errorMessage).toBeNull();
    });

    test('should not show error when only max is set', () => {
      const mockOnChange = jest.fn();
      render(<AmountRangeFilter value={{ min: null, max: null }} onChange={mockOnChange} />);
      
      const maxInput = screen.getByLabelText(/maximum amount/i);
      
      // Set only max
      fireEvent.change(maxInput, { target: { value: '5000' } });
      
      // Should not show error message
      const errorMessage = screen.queryByRole('alert');
      expect(errorMessage).toBeNull();
    });

    test('should clear error when invalid range is corrected', () => {
      const mockOnChange = jest.fn();
      render(<AmountRangeFilter value={{ min: null, max: null }} onChange={mockOnChange} />);
      
      const minInput = screen.getByLabelText(/minimum amount/i);
      const maxInput = screen.getByLabelText(/maximum amount/i);
      
      // Create invalid range
      fireEvent.change(minInput, { target: { value: '5000' } });
      fireEvent.change(maxInput, { target: { value: '1000' } });
      
      // Verify error is shown
      expect(screen.getByRole('alert')).toBeTruthy();
      
      // Correct the max value
      fireEvent.change(maxInput, { target: { value: '10000' } });
      
      // Error should be cleared
      const errorMessage = screen.queryByRole('alert');
      expect(errorMessage).toBeNull();
    });
  });

  describe('Error message display', () => {
    test('should add error class to inputs when validation fails', () => {
      const mockOnChange = jest.fn();
      render(<AmountRangeFilter value={{ min: null, max: null }} onChange={mockOnChange} />);
      
      const minInput = screen.getByLabelText(/minimum amount/i);
      const maxInput = screen.getByLabelText(/maximum amount/i);
      
      // Create invalid range
      fireEvent.change(minInput, { target: { value: '5000' } });
      fireEvent.change(maxInput, { target: { value: '1000' } });
      
      // Both inputs should have error class
      expect(minInput.classList.contains('error')).toBe(true);
      expect(maxInput.classList.contains('error')).toBe(true);
    });

    test('should set aria-invalid attribute when validation fails', () => {
      const mockOnChange = jest.fn();
      render(<AmountRangeFilter value={{ min: null, max: null }} onChange={mockOnChange} />);
      
      const minInput = screen.getByLabelText(/minimum amount/i);
      const maxInput = screen.getByLabelText(/maximum amount/i);
      
      // Create invalid range
      fireEvent.change(minInput, { target: { value: '5000' } });
      fireEvent.change(maxInput, { target: { value: '1000' } });
      
      // Both inputs should have aria-invalid="true"
      expect(minInput.getAttribute('aria-invalid')).toBe('true');
      expect(maxInput.getAttribute('aria-invalid')).toBe('true');
    });
  });

  describe('onChange callbacks', () => {
    test('should call onChange with numeric values when valid amounts are entered', () => {
      const mockOnChange = jest.fn();
      render(<AmountRangeFilter value={{ min: null, max: null }} onChange={mockOnChange} />);
      
      const minInput = screen.getByLabelText(/minimum amount/i);
      
      // Set min amount
      fireEvent.change(minInput, { target: { value: '1000' } });
      
      // Should call onChange with numeric value
      expect(mockOnChange).toHaveBeenCalledWith({
        min: 1000,
        max: null
      });
    });

    test('should call onChange with both amounts when both are set', () => {
      const mockOnChange = jest.fn();
      render(<AmountRangeFilter value={{ min: null, max: null }} onChange={mockOnChange} />);
      
      const minInput = screen.getByLabelText(/minimum amount/i);
      const maxInput = screen.getByLabelText(/maximum amount/i);
      
      // Set min amount
      fireEvent.change(minInput, { target: { value: '1000' } });
      
      // Set max amount
      fireEvent.change(maxInput, { target: { value: '5000' } });
      
      // Should call onChange with both amounts
      expect(mockOnChange).toHaveBeenLastCalledWith({
        min: 1000,
        max: 5000
      });
    });

    test('should not call onChange when validation fails', () => {
      const mockOnChange = jest.fn();
      render(<AmountRangeFilter value={{ min: null, max: null }} onChange={mockOnChange} />);
      
      const minInput = screen.getByLabelText(/minimum amount/i);
      const maxInput = screen.getByLabelText(/maximum amount/i);
      
      // Set valid min amount
      fireEvent.change(minInput, { target: { value: '5000' } });
      expect(mockOnChange).toHaveBeenCalledTimes(1);
      
      // Set invalid max amount (less than min)
      fireEvent.change(maxInput, { target: { value: '1000' } });
      
      // onChange should not be called again
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });

    test('should call onChange with null values when cleared', () => {
      const mockOnChange = jest.fn();
      render(<AmountRangeFilter 
        value={{ min: 1000, max: 5000 }} 
        onChange={mockOnChange} 
      />);
      
      const clearButton = screen.getByLabelText(/clear amount range/i);
      fireEvent.click(clearButton);
      
      // Should call onChange with null values
      expect(mockOnChange).toHaveBeenCalledWith({
        min: null,
        max: null
      });
    });

    test('should parse decimal values correctly', () => {
      const mockOnChange = jest.fn();
      render(<AmountRangeFilter value={{ min: null, max: null }} onChange={mockOnChange} />);
      
      const minInput = screen.getByLabelText(/minimum amount/i);
      
      // Set decimal amount
      fireEvent.change(minInput, { target: { value: '1000.50' } });
      
      // Should call onChange with parsed decimal
      expect(mockOnChange).toHaveBeenCalledWith({
        min: 1000.50,
        max: null
      });
    });
  });

  describe('Clear functionality', () => {
    test('should show clear button when amounts are set', () => {
      render(<AmountRangeFilter 
        value={{ min: 1000, max: null }} 
        onChange={jest.fn()} 
      />);
      
      const clearButton = screen.getByLabelText(/clear amount range/i);
      expect(clearButton).toBeTruthy();
    });

    test('should not show clear button when no amounts are set', () => {
      render(<AmountRangeFilter 
        value={{ min: null, max: null }} 
        onChange={jest.fn()} 
      />);
      
      const clearButton = screen.queryByLabelText(/clear amount range/i);
      expect(clearButton).toBeNull();
    });

    test('should clear both inputs when clear button is clicked', () => {
      const mockOnChange = jest.fn();
      const { rerender } = render(<AmountRangeFilter 
        value={{ min: 1000, max: 5000 }} 
        onChange={mockOnChange} 
      />);
      
      const clearButton = screen.getByLabelText(/clear amount range/i);
      fireEvent.click(clearButton);
      
      // Update with cleared values
      rerender(<AmountRangeFilter 
        value={{ min: null, max: null }} 
        onChange={mockOnChange} 
      />);
      
      const minInput = screen.getByLabelText(/minimum amount/i);
      const maxInput = screen.getByLabelText(/maximum amount/i);
      
      expect(minInput.value).toBe('');
      expect(maxInput.value).toBe('');
    });

    test('should clear error message when clear button is clicked', () => {
      const mockOnChange = jest.fn();
      const { rerender } = render(<AmountRangeFilter 
        value={{ min: null, max: null }} 
        onChange={mockOnChange} 
      />);
      
      const minInput = screen.getByLabelText(/minimum amount/i);
      const maxInput = screen.getByLabelText(/maximum amount/i);
      
      // Create invalid range
      fireEvent.change(minInput, { target: { value: '5000' } });
      fireEvent.change(maxInput, { target: { value: '1000' } });
      
      // Verify error is shown
      expect(screen.getByRole('alert')).toBeTruthy();
      
      // Update to show clear button
      rerender(<AmountRangeFilter 
        value={{ min: 5000, max: 1000 }} 
        onChange={mockOnChange} 
      />);
      
      // Clear
      const clearButton = screen.getByLabelText(/clear amount range/i);
      fireEvent.click(clearButton);
      
      // Update with cleared values
      rerender(<AmountRangeFilter 
        value={{ min: null, max: null }} 
        onChange={mockOnChange} 
      />);
      
      // Error should be cleared
      const errorMessage = screen.queryByRole('alert');
      expect(errorMessage).toBeNull();
    });
  });

  describe('Rendering', () => {
    test('should render with label', () => {
      render(<AmountRangeFilter value={{ min: null, max: null }} onChange={jest.fn()} />);
      
      const label = screen.getByText('Amount Range');
      expect(label).toBeTruthy();
    });

    test('should render min and max amount inputs', () => {
      render(<AmountRangeFilter value={{ min: null, max: null }} onChange={jest.fn()} />);
      
      const minInput = screen.getByLabelText(/minimum amount/i);
      const maxInput = screen.getByLabelText(/maximum amount/i);
      
      expect(minInput).toBeTruthy();
      expect(maxInput).toBeTruthy();
    });

    test('should render "Min" and "Max" labels with currency symbol', () => {
      render(<AmountRangeFilter value={{ min: null, max: null }} onChange={jest.fn()} />);
      
      const minLabel = screen.getByText('Min (₹)');
      const maxLabel = screen.getByText('Max (₹)');
      
      expect(minLabel).toBeTruthy();
      expect(maxLabel).toBeTruthy();
    });

    test('should render amount separator', () => {
      render(<AmountRangeFilter value={{ min: null, max: null }} onChange={jest.fn()} />);
      
      const separator = screen.getByText('to');
      expect(separator).toBeTruthy();
    });

    test('should apply dark mode class when darkMode prop is true', () => {
      const { container } = render(<AmountRangeFilter 
        value={{ min: null, max: null }} 
        onChange={jest.fn()} 
        darkMode={true} 
      />);
      
      const amountRangeFilter = container.querySelector('.amount-range-filter');
      expect(amountRangeFilter.classList.contains('dark-mode')).toBe(true);
    });

    test('should not apply dark mode class when darkMode prop is false', () => {
      const { container } = render(<AmountRangeFilter 
        value={{ min: null, max: null }} 
        onChange={jest.fn()} 
        darkMode={false} 
      />);
      
      const amountRangeFilter = container.querySelector('.amount-range-filter');
      expect(amountRangeFilter.classList.contains('dark-mode')).toBe(false);
    });

    test('should display initial values from props', () => {
      render(<AmountRangeFilter 
        value={{ min: 1000, max: 5000 }} 
        onChange={jest.fn()} 
      />);
      
      const minInput = screen.getByLabelText(/minimum amount/i);
      const maxInput = screen.getByLabelText(/maximum amount/i);
      
      expect(minInput.value).toBe('1000');
      expect(maxInput.value).toBe('5000');
    });

    test('should update when prop values change', () => {
      const { rerender } = render(<AmountRangeFilter 
        value={{ min: 1000, max: 5000 }} 
        onChange={jest.fn()} 
      />);
      
      const minInput = screen.getByLabelText(/minimum amount/i);
      const maxInput = screen.getByLabelText(/maximum amount/i);
      
      expect(minInput.value).toBe('1000');
      expect(maxInput.value).toBe('5000');
      
      // Update props
      rerender(<AmountRangeFilter 
        value={{ min: 2000, max: 10000 }} 
        onChange={jest.fn()} 
      />);
      
      expect(minInput.value).toBe('2000');
      expect(maxInput.value).toBe('10000');
    });

    test('should have inputMode="decimal" for numeric keyboard on mobile', () => {
      render(<AmountRangeFilter value={{ min: null, max: null }} onChange={jest.fn()} />);
      
      const minInput = screen.getByLabelText(/minimum amount/i);
      const maxInput = screen.getByLabelText(/maximum amount/i);
      
      expect(minInput.getAttribute('inputMode')).toBe('decimal');
      expect(maxInput.getAttribute('inputMode')).toBe('decimal');
    });

    test('should have appropriate placeholders', () => {
      render(<AmountRangeFilter value={{ min: null, max: null }} onChange={jest.fn()} />);
      
      const minInput = screen.getByLabelText(/minimum amount/i);
      const maxInput = screen.getByLabelText(/maximum amount/i);
      
      expect(minInput.getAttribute('placeholder')).toBe('0');
      expect(maxInput.getAttribute('placeholder')).toBe('∞');
    });
  });
});
