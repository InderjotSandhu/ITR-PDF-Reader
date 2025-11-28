/**
 * Unit tests for SearchBar component
 * Feature: advanced-filtering-search
 * Requirements: 3.1, 3.2
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SearchBar from './SearchBar';

describe('SearchBar Component', () => {
  describe('Debouncing behavior', () => {
    test('should debounce onChange calls', async () => {
      const mockOnChange = jest.fn();
      render(<SearchBar value="" onChange={mockOnChange} debounceMs={300} />);
      
      const input = screen.getByPlaceholderText(/search by scheme name/i);
      
      // Type multiple characters quickly
      fireEvent.change(input, { target: { value: 'H' } });
      fireEvent.change(input, { target: { value: 'HD' } });
      fireEvent.change(input, { target: { value: 'HDF' } });
      fireEvent.change(input, { target: { value: 'HDFC' } });
      
      // onChange should not be called immediately
      expect(mockOnChange).not.toHaveBeenCalled();
      
      // Wait for debounce delay
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledTimes(1);
      }, { timeout: 400 });
      
      // Should be called with the final value
      expect(mockOnChange).toHaveBeenCalledWith('HDFC');
    });

    test('should call onChange only once after debounce delay', async () => {
      const mockOnChange = jest.fn();
      render(<SearchBar value="" onChange={mockOnChange} debounceMs={200} />);
      
      const input = screen.getByPlaceholderText(/search by scheme name/i);
      
      // Type a value
      fireEvent.change(input, { target: { value: 'Test' } });
      
      // Wait for debounce
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledTimes(1);
      }, { timeout: 300 });
      
      expect(mockOnChange).toHaveBeenCalledWith('Test');
    });

    test('should reset debounce timer on new input', async () => {
      const mockOnChange = jest.fn();
      render(<SearchBar value="" onChange={mockOnChange} debounceMs={300} />);
      
      const input = screen.getByPlaceholderText(/search by scheme name/i);
      
      // Type first value
      fireEvent.change(input, { target: { value: 'A' } });
      
      // Wait 150ms (half of debounce time)
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Type again - should reset timer
      fireEvent.change(input, { target: { value: 'AB' } });
      
      // Wait another 150ms (total 300ms from first input, but only 150ms from second)
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Should not have been called yet
      expect(mockOnChange).not.toHaveBeenCalled();
      
      // Wait for the full debounce from second input
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledTimes(1);
      }, { timeout: 200 });
      
      expect(mockOnChange).toHaveBeenCalledWith('AB');
    });
  });

  describe('Clear functionality', () => {
    test('should show clear button when input has value', () => {
      render(<SearchBar value="test" onChange={jest.fn()} />);
      
      const clearButton = screen.getByLabelText(/clear search/i);
      expect(clearButton).toBeTruthy();
    });

    test('should not show clear button when input is empty', () => {
      render(<SearchBar value="" onChange={jest.fn()} />);
      
      const clearButton = screen.queryByLabelText(/clear search/i);
      expect(clearButton).toBeNull();
    });

    test('should clear input and call onChange immediately when clear button is clicked', async () => {
      const mockOnChange = jest.fn();
      const { rerender } = render(<SearchBar value="test" onChange={mockOnChange} />);
      
      const clearButton = screen.getByLabelText(/clear search/i);
      fireEvent.click(clearButton);
      
      // Should call onChange immediately (no debounce)
      expect(mockOnChange).toHaveBeenCalledWith('');
      expect(mockOnChange).toHaveBeenCalledTimes(1);
      
      // Update component with new value
      rerender(<SearchBar value="" onChange={mockOnChange} />);
      
      // Input should be cleared
      const input = screen.getByPlaceholderText(/search by scheme name/i);
      expect(input.value).toBe('');
    });

    test('should clear pending debounce when clear button is clicked', async () => {
      const mockOnChange = jest.fn();
      const { rerender } = render(<SearchBar value="" onChange={mockOnChange} debounceMs={300} />);
      
      const input = screen.getByPlaceholderText(/search by scheme name/i);
      
      // Type something
      fireEvent.change(input, { target: { value: 'test' } });
      
      // Update to show clear button
      rerender(<SearchBar value="test" onChange={mockOnChange} debounceMs={300} />);
      
      // Click clear before debounce completes
      const clearButton = screen.getByLabelText(/clear search/i);
      fireEvent.click(clearButton);
      
      // Should call onChange with empty string immediately
      expect(mockOnChange).toHaveBeenCalledWith('');
      
      // Wait to ensure debounced call doesn't happen
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Should only have been called once (for clear)
      expect(mockOnChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('onChange callback', () => {
    test('should call onChange with input value after debounce', async () => {
      const mockOnChange = jest.fn();
      render(<SearchBar value="" onChange={mockOnChange} debounceMs={200} />);
      
      const input = screen.getByPlaceholderText(/search by scheme name/i);
      fireEvent.change(input, { target: { value: 'ICICI' } });
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('ICICI');
      }, { timeout: 300 });
    });

    test('should update local value immediately on input change', () => {
      render(<SearchBar value="" onChange={jest.fn()} />);
      
      const input = screen.getByPlaceholderText(/search by scheme name/i);
      fireEvent.change(input, { target: { value: 'SBI' } });
      
      // Local value should update immediately
      expect(input.value).toBe('SBI');
    });

    test('should sync local value with prop value', () => {
      const { rerender } = render(<SearchBar value="initial" onChange={jest.fn()} />);
      
      const input = screen.getByPlaceholderText(/search by scheme name/i);
      expect(input.value).toBe('initial');
      
      // Update prop
      rerender(<SearchBar value="updated" onChange={jest.fn()} />);
      
      expect(input.value).toBe('updated');
    });
  });

  describe('Rendering', () => {
    test('should render with default placeholder', () => {
      render(<SearchBar value="" onChange={jest.fn()} />);
      
      const input = screen.getByPlaceholderText(/search by scheme name/i);
      expect(input).toBeTruthy();
    });

    test('should render with custom placeholder', () => {
      render(<SearchBar value="" onChange={jest.fn()} placeholder="Custom placeholder" />);
      
      const input = screen.getByPlaceholderText(/custom placeholder/i);
      expect(input).toBeTruthy();
    });

    test('should render search icon', () => {
      render(<SearchBar value="" onChange={jest.fn()} />);
      
      const searchIcon = screen.getByText('🔍');
      expect(searchIcon).toBeTruthy();
    });

    test('should apply dark mode class when darkMode prop is true', () => {
      const { container } = render(<SearchBar value="" onChange={jest.fn()} darkMode={true} />);
      
      const searchBar = container.querySelector('.search-bar');
      expect(searchBar.classList.contains('dark-mode')).toBe(true);
    });

    test('should not apply dark mode class when darkMode prop is false', () => {
      const { container } = render(<SearchBar value="" onChange={jest.fn()} darkMode={false} />);
      
      const searchBar = container.querySelector('.search-bar');
      expect(searchBar.classList.contains('dark-mode')).toBe(false);
    });
  });

  describe('Cleanup', () => {
    test('should cleanup debounce timer on unmount', async () => {
      const mockOnChange = jest.fn();
      const { unmount } = render(<SearchBar value="" onChange={mockOnChange} debounceMs={300} />);
      
      const input = screen.getByPlaceholderText(/search by scheme name/i);
      fireEvent.change(input, { target: { value: 'test' } });
      
      // Unmount before debounce completes
      unmount();
      
      // Wait for what would have been the debounce time
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // onChange should not have been called
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });
});
