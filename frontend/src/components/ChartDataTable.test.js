import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ChartDataTable from './ChartDataTable';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('ChartDataTable Accessibility Tests', () => {
  const mockData = [
    { scheme: 'HDFC Equity Fund', value: 15000, percentage: 60 },
    { scheme: 'ICICI Prudential Fund', value: 8000, percentage: 32 },
    { scheme: 'SBI Small Cap Fund', value: 2000, percentage: 8 }
  ];

  const mockColumns = [
    {
      header: 'Scheme Name',
      accessor: 'scheme',
      ariaLabel: 'Mutual fund scheme name'
    },
    {
      header: 'Market Value',
      render: (row) => `₹${row.value.toLocaleString('en-IN')}`,
      ariaLabel: 'Current market value in rupees'
    },
    {
      header: 'Allocation %',
      render: (row) => `${row.percentage}%`,
      ariaLabel: 'Percentage allocation of total portfolio'
    }
  ];

  describe('Basic Structure', () => {
    test('should render table with proper structure', () => {
      render(
        <ChartDataTable
          data={mockData}
          columns={mockColumns}
          caption="Portfolio allocation data"
          darkMode={false}
          visible={false}
        />
      );

      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      expect(table).toHaveAttribute('aria-label', 'Portfolio allocation data');

      // Check caption
      expect(screen.getByText('Portfolio allocation data')).toBeInTheDocument();

      // Check headers
      expect(screen.getByText('Scheme Name')).toBeInTheDocument();
      expect(screen.getByText('Market Value')).toBeInTheDocument();
      expect(screen.getByText('Allocation %')).toBeInTheDocument();

      // Check data rows
      expect(screen.getByText('HDFC Equity Fund')).toBeInTheDocument();
      expect(screen.getByText('₹15,000')).toBeInTheDocument();
      expect(screen.getByText('60%')).toBeInTheDocument();
    });

    test('should have proper table headers with scope attributes', () => {
      render(
        <ChartDataTable
          data={mockData}
          columns={mockColumns}
          caption="Test table"
          darkMode={false}
          visible={false}
        />
      );

      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(3);

      headers.forEach(header => {
        expect(header).toHaveAttribute('scope', 'col');
      });
    });

    test('should apply screen reader only class by default', () => {
      const { container } = render(
        <ChartDataTable
          data={mockData}
          columns={mockColumns}
          caption="Test table"
          darkMode={false}
          visible={false}
        />
      );

      const tableContainer = container.querySelector('.chart-data-table');
      expect(tableContainer).toHaveClass('sr-only');
    });

    test('should be visible when visible prop is true', () => {
      const { container } = render(
        <ChartDataTable
          data={mockData}
          columns={mockColumns}
          caption="Test table"
          darkMode={false}
          visible={true}
        />
      );

      const tableContainer = container.querySelector('.chart-data-table');
      expect(tableContainer).toHaveClass('visible');
      expect(tableContainer).not.toHaveClass('sr-only');
    });
  });

  describe('ARIA Labels', () => {
    test('should apply ARIA labels to headers', () => {
      render(
        <ChartDataTable
          data={mockData}
          columns={mockColumns}
          caption="Test table"
          darkMode={false}
          visible={false}
        />
      );

      const schemeHeader = screen.getByText('Scheme Name');
      expect(schemeHeader).toHaveAttribute('aria-label', 'Mutual fund scheme name');

      const valueHeader = screen.getByText('Market Value');
      expect(valueHeader).toHaveAttribute('aria-label', 'Current market value in rupees');

      const percentageHeader = screen.getByText('Allocation %');
      expect(percentageHeader).toHaveAttribute('aria-label', 'Percentage allocation of total portfolio');
    });

    test('should handle columns without ARIA labels', () => {
      const columnsWithoutAria = [
        {
          header: 'Simple Column',
          accessor: 'scheme'
        }
      ];

      render(
        <ChartDataTable
          data={mockData}
          columns={columnsWithoutAria}
          caption="Test table"
          darkMode={false}
          visible={false}
        />
      );

      const header = screen.getByText('Simple Column');
      expect(header).toHaveAttribute('aria-label', 'Simple Column');
    });

    test('should apply cell ARIA labels when provided', () => {
      const columnsWithCellAria = [
        {
          header: 'Scheme',
          accessor: 'scheme',
          getCellAriaLabel: (row) => `Scheme: ${row.scheme}`
        }
      ];

      render(
        <ChartDataTable
          data={mockData}
          columns={columnsWithCellAria}
          caption="Test table"
          darkMode={false}
          visible={false}
        />
      );

      const cell = screen.getByText('HDFC Equity Fund');
      expect(cell).toHaveAttribute('aria-label', 'Scheme: HDFC Equity Fund');
    });
  });

  describe('Dark Mode', () => {
    test('should apply dark mode class', () => {
      const { container } = render(
        <ChartDataTable
          data={mockData}
          columns={mockColumns}
          caption="Test table"
          darkMode={true}
          visible={false}
        />
      );

      const tableContainer = container.querySelector('.chart-data-table');
      expect(tableContainer).toHaveClass('dark-mode');
    });
  });

  describe('Empty States', () => {
    test('should not render when data is empty', () => {
      const { container } = render(
        <ChartDataTable
          data={[]}
          columns={mockColumns}
          caption="Test table"
          darkMode={false}
          visible={false}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    test('should not render when columns are empty', () => {
      const { container } = render(
        <ChartDataTable
          data={mockData}
          columns={[]}
          caption="Test table"
          darkMode={false}
          visible={false}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Data Rendering', () => {
    test('should render data using accessor', () => {
      const columns = [
        {
          header: 'Scheme',
          accessor: 'scheme'
        }
      ];

      render(
        <ChartDataTable
          data={mockData}
          columns={columns}
          caption="Test table"
          darkMode={false}
          visible={false}
        />
      );

      expect(screen.getByText('HDFC Equity Fund')).toBeInTheDocument();
      expect(screen.getByText('ICICI Prudential Fund')).toBeInTheDocument();
      expect(screen.getByText('SBI Small Cap Fund')).toBeInTheDocument();
    });

    test('should render data using render function', () => {
      const columns = [
        {
          header: 'Formatted Value',
          render: (row) => `Value: ₹${row.value}`
        }
      ];

      render(
        <ChartDataTable
          data={mockData}
          columns={columns}
          caption="Test table"
          darkMode={false}
          visible={false}
        />
      );

      expect(screen.getByText('Value: ₹15000')).toBeInTheDocument();
      expect(screen.getByText('Value: ₹8000')).toBeInTheDocument();
      expect(screen.getByText('Value: ₹2000')).toBeInTheDocument();
    });
  });

  describe('Accessibility Compliance', () => {
    test('should not have accessibility violations', async () => {
      const { container } = render(
        <ChartDataTable
          data={mockData}
          columns={mockColumns}
          caption="Portfolio allocation data"
          darkMode={false}
          visible={true}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should not have accessibility violations in dark mode', async () => {
      const { container } = render(
        <ChartDataTable
          data={mockData}
          columns={mockColumns}
          caption="Portfolio allocation data"
          darkMode={true}
          visible={true}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should maintain accessibility when hidden for screen readers', async () => {
      const { container } = render(
        <ChartDataTable
          data={mockData}
          columns={mockColumns}
          caption="Portfolio allocation data"
          darkMode={false}
          visible={false}
        />
      );

      // Even when visually hidden, the table should still be accessible to screen readers
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Table Navigation', () => {
    test('should be navigable by screen readers', () => {
      render(
        <ChartDataTable
          data={mockData}
          columns={mockColumns}
          caption="Portfolio allocation data"
          darkMode={false}
          visible={true}
        />
      );

      // Check that all table elements are present for navigation
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader')).toHaveLength(3);
      expect(screen.getAllByRole('row')).toHaveLength(4); // 1 header + 3 data rows
      expect(screen.getAllByRole('cell')).toHaveLength(9); // 3 columns × 3 rows
    });

    test('should provide proper table structure for assistive technology', () => {
      render(
        <ChartDataTable
          data={mockData}
          columns={mockColumns}
          caption="Portfolio allocation data"
          darkMode={false}
          visible={true}
        />
      );

      const table = screen.getByRole('table');
      
      // Check table has proper structure
      const thead = table.querySelector('thead');
      const tbody = table.querySelector('tbody');
      
      expect(thead).toBeInTheDocument();
      expect(tbody).toBeInTheDocument();
      
      // Check header row is in thead
      const headerRow = thead.querySelector('tr');
      expect(headerRow).toBeInTheDocument();
      
      // Check data rows are in tbody
      const dataRows = tbody.querySelectorAll('tr');
      expect(dataRows).toHaveLength(3);
    });
  });
});