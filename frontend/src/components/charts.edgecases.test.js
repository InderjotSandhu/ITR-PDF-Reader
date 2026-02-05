import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
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

const ChartWithProvider = ({ children }) => (
  <FilterProvider>
    {children}
  </FilterProvider>
);

describe('Chart Components Edge Cases', () => {
  describe('PortfolioAllocationChart', () => {
    test('renders empty state when no portfolio data', () => {
      render(
        <ChartWithProvider>
          <PortfolioAllocationChart portfolioData={null} />
        </ChartWithProvider>
      );
      
      expect(screen.getByText('Portfolio Allocation')).toBeInTheDocument();
      expect(screen.getByText('No portfolio data available')).toBeInTheDocument();
      expect(screen.getByText('📊')).toBeInTheDocument();
    });

    test('renders empty state when portfolio summary is empty', () => {
      const emptyPortfolioData = {
        portfolioSummary: []
      };
      
      render(
        <ChartWithProvider>
          <PortfolioAllocationChart portfolioData={emptyPortfolioData} />
        </ChartWithProvider>
      );
      
      expect(screen.getByText('No portfolio data available')).toBeInTheDocument();
    });

    test('renders single scheme display when only one scheme', () => {
      const singleSchemeData = {
        portfolioSummary: [
          {
            fundName: 'Test Fund',
            marketValue: 10000,
            costValue: 8000
          }
        ]
      };
      
      render(
        <ChartWithProvider>
          <PortfolioAllocationChart portfolioData={singleSchemeData} />
        </ChartWithProvider>
      );
      
      expect(screen.getByText('Test Fund')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('₹10,000')).toBeInTheDocument();
    });

    test('renders chart when multiple schemes available', () => {
      const multiSchemeData = {
        portfolioSummary: [
          {
            fundName: 'Fund A',
            marketValue: 10000,
            costValue: 8000
          },
          {
            fundName: 'Fund B',
            marketValue: 5000,
            costValue: 4000
          }
        ]
      };
      
      render(
        <ChartWithProvider>
          <PortfolioAllocationChart portfolioData={multiSchemeData} />
        </ChartWithProvider>
      );
      
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });
  });

  describe('TransactionTimelineChart', () => {
    test('renders empty state when no transactions', () => {
      render(
        <ChartWithProvider>
          <TransactionTimelineChart transactions={[]} />
        </ChartWithProvider>
      );
      
      expect(screen.getByText('Transaction Timeline')).toBeInTheDocument();
      expect(screen.getByText('No transaction data available')).toBeInTheDocument();
      expect(screen.getByText('📈')).toBeInTheDocument();
    });

    test('renders single point display when only one data point', () => {
      const singleTransaction = [
        {
          id: '1',
          date: '2023-01-01',
          transactionType: 'Purchase',
          amount: 1000,
          isAdministrative: false
        }
      ];
      
      render(
        <ChartWithProvider>
          <TransactionTimelineChart transactions={singleTransaction} />
        </ChartWithProvider>
      );
      
      expect(screen.getByText('2023-01')).toBeInTheDocument();
      expect(screen.getByText('Purchases:')).toBeInTheDocument();
      expect(screen.getByText('Redemptions:')).toBeInTheDocument();
      expect(screen.getByText('Net:')).toBeInTheDocument();
    });

    test('renders chart when multiple transactions available', () => {
      const multipleTransactions = [
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
        }
      ];
      
      render(
        <ChartWithProvider>
          <TransactionTimelineChart transactions={multipleTransactions} />
        </ChartWithProvider>
      );
      
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  describe('TransactionTypeChart', () => {
    test('renders empty state when no transactions', () => {
      render(
        <ChartWithProvider>
          <TransactionTypeChart transactions={[]} />
        </ChartWithProvider>
      );
      
      expect(screen.getByText('Transaction Type Distribution')).toBeInTheDocument();
      expect(screen.getByText('No transaction data available')).toBeInTheDocument();
      expect(screen.getByText('📊')).toBeInTheDocument();
    });

    test('renders single type display when only one transaction type', () => {
      const singleTypeTransactions = [
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
        <ChartWithProvider>
          <TransactionTypeChart transactions={singleTypeTransactions} />
        </ChartWithProvider>
      );
      
      expect(screen.getByText('Purchase')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('Count:')).toBeInTheDocument();
      expect(screen.getByText('Amount:')).toBeInTheDocument();
    });

    test('renders chart when multiple transaction types available', () => {
      const multiTypeTransactions = [
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
        }
      ];
      
      render(
        <ChartWithProvider>
          <TransactionTypeChart transactions={multiTypeTransactions} />
        </ChartWithProvider>
      );
      
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  describe('MonthlyTrendChart', () => {
    test('renders empty state when no transactions', () => {
      render(
        <ChartWithProvider>
          <MonthlyTrendChart transactions={[]} />
        </ChartWithProvider>
      );
      
      expect(screen.getByText('Monthly Investment Trend')).toBeInTheDocument();
      expect(screen.getByText('No transaction data available')).toBeInTheDocument();
      expect(screen.getByText('📈')).toBeInTheDocument();
    });

    test('renders single month display when only one month of data', () => {
      const singleMonthTransactions = [
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
        <ChartWithProvider>
          <MonthlyTrendChart transactions={singleMonthTransactions} />
        </ChartWithProvider>
      );
      
      expect(screen.getByText('Jan 2023')).toBeInTheDocument();
      expect(screen.getByText('Purchases:')).toBeInTheDocument();
      expect(screen.getByText('Redemptions:')).toBeInTheDocument();
      expect(screen.getByText('Net Investment:')).toBeInTheDocument();
    });

    test('renders chart when multiple months available', () => {
      const multiMonthTransactions = [
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
        }
      ];
      
      render(
        <ChartWithProvider>
          <MonthlyTrendChart transactions={multiMonthTransactions} />
        </ChartWithProvider>
      );
      
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    test('all charts apply dark mode class when enabled', () => {
      const transactions = [
        {
          id: '1',
          date: '2023-01-01',
          transactionType: 'Purchase',
          amount: 1000,
          isAdministrative: false
        }
      ];

      const portfolioData = {
        portfolioSummary: [
          {
            fundName: 'Test Fund',
            marketValue: 10000,
            costValue: 8000
          }
        ]
      };

      const { rerender } = render(
        <ChartWithProvider>
          <PortfolioAllocationChart portfolioData={portfolioData} darkMode={true} />
        </ChartWithProvider>
      );
      
      expect(document.querySelector('.portfolio-allocation-chart.dark-mode')).toBeInTheDocument();

      rerender(
        <ChartWithProvider>
          <TransactionTimelineChart transactions={transactions} darkMode={true} />
        </ChartWithProvider>
      );
      
      expect(document.querySelector('.transaction-timeline-chart.dark-mode')).toBeInTheDocument();

      rerender(
        <ChartWithProvider>
          <TransactionTypeChart transactions={transactions} darkMode={true} />
        </ChartWithProvider>
      );
      
      expect(document.querySelector('.transaction-type-chart.dark-mode')).toBeInTheDocument();

      rerender(
        <ChartWithProvider>
          <MonthlyTrendChart transactions={transactions} darkMode={true} />
        </ChartWithProvider>
      );
      
      expect(document.querySelector('.monthly-trend-chart.dark-mode')).toBeInTheDocument();
    });
  });
});