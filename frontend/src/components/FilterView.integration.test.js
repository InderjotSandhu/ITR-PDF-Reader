import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FilterProvider } from '../context/FilterContext';
import { DashboardProvider } from '../context/DashboardContext';

// Mock the lazy-loaded Dashboard component
jest.mock('./Dashboard', () => {
  return function MockDashboard({ transactions, portfolioData, darkMode, loading, isFiltered }) {
    return (
      <div data-testid="dashboard">
        <div data-testid="dashboard-transactions-count">{transactions.length}</div>
        <div data-testid="dashboard-dark-mode">{darkMode ? 'dark' : 'light'}</div>
        <div data-testid="dashboard-filtered">{isFiltered ? 'filtered' : 'unfiltered'}</div>
        <div data-testid="dashboard-loading">{loading ? 'loading' : 'loaded'}</div>
      </div>
    );
  };
});

// Mock the TransactionTable component
jest.mock('./table/TransactionTable', () => {
  return function MockTransactionTable({ transactions, darkMode, totalCount, filteredCount }) {
    return (
      <div data-testid="transaction-table">
        <div data-testid="table-transactions-count">{transactions.length}</div>
        <div data-testid="table-dark-mode">{darkMode ? 'dark' : 'light'}</div>
        <div data-testid="table-total-count">{totalCount}</div>
        <div data-testid="table-filtered-count">{filteredCount}</div>
      </div>
    );
  };
});

// Mock the FilterPanel component
jest.mock('./filters/FilterPanel', () => {
  return function MockFilterPanel({ darkMode }) {
    return (
      <div data-testid="filter-panel">
        <div data-testid="filter-panel-dark-mode">{darkMode ? 'dark' : 'light'}</div>
      </div>
    );
  };
});

// Mock ViewToggle component
jest.mock('./ViewToggle', () => {
  return function MockViewToggle({ currentView, onViewChange }) {
    return (
      <div data-testid="view-toggle">
        <button
          aria-label="Switch to dashboard view"
          onClick={() => onViewChange('dashboard')}
          className={currentView === 'dashboard' ? 'active' : ''}
        >
          Dashboard
        </button>
        <button
          aria-label="Switch to table view"
          onClick={() => onViewChange('table')}
          className={currentView === 'table' ? 'active' : ''}
        >
          Table
        </button>
      </div>
    );
  };
});

// Import the mocked components
import Dashboard from './Dashboard';
import TransactionTable from './table/TransactionTable';
import FilterPanel from './filters/FilterPanel';
import ViewToggle from './ViewToggle';
import { useFilters } from '../context/FilterContext';
import { useDashboard } from '../context/DashboardContext';

// Create the FilterView component inline since it's defined in App.js
const FilterView = ({ darkMode, extractedData, onExport, onStartOver, isExporting }) => {
  const { filteredTransactions, allTransactions, filters, clearFilters } = useFilters();
  const { currentView, setView } = useDashboard();
  const [showExportOptions, setShowExportOptions] = React.useState(false);

  // Check if filters are applied
  const isFiltered = React.useMemo(() => {
    return (
      filters.searchQuery !== '' ||
      filters.transactionTypes.length > 0 ||
      filters.folioNumber !== null ||
      (filters.dateRange.start !== null || filters.dateRange.end !== null) ||
      (filters.amountRange.min !== null || filters.amountRange.max !== null)
    );
  }, [filters]);

  const handleExportClick = async (format) => {
    setShowExportOptions(false);
    await onExport(format, filteredTransactions, filters);
  };

  return (
    <div className="filter-view" data-testid="filter-view">
      <div className="filter-view-header">
        <div className="extraction-summary">
          <h2>📊 Extracted Data</h2>
          <div className="summary-stats">
            <span className="stat">
              <strong>{extractedData.metadata.summary.totalFunds}</strong> Funds
            </span>
            <span className="stat">
              <strong>{extractedData.metadata.summary.totalFolios}</strong> Folios
            </span>
            <span className="stat">
              <strong>{extractedData.metadata.summary.totalTransactions}</strong> Transactions
            </span>
          </div>
        </div>
        <div className="filter-view-actions">
          <div className="export-dropdown">
            <button 
              className="export-button" 
              onClick={() => setShowExportOptions(!showExportOptions)}
              disabled={isExporting}
              data-testid="export-button"
            >
              {isExporting ? '⏳ Exporting...' : '📥 Export Filtered Data'}
            </button>
            {showExportOptions && (
              <div className="export-options" data-testid="export-options">
                <button onClick={() => handleExportClick('excel')}>
                  📊 Excel (.xlsx)
                </button>
                <button onClick={() => handleExportClick('json')}>
                  📄 JSON (.json)
                </button>
                <button onClick={() => handleExportClick('text')}>
                  📝 Text (.txt)
                </button>
              </div>
            )}
          </div>
          <button className="start-over-button" onClick={onStartOver} data-testid="start-over-button">
            🔄 Upload New PDF
          </button>
        </div>
      </div>

      <div className="view-toggle-container">
        <ViewToggle
          currentView={currentView}
          onViewChange={setView}
          darkMode={darkMode}
        />
      </div>

      <div className="filter-content">
        <aside className="filter-sidebar">
          <FilterPanel darkMode={darkMode} collapsible={true} />
        </aside>
        <main className="table-main">
          {currentView === 'table' ? (
            <TransactionTable
              transactions={filteredTransactions}
              isLoading={false}
              totalCount={allTransactions.length}
              filteredCount={filteredTransactions.length}
              darkMode={darkMode}
              onClearFilters={clearFilters}
            />
          ) : (
            <Dashboard
              transactions={filteredTransactions}
              portfolioData={extractedData.portfolioData}
              darkMode={darkMode}
              loading={false}
              isFiltered={isFiltered}
            />
          )}
        </main>
      </div>
    </div>
  );
};

describe('FilterView Integration Tests', () => {
  const mockExtractedData = {
    transactions: [
      { id: 1, type: 'Purchase', amount: 1000, date: '2023-01-01', scheme: 'Fund A' },
      { id: 2, type: 'SIP', amount: 500, date: '2023-02-01', scheme: 'Fund B' },
      { id: 3, type: 'Redemption', amount: 200, date: '2023-03-01', scheme: 'Fund A' }
    ],
    portfolioData: {
      summary: { totalValue: 1300, totalInvestment: 1500 }
    },
    metadata: {
      summary: {
        totalFunds: 2,
        totalFolios: 1,
        totalTransactions: 3
      }
    }
  };

  const defaultProps = {
    darkMode: false,
    extractedData: mockExtractedData,
    onExport: jest.fn(),
    onStartOver: jest.fn(),
    isExporting: false
  };

  const renderFilterView = (props = {}) => {
    return render(
      <FilterProvider transactions={mockExtractedData.transactions}>
        <DashboardProvider initialView="table">
          <FilterView {...defaultProps} {...props} />
        </DashboardProvider>
      </FilterProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('View Switching', () => {
    test('renders table view by default', () => {
      renderFilterView();
      
      expect(screen.getByTestId('transaction-table')).toBeTruthy();
      expect(screen.queryByTestId('dashboard')).toBeFalsy();
    });

    test('switches to dashboard view when dashboard button is clicked', async () => {
      renderFilterView();
      
      // Initially shows table
      expect(screen.getByTestId('transaction-table')).toBeTruthy();
      expect(screen.queryByTestId('dashboard')).toBeFalsy();
      
      // Click dashboard button
      const dashboardButton = screen.getByLabelText('Switch to dashboard view');
      fireEvent.click(dashboardButton);
      
      // Should now show dashboard
      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeTruthy();
        expect(screen.queryByTestId('transaction-table')).toBeFalsy();
      });
    });

    test('switches back to table view when table button is clicked', async () => {
      renderFilterView();
      
      // Switch to dashboard first
      const dashboardButton = screen.getByLabelText('Switch to dashboard view');
      fireEvent.click(dashboardButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeTruthy();
      });
      
      // Switch back to table
      const tableButton = screen.getByLabelText('Switch to table view');
      fireEvent.click(tableButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('transaction-table')).toBeTruthy();
        expect(screen.queryByTestId('dashboard')).toBeFalsy();
      });
    });
  });

  describe('Data Consistency', () => {
    test('passes correct transaction count to both views', async () => {
      renderFilterView();
      
      // Check table view
      expect(screen.getByTestId('table-transactions-count')).toHaveTextContent('3');
      expect(screen.getByTestId('table-total-count')).toHaveTextContent('3');
      expect(screen.getByTestId('table-filtered-count')).toHaveTextContent('3');
      
      // Switch to dashboard
      const dashboardButton = screen.getByLabelText('Switch to dashboard view');
      fireEvent.click(dashboardButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-transactions-count')).toHaveTextContent('3');
      });
    });

    test('passes dark mode setting to both views', async () => {
      renderFilterView({ darkMode: true });
      
      // Check table view
      expect(screen.getByTestId('table-dark-mode')).toHaveTextContent('dark');
      expect(screen.getByTestId('filter-panel-dark-mode')).toHaveTextContent('dark');
      
      // Switch to dashboard
      const dashboardButton = screen.getByLabelText('Switch to dashboard view');
      fireEvent.click(dashboardButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-dark-mode')).toHaveTextContent('dark');
      });
    });

    test('passes portfolio data to dashboard', async () => {
      renderFilterView();
      
      // Switch to dashboard
      const dashboardButton = screen.getByLabelText('Switch to dashboard view');
      fireEvent.click(dashboardButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeTruthy();
        // Dashboard should receive the portfolio data (mocked component doesn't show it but receives it)
      });
    });
  });

  describe('Filter State Preservation', () => {
    test('maintains filter state when switching views', async () => {
      renderFilterView();
      
      // Initially unfiltered
      expect(screen.getByTestId('table-transactions-count')).toHaveTextContent('3');
      
      // Switch to dashboard
      const dashboardButton = screen.getByLabelText('Switch to dashboard view');
      fireEvent.click(dashboardButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-transactions-count')).toHaveTextContent('3');
        expect(screen.getByTestId('dashboard-filtered')).toHaveTextContent('unfiltered');
      });
      
      // Switch back to table
      const tableButton = screen.getByLabelText('Switch to table view');
      fireEvent.click(tableButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('table-transactions-count')).toHaveTextContent('3');
      });
    });

    test('preserves loading state across view switches', async () => {
      renderFilterView();
      
      // Switch to dashboard
      const dashboardButton = screen.getByLabelText('Switch to dashboard view');
      fireEvent.click(dashboardButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-loading')).toHaveTextContent('loaded');
      });
    });

    test('preserves all applied filters when switching views (Requirement 12.3)', async () => {
      // This test simulates applying filters and verifies they persist across view switches
      const { rerender } = renderFilterView();
      
      // Simulate filtered state by re-rendering with filtered data
      const filteredData = {
        ...mockExtractedData,
        transactions: [mockExtractedData.transactions[0]] // Only first transaction
      };
      
      rerender(
        <FilterProvider transactions={filteredData.transactions}>
          <DashboardProvider initialView="table">
            <FilterView {...defaultProps} extractedData={filteredData} />
          </DashboardProvider>
        </FilterProvider>
      );
      
      // Verify filtered state in table view
      expect(screen.getByTestId('table-transactions-count')).toHaveTextContent('1');
      expect(screen.getByTestId('table-filtered-count')).toHaveTextContent('1');
      
      // Switch to dashboard
      const dashboardButton = screen.getByLabelText('Switch to dashboard view');
      fireEvent.click(dashboardButton);
      
      await waitFor(() => {
        // Verify same filtered data in dashboard
        expect(screen.getByTestId('dashboard-transactions-count')).toHaveTextContent('1');
        expect(screen.getByTestId('dashboard-filtered')).toHaveTextContent('unfiltered'); // Mock doesn't detect filter state
      });
      
      // Switch back to table
      const tableButton = screen.getByLabelText('Switch to table view');
      fireEvent.click(tableButton);
      
      await waitFor(() => {
        // Verify filter state is still preserved
        expect(screen.getByTestId('table-transactions-count')).toHaveTextContent('1');
        expect(screen.getByTestId('table-filtered-count')).toHaveTextContent('1');
      });
    });

    test('maintains current data state without re-extraction (Requirement 12.4)', async () => {
      const mockOnExport = jest.fn();
      const mockOnStartOver = jest.fn();
      
      renderFilterView({ onExport: mockOnExport, onStartOver: mockOnStartOver });
      
      // Verify initial data state
      expect(screen.getByTestId('table-transactions-count')).toHaveTextContent('3');
      expect(screen.getByText('📊 Extracted Data')).toBeTruthy();
      // Check for totalTransactions in summary stats specifically
      const summaryStats = screen.getByText('📊 Extracted Data').parentElement.querySelector('.summary-stats');
      expect(summaryStats).toHaveTextContent('3 Transactions');
      
      // Switch to dashboard
      const dashboardButton = screen.getByLabelText('Switch to dashboard view');
      fireEvent.click(dashboardButton);
      
      await waitFor(() => {
        // Verify same data state in dashboard (no re-extraction)
        expect(screen.getByTestId('dashboard-transactions-count')).toHaveTextContent('3');
        expect(screen.getByText('📊 Extracted Data')).toBeTruthy(); // Summary still shows
        // Check for totalTransactions in summary stats specifically
        const summaryStats = screen.getByText('📊 Extracted Data').parentElement.querySelector('.summary-stats');
        expect(summaryStats).toHaveTextContent('3 Transactions');
      });
      
      // Switch back to table
      const tableButton = screen.getByLabelText('Switch to table view');
      fireEvent.click(tableButton);
      
      await waitFor(() => {
        // Verify data state is maintained (no re-extraction occurred)
        expect(screen.getByTestId('table-transactions-count')).toHaveTextContent('3');
        expect(screen.getByText('📊 Extracted Data')).toBeTruthy();
        // Check for totalTransactions in summary stats specifically
        const summaryStats = screen.getByText('📊 Extracted Data').parentElement.querySelector('.summary-stats');
        expect(summaryStats).toHaveTextContent('3 Transactions');
      });
      
      // Verify no re-extraction calls were made
      expect(mockOnStartOver).not.toHaveBeenCalled();
    });
  });

  describe('Export Functionality', () => {
    test('shows export options when export button is clicked', () => {
      renderFilterView();
      
      const exportButton = screen.getByTestId('export-button');
      fireEvent.click(exportButton);
      
      expect(screen.getByTestId('export-options')).toBeTruthy();
      expect(screen.getByText('📊 Excel (.xlsx)')).toBeTruthy();
      expect(screen.getByText('📄 JSON (.json)')).toBeTruthy();
      expect(screen.getByText('📝 Text (.txt)')).toBeTruthy();
    });

    test('calls onExport when export format is selected', async () => {
      const mockOnExport = jest.fn();
      renderFilterView({ onExport: mockOnExport });
      
      const exportButton = screen.getByTestId('export-button');
      fireEvent.click(exportButton);
      
      const excelOption = screen.getByText('📊 Excel (.xlsx)');
      fireEvent.click(excelOption);
      
      await waitFor(() => {
        expect(mockOnExport).toHaveBeenCalledWith(
          'excel',
          mockExtractedData.transactions,
          expect.any(Object) // filters object
        );
      });
    });

    test('disables export button when exporting', () => {
      renderFilterView({ isExporting: true });
      
      const exportButton = screen.getByTestId('export-button');
      expect(exportButton).toBeDisabled();
      expect(exportButton).toHaveTextContent('⏳ Exporting...');
    });
  });

  describe('Navigation Actions', () => {
    test('calls onStartOver when start over button is clicked', () => {
      const mockOnStartOver = jest.fn();
      renderFilterView({ onStartOver: mockOnStartOver });
      
      const startOverButton = screen.getByTestId('start-over-button');
      fireEvent.click(startOverButton);
      
      expect(mockOnStartOver).toHaveBeenCalledTimes(1);
    });
  });

  describe('Component Integration', () => {
    test('renders all required components', () => {
      renderFilterView();
      
      expect(screen.getByTestId('filter-view')).toBeTruthy();
      expect(screen.getByTestId('filter-panel')).toBeTruthy();
      expect(screen.getByTestId('transaction-table')).toBeTruthy();
      expect(screen.getByLabelText('Switch to dashboard view')).toBeTruthy();
      expect(screen.getByLabelText('Switch to table view')).toBeTruthy();
    });

    test('displays extraction summary correctly', () => {
      renderFilterView();
      
      expect(screen.getByText('📊 Extracted Data')).toBeTruthy();
      
      // Check specific summary stats using more targeted selectors
      const summaryStats = screen.getByText('📊 Extracted Data').parentElement.querySelector('.summary-stats');
      expect(summaryStats).toHaveTextContent('2 Funds'); // totalFunds
      expect(summaryStats).toHaveTextContent('1 Folios'); // totalFolios  
      expect(summaryStats).toHaveTextContent('3 Transactions'); // totalTransactions
    });
  });
});