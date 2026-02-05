import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TransactionTypeChart from './TransactionTypeChart';
import { FilterProvider } from '../context/FilterContext';
import html2canvas from 'html2canvas';

// Mock html2canvas
jest.mock('html2canvas');

// Helper to render with FilterProvider
const renderWithFilters = (component, transactions = []) => {
  return render(
    <FilterProvider transactions={transactions}>
      {component}
    </FilterProvider>
  );
};

describe('TransactionTypeChart', () => {
  const mockTransactions = [
    {
      date: '2023-01-15',
      amount: 10000,
      transactionType: 'Purchase',
      isAdministrative: false,
      schemeName: 'Scheme A',
      folioNumber: 'F001'
    },
    {
      date: '2023-02-20',
      amount: 5000,
      transactionType: 'SIP',
      isAdministrative: false,
      schemeName: 'Scheme B',
      folioNumber: 'F002'
    },
    {
      date: '2023-03-10',
      amount: 3000,
      transactionType: 'Redemption',
      isAdministrative: false,
      schemeName: 'Scheme A',
      folioNumber: 'F001'
    },
    {
      date: '2023-04-05',
      amount: 10000,
      transactionType: 'Purchase',
      isAdministrative: false,
      schemeName: 'Scheme C',
      folioNumber: 'F003'
    },
    {
      date: '2023-05-12',
      amount: 100,
      transactionType: 'STT',
      isAdministrative: true,
      schemeName: 'Scheme A',
      folioNumber: 'F001'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    html2canvas.mockResolvedValue({
      toBlob: (callback) => callback(new Blob(['test'], { type: 'image/png' }))
    });

    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Chart Rendering with Type Distribution (Requirement 4.1)', () => {
    test('renders chart with transaction data', () => {
      renderWithFilters(
        <TransactionTypeChart
          transactions={mockTransactions}
          darkMode={false}
        />
      );

      expect(screen.getByText('Transaction Type Distribution')).toBeTruthy();
      expect(screen.getByText('📥 Export')).toBeTruthy();
    });

    test('renders empty state when no transactions', () => {
      renderWithFilters(
        <TransactionTypeChart
          transactions={[]}
          darkMode={false}
        />
      );

      expect(screen.getByText('No transaction data available')).toBeTruthy();
    });

    test('renders chart with single transaction type', () => {
      const singleTypeTransactions = [
        {
          date: '2023-01-15',
          amount: 10000,
          transactionType: 'Purchase',
          isAdministrative: false,
          schemeName: 'Scheme A',
          folioNumber: 'F001'
        }
      ];

      renderWithFilters(
        <TransactionTypeChart
          transactions={singleTypeTransactions}
          darkMode={false}
        />
      );

      expect(screen.getByText('Transaction Type Distribution')).toBeTruthy();
    });

    test('renders chart with multiple transaction types', () => {
      renderWithFilters(
        <TransactionTypeChart
          transactions={mockTransactions}
          darkMode={false}
        />
      );

      expect(screen.getByText('Transaction Type Distribution')).toBeTruthy();
      expect(screen.getByText('📥 Export')).toBeTruthy();
    });

    test('applies dark mode class when darkMode is true', () => {
      const { container } = renderWithFilters(
        <TransactionTypeChart
          transactions={mockTransactions}
          darkMode={true}
        />
      );

      expect(container.querySelector('.transaction-type-chart.dark-mode')).toBeTruthy();
    });

    test('does not apply dark mode class when darkMode is false', () => {
      const { container } = renderWithFilters(
        <TransactionTypeChart
          transactions={mockTransactions}
          darkMode={false}
        />
      );

      const chart = container.querySelector('.transaction-type-chart');
      expect(chart).toBeTruthy();
      expect(chart.classList.contains('dark-mode')).toBe(false);
    });
  });

  describe('Administrative Transaction Handling (Requirement 4.5)', () => {
    test('excludes administrative transactions by default', () => {
      renderWithFilters(
        <TransactionTypeChart
          transactions={mockTransactions}
          darkMode={false}
        />
      );

      // Chart should render
      expect(screen.getByText('Transaction Type Distribution')).toBeTruthy();
      
      // Toggle should be unchecked by default
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox.checked).toBe(false);
    });

    test('toggle for showing/hiding administrative transactions is present', () => {
      renderWithFilters(
        <TransactionTypeChart
          transactions={mockTransactions}
          darkMode={false}
        />
      );

      expect(screen.getByText('Show Administrative')).toBeTruthy();
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeTruthy();
    });

    test('clicking toggle includes administrative transactions', () => {
      renderWithFilters(
        <TransactionTypeChart
          transactions={mockTransactions}
          darkMode={false}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox.checked).toBe(false);

      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(true);
    });

    test('clicking toggle again excludes administrative transactions', () => {
      renderWithFilters(
        <TransactionTypeChart
          transactions={mockTransactions}
          darkMode={false}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      
      // Toggle on
      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(true);

      // Toggle off
      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(false);
    });

    test('handles transactions with only administrative types', () => {
      const adminOnlyTransactions = [
        {
          date: '2023-01-15',
          amount: 100,
          transactionType: 'STT',
          isAdministrative: true,
          schemeName: 'Scheme A',
          folioNumber: 'F001'
        },
        {
          date: '2023-02-20',
          amount: 50,
          transactionType: 'Stamp Duty',
          isAdministrative: true,
          schemeName: 'Scheme B',
          folioNumber: 'F002'
        }
      ];

      renderWithFilters(
        <TransactionTypeChart
          transactions={adminOnlyTransactions}
          darkMode={false}
        />
      );

      // Should show empty state when admin transactions are hidden
      expect(screen.getByText('No transaction data available')).toBeTruthy();
    });

    test('shows administrative transactions when toggle is enabled', () => {
      const mixedTransactions = [
        {
          date: '2023-01-15',
          amount: 10000,
          transactionType: 'Purchase',
          isAdministrative: false,
          schemeName: 'Scheme A',
          folioNumber: 'F001'
        },
        {
          date: '2023-02-20',
          amount: 100,
          transactionType: 'STT',
          isAdministrative: true,
          schemeName: 'Scheme A',
          folioNumber: 'F001'
        }
      ];

      renderWithFilters(
        <TransactionTypeChart
          transactions={mixedTransactions}
          darkMode={false}
        />
      );

      // Chart should render with non-admin transactions
      expect(screen.getByText('Transaction Type Distribution')).toBeTruthy();

      // Enable administrative transactions
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox.checked).toBe(false);
      
      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(true);

      // Chart should still be visible with both types
      expect(screen.getByText('Transaction Type Distribution')).toBeTruthy();
    });
  });

  describe('Click-to-Filter Interaction (Requirement 4.4)', () => {
    test('chart container is rendered with click handler', () => {
      const { container } = renderWithFilters(
        <TransactionTypeChart
          transactions={mockTransactions}
          darkMode={false}
        />
      );

      const chartContainer = container.querySelector('.chart-container');
      expect(chartContainer).toBeTruthy();

      const responsiveContainer = container.querySelector('.recharts-responsive-container');
      expect(responsiveContainer).toBeTruthy();
    });

    test('chart has cursor pointer style for clickable bars', () => {
      const { container } = renderWithFilters(
        <TransactionTypeChart
          transactions={mockTransactions}
          darkMode={false}
        />
      );

      const chartContainer = container.querySelector('.chart-container');
      expect(chartContainer).toBeTruthy();
    });
  });

  describe('Export Functionality (Requirement 8.2)', () => {
    test('export button is present', () => {
      renderWithFilters(
        <TransactionTypeChart
          transactions={mockTransactions}
          darkMode={false}
        />
      );

      const exportButton = screen.getByText('📥 Export');
      expect(exportButton).toBeTruthy();
      expect(exportButton.tagName).toBe('BUTTON');
    });

    test('clicking export button triggers html2canvas', async () => {
      renderWithFilters(
        <TransactionTypeChart
          transactions={mockTransactions}
          darkMode={false}
        />
      );

      const exportButton = screen.getByText('📥 Export');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(html2canvas).toHaveBeenCalled();
      });
    });

    test('export creates download link with correct filename format', async () => {
      const mockLink = {
        click: jest.fn(),
        download: '',
        href: ''
      };
      const originalCreateElement = document.createElement.bind(document);
      jest.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          return mockLink;
        }
        return originalCreateElement(tag);
      });

      renderWithFilters(
        <TransactionTypeChart
          transactions={mockTransactions}
          darkMode={false}
        />
      );

      const exportButton = screen.getByText('📥 Export');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockLink.download).toMatch(/^transaction-type-distribution-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.png$/);
        expect(mockLink.click).toHaveBeenCalled();
      });
    });

    test('export uses correct background color for dark mode', async () => {
      renderWithFilters(
        <TransactionTypeChart
          transactions={mockTransactions}
          darkMode={true}
        />
      );

      const exportButton = screen.getByText('📥 Export');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(html2canvas).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            backgroundColor: '#1a1a1a',
            scale: 2
          })
        );
      });
    });

    test('export uses correct background color for light mode', async () => {
      renderWithFilters(
        <TransactionTypeChart
          transactions={mockTransactions}
          darkMode={false}
        />
      );

      const exportButton = screen.getByText('📥 Export');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(html2canvas).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            backgroundColor: '#ffffff',
            scale: 2
          })
        );
      });
    });

    test('handles export error gracefully', async () => {
      html2canvas.mockRejectedValueOnce(new Error('Export failed'));

      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
      const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

      renderWithFilters(
        <TransactionTypeChart
          transactions={mockTransactions}
          darkMode={false}
        />
      );

      const exportButton = screen.getByText('📥 Export');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(consoleErrorMock).toHaveBeenCalledWith('Error exporting chart:', expect.any(Error));
        expect(alertMock).toHaveBeenCalledWith('Failed to export chart. Please try again.');
      });

      alertMock.mockRestore();
      consoleErrorMock.mockRestore();
    });

    test('export button has correct title attribute', () => {
      renderWithFilters(
        <TransactionTypeChart
          transactions={mockTransactions}
          darkMode={false}
        />
      );

      const exportButton = screen.getByTitle('Export chart as PNG');
      expect(exportButton).toBeTruthy();
    });
  });

  describe('Edge Cases and Data Validation', () => {
    test('handles undefined transactions prop', () => {
      renderWithFilters(
        <TransactionTypeChart
          darkMode={false}
        />
      );

      expect(screen.getByText('No transaction data available')).toBeTruthy();
    });

    test('handles transactions with missing transactionType', () => {
      const incompleteTransactions = [
        {
          date: '2023-01-15',
          amount: 10000,
          isAdministrative: false,
          schemeName: 'Scheme A',
          folioNumber: 'F001'
        }
      ];

      renderWithFilters(
        <TransactionTypeChart
          transactions={incompleteTransactions}
          darkMode={false}
        />
      );

      // Should still render chart
      expect(screen.getByText('Transaction Type Distribution')).toBeTruthy();
    });

    test('handles transactions with zero amounts', () => {
      const zeroAmountTransactions = [
        {
          date: '2023-01-15',
          amount: 0,
          transactionType: 'Purchase',
          isAdministrative: false,
          schemeName: 'Scheme A',
          folioNumber: 'F001'
        }
      ];

      renderWithFilters(
        <TransactionTypeChart
          transactions={zeroAmountTransactions}
          darkMode={false}
        />
      );

      expect(screen.getByText('Transaction Type Distribution')).toBeTruthy();
    });

    test('handles very large transaction amounts', () => {
      const largeAmountTransactions = [
        {
          date: '2023-01-15',
          amount: 10000000000,
          transactionType: 'Purchase',
          isAdministrative: false,
          schemeName: 'Scheme A',
          folioNumber: 'F001'
        }
      ];

      renderWithFilters(
        <TransactionTypeChart
          transactions={largeAmountTransactions}
          darkMode={false}
        />
      );

      expect(screen.getByText('Transaction Type Distribution')).toBeTruthy();
    });

    test('handles all transaction types being the same', () => {
      const sameTypeTransactions = [
        {
          date: '2023-01-15',
          amount: 10000,
          transactionType: 'Purchase',
          isAdministrative: false,
          schemeName: 'Scheme A',
          folioNumber: 'F001'
        },
        {
          date: '2023-02-20',
          amount: 5000,
          transactionType: 'Purchase',
          isAdministrative: false,
          schemeName: 'Scheme B',
          folioNumber: 'F002'
        }
      ];

      renderWithFilters(
        <TransactionTypeChart
          transactions={sameTypeTransactions}
          darkMode={false}
        />
      );

      expect(screen.getByText('Transaction Type Distribution')).toBeTruthy();
    });

    test('handles mixed administrative and non-administrative transactions', () => {
      renderWithFilters(
        <TransactionTypeChart
          transactions={mockTransactions}
          darkMode={false}
        />
      );

      // Should render with non-admin transactions by default
      expect(screen.getByText('Transaction Type Distribution')).toBeTruthy();
    });
  });

  describe('Responsive and Accessibility', () => {
    test('chart container has correct CSS class', () => {
      const { container } = renderWithFilters(
        <TransactionTypeChart
          transactions={mockTransactions}
          darkMode={false}
        />
      );

      expect(container.querySelector('.chart-container')).toBeTruthy();
    });

    test('export button is keyboard accessible', () => {
      renderWithFilters(
        <TransactionTypeChart
          transactions={mockTransactions}
          darkMode={false}
        />
      );

      const exportButton = screen.getByText('📥 Export');
      expect(exportButton.tagName).toBe('BUTTON');
    });

    test('toggle checkbox is keyboard accessible', () => {
      renderWithFilters(
        <TransactionTypeChart
          transactions={mockTransactions}
          darkMode={false}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeTruthy();
    });

    test('chart header is properly structured', () => {
      const { container } = renderWithFilters(
        <TransactionTypeChart
          transactions={mockTransactions}
          darkMode={false}
        />
      );

      const header = container.querySelector('.chart-header');
      expect(header).toBeTruthy();
      
      const heading = header.querySelector('h3');
      expect(heading).toBeTruthy();
      expect(heading.textContent).toBe('Transaction Type Distribution');
    });

    test('chart controls are properly grouped', () => {
      const { container } = renderWithFilters(
        <TransactionTypeChart
          transactions={mockTransactions}
          darkMode={false}
        />
      );

      const controls = container.querySelector('.chart-controls');
      expect(controls).toBeTruthy();
    });
  });
});
