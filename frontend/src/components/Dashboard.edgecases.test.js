import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from './Dashboard';
import { FilterProvider } from '../context/FilterContext';

// Mock the chart components to avoid Recharts rendering issues in tests
jest.mock('./MetricsPanel', () => {
  return function MockMetricsPanel() {
    return <div data-testid="metrics-panel">Metrics Panel</div>;
  };
});

jest.mock('./PortfolioAllocationChart', () => {
  return function MockPortfolioAllocationChart() {
    return <div data-testid="portfolio-chart">Portfolio Chart</div>;
  };
});

jest.mock('./TransactionTimelineChart', () => {
  return function MockTransactionTimelineChart() {
    return <div data-testid="timeline-chart">Timeline Chart</div>;
  };
});

jest.mock('./TransactionTypeChart', () => {
  return function MockTransactionTypeChart() {
    return <div data-testid="type-chart">Type Chart</div>;
  };
});

jest.mock('./MonthlyTrendChart', () => {
  return function MockMonthlyTrendChart() {
    return <div data-testid="trend-chart">Trend Chart</div>;
  };
});

const DashboardWithProvider = (props) => (
  <FilterProvider>
    <Dashboard {...props} />
  </FilterProvider>
);

describe('Dashboard Edge Cases', () => {
  test('renders loading state', () => {
    render(
      <DashboardWithProvider 
        loading={true}
        transactions={[]}
      />
    );
    
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  test('renders empty state when no transactions', () => {
    render(
      <DashboardWithProvider 
        transactions={[]}
        isFiltered={false}
      />
    );
    
    expect(screen.getByText('No Data Available')).toBeInTheDocument();
    expect(screen.getByText('No transaction data available. Upload a CAS PDF to get started.')).toBeInTheDocument();
  });

  test('renders no results message when filtered with no results', () => {
    render(
      <DashboardWithProvider 
        transactions={[]}
        isFiltered={true}
      />
    );
    
    expect(screen.getByText('No Matching Transactions')).toBeInTheDocument();
  });

  test('renders single transaction warning', () => {
    const singleTransaction = [{
      id: '1',
      date: '2023-01-01',
      transactionType: 'Purchase',
      amount: 1000,
      isAdministrative: false
    }];
    
    render(
      <DashboardWithProvider 
        transactions={singleTransaction}
      />
    );
    
    expect(screen.getByText('Limited Data Available')).toBeInTheDocument();
    expect(screen.getByText(/Only one transaction found/)).toBeInTheDocument();
  });

  test('renders same type warning when all transactions are same type', () => {
    const sameTypeTransactions = [
      {
        id: '1',
        date: '2023-01-01',
        transactionType: 'Purchase',
        amount: 1000,
        isAdministrative: false
      },
      {
        id: '2',
        date: '2023-02-01',
        transactionType: 'Purchase',
        amount: 2000,
        isAdministrative: false
      }
    ];
    
    render(
      <DashboardWithProvider 
        transactions={sameTypeTransactions}
      />
    );
    
    expect(screen.getByText('All Transactions Same Type')).toBeInTheDocument();
  });

  test('renders short range warning for transactions within 30 days', () => {
    const shortRangeTransactions = [
      {
        id: '1',
        date: '2023-01-01',
        transactionType: 'Purchase',
        amount: 1000,
        isAdministrative: false
      },
      {
        id: '2',
        date: '2023-01-15',
        transactionType: 'Redemption',
        amount: 500,
        isAdministrative: false
      }
    ];
    
    render(
      <DashboardWithProvider 
        transactions={shortRangeTransactions}
      />
    );
    
    expect(screen.getByText('Short Date Range')).toBeInTheDocument();
  });

  test('renders long range warning for transactions spanning more than 10 years', () => {
    const longRangeTransactions = [
      {
        id: '1',
        date: '2010-01-01',
        transactionType: 'Purchase',
        amount: 1000,
        isAdministrative: false
      },
      {
        id: '2',
        date: '2023-01-01',
        transactionType: 'Redemption',
        amount: 500,
        isAdministrative: false
      }
    ];
    
    render(
      <DashboardWithProvider 
        transactions={longRangeTransactions}
      />
    );
    
    expect(screen.getByText('Long Date Range Detected')).toBeInTheDocument();
  });

  test('renders limited data warning for less than 5 transactions', () => {
    const limitedTransactions = [
      {
        id: '1',
        date: '2023-01-01',
        transactionType: 'Purchase',
        amount: 1000,
        isAdministrative: false
      },
      {
        id: '2',
        date: '2023-02-01',
        transactionType: 'Redemption',
        amount: 500,
        isAdministrative: false
      },
      {
        id: '3',
        date: '2023-03-01',
        transactionType: 'SIP',
        amount: 1500,
        isAdministrative: false
      }
    ];
    
    render(
      <DashboardWithProvider 
        transactions={limitedTransactions}
      />
    );
    
    expect(screen.getByText('Limited Data Available')).toBeInTheDocument();
  });

  test('renders normal dashboard with sufficient diverse data', () => {
    const normalTransactions = [
      {
        id: '1',
        date: '2023-01-01',
        transactionType: 'Purchase',
        amount: 1000,
        isAdministrative: false
      },
      {
        id: '2',
        date: '2023-02-01',
        transactionType: 'Redemption',
        amount: 500,
        isAdministrative: false
      },
      {
        id: '3',
        date: '2023-03-01',
        transactionType: 'SIP',
        amount: 1500,
        isAdministrative: false
      },
      {
        id: '4',
        date: '2023-04-01',
        transactionType: 'Purchase',
        amount: 2000,
        isAdministrative: false
      },
      {
        id: '5',
        date: '2023-05-01',
        transactionType: 'Switch-In',
        amount: 800,
        isAdministrative: false
      }
    ];
    
    render(
      <DashboardWithProvider 
        transactions={normalTransactions}
      />
    );
    
    // Should render all chart components without warnings
    expect(screen.getByTestId('metrics-panel')).toBeInTheDocument();
    expect(screen.getByTestId('portfolio-chart')).toBeInTheDocument();
    expect(screen.getByTestId('timeline-chart')).toBeInTheDocument();
    expect(screen.getByTestId('type-chart')).toBeInTheDocument();
    expect(screen.getByTestId('trend-chart')).toBeInTheDocument();
    
    // Should not show any warnings
    expect(screen.queryByText('Limited Data Available')).not.toBeInTheDocument();
  });

  test('ignores administrative transactions in edge case analysis', () => {
    const transactionsWithAdmin = [
      {
        id: '1',
        date: '2023-01-01',
        transactionType: 'Purchase',
        amount: 1000,
        isAdministrative: false
      },
      {
        id: '2',
        date: '2023-01-01',
        transactionType: 'Administrative',
        amount: 0,
        isAdministrative: true
      },
      {
        id: '3',
        date: '2023-01-01',
        transactionType: 'Administrative',
        amount: 0,
        isAdministrative: true
      }
    ];
    
    render(
      <DashboardWithProvider 
        transactions={transactionsWithAdmin}
      />
    );
    
    // Should show single transaction warning (ignoring admin transactions)
    expect(screen.getByText('Limited Data Available')).toBeInTheDocument();
    expect(screen.getByText(/Only one transaction found/)).toBeInTheDocument();
  });

  test('renders filter indicator when filtered', () => {
    const transactions = [
      {
        id: '1',
        date: '2023-01-01',
        transactionType: 'Purchase',
        amount: 1000,
        isAdministrative: false
      }
    ];
    
    render(
      <DashboardWithProvider 
        transactions={transactions}
        isFiltered={true}
      />
    );
    
    expect(screen.getByText(/Showing filtered data \(1 transactions\)/)).toBeInTheDocument();
  });

  test('applies dark mode class', () => {
    const { container } = render(
      <DashboardWithProvider 
        transactions={[]}
        darkMode={true}
      />
    );
    
    expect(container.firstChild).toHaveClass('dark-mode');
  });
});