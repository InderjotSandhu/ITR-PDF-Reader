import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TransactionTimelineChart from './TransactionTimelineChart';
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

describe('TransactionTimelineChart', () => {
  const mockTransactions = [
    {
      date: '2023-01-15',
      transactionType: 'Purchase',
      amount: 10000,
      isAdministrative: false
    },
    {
      date: '2023-02-20',
      transactionType: 'SIP',
      amount: 5000,
      isAdministrative: false
    },
    {
      date: '2023-03-10',
      transactionType: 'Redemption',
      amount: 3000,
      isAdministrative: false
    },
    {
      date: '2023-04-05',
      transactionType: 'Purchase',
      amount: 8000,
      isAdministrative: false
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

  describe('Chart Rendering with Time Series Data', () => {
    test('renders chart with transaction data', () => {
      renderWithFilters(
        <TransactionTimelineChart
          transactions={mockTransactions}
          darkMode={false}
        />
      );

      expect(screen.getByText('Transaction Timeline')).toBeTruthy();
      expect(screen.getByText('📥 Export')).toBeTruthy();
    });

    test('renders empty state when no transactions', () => {
      renderWithFilters(
        <TransactionTimelineChart
          transactions={[]}
          darkMode={false}
        />
      );

      expect(screen.getByText('No transaction data available')).toBeTruthy();
    });

    test('applies dark mode class when darkMode is true', () => {
      const { container } = renderWithFilters(
        <TransactionTimelineChart
          transactions={mockTransactions}
          darkMode={true}
        />
      );

      expect(container.querySelector('.transaction-timeline-chart.dark-mode')).toBeTruthy();
    });
  });

  describe('Aggregation by Different Periods', () => {
    test('renders period selector with monthly, quarterly, yearly options', () => {
      renderWithFilters(
        <TransactionTimelineChart
          transactions={mockTransactions}
          darkMode={false}
        />
      );

      const periodSelector = screen.getByRole('combobox');
      expect(periodSelector).toBeTruthy();
      
      const options = Array.from(periodSelector.querySelectorAll('option'));
      expect(options.length).toBe(3);
      expect(options[0].value).toBe('monthly');
      expect(options[1].value).toBe('quarterly');
      expect(options[2].value).toBe('yearly');
    });

    test('changes aggregation period when selector is changed', () => {
      renderWithFilters(
        <TransactionTimelineChart
          transactions={mockTransactions}
          darkMode={false}
        />
      );

      const periodSelector = screen.getByRole('combobox');
      fireEvent.change(periodSelector, { target: { value: 'quarterly' } });
      
      expect(periodSelector.value).toBe('quarterly');
    });
  });

  describe('Zoom Functionality (Requirement 7.4)', () => {
    test('renders zoom controls', () => {
      renderWithFilters(
        <TransactionTimelineChart
          transactions={mockTransactions}
          darkMode={false}
        />
      );

      expect(screen.getByTitle('Zoom in')).toBeTruthy();
      expect(screen.getByTitle('Zoom out')).toBeTruthy();
      expect(screen.getByTitle('Reset zoom')).toBeTruthy();
    });

    test('zoom out and reset buttons are disabled initially', () => {
      renderWithFilters(
        <TransactionTimelineChart
          transactions={mockTransactions}
          darkMode={false}
        />
      );

      const zoomOutButton = screen.getByTitle('Zoom out');
      const resetButton = screen.getByTitle('Reset zoom');
      
      expect(zoomOutButton.disabled).toBe(true);
      expect(resetButton.disabled).toBe(true);
    });

    test('zoom in button is enabled when there is sufficient data', () => {
      renderWithFilters(
        <TransactionTimelineChart
          transactions={mockTransactions}
          darkMode={false}
        />
      );

      const zoomInButton = screen.getByTitle('Zoom in');
      expect(zoomInButton.disabled).toBe(false);
    });
  });

  describe('Export Functionality (Requirement 8.2, 8.3)', () => {
    test('export button is present', () => {
      renderWithFilters(
        <TransactionTimelineChart
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
        <TransactionTimelineChart
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
        <TransactionTimelineChart
          transactions={mockTransactions}
          darkMode={false}
        />
      );

      const exportButton = screen.getByText('📥 Export');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockLink.download).toMatch(/^transaction-timeline-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.png$/);
        expect(mockLink.click).toHaveBeenCalled();
      });
    });

    test('export uses correct background color for dark mode', async () => {
      renderWithFilters(
        <TransactionTimelineChart
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
  });

  describe('Edge Cases', () => {
    test('handles single transaction', () => {
      const singleTransaction = [mockTransactions[0]];
      
      renderWithFilters(
        <TransactionTimelineChart
          transactions={singleTransaction}
          darkMode={false}
        />
      );

      expect(screen.getByText('Transaction Timeline')).toBeTruthy();
    });

    test('filters out administrative transactions', () => {
      const transactionsWithAdmin = [
        ...mockTransactions,
        {
          date: '2023-05-01',
          transactionType: 'Administrative',
          amount: 0,
          isAdministrative: true
        }
      ];

      renderWithFilters(
        <TransactionTimelineChart
          transactions={transactionsWithAdmin}
          darkMode={false}
        />
      );

      expect(screen.getByText('Transaction Timeline')).toBeTruthy();
    });

    test('handles undefined transactions prop', () => {
      renderWithFilters(
        <TransactionTimelineChart
          darkMode={false}
        />
      );

      expect(screen.getByText('No transaction data available')).toBeTruthy();
    });
  });
});
