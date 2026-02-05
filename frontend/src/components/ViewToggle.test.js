import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ViewToggle from './ViewToggle';

describe('ViewToggle', () => {
  test('renders both view buttons', () => {
    const mockOnViewChange = jest.fn();
    
    render(
      <ViewToggle
        currentView="table"
        onViewChange={mockOnViewChange}
        darkMode={false}
      />
    );

    expect(screen.getByLabelText('Switch to dashboard view')).toBeTruthy();
    expect(screen.getByLabelText('Switch to table view')).toBeTruthy();
    expect(screen.getByText('Dashboard')).toBeTruthy();
    expect(screen.getByText('Table')).toBeTruthy();
  });

  test('applies active class to current view', () => {
    const mockOnViewChange = jest.fn();
    
    const { container } = render(
      <ViewToggle
        currentView="dashboard"
        onViewChange={mockOnViewChange}
        darkMode={false}
      />
    );

    const dashboardButton = screen.getByLabelText('Switch to dashboard view');
    const tableButton = screen.getByLabelText('Switch to table view');

    expect(dashboardButton.classList.contains('active')).toBe(true);
    expect(tableButton.classList.contains('active')).toBe(false);
  });

  test('calls onViewChange when clicking inactive button', () => {
    const mockOnViewChange = jest.fn();
    
    render(
      <ViewToggle
        currentView="table"
        onViewChange={mockOnViewChange}
        darkMode={false}
      />
    );

    const dashboardButton = screen.getByLabelText('Switch to dashboard view');
    fireEvent.click(dashboardButton);

    expect(mockOnViewChange).toHaveBeenCalledWith('dashboard');
    expect(mockOnViewChange).toHaveBeenCalledTimes(1);
  });

  test('does not call onViewChange when clicking active button', () => {
    const mockOnViewChange = jest.fn();
    
    render(
      <ViewToggle
        currentView="table"
        onViewChange={mockOnViewChange}
        darkMode={false}
      />
    );

    const tableButton = screen.getByLabelText('Switch to table view');
    fireEvent.click(tableButton);

    expect(mockOnViewChange).not.toHaveBeenCalled();
  });

  test('switches view from table to dashboard', () => {
    const mockOnViewChange = jest.fn();
    
    render(
      <ViewToggle
        currentView="table"
        onViewChange={mockOnViewChange}
        darkMode={false}
      />
    );

    const dashboardButton = screen.getByLabelText('Switch to dashboard view');
    fireEvent.click(dashboardButton);

    expect(mockOnViewChange).toHaveBeenCalledWith('dashboard');
  });

  test('switches view from dashboard to table', () => {
    const mockOnViewChange = jest.fn();
    
    render(
      <ViewToggle
        currentView="dashboard"
        onViewChange={mockOnViewChange}
        darkMode={false}
      />
    );

    const tableButton = screen.getByLabelText('Switch to table view');
    fireEvent.click(tableButton);

    expect(mockOnViewChange).toHaveBeenCalledWith('table');
  });

  test('applies dark mode class when darkMode is true', () => {
    const mockOnViewChange = jest.fn();
    
    const { container } = render(
      <ViewToggle
        currentView="table"
        onViewChange={mockOnViewChange}
        darkMode={true}
      />
    );

    const viewToggle = container.querySelector('.view-toggle');
    expect(viewToggle.classList.contains('dark-mode')).toBe(true);
  });

  test('does not apply dark mode class when darkMode is false', () => {
    const mockOnViewChange = jest.fn();
    
    const { container } = render(
      <ViewToggle
        currentView="table"
        onViewChange={mockOnViewChange}
        darkMode={false}
      />
    );

    const viewToggle = container.querySelector('.view-toggle');
    expect(viewToggle.classList.contains('dark-mode')).toBe(false);
  });

  test('has correct aria-pressed attributes', () => {
    const mockOnViewChange = jest.fn();
    
    render(
      <ViewToggle
        currentView="dashboard"
        onViewChange={mockOnViewChange}
        darkMode={false}
      />
    );

    const dashboardButton = screen.getByLabelText('Switch to dashboard view');
    const tableButton = screen.getByLabelText('Switch to table view');

    expect(dashboardButton.getAttribute('aria-pressed')).toBe('true');
    expect(tableButton.getAttribute('aria-pressed')).toBe('false');
  });

  test('renders icons for both views', () => {
    const mockOnViewChange = jest.fn();
    
    render(
      <ViewToggle
        currentView="table"
        onViewChange={mockOnViewChange}
        darkMode={false}
      />
    );

    expect(screen.getByLabelText('Dashboard icon')).toBeTruthy();
    expect(screen.getByLabelText('Table icon')).toBeTruthy();
  });
});
