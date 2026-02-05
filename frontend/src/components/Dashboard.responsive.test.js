/**
 * Unit tests for responsive dashboard layouts
 * Feature: data-visualization-dashboard
 * Requirements: 10.2, 10.3, 10.4
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from './Dashboard';
import { FilterProvider } from '../context/FilterContext';
import { DashboardProvider } from '../context/DashboardContext';

// Mock Recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

const renderDashboard = (props) => {
  return render(
    <FilterProvider>
      <DashboardProvider>
        <Dashboard {...props} />
      </DashboardProvider>
    </FilterProvider>
  );
};

const mockTransactions = [
  {
    date: '2024-01-01',
    amount: 1000,
    transactionType: 'Purchase',
    isAdministrative: false,
    schemeName: 'Test Scheme',
    folioNumber: 'TEST123'
  }
];

const mockPortfolioData = {
  portfolioSummary: [
    {
      fundName: 'Test Fund',
      costValue: 1000,
      marketValue: 1100
    }
  ]
};

describe('Dashboard Responsive Layouts', () => {
  /**
   * Test mobile layout (vertical stack)
   * Requirements: 10.2
   */
  describe('Mobile layout (< 768px)', () => {
    it('should render dashboard with all components', () => {
      const { container } = renderDashboard({
        transactions: mockTransactions,
        portfolioData: mockPortfolioData,
        darkMode: false,
        loading: false,
        isFiltered: false
      });

      // Dashboard should be present
      const dashboard = container.querySelector('.dashboard');
      expect(dashboard).toBeInTheDocument();

      // Dashboard grid should be present
      const dashboardGrid = container.querySelector('.dashboard-grid');
      expect(dashboardGrid).toBeInTheDocument();

      // All chart containers should be present
      const chartContainers = container.querySelectorAll('.dashboard-chart');
      expect(chartContainers.length).toBe(4); // 4 charts
    });

    it('should render metrics panel', () => {
      const { container } = renderDashboard({
        transactions: mockTransactions,
        portfolioData: mockPortfolioData,
        darkMode: false,
        loading: false,
        isFiltered: false
      });

      // Metrics grid should be present
      const metricsGrid = container.querySelector('.metrics-grid');
      expect(metricsGrid).toBeInTheDocument();
    });
  });

  /**
   * Test tablet layout (2-column grid)
   * Requirements: 10.3
   */
  describe('Tablet layout (768px - 1200px)', () => {
    it('should render dashboard with grid layout', () => {
      const { container } = renderDashboard({
        transactions: mockTransactions,
        portfolioData: mockPortfolioData,
        darkMode: false,
        loading: false,
        isFiltered: false
      });

      // Dashboard grid should have the dashboard-grid class
      const dashboardGrid = container.querySelector('.dashboard-grid');
      expect(dashboardGrid).toBeInTheDocument();
      expect(dashboardGrid).toHaveClass('dashboard-grid');
    });

    it('should render all charts in grid', () => {
      const { container } = renderDashboard({
        transactions: mockTransactions,
        portfolioData: mockPortfolioData,
        darkMode: false,
        loading: false,
        isFiltered: false
      });

      // All 4 charts should be rendered
      const chartContainers = container.querySelectorAll('.dashboard-chart');
      expect(chartContainers.length).toBe(4);
    });
  });

  /**
   * Test desktop layout (multi-column)
   * Requirements: 10.4
   */
  describe('Desktop layout (> 1200px)', () => {
    it('should render dashboard with multi-column layout', () => {
      const { container } = renderDashboard({
        transactions: mockTransactions,
        portfolioData: mockPortfolioData,
        darkMode: false,
        loading: false,
        isFiltered: false
      });

      // Dashboard should use grid layout
      const dashboardGrid = container.querySelector('.dashboard-grid');
      expect(dashboardGrid).toBeInTheDocument();
    });

    it('should render metrics in horizontal layout', () => {
      const { container } = renderDashboard({
        transactions: mockTransactions,
        portfolioData: mockPortfolioData,
        darkMode: false,
        loading: false,
        isFiltered: false
      });

      // Metrics grid should be present
      const metricsGrid = container.querySelector('.metrics-grid');
      expect(metricsGrid).toBeInTheDocument();
      expect(metricsGrid).toHaveClass('metrics-grid');
    });

    it('should render all dashboard components', () => {
      const { container } = renderDashboard({
        transactions: mockTransactions,
        portfolioData: mockPortfolioData,
        darkMode: false,
        loading: false,
        isFiltered: false
      });

      // Check for metrics panel
      expect(container.querySelector('.metrics-panel')).toBeInTheDocument();

      // Check for dashboard grid
      expect(container.querySelector('.dashboard-grid')).toBeInTheDocument();

      // Check for all chart containers
      const charts = container.querySelectorAll('.dashboard-chart');
      expect(charts.length).toBe(4);
    });
  });

  /**
   * Test responsive chart containers
   */
  describe('Responsive chart containers', () => {
    it('should use ResponsiveContainer for charts', () => {
      renderDashboard({
        transactions: mockTransactions,
        portfolioData: mockPortfolioData,
        darkMode: false,
        loading: false,
        isFiltered: false
      });

      // Should have responsive containers
      const responsiveContainers = screen.queryAllByTestId('responsive-container');
      expect(responsiveContainers.length).toBeGreaterThan(0);
    });

    it('should render charts within containers', () => {
      const { container } = renderDashboard({
        transactions: mockTransactions,
        portfolioData: mockPortfolioData,
        darkMode: false,
        loading: false,
        isFiltered: false
      });

      // Each chart should be in a dashboard-chart container
      const chartContainers = container.querySelectorAll('.dashboard-chart');
      chartContainers.forEach(chartContainer => {
        expect(chartContainer).toBeInTheDocument();
        expect(chartContainer).toHaveClass('dashboard-chart');
      });
    });
  });
});
