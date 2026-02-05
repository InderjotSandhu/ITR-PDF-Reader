import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from './Dashboard';
import PortfolioAllocationChart from './PortfolioAllocationChart';
import TransactionTimelineChart from './TransactionTimelineChart';
import TransactionTypeChart from './TransactionTypeChart';
import MonthlyTrendChart from './MonthlyTrendChart';
import { FilterProvider } from '../context/FilterContext';

// Mock html2canvas to avoid issues in tests
jest.mock('html2canvas', () => {
  return jest.fn(() => Promise.resolve({
    toBlob: jest.fn((callback) => callback(new Blob()))
  }));
});

// Mock Recharts components to avoid rendering issues
jest.mock('recharts', () => ({
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />
}));

const ComponentWithProvider = ({ children }) => (
  <FilterProvider>
    {children}
  </FilterProvider>
);

describe('Comprehensive Edge Case Tests', () => {
  describe('Empty Data State - Requirement 14.1', () => {
    test('Dashboard displays empty state message when no transaction data', () => {
      render(
        <ComponentWithProvider>
          <Dashboard transactions={[]} isFiltered={false} />
        </ComponentWithProvider>
      );
      
      expect(screen.getByText('No Data Available')).toBeInTheDocument();
      expect(screen.getByText('No transaction data available. Upload a CAS PDF to get started.')).toBeInTheDocument();
    });

    test('Dashboard displays no results message when filtered with no results', () => {
      render(
        <ComponentWithProvider>
          <Dashboard transactions={[]} isFiltered={true} />
        </ComponentWithProvider>
      );
      
      expect(screen.getByText('No Matching Transactions')).toBeInTheDocument();
    });

    test('All chart components handle empty data gracefully', () => {
      const emptyPortfolioData = { portfolioSummary: [] };
      
      // Test portfolio chart
      const { unmount: unmount1 } = render(
        <ComponentWithProvider>
          <PortfolioAllocationChart portfolioData={emptyPortfolioData} />
        </ComponentWithProvider>
      );
      expect(screen.getByText('No portfolio data available')).toBeInTheDocument();
      unmount1();

      // Test timeline chart
      const { unmount: unmount2 } = render(
        <ComponentWithProvider>
          <TransactionTimelineChart transactions={[]} />
        </ComponentWithProvider>
      );
      expect(screen.getByText('No transaction data available')).toBeInTheDocument();
      unmount2();

      // Test type chart
      const { unmount: unmount3 } = render(
        <ComponentWithProvider>
          <TransactionTypeChart transactions={[]} />
        </ComponentWithProvider>
      );
      expect(screen.getByText('No transaction data available')).toBeInTheDocument();
      unmount3();

      // Test monthly trend chart
      render(
        <ComponentWithProvider>
          <MonthlyTrendChart transactions={[]} />
        </ComponentWithProvider>
      );
      expect(screen.getByText('No transaction data available')).toBeInTheDocument();
    });
  });

  describe('Single Transaction - Requirement 14.2', () => {
    const singleTransaction = [{
      id: '1',
      date: '2023-06-15',
      transactionType: 'Purchase',
      amount: 10000,
      isAdministrative: false,
      schemeName: 'Test Scheme',
      folioNumber: 'F001',
      description: 'Single test transaction'
    }];

    test('Dashboard shows limited data warning for single transaction', () => {
      render(
        <ComponentWithProvider>
          <Dashboard transactions={singleTransaction} />
        </ComponentWithProvider>
      );
      
      expect(screen.getByText('Limited Data Available')).toBeInTheDocument();
      expect(screen.getByText(/Only one transaction found/)).toBeInTheDocument();
    });

    test('Charts display single data point appropriately', () => {
      // Timeline chart with single transaction
      render(
        <ComponentWithProvider>
          <TransactionTimelineChart transactions={singleTransaction} />
        </ComponentWithProvider>
      );
      expect(screen.getByText('2023-06')).toBeInTheDocument();
      expect(screen.getByText('Purchases:')).toBeInTheDocument();
      expect(screen.getByText('Redemptions:')).toBeInTheDocument();

      // Type chart with single transaction
      render(
        <ComponentWithProvider>
          <TransactionTypeChart transactions={singleTransaction} />
        </ComponentWithProvider>
      );
      expect(screen.getByText('Purchase')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();

      // Monthly trend with single transaction
      render(
        <ComponentWithProvider>
          <MonthlyTrendChart transactions={singleTransaction} />
        </ComponentWithProvider>
      );
      expect(screen.getByText('Jun 2023')).toBeInTheDocument();
    });
  });

  describe('All Same Type - Requirement 14.3', () => {
    const sameTypeTransactions = [
      {
        id: '1',
        date: '2023-01-15',
        transactionType: 'Purchase',
        amount: 5000,
        isAdministrative: false,
        schemeName: 'Test Scheme A',
        folioNumber: 'F001'
      },
      {
        id: '2',
        date: '2023-02-15',
        transactionType: 'Purchase',
        amount: 7500,
        isAdministrative: false,
        schemeName: 'Test Scheme B',
        folioNumber: 'F002'
      },
      {
        id: '3',
        date: '2023-03-15',
        transactionType: 'Purchase',
        amount: 10000,
        isAdministrative: false,
        schemeName: 'Test Scheme C',
        folioNumber: 'F003'
      }
    ];

    test('Dashboard shows same type warning when all transactions are same type', () => {
      render(
        <ComponentWithProvider>
          <Dashboard transactions={sameTypeTransactions} />
        </ComponentWithProvider>
      );
      
      expect(screen.getByText('All Transactions Same Type')).toBeInTheDocument();
    });

    test('Transaction type chart displays single category for same type transactions', () => {
      render(
        <ComponentWithProvider>
          <TransactionTypeChart transactions={sameTypeTransactions} />
        </ComponentWithProvider>
      );
      
      expect(screen.getByText('Purchase')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('Count:')).toBeInTheDocument();
      expect(screen.getByText('Amount:')).toBeInTheDocument();
    });
  });

  describe('Short Date Range - Requirement 14.4', () => {
    const shortRangeTransactions = [
      {
        id: '1',
        date: '2023-06-01',
        transactionType: 'Purchase',
        amount: 5000,
        isAdministrative: false,
        schemeName: 'Test Scheme A',
        folioNumber: 'F001'
      },
      {
        id: '2',
        date: '2023-06-15',
        transactionType: 'Redemption',
        amount: 2000,
        isAdministrative: false,
        schemeName: 'Test Scheme A',
        folioNumber: 'F001'
      },
      {
        id: '3',
        date: '2023-06-20',
        transactionType: 'SIP',
        amount: 3000,
        isAdministrative: false,
        schemeName: 'Test Scheme B',
        folioNumber: 'F002'
      }
    ];

    test('Dashboard shows short range warning for transactions within 30 days', () => {
      render(
        <ComponentWithProvider>
          <Dashboard transactions={shortRangeTransactions} />
        </ComponentWithProvider>
      );
      
      expect(screen.getByText('Short Date Range')).toBeInTheDocument();
    });

    test('Charts handle short date ranges appropriately', () => {
      // Timeline should still work with short range
      render(
        <ComponentWithProvider>
          <TransactionTimelineChart transactions={shortRangeTransactions} />
        </ComponentWithProvider>
      );
      // For short ranges, it shows single point display instead of line chart
      expect(screen.getByText('2023-06')).toBeInTheDocument();

      // Monthly trend should show single month
      render(
        <ComponentWithProvider>
          <MonthlyTrendChart transactions={shortRangeTransactions} />
        </ComponentWithProvider>
      );
      expect(screen.getByText('Jun 2023')).toBeInTheDocument();
    });
  });

  describe('Long Date Range - Requirement 14.5', () => {
    const longRangeTransactions = [
      {
        id: '1',
        date: '2010-01-15',
        transactionType: 'Purchase',
        amount: 5000,
        isAdministrative: false,
        schemeName: 'Test Scheme A',
        folioNumber: 'F001'
      },
      {
        id: '2',
        date: '2015-06-15',
        transactionType: 'SIP',
        amount: 3000,
        isAdministrative: false,
        schemeName: 'Test Scheme B',
        folioNumber: 'F002'
      },
      {
        id: '3',
        date: '2023-12-15',
        transactionType: 'Redemption',
        amount: 2000,
        isAdministrative: false,
        schemeName: 'Test Scheme A',
        folioNumber: 'F001'
      }
    ];

    test('Dashboard shows long range warning for transactions spanning more than 10 years', () => {
      render(
        <ComponentWithProvider>
          <Dashboard transactions={longRangeTransactions} />
        </ComponentWithProvider>
      );
      
      expect(screen.getByText('Long Date Range Detected')).toBeInTheDocument();
    });

    test('Charts handle long date ranges with appropriate aggregation', () => {
      // Timeline should aggregate by year for long ranges
      render(
        <ComponentWithProvider>
          <TransactionTimelineChart transactions={longRangeTransactions} />
        </ComponentWithProvider>
      );
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();

      // Monthly trend should have year selector
      render(
        <ComponentWithProvider>
          <MonthlyTrendChart transactions={longRangeTransactions} />
        </ComponentWithProvider>
      );
      expect(screen.getByText('All Years')).toBeInTheDocument();
    });
  });

  describe('Administrative Transactions Handling', () => {
    const transactionsWithAdmin = [
      {
        id: '1',
        date: '2023-01-15',
        transactionType: 'Purchase',
        amount: 5000,
        isAdministrative: false,
        schemeName: 'Test Scheme A',
        folioNumber: 'F001'
      },
      {
        id: '2',
        date: '2023-01-16',
        transactionType: 'Administrative',
        amount: 0,
        isAdministrative: true,
        schemeName: 'Test Scheme A',
        folioNumber: 'F001'
      },
      {
        id: '3',
        date: '2023-01-17',
        transactionType: 'Administrative',
        amount: 0,
        isAdministrative: true,
        schemeName: 'Test Scheme B',
        folioNumber: 'F002'
      }
    ];

    test('Dashboard ignores administrative transactions in edge case analysis', () => {
      render(
        <ComponentWithProvider>
          <Dashboard transactions={transactionsWithAdmin} />
        </ComponentWithProvider>
      );
      
      // Should show single transaction warning (ignoring admin transactions)
      expect(screen.getByText('Limited Data Available')).toBeInTheDocument();
      expect(screen.getByText(/Only one transaction found/)).toBeInTheDocument();
    });

    test('Transaction type chart can show/hide administrative transactions', () => {
      render(
        <ComponentWithProvider>
          <TransactionTypeChart transactions={transactionsWithAdmin} />
        </ComponentWithProvider>
      );
      
      // Should have toggle for administrative transactions
      expect(screen.getByText('Show Administrative')).toBeInTheDocument();
    });
  });

  describe('Null and Undefined Data Handling', () => {
    test('Dashboard handles null transactions gracefully', () => {
      // Dashboard should handle null by treating it as empty array
      render(
        <ComponentWithProvider>
          <Dashboard transactions={null} />
        </ComponentWithProvider>
      );
      
      expect(screen.getByText('No Data Available')).toBeInTheDocument();
    });

    test('Dashboard handles undefined transactions gracefully', () => {
      render(
        <ComponentWithProvider>
          <Dashboard transactions={undefined} />
        </ComponentWithProvider>
      );
      
      expect(screen.getByText('No Data Available')).toBeInTheDocument();
    });

    test('Portfolio chart handles null portfolio data', () => {
      render(
        <ComponentWithProvider>
          <PortfolioAllocationChart portfolioData={null} />
        </ComponentWithProvider>
      );
      
      expect(screen.getByText('No portfolio data available')).toBeInTheDocument();
    });

    test('Portfolio chart handles undefined portfolio data', () => {
      render(
        <ComponentWithProvider>
          <PortfolioAllocationChart portfolioData={undefined} />
        </ComponentWithProvider>
      );
      
      expect(screen.getByText('No portfolio data available')).toBeInTheDocument();
    });
  });

  describe('Invalid Data Handling', () => {
    const invalidTransactions = [
      {
        id: '1',
        date: 'invalid-date',
        transactionType: 'Purchase',
        amount: 'invalid-amount',
        isAdministrative: false,
        schemeName: null,
        folioNumber: undefined
      },
      {
        id: '2',
        date: '2023-02-15',
        transactionType: null,
        amount: -5000,
        isAdministrative: 'not-boolean',
        schemeName: '',
        folioNumber: 'F002'
      }
    ];

    test('Charts handle invalid transaction data gracefully', () => {
      // Should not crash and should handle invalid data
      render(
        <ComponentWithProvider>
          <TransactionTimelineChart transactions={invalidTransactions} />
        </ComponentWithProvider>
      );
      
      // Should render without crashing
      expect(screen.getByText('Transaction Timeline')).toBeInTheDocument();
    });

    test('Dashboard handles invalid transaction data gracefully', () => {
      render(
        <ComponentWithProvider>
          <Dashboard transactions={invalidTransactions} />
        </ComponentWithProvider>
      );
      
      // Should render without crashing
      expect(screen.getByText('Limited Data Available')).toBeInTheDocument();
    });
  });

  describe('Large Dataset Edge Cases', () => {
    const generateLargeDataset = (count) => {
      return Array.from({ length: count }, (_, i) => ({
        id: `tx-${i}`,
        date: new Date(2020, i % 12, (i % 28) + 1).toISOString().split('T')[0],
        transactionType: ['Purchase', 'SIP', 'Redemption'][i % 3],
        amount: Math.floor(Math.random() * 10000) + 1000,
        isAdministrative: false,
        schemeName: `Scheme ${i % 10}`,
        folioNumber: `F${String(i % 5).padStart(3, '0')}`
      }));
    };

    test('Dashboard handles medium dataset (1000 transactions)', () => {
      const mediumDataset = generateLargeDataset(1000);
      
      render(
        <ComponentWithProvider>
          <Dashboard transactions={mediumDataset} />
        </ComponentWithProvider>
      );
      
      // Should render without performance issues - check for metrics panel class
      expect(screen.getByText('Total Investment')).toBeInTheDocument();
    });

    test('Charts handle datasets with many unique schemes', () => {
      const manySchemes = Array.from({ length: 15 }, (_, i) => ({
        id: `tx-${i}`,
        date: '2023-01-15',
        transactionType: 'Purchase',
        amount: 1000 * (i + 1),
        isAdministrative: false,
        schemeName: `Scheme ${i + 1}`,
        folioNumber: `F${String(i).padStart(3, '0')}`
      }));

      const portfolioData = {
        portfolioSummary: manySchemes.map((tx, i) => ({
          fundName: tx.schemeName,
          marketValue: tx.amount * 1.1,
          costValue: tx.amount
        }))
      };

      render(
        <ComponentWithProvider>
          <PortfolioAllocationChart portfolioData={portfolioData} />
        </ComponentWithProvider>
      );
      
      // Should handle many schemes (>10 should group into "Others")
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });
  });

  describe('Boundary Value Testing', () => {
    test('Dashboard handles exactly 5 transactions (boundary for limited data)', () => {
      const boundaryTransactions = Array.from({ length: 5 }, (_, i) => ({
        id: `tx-${i}`,
        date: `2023-0${i + 1}-15`,
        transactionType: 'Purchase',
        amount: 1000 * (i + 1),
        isAdministrative: false,
        schemeName: `Scheme ${i + 1}`,
        folioNumber: `F00${i + 1}`
      }));

      render(
        <ComponentWithProvider>
          <Dashboard transactions={boundaryTransactions} />
        </ComponentWithProvider>
      );
      
      // Should not show limited data warning for exactly 5 transactions
      expect(screen.queryByText('Limited Data Available')).not.toBeInTheDocument();
    });

    test('Dashboard handles exactly 30 days date range (boundary for short range)', () => {
      const boundaryDateTransactions = [
        {
          id: '1',
          date: '2023-01-01',
          transactionType: 'Purchase',
          amount: 5000,
          isAdministrative: false,
          schemeName: 'Test Scheme A',
          folioNumber: 'F001'
        },
        {
          id: '2',
          date: '2023-01-31',
          transactionType: 'Redemption',
          amount: 2000,
          isAdministrative: false,
          schemeName: 'Test Scheme A',
          folioNumber: 'F001'
        }
      ];

      render(
        <ComponentWithProvider>
          <Dashboard transactions={boundaryDateTransactions} />
        </ComponentWithProvider>
      );
      
      // Should not show short range warning for exactly 30 days
      expect(screen.queryByText('Short Date Range')).not.toBeInTheDocument();
    });
  });
});