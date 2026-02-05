import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Dashboard from './Dashboard';
import { FilterProvider } from '../context/FilterContext';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock data for testing
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

const mockPortfolioData = {
  portfolioSummary: [
    {
      scheme: 'HDFC Equity Fund',
      marketValue: 15000,
      units: 70,
      nav: 214.29
    },
    {
      scheme: 'ICICI Prudential Bluechip Fund',
      marketValue: 8000,
      units: 50,
      nav: 160
    }
  ]
};

const DashboardWithProvider = (props) => (
  <FilterProvider>
    <Dashboard {...props} />
  </FilterProvider>
);

describe('Dashboard Accessibility Tests', () => {
  beforeEach(() => {
    // Mock html2canvas to avoid errors in tests
    global.html2canvas = jest.fn(() => Promise.resolve({
      toBlob: jest.fn((callback) => callback(new Blob()))
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Keyboard Navigation', () => {
    test('dashboard should be focusable and have proper role', () => {
      render(
        <DashboardWithProvider
          transactions={mockTransactions}
          portfolioData={mockPortfolioData}
          darkMode={false}
        />
      );

      const dashboard = screen.getByRole('main');
      expect(dashboard).toBeInTheDocument();
      expect(dashboard).toHaveAttribute('tabIndex', '0');
      expect(dashboard).toHaveAttribute('aria-label', 'Investment dashboard');
    });

    test('chart containers should be focusable', () => {
      render(
        <DashboardWithProvider
          transactions={mockTransactions}
          portfolioData={mockPortfolioData}
          darkMode={false}
        />
      );

      const chartContainers = screen.getAllByRole('img');
      chartContainers.forEach(container => {
        expect(container).toHaveAttribute('tabIndex', '0');
      });
    });

    test('export buttons should be keyboard accessible', async () => {
      const user = userEvent.setup();
      render(
        <DashboardWithProvider
          transactions={mockTransactions}
          portfolioData={mockPortfolioData}
          darkMode={false}
        />
      );

      const exportButtons = screen.getAllByLabelText(/export.*chart.*as png/i);
      
      for (const button of exportButtons) {
        expect(button).toBeInTheDocument();
        
        // Test keyboard activation
        button.focus();
        expect(button).toHaveFocus();
        
        // Test Enter key
        await user.keyboard('{Enter}');
        // Note: We can't easily test the actual export functionality in unit tests
        // but we can verify the button is keyboard accessible
      }
    });

    test('escape key should clear filters when applied', async () => {
      const user = userEvent.setup();
      render(
        <DashboardWithProvider
          transactions={mockTransactions}
          portfolioData={mockPortfolioData}
          darkMode={false}
          isFiltered={true}
        />
      );

      const dashboard = screen.getByRole('main');
      dashboard.focus();
      
      // Simulate Escape key press
      await user.keyboard('{Escape}');
      
      // The clear filters functionality should be triggered
      // (This would need to be verified through the FilterContext in a full integration test)
    });

    test('tab navigation should follow logical order', async () => {
      const user = userEvent.setup();
      render(
        <DashboardWithProvider
          transactions={mockTransactions}
          portfolioData={mockPortfolioData}
          darkMode={false}
          isFiltered={true}
        />
      );

      // Start from the dashboard
      const dashboard = screen.getByRole('main');
      dashboard.focus();
      expect(dashboard).toHaveFocus();

      // Tab should move to clear filters button
      await user.tab();
      const clearButton = screen.getByLabelText('Clear all filters');
      expect(clearButton).toHaveFocus();

      // Continue tabbing through interactive elements
      await user.tab();
      // Should move to first chart or interactive element
      // (Exact behavior depends on chart library implementation)
    });
  });

  describe('ARIA Labels and Roles', () => {
    test('dashboard should have proper ARIA structure', () => {
      render(
        <DashboardWithProvider
          transactions={mockTransactions}
          portfolioData={mockPortfolioData}
          darkMode={false}
        />
      );

      // Main dashboard
      expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Investment dashboard');

      // Charts region
      expect(screen.getByRole('region', { name: /investment charts/i })).toBeInTheDocument();

      // Metrics region
      expect(screen.getByRole('region', { name: /key performance metrics/i })).toBeInTheDocument();
    });

    test('charts should have descriptive ARIA labels', () => {
      render(
        <DashboardWithProvider
          transactions={mockTransactions}
          portfolioData={mockPortfolioData}
          darkMode={false}
        />
      );

      // Check for chart ARIA labels
      expect(screen.getByLabelText(/portfolio allocation pie chart/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/transaction timeline line chart/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/transaction type distribution bar chart/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/monthly investment trend bar chart/i)).toBeInTheDocument();
    });

    test('interactive elements should have proper ARIA attributes', () => {
      render(
        <DashboardWithProvider
          transactions={mockTransactions}
          portfolioData={mockPortfolioData}
          darkMode={false}
        />
      );

      // Export buttons
      const exportButtons = screen.getAllByLabelText(/export.*chart.*as png/i);
      exportButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });

      // Control elements
      const selectors = screen.getAllByRole('combobox');
      selectors.forEach(selector => {
        expect(selector).toHaveAttribute('aria-label');
      });
    });

    test('filter indicator should have live region', () => {
      render(
        <DashboardWithProvider
          transactions={mockTransactions}
          portfolioData={mockPortfolioData}
          darkMode={false}
          isFiltered={true}
        />
      );

      const filterIndicator = screen.getByRole('status');
      expect(filterIndicator).toHaveAttribute('aria-live', 'polite');
      expect(filterIndicator).toHaveAttribute('aria-label');
    });

    test('metric cards should have descriptive labels', () => {
      render(
        <DashboardWithProvider
          transactions={mockTransactions}
          portfolioData={mockPortfolioData}
          darkMode={false}
        />
      );

      // Check for metric card regions
      const metricRegions = screen.getAllByRole('region');
      const metricCards = metricRegions.filter(region => 
        region.getAttribute('aria-label')?.includes('investment') ||
        region.getAttribute('aria-label')?.includes('value') ||
        region.getAttribute('aria-label')?.includes('gains') ||
        region.getAttribute('aria-label')?.includes('return')
      );
      
      expect(metricCards.length).toBeGreaterThan(0);
    });
  });

  describe('Screen Reader Support', () => {
    test('should provide screen reader only descriptions', () => {
      render(
        <DashboardWithProvider
          transactions={mockTransactions}
          portfolioData={mockPortfolioData}
          darkMode={false}
        />
      );

      // Check for screen reader descriptions
      expect(screen.getByText(/portfolio allocation showing distribution/i)).toBeInTheDocument();
      expect(screen.getByText(/transaction timeline showing.*data points/i)).toBeInTheDocument();
      expect(screen.getByText(/transaction type distribution showing/i)).toBeInTheDocument();
      expect(screen.getByText(/monthly investment trend showing/i)).toBeInTheDocument();
    });

    test('should provide data tables for screen readers', () => {
      render(
        <DashboardWithProvider
          transactions={mockTransactions}
          portfolioData={mockPortfolioData}
          darkMode={false}
        />
      );

      // Check for data tables (they should be present but hidden)
      const tables = document.querySelectorAll('table');
      expect(tables.length).toBeGreaterThan(0);

      tables.forEach(table => {
        expect(table).toHaveAttribute('role', 'table');
        expect(table).toHaveAttribute('aria-label');
      });
    });

    test('should have proper table structure for screen readers', () => {
      render(
        <DashboardWithProvider
          transactions={mockTransactions}
          portfolioData={mockPortfolioData}
          darkMode={false}
        />
      );

      const tables = document.querySelectorAll('table');
      
      tables.forEach(table => {
        // Check for caption
        const caption = table.querySelector('caption');
        expect(caption).toBeInTheDocument();

        // Check for proper header structure
        const headers = table.querySelectorAll('th[scope="col"]');
        expect(headers.length).toBeGreaterThan(0);

        // Check for table body
        const tbody = table.querySelector('tbody');
        expect(tbody).toBeInTheDocument();
      });
    });

    test('tooltips should have proper ARIA attributes', async () => {
      const user = userEvent.setup();
      render(
        <DashboardWithProvider
          transactions={mockTransactions}
          portfolioData={mockPortfolioData}
          darkMode={false}
        />
      );

      // This test would need to interact with chart elements to trigger tooltips
      // The exact implementation depends on how Recharts handles accessibility
      // For now, we'll check that tooltip containers exist
      const chartContainers = screen.getAllByRole('img');
      expect(chartContainers.length).toBeGreaterThan(0);
    });
  });

  describe('Automated Accessibility Testing', () => {
    test('should not have accessibility violations', async () => {
      const { container } = render(
        <DashboardWithProvider
          transactions={mockTransactions}
          portfolioData={mockPortfolioData}
          darkMode={false}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should not have accessibility violations in dark mode', async () => {
      const { container } = render(
        <DashboardWithProvider
          transactions={mockTransactions}
          portfolioData={mockPortfolioData}
          darkMode={true}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should not have accessibility violations with filters applied', async () => {
      const { container } = render(
        <DashboardWithProvider
          transactions={mockTransactions}
          portfolioData={mockPortfolioData}
          darkMode={false}
          isFiltered={true}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should not have accessibility violations in empty state', async () => {
      const { container } = render(
        <DashboardWithProvider
          transactions={[]}
          portfolioData={null}
          darkMode={false}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Focus Management', () => {
    test('focus should be visible on all interactive elements', () => {
      render(
        <DashboardWithProvider
          transactions={mockTransactions}
          portfolioData={mockPortfolioData}
          darkMode={false}
        />
      );

      // Test focus on buttons
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        button.focus();
        expect(button).toHaveFocus();
        // Visual focus indicators are tested through CSS, which is harder to test in unit tests
      });

      // Test focus on select elements
      const selects = screen.getAllByRole('combobox');
      selects.forEach(select => {
        select.focus();
        expect(select).toHaveFocus();
      });
    });

    test('focus should not be trapped inappropriately', async () => {
      const user = userEvent.setup();
      render(
        <DashboardWithProvider
          transactions={mockTransactions}
          portfolioData={mockPortfolioData}
          darkMode={false}
        />
      );

      // Focus should be able to move freely through the dashboard
      const dashboard = screen.getByRole('main');
      dashboard.focus();
      
      // Tab through several elements
      await user.tab();
      await user.tab();
      await user.tab();
      
      // Focus should still be within the document
      expect(document.activeElement).toBeInTheDocument();
    });
  });

  describe('Color and Contrast', () => {
    test('should maintain proper color coding semantics', () => {
      render(
        <DashboardWithProvider
          transactions={mockTransactions}
          portfolioData={mockPortfolioData}
          darkMode={false}
        />
      );

      // This test would ideally check computed styles for contrast ratios
      // For now, we verify that color-coded elements exist
      const dashboard = screen.getByRole('main');
      expect(dashboard).toBeInTheDocument();
      
      // Color contrast testing is better done with automated tools like axe
      // which we're already using in the automated accessibility tests
    });
  });

  describe('Responsive Accessibility', () => {
    test('should maintain accessibility on mobile viewports', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <DashboardWithProvider
          transactions={mockTransactions}
          portfolioData={mockPortfolioData}
          darkMode={false}
        />
      );

      // Accessibility should be maintained regardless of viewport size
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('region', { name: /investment charts/i })).toBeInTheDocument();
    });
  });
});