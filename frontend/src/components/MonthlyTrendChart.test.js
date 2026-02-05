import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MonthlyTrendChart from './MonthlyTrendChart';
import { FilterProvider } from '../context/FilterContext';
import html2canvas from 'html2canvas';

jest.mock('html2canvas');

const renderWithFilters = (component, transactions = []) => {
  return render(
    <FilterProvider transactions={transactions}>
      {component}
    </FilterProvider>
  );
};

describe('MonthlyTrendChart', () => {
  const mockTransactions = [
    { date: '2023-01-15', amount: 10000, transactionType: 'Purchase', isAdministrative: false, schemeName: 'Scheme A', folioNumber: 'F001' },
    { date: '2023-02-20', amount: 5000, transactionType: 'SIP', isAdministrative: false, schemeName: 'Scheme B', folioNumber: 'F002' },
    { date: '2023-03-10', amount: 3000, transactionType: 'Redemption', isAdministrative: false, schemeName: 'Scheme A', folioNumber: 'F001' },
    { date: '2023-06-05', amount: 8000, transactionType: 'Purchase', isAdministrative: false, schemeName: 'Scheme C', folioNumber: 'F003' },
    { date: '2024-01-12', amount: 12000, transactionType: 'Purchase', isAdministrative: false, schemeName: 'Scheme A', folioNumber: 'F001' },
    { date: '2024-02-18', amount: 6000, transactionType: 'SIP', isAdministrative: false, schemeName: 'Scheme B', folioNumber: 'F002' },
    { date: '2024-03-25', amount: 4000, transactionType: 'Redemption', isAdministrative: false, schemeName: 'Scheme C', folioNumber: 'F003' }
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

  describe('Chart Rendering with Monthly Data (Requirement 5.1)', () => {
    test('renders chart with monthly transaction data', () => {
      renderWithFilters(<MonthlyTrendChart transactions={mockTransactions} darkMode={false} />);
      expect(screen.getByText('Monthly Investment Trend')).toBeTruthy();
      expect(screen.getByText('📥 Export')).toBeTruthy();
    });

    test('renders empty state when no transactions', () => {
      renderWithFilters(<MonthlyTrendChart transactions={[]} darkMode={false} />);
      expect(screen.getByText('No transaction data available')).toBeTruthy();
    });

    test('renders chart with single month of data', () => {
      const singleMonth = [{ date: '2023-01-15', amount: 10000, transactionType: 'Purchase', isAdministrative: false, schemeName: 'Scheme A', folioNumber: 'F001' }];
      renderWithFilters(<MonthlyTrendChart transactions={singleMonth} darkMode={false} />);
      expect(screen.getByText('Monthly Investment Trend')).toBeTruthy();
    });

    test('applies dark mode class when darkMode is true', () => {
      const { container } = renderWithFilters(<MonthlyTrendChart transactions={mockTransactions} darkMode={true} />);
      expect(container.querySelector('.monthly-trend-chart.dark-mode')).toBeTruthy();
    });

    test('excludes administrative transactions from chart', () => {
      const withAdmin = [...mockTransactions, { date: '2023-01-20', amount: 100, transactionType: 'STT', isAdministrative: true, schemeName: 'Scheme A', folioNumber: 'F001' }];
      renderWithFilters(<MonthlyTrendChart transactions={withAdmin} darkMode={false} />);
      expect(screen.getByText('Monthly Investment Trend')).toBeTruthy();
    });
  });

  describe('Year Selection Functionality (Requirement 5.4)', () => {
    test('year selector is present', () => {
      renderWithFilters(<MonthlyTrendChart transactions={mockTransactions} darkMode={false} />);
      const yearSelector = screen.getByRole('combobox');
      expect(yearSelector).toBeTruthy();
      expect(yearSelector.classList.contains('year-selector')).toBe(true);
    });

    test('year selector shows "All Years" option by default', () => {
      renderWithFilters(<MonthlyTrendChart transactions={mockTransactions} darkMode={false} />);
      const yearSelector = screen.getByRole('combobox');
      expect(yearSelector.value).toBe('all');
      expect(screen.getByText('All Years')).toBeTruthy();
    });

    test('year selector displays available years from transactions', () => {
      renderWithFilters(<MonthlyTrendChart transactions={mockTransactions} darkMode={false} />);
      expect(screen.getByText('2023')).toBeTruthy();
      expect(screen.getByText('2024')).toBeTruthy();
    });

    test('selecting a specific year filters the data', () => {
      renderWithFilters(<MonthlyTrendChart transactions={mockTransactions} darkMode={false} />);
      const yearSelector = screen.getByRole('combobox');
      fireEvent.change(yearSelector, { target: { value: '2023' } });
      expect(yearSelector.value).toBe('2023');
    });

    test('year selector sorts years in descending order', () => {
      renderWithFilters(<MonthlyTrendChart transactions={mockTransactions} darkMode={false} />);
      const yearSelector = screen.getByRole('combobox');
      const options = Array.from(yearSelector.options).slice(1);
      const years = options.map(opt => parseInt(opt.value));
      for (let i = 0; i < years.length - 1; i++) {
        expect(years[i]).toBeGreaterThan(years[i + 1]);
      }
    });
  });

  describe('Click-to-Filter Interaction (Requirement 5.5)', () => {
    test('chart container is rendered with click handler', () => {
      const { container } = renderWithFilters(<MonthlyTrendChart transactions={mockTransactions} darkMode={false} />);
      expect(container.querySelector('.chart-container')).toBeTruthy();
      expect(container.querySelector('.recharts-responsive-container')).toBeTruthy();
    });
  });

  describe('Export Functionality (Requirement 8.2)', () => {
    test('export button is present', () => {
      renderWithFilters(<MonthlyTrendChart transactions={mockTransactions} darkMode={false} />);
      const exportButton = screen.getByText('📥 Export');
      expect(exportButton).toBeTruthy();
      expect(exportButton.tagName).toBe('BUTTON');
    });

    test('clicking export button triggers html2canvas', async () => {
      renderWithFilters(<MonthlyTrendChart transactions={mockTransactions} darkMode={false} />);
      const exportButton = screen.getByText('📥 Export');
      fireEvent.click(exportButton);
      await waitFor(() => {
        expect(html2canvas).toHaveBeenCalled();
      });
    });

    test('export uses correct background color for dark mode', async () => {
      renderWithFilters(<MonthlyTrendChart transactions={mockTransactions} darkMode={true} />);
      const exportButton = screen.getByText('📥 Export');
      fireEvent.click(exportButton);
      await waitFor(() => {
        expect(html2canvas).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ backgroundColor: '#1a1a1a', scale: 2 }));
      });
    });

    test('handles export error gracefully', async () => {
      html2canvas.mockRejectedValueOnce(new Error('Export failed'));
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
      const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
      renderWithFilters(<MonthlyTrendChart transactions={mockTransactions} darkMode={false} />);
      const exportButton = screen.getByText('📥 Export');
      fireEvent.click(exportButton);
      await waitFor(() => {
        expect(consoleErrorMock).toHaveBeenCalledWith('Error exporting chart:', expect.any(Error));
        expect(alertMock).toHaveBeenCalledWith('Failed to export chart. Please try again.');
      });
      alertMock.mockRestore();
      consoleErrorMock.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    test('handles undefined transactions prop', () => {
      renderWithFilters(<MonthlyTrendChart darkMode={false} />);
      expect(screen.getByText('No transaction data available')).toBeTruthy();
    });

    test('handles transactions with only administrative types', () => {
      const adminOnly = [{ date: '2023-01-15', amount: 100, transactionType: 'STT', isAdministrative: true, schemeName: 'Scheme A', folioNumber: 'F001' }];
      renderWithFilters(<MonthlyTrendChart transactions={adminOnly} darkMode={false} />);
      expect(screen.getByText('No transaction data available')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    test('export button is keyboard accessible', () => {
      renderWithFilters(<MonthlyTrendChart transactions={mockTransactions} darkMode={false} />);
      const exportButton = screen.getByText('📥 Export');
      expect(exportButton.tagName).toBe('BUTTON');
    });

    test('year selector is keyboard accessible', () => {
      renderWithFilters(<MonthlyTrendChart transactions={mockTransactions} darkMode={false} />);
      const yearSelector = screen.getByRole('combobox');
      expect(yearSelector).toBeTruthy();
    });
  });
});
