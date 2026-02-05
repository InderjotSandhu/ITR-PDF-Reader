import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import PortfolioAllocationChart from './PortfolioAllocationChart';
import TransactionTimelineChart from './TransactionTimelineChart';
import TransactionTypeChart from './TransactionTypeChart';
import MonthlyTrendChart from './MonthlyTrendChart';
import { FilterProvider } from '../context/FilterContext';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock data
const mockPortfolioData = {
  portfolioSummary: [
    { scheme: 'HDFC Equity Fund', marketValue: 15000, units: 70, nav: 214.29 },
    { scheme: 'ICICI Prudential Bluechip Fund', marketValue: 8000, units: 50, nav: 160 },
    { scheme: 'SBI Small Cap Fund', marketValue: 5000, units: 25, nav: 200 }
  ]
};

const mockTransactions = [
  {
    id: 1,
    date: '2023-01-15',
    transactionType: 'Purchase',
    scheme: 'HDFC Equity Fund',
    amount: 10000,
    units: 100,
    nav: 100,
    isAdministrative: false
  },
  {
    id: 2,
    date: '2023-02-15',
    transactionType: 'SIP',
    scheme: 'ICICI Prudential Bluechip Fund',
    amount: 5000,
    units: 50,
    nav: 100,
    isAdministrative: false
  },
  {
    id: 3,
    date: '2023-03-15',
    transactionType: 'Redemption',
    scheme: 'HDFC Equity Fund',
    amount: -3000,
    units: -30,
    nav: 100,
    isAdministrative: false
  }
];

const ChartWithProvider = ({ children }) => (
  <FilterProvider>
    {children}
  </FilterProvider>
);

describe('Chart Components Accessibility Tests', () => {
  beforeEach(() => {
    // Mock html2canvas
    global.html2canvas = jest.fn(() => Promise.resolve({
      toBlob: jest.fn((callback) => callback(new Blob()))
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('PortfolioAllocationChart Accessibility', () => {
    test('should have proper ARIA structure', () => {
      render(
        <ChartWithProvider>
          <PortfolioAllocationChart
            portfolioData={mockPortfolioData}
            darkMode={false}
          />
        </ChartWithProvider>
      );

      // Check main chart container
      expect(screen.getByRole('img', { name: /portfolio allocation pie chart/i })).toBeInTheDocument();
      
      // Check title
      expect(screen.getByText('Portfolio Allocation')).toBeInTheDocument();
      
      // Check export button
      expect(screen.getByLabelText(/export portfolio allocation chart/i)).toBeInTheDocument();
    });

    test('should provide screen reader description', () => {
      render(
        <ChartWithProvider>
          <PortfolioAllocationChart
            portfolioData={mockPortfolioData}
            darkMode={false}
          />
        </ChartWithProvider>
      );

      expect(screen.getByText(/portfolio allocation showing distribution/i)).toBeInTheDocument();
    });

    test('should have accessible data table', () => {
      render(
        <ChartWithProvider>
          <PortfolioAllocationChart
            portfolioData={mockPortfolioData}
            darkMode={false}
          />
        </ChartWithProvider>
      );

      const table = document.querySelector('table');
      expect(table).toBeInTheDocument();
      expect(table).toHaveAttribute('role', 'table');
      
      const caption = table.querySelector('caption');
      expect(caption).toBeInTheDocument();
      expect(caption.textContent).toMatch(/portfolio allocation data/i);
    });

    test('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      render(
        <ChartWithProvider>
          <PortfolioAllocationChart
            portfolioData={mockPortfolioData}
            darkMode={false}
          />
        </ChartWithProvider>
      );

      const chart = screen.getByRole('img', { name: /portfolio allocation pie chart/i });
      chart.focus();
      expect(chart).toHaveFocus();

      // Test keyboard interaction
      await user.keyboard('{Enter}');
      // Chart should handle keyboard events
    });

    test('should not have accessibility violations', async () => {
      const { container } = render(
        <ChartWithProvider>
          <PortfolioAllocationChart
            portfolioData={mockPortfolioData}
            darkMode={false}
          />
        </ChartWithProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('TransactionTimelineChart Accessibility', () => {
    test('should have proper ARIA structure', () => {
      render(
        <ChartWithProvider>
          <TransactionTimelineChart
            transactions={mockTransactions}
            darkMode={false}
          />
        </ChartWithProvider>
      );

      expect(screen.getByRole('img', { name: /transaction timeline line chart/i })).toBeInTheDocument();
      expect(screen.getByText('Transaction Timeline')).toBeInTheDocument();
      expect(screen.getByLabelText(/export transaction timeline chart/i)).toBeInTheDocument();
    });

    test('should have accessible controls', () => {
      render(
        <ChartWithProvider>
          <TransactionTimelineChart
            transactions={mockTransactions}
            darkMode={false}
          />
        </ChartWithProvider>
      );

      // Period selector
      expect(screen.getByLabelText(/select time period for aggregation/i)).toBeInTheDocument();
      
      // Zoom controls
      expect(screen.getByRole('group', { name: /chart zoom controls/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/zoom in on timeline chart/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/zoom out on timeline chart/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/reset timeline chart zoom/i)).toBeInTheDocument();
    });

    test('should provide keyboard shortcuts information', () => {
      render(
        <ChartWithProvider>
          <TransactionTimelineChart
            transactions={mockTransactions}
            darkMode={false}
          />
        </ChartWithProvider>
      );

      // Check for keyboard shortcut hints in titles
      expect(screen.getByTitle(/\+ key/i)).toBeInTheDocument();
      expect(screen.getByTitle(/- key/i)).toBeInTheDocument();
      expect(screen.getByTitle(/escape key/i)).toBeInTheDocument();
    });

    test('should not have accessibility violations', async () => {
      const { container } = render(
        <ChartWithProvider>
          <TransactionTimelineChart
            transactions={mockTransactions}
            darkMode={false}
          />
        </ChartWithProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('TransactionTypeChart Accessibility', () => {
    test('should have proper ARIA structure', () => {
      render(
        <ChartWithProvider>
          <TransactionTypeChart
            transactions={mockTransactions}
            darkMode={false}
          />
        </ChartWithProvider>
      );

      expect(screen.getByRole('img', { name: /transaction type distribution bar chart/i })).toBeInTheDocument();
      expect(screen.getByText('Transaction Type Distribution')).toBeInTheDocument();
    });

    test('should have accessible toggle control', () => {
      render(
        <ChartWithProvider>
          <TransactionTypeChart
            transactions={mockTransactions}
            darkMode={false}
          />
        </ChartWithProvider>
      );

      const toggle = screen.getByLabelText(/toggle administrative transactions visibility/i);
      expect(toggle).toBeInTheDocument();
      expect(toggle).toHaveAttribute('type', 'checkbox');
    });

    test('should not have accessibility violations', async () => {
      const { container } = render(
        <ChartWithProvider>
          <TransactionTypeChart
            transactions={mockTransactions}
            darkMode={false}
          />
        </ChartWithProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('MonthlyTrendChart Accessibility', () => {
    test('should have proper ARIA structure', () => {
      render(
        <ChartWithProvider>
          <MonthlyTrendChart
            transactions={mockTransactions}
            darkMode={false}
          />
        </ChartWithProvider>
      );

      expect(screen.getByRole('img', { name: /monthly investment trend bar chart/i })).toBeInTheDocument();
      expect(screen.getByText('Monthly Investment Trend')).toBeInTheDocument();
    });

    test('should have accessible year selector', () => {
      render(
        <ChartWithProvider>
          <MonthlyTrendChart
            transactions={mockTransactions}
            darkMode={false}
          />
        </ChartWithProvider>
      );

      expect(screen.getByLabelText(/select year for monthly trend analysis/i)).toBeInTheDocument();
    });

    test('should not have accessibility violations', async () => {
      const { container } = render(
        <ChartWithProvider>
          <MonthlyTrendChart
            transactions={mockTransactions}
            darkMode={false}
          />
        </ChartWithProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Chart Data Tables Accessibility', () => {
    test('all charts should provide accessible data tables', () => {
      const { rerender } = render(
        <ChartWithProvider>
          <PortfolioAllocationChart
            portfolioData={mockPortfolioData}
            darkMode={false}
          />
        </ChartWithProvider>
      );

      // Portfolio chart table
      let table = document.querySelector('table');
      expect(table).toBeInTheDocument();
      expect(table.querySelector('caption')).toBeInTheDocument();

      // Timeline chart table
      rerender(
        <ChartWithProvider>
          <TransactionTimelineChart
            transactions={mockTransactions}
            darkMode={false}
          />
        </ChartWithProvider>
      );

      table = document.querySelector('table');
      expect(table).toBeInTheDocument();

      // Type chart table
      rerender(
        <ChartWithProvider>
          <TransactionTypeChart
            transactions={mockTransactions}
            darkMode={false}
          />
        </ChartWithProvider>
      );

      table = document.querySelector('table');
      expect(table).toBeInTheDocument();

      // Monthly trend chart table
      rerender(
        <ChartWithProvider>
          <MonthlyTrendChart
            transactions={mockTransactions}
            darkMode={false}
          />
        </ChartWithProvider>
      );

      table = document.querySelector('table');
      expect(table).toBeInTheDocument();
    });

    test('data tables should have proper structure', () => {
      render(
        <ChartWithProvider>
          <PortfolioAllocationChart
            portfolioData={mockPortfolioData}
            darkMode={false}
          />
        </ChartWithProvider>
      );

      const table = document.querySelector('table');
      
      // Check table structure
      expect(table.querySelector('thead')).toBeInTheDocument();
      expect(table.querySelector('tbody')).toBeInTheDocument();
      
      // Check headers have scope
      const headers = table.querySelectorAll('th');
      headers.forEach(header => {
        expect(header).toHaveAttribute('scope', 'col');
      });
    });
  });

  describe('Dark Mode Accessibility', () => {
    test('charts should maintain accessibility in dark mode', async () => {
      const { container } = render(
        <ChartWithProvider>
          <PortfolioAllocationChart
            portfolioData={mockPortfolioData}
            darkMode={true}
          />
        </ChartWithProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('all charts should work in dark mode', async () => {
      const charts = [
        <PortfolioAllocationChart portfolioData={mockPortfolioData} darkMode={true} />,
        <TransactionTimelineChart transactions={mockTransactions} darkMode={true} />,
        <TransactionTypeChart transactions={mockTransactions} darkMode={true} />,
        <MonthlyTrendChart transactions={mockTransactions} darkMode={true} />
      ];

      for (const chart of charts) {
        const { container } = render(
          <ChartWithProvider>
            {chart}
          </ChartWithProvider>
        );

        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    });
  });

  describe('Empty State Accessibility', () => {
    test('charts should handle empty data accessibly', async () => {
      const { container } = render(
        <ChartWithProvider>
          <PortfolioAllocationChart
            portfolioData={null}
            darkMode={false}
          />
        </ChartWithProvider>
      );

      // Should show empty state
      expect(screen.getByText(/no portfolio data available/i)).toBeInTheDocument();

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('timeline chart should handle empty transactions', async () => {
      const { container } = render(
        <ChartWithProvider>
          <TransactionTimelineChart
            transactions={[]}
            darkMode={false}
          />
        </ChartWithProvider>
      );

      expect(screen.getByText(/no transaction data available/i)).toBeInTheDocument();

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('timeline chart should respond to keyboard shortcuts', async () => {
      const user = userEvent.setup();
      render(
        <ChartWithProvider>
          <TransactionTimelineChart
            transactions={mockTransactions}
            darkMode={false}
          />
        </ChartWithProvider>
      );

      const chart = screen.getByRole('img', { name: /transaction timeline line chart/i });
      chart.focus();

      // Test zoom shortcuts
      await user.keyboard('{+}');
      await user.keyboard('{-}');
      await user.keyboard('{Escape}');

      // Chart should handle these keyboard events
      expect(chart).toHaveFocus();
    });

    test('dashboard should respond to escape key for filter clearing', async () => {
      const user = userEvent.setup();
      render(
        <ChartWithProvider>
          <PortfolioAllocationChart
            portfolioData={mockPortfolioData}
            darkMode={false}
          />
        </ChartWithProvider>
      );

      const chart = screen.getByRole('img', { name: /portfolio allocation pie chart/i });
      chart.focus();

      await user.keyboard('{Escape}');
      // Should handle escape key for clearing filters
    });
  });
});