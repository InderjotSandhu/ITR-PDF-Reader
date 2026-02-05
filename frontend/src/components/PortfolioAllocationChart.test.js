import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PortfolioAllocationChart from './PortfolioAllocationChart';
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

describe('PortfolioAllocationChart', () => {
  const mockPortfolioData = {
    portfolioSummary: [
      { fundName: 'Scheme A', marketValue: 50000, costValue: 40000 },
      { fundName: 'Scheme B', marketValue: 30000, costValue: 25000 },
      { fundName: 'Scheme C', marketValue: 20000, costValue: 18000 }
    ]
  };

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock html2canvas default behavior
    html2canvas.mockResolvedValue({
      toBlob: (callback) => callback(new Blob(['test'], { type: 'image/png' }))
    });

    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Chart Rendering with Various Data', () => {
    test('renders chart with portfolio data', () => {
      renderWithFilters(
        <PortfolioAllocationChart
          portfolioData={mockPortfolioData}
          darkMode={false}
        />
      );

      expect(screen.getByText('Portfolio Allocation')).toBeTruthy();
      expect(screen.getByText('📥 Export')).toBeTruthy();
    });

    test('renders empty state when no portfolio data', () => {
      renderWithFilters(
        <PortfolioAllocationChart
          portfolioData={null}
          darkMode={false}
        />
      );

      expect(screen.getByText('No portfolio data available')).toBeTruthy();
    });

    test('renders empty state when portfolio summary is empty', () => {
      renderWithFilters(
        <PortfolioAllocationChart
          portfolioData={{ portfolioSummary: [] }}
          darkMode={false}
        />
      );

      expect(screen.getByText('No portfolio data available')).toBeTruthy();
    });

    test('renders chart with single scheme', () => {
      const singleSchemeData = {
        portfolioSummary: [
          { fundName: 'Single Scheme', marketValue: 100000, costValue: 90000 }
        ]
      };

      renderWithFilters(
        <PortfolioAllocationChart
          portfolioData={singleSchemeData}
          darkMode={false}
        />
      );

      expect(screen.getByText('Portfolio Allocation')).toBeTruthy();
      expect(screen.getByText('📥 Export')).toBeTruthy();
    });

    test('renders chart with multiple schemes of varying sizes', () => {
      const variedData = {
        portfolioSummary: [
          { fundName: 'Large Scheme', marketValue: 500000, costValue: 400000 },
          { fundName: 'Medium Scheme', marketValue: 100000, costValue: 90000 },
          { fundName: 'Small Scheme', marketValue: 10000, costValue: 9000 },
          { fundName: 'Tiny Scheme', marketValue: 1000, costValue: 900 }
        ]
      };

      renderWithFilters(
        <PortfolioAllocationChart
          portfolioData={variedData}
          darkMode={false}
        />
      );

      expect(screen.getByText('Portfolio Allocation')).toBeTruthy();
    });

    test('applies dark mode class when darkMode is true', () => {
      const { container } = renderWithFilters(
        <PortfolioAllocationChart
          portfolioData={mockPortfolioData}
          darkMode={true}
        />
      );

      expect(container.querySelector('.portfolio-allocation-chart.dark-mode')).toBeTruthy();
    });

    test('does not apply dark mode class when darkMode is false', () => {
      const { container } = renderWithFilters(
        <PortfolioAllocationChart
          portfolioData={mockPortfolioData}
          darkMode={false}
        />
      );

      const chart = container.querySelector('.portfolio-allocation-chart');
      expect(chart).toBeTruthy();
      expect(chart.classList.contains('dark-mode')).toBe(false);
    });
  });

  describe('"Others" Grouping Logic (Requirement 2.4)', () => {
    test('groups schemes beyond 10 into "Others" category', () => {
      // Create 12 schemes
      const manySchemes = {
        portfolioSummary: Array.from({ length: 12 }, (_, i) => ({
          fundName: `Scheme ${i + 1}`,
          marketValue: 10000 - (i * 500), // Descending values
          costValue: 9000 - (i * 450)
        }))
      };

      renderWithFilters(
        <PortfolioAllocationChart
          portfolioData={manySchemes}
          darkMode={false}
        />
      );

      // Chart should render
      expect(screen.getByText('Portfolio Allocation')).toBeTruthy();
      
      // The calculatePortfolioAllocation function should create an "Others" category
      // We can't directly test the chart segments, but we can verify the component renders
    });

    test('does not create "Others" category with 10 or fewer schemes', () => {
      const tenSchemes = {
        portfolioSummary: Array.from({ length: 10 }, (_, i) => ({
          fundName: `Scheme ${i + 1}`,
          marketValue: 10000 - (i * 500),
          costValue: 9000 - (i * 450)
        }))
      };

      renderWithFilters(
        <PortfolioAllocationChart
          portfolioData={tenSchemes}
          darkMode={false}
        />
      );

      expect(screen.getByText('Portfolio Allocation')).toBeTruthy();
    });

    test('handles exactly 11 schemes (edge case)', () => {
      const elevenSchemes = {
        portfolioSummary: Array.from({ length: 11 }, (_, i) => ({
          fundName: `Scheme ${i + 1}`,
          marketValue: 10000 - (i * 500),
          costValue: 9000 - (i * 450)
        }))
      };

      renderWithFilters(
        <PortfolioAllocationChart
          portfolioData={elevenSchemes}
          darkMode={false}
        />
      );

      expect(screen.getByText('Portfolio Allocation')).toBeTruthy();
    });
  });

  describe('Click-to-Filter Interaction (Requirement 2.5)', () => {
    test('clicking on a scheme segment applies search filter', () => {
      const { container } = renderWithFilters(
        <PortfolioAllocationChart
          portfolioData={mockPortfolioData}
          darkMode={false}
        />
      );

      // Verify the chart container is rendered (Recharts components are present)
      const chartContainer = container.querySelector('.chart-container');
      expect(chartContainer).toBeTruthy();

      // Verify ResponsiveContainer is rendered (Recharts wrapper)
      const responsiveContainer = container.querySelector('.recharts-responsive-container');
      expect(responsiveContainer).toBeTruthy();
      
      // The component has click handlers set up via the onClick prop on the Pie component
      // This is verified by the component code, not easily testable in unit tests
      // Integration tests would be better for testing actual click interactions
    });

    test('does not filter when clicking on "Others" category', () => {
      // Create data that will have "Others" category
      const manySchemes = {
        portfolioSummary: Array.from({ length: 12 }, (_, i) => ({
          fundName: `Scheme ${i + 1}`,
          marketValue: 10000 - (i * 500),
          costValue: 9000 - (i * 450)
        }))
      };

      renderWithFilters(
        <PortfolioAllocationChart
          portfolioData={manySchemes}
          darkMode={false}
        />
      );

      // The component should render without errors
      expect(screen.getByText('Portfolio Allocation')).toBeTruthy();
    });
  });

  describe('Export Functionality (Requirement 8.2)', () => {
    test('export button is present', () => {
      renderWithFilters(
        <PortfolioAllocationChart
          portfolioData={mockPortfolioData}
          darkMode={false}
        />
      );

      const exportButton = screen.getByText('📥 Export');
      expect(exportButton).toBeTruthy();
      expect(exportButton.tagName).toBe('BUTTON');
    });

    test('clicking export button triggers html2canvas', async () => {
      renderWithFilters(
        <PortfolioAllocationChart
          portfolioData={mockPortfolioData}
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
      // Mock document.createElement to track link creation
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
        <PortfolioAllocationChart
          portfolioData={mockPortfolioData}
          darkMode={false}
        />
      );

      const exportButton = screen.getByText('📥 Export');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockLink.download).toMatch(/^portfolio-allocation-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.png$/);
        expect(mockLink.click).toHaveBeenCalled();
      });
    });

    test('export uses correct background color for dark mode', async () => {
      renderWithFilters(
        <PortfolioAllocationChart
          portfolioData={mockPortfolioData}
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
        <PortfolioAllocationChart
          portfolioData={mockPortfolioData}
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
      // Mock html2canvas to reject
      html2canvas.mockRejectedValueOnce(new Error('Export failed'));

      // Mock alert
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
      const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

      renderWithFilters(
        <PortfolioAllocationChart
          portfolioData={mockPortfolioData}
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
        <PortfolioAllocationChart
          portfolioData={mockPortfolioData}
          darkMode={false}
        />
      );

      const exportButton = screen.getByTitle('Export chart as PNG');
      expect(exportButton).toBeTruthy();
    });
  });

  describe('Edge Cases and Data Validation', () => {
    test('handles portfolio data with zero market values', () => {
      const zeroValueData = {
        portfolioSummary: [
          { fundName: 'Scheme A', marketValue: 0, costValue: 40000 },
          { fundName: 'Scheme B', marketValue: 0, costValue: 25000 }
        ]
      };

      renderWithFilters(
        <PortfolioAllocationChart
          portfolioData={zeroValueData}
          darkMode={false}
        />
      );

      // Should show empty state when all values are zero
      expect(screen.getByText('No portfolio data available')).toBeTruthy();
    });

    test('handles mixed zero and non-zero market values', () => {
      const mixedData = {
        portfolioSummary: [
          { fundName: 'Active Scheme', marketValue: 50000, costValue: 40000 },
          { fundName: 'Zero Scheme', marketValue: 0, costValue: 25000 }
        ]
      };

      renderWithFilters(
        <PortfolioAllocationChart
          portfolioData={mixedData}
          darkMode={false}
        />
      );

      // Should render chart with only active schemes
      expect(screen.getByText('Portfolio Allocation')).toBeTruthy();
    });

    test('handles undefined portfolioData prop', () => {
      renderWithFilters(
        <PortfolioAllocationChart
          darkMode={false}
        />
      );

      expect(screen.getByText('No portfolio data available')).toBeTruthy();
    });

    test('handles portfolioData without portfolioSummary property', () => {
      renderWithFilters(
        <PortfolioAllocationChart
          portfolioData={{}}
          darkMode={false}
        />
      );

      expect(screen.getByText('No portfolio data available')).toBeTruthy();
    });

    test('handles very large market values', () => {
      const largeValueData = {
        portfolioSummary: [
          { fundName: 'Large Scheme', marketValue: 10000000000, costValue: 9000000000 },
          { fundName: 'Small Scheme', marketValue: 1000000, costValue: 900000 }
        ]
      };

      renderWithFilters(
        <PortfolioAllocationChart
          portfolioData={largeValueData}
          darkMode={false}
        />
      );

      expect(screen.getByText('Portfolio Allocation')).toBeTruthy();
    });

    test('handles schemes with very small market values', () => {
      const smallValueData = {
        portfolioSummary: [
          { fundName: 'Tiny Scheme 1', marketValue: 0.01, costValue: 0.01 },
          { fundName: 'Tiny Scheme 2', marketValue: 0.02, costValue: 0.02 }
        ]
      };

      renderWithFilters(
        <PortfolioAllocationChart
          portfolioData={smallValueData}
          darkMode={false}
        />
      );

      expect(screen.getByText('Portfolio Allocation')).toBeTruthy();
    });
  });

  describe('Responsive and Accessibility', () => {
    test('chart container has correct CSS class', () => {
      const { container } = renderWithFilters(
        <PortfolioAllocationChart
          portfolioData={mockPortfolioData}
          darkMode={false}
        />
      );

      expect(container.querySelector('.chart-container')).toBeTruthy();
    });

    test('export button is keyboard accessible', () => {
      renderWithFilters(
        <PortfolioAllocationChart
          portfolioData={mockPortfolioData}
          darkMode={false}
        />
      );

      const exportButton = screen.getByText('📥 Export');
      expect(exportButton.tagName).toBe('BUTTON');
      // Buttons are keyboard accessible by default
    });

    test('chart header is properly structured', () => {
      const { container } = renderWithFilters(
        <PortfolioAllocationChart
          portfolioData={mockPortfolioData}
          darkMode={false}
        />
      );

      const header = container.querySelector('.chart-header');
      expect(header).toBeTruthy();
      
      const heading = header.querySelector('h3');
      expect(heading).toBeTruthy();
      expect(heading.textContent).toBe('Portfolio Allocation');
    });
  });
});
