import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LimitedDataWarning from './LimitedDataWarning';

describe('LimitedDataWarning Component', () => {
  test('renders single transaction warning', () => {
    render(
      <LimitedDataWarning 
        transactionCount={1}
        dataType="single-transaction"
      />
    );
    
    expect(screen.getByText('Limited Data Available')).toBeInTheDocument();
    expect(screen.getByText(/Only one transaction found/)).toBeInTheDocument();
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  test('renders same type warning', () => {
    render(
      <LimitedDataWarning 
        transactionCount={5}
        dataType="same-type"
      />
    );
    
    expect(screen.getByText('All Transactions Same Type')).toBeInTheDocument();
    expect(screen.getByText(/All transactions are of the same type/)).toBeInTheDocument();
    expect(screen.getByText('📊')).toBeInTheDocument();
  });

  test('renders short range warning', () => {
    render(
      <LimitedDataWarning 
        transactionCount={3}
        dataType="short-range"
      />
    );
    
    expect(screen.getByText('Short Date Range')).toBeInTheDocument();
    expect(screen.getByText(/Transaction data spans a very short time period/)).toBeInTheDocument();
    expect(screen.getByText('📅')).toBeInTheDocument();
  });

  test('renders long range warning', () => {
    render(
      <LimitedDataWarning 
        transactionCount={1000}
        dataType="long-range"
      />
    );
    
    expect(screen.getByText('Long Date Range Detected')).toBeInTheDocument();
    expect(screen.getByText(/Transaction data spans many years/)).toBeInTheDocument();
    expect(screen.getByText('📈')).toBeInTheDocument();
  });

  test('renders general limited data warning', () => {
    render(
      <LimitedDataWarning 
        transactionCount={3}
        dataType="general"
      />
    );
    
    expect(screen.getByText('Limited Data Available')).toBeInTheDocument();
    expect(screen.getByText(/Only 3 transactions available/)).toBeInTheDocument();
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  test('handles singular transaction count correctly', () => {
    render(
      <LimitedDataWarning 
        transactionCount={1}
        dataType="general"
      />
    );
    
    expect(screen.getByText(/Only 1 transaction available/)).toBeInTheDocument();
  });

  test('applies dark mode when specified', () => {
    const { container } = render(
      <LimitedDataWarning 
        transactionCount={2}
        darkMode={true}
      />
    );
    
    // Check if dark mode is passed to EmptyState component
    expect(container.querySelector('.dark-mode')).toBeInTheDocument();
  });
});