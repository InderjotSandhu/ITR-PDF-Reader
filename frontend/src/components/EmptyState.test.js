import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import EmptyState from './EmptyState';

describe('EmptyState Component', () => {
  test('renders with default props', () => {
    render(<EmptyState />);
    
    expect(screen.getByText('📊')).toBeInTheDocument();
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });

  test('renders with custom title and message', () => {
    const title = 'Custom Title';
    const message = 'Custom message for testing';
    
    render(
      <EmptyState 
        title={title}
        message={message}
      />
    );
    
    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  test('renders with custom icon', () => {
    const customIcon = '🔍';
    
    render(
      <EmptyState 
        icon={customIcon}
        title="Test"
        message="Test message"
      />
    );
    
    expect(screen.getByText(customIcon)).toBeInTheDocument();
  });

  test('applies dark mode class when darkMode is true', () => {
    const { container } = render(
      <EmptyState 
        darkMode={true}
        title="Test"
        message="Test message"
      />
    );
    
    expect(container.firstChild).toHaveClass('dark-mode');
  });

  test('applies correct type class', () => {
    const { container } = render(
      <EmptyState 
        type="no-results"
        title="Test"
        message="Test message"
      />
    );
    
    expect(container.firstChild).toHaveClass('no-results');
  });

  test('renders children when provided', () => {
    const buttonText = 'Clear Filters';
    
    render(
      <EmptyState 
        title="Test"
        message="Test message"
      >
        <button>{buttonText}</button>
      </EmptyState>
    );
    
    expect(screen.getByText(buttonText)).toBeInTheDocument();
  });

  test('applies limited-data styling for limited-data type', () => {
    const { container } = render(
      <EmptyState 
        type="limited-data"
        title="Limited Data"
        message="Warning message"
      />
    );
    
    expect(container.firstChild).toHaveClass('limited-data');
  });
});