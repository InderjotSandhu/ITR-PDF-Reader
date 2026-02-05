import React from 'react';
import { render, screen } from '@testing-library/react';
import MetricsPanel from './MetricsPanel';

describe('MetricsPanel', () => {
  const mockTransactions = [
    {
      date: '2024-01-15',
      transactionType: 'Purchase',
      amount: 10000,
      isAdministrative: false
    },
    {
      date: '2024-02-15',
      transactionType: 'SIP',
      amount: 5000,
      isAdministrative: false
    },
    {
      date: '2024-03-15',
      transactionType: 'Redemption',
      amount: 3000,
      isAdministrative: false
    }
  ];

  const mockPortfolioData = {
    portfolioSummary: [
      { fundName: 'Fund A', marketValue: 15000, costValue: 12000 }
    ]
  };

  describe('Metric Card Rendering', () => {
    test('renders all four metric cards', () => {
      render(
        <MetricsPanel
          transactions={mockTransactions}
          portfolioData={mockPortfolioData}
          darkMode={false}
        />
      );

      expect(screen.getByText('Total Investment')).toBeTruthy();
      expect(screen.getByText('Current Value')).toBeTruthy();
      expect(screen.getByText('Gains/Losses')).toBeTruthy();
      expect(screen.getByText('Return %')).toBeTruthy();
    });

    test('renders metric cards with correct icons', () => {
      render(
        <MetricsPanel
          transactions={mockTransactions}
          portfolioData={mockPortfolioData}
          darkMode={false}
        />
      );

      expect(screen.getByText('💰')).toBeTruthy(); // Total Investment
      expect(screen.getByText('📊')).toBeTruthy(); // Current Value
      expect(screen.getByText('📈')).toBeTruthy(); // Gains/Losses
      expect(screen.getByText('🎯')).toBeTruthy(); // Return %
    });

    test('calculates and displays correct metric values', () => {
      render(
        <MetricsPanel
          transactions={mockTransactions}
          portfolioData={mockPortfolioData}
          darkMode={false}
        />
      );

      // Total Investment = 10000 + 5000 - 3000 = 12000
      expect(screen.getByText(/₹12,000/)).toBeTruthy();
      
      // Current Value = 15000
      expect(screen.getByText(/₹15,000/)).toBeTruthy();
      
      // Gains/Losses = 15000 - 12000 = 3000
      expect(screen.getByText(/₹3,000/)).toBeTruthy();
      
      // Return % = (3000 / 12000) * 100 = 25%
      expect(screen.getByText(/25\.00%/)).toBeTruthy();
    });

    test('handles empty transactions array', () => {
      render(
        <MetricsPanel
          transactions={[]}
          portfolioData={mockPortfolioData}
          darkMode={false}
        />
      );

      expect(screen.getByText('Total Investment')).toBeTruthy();
      expect(screen.getByText('Current Value')).toBeTruthy();
    });

    test('handles null portfolio data', () => {
      render(
        <MetricsPanel
          transactions={mockTransactions}
          portfolioData={null}
          darkMode={false}
        />
      );

      expect(screen.getByText('Total Investment')).toBeTruthy();
      expect(screen.getByText('Current Value')).toBeTruthy();
    });
  });

  describe('Color Coding Logic', () => {
    test('applies positive color for gains', () => {
      const { container } = render(
        <MetricsPanel
          transactions={mockTransactions}
          portfolioData={mockPortfolioData}
          darkMode={false}
        />
      );

      // Gains/Losses card should have positive color
      const positiveCards = container.querySelectorAll('.color-positive');
      expect(positiveCards.length).toBeGreaterThan(0);
    });

    test('applies negative color for losses', () => {
      const lossPortfolio = {
        portfolioSummary: [
          { fundName: 'Fund A', marketValue: 8000, costValue: 12000 }
        ]
      };

      const { container } = render(
        <MetricsPanel
          transactions={mockTransactions}
          portfolioData={lossPortfolio}
          darkMode={false}
        />
      );

      // Gains/Losses card should have negative color
      const negativeCards = container.querySelectorAll('.color-negative');
      expect(negativeCards.length).toBeGreaterThan(0);
    });

    test('applies neutral color for zero gains/losses', () => {
      const neutralPortfolio = {
        portfolioSummary: [
          { fundName: 'Fund A', marketValue: 12000, costValue: 12000 }
        ]
      };

      const { container } = render(
        <MetricsPanel
          transactions={mockTransactions}
          portfolioData={neutralPortfolio}
          darkMode={false}
        />
      );

      // Neutral color cards should exist (Total Investment and Current Value)
      const neutralCards = container.querySelectorAll('.color-neutral');
      expect(neutralCards.length).toBeGreaterThan(0);
    });

    test('applies neutral color to Total Investment and Current Value cards', () => {
      const { container } = render(
        <MetricsPanel
          transactions={mockTransactions}
          portfolioData={mockPortfolioData}
          darkMode={false}
        />
      );

      const neutralCards = container.querySelectorAll('.color-neutral');
      // Should have at least 2 neutral cards (Total Investment and Current Value)
      expect(neutralCards.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Responsive Layout', () => {
    test('renders metrics-grid container', () => {
      const { container } = render(
        <MetricsPanel
          transactions={mockTransactions}
          portfolioData={mockPortfolioData}
          darkMode={false}
        />
      );

      const metricsGrid = container.querySelector('.metrics-grid');
      expect(metricsGrid).toBeTruthy();
    });

    test('renders all metric cards within grid', () => {
      const { container } = render(
        <MetricsPanel
          transactions={mockTransactions}
          portfolioData={mockPortfolioData}
          darkMode={false}
        />
      );

      const metricsGrid = container.querySelector('.metrics-grid');
      const metricCards = metricsGrid.querySelectorAll('.metric-card');
      expect(metricCards.length).toBe(4);
    });

    test('applies correct CSS classes for responsive layout', () => {
      const { container } = render(
        <MetricsPanel
          transactions={mockTransactions}
          portfolioData={mockPortfolioData}
          darkMode={false}
        />
      );

      const metricsPanel = container.querySelector('.metrics-panel');
      expect(metricsPanel).toBeTruthy();
      
      const metricsGrid = container.querySelector('.metrics-grid');
      expect(metricsGrid).toBeTruthy();
    });
  });

  describe('Dark Mode Styling', () => {
    test('applies dark-mode class when darkMode is true', () => {
      const { container } = render(
        <MetricsPanel
          transactions={mockTransactions}
          portfolioData={mockPortfolioData}
          darkMode={true}
        />
      );

      const metricsPanel = container.querySelector('.metrics-panel.dark-mode');
      expect(metricsPanel).toBeTruthy();
    });

    test('does not apply dark-mode class when darkMode is false', () => {
      const { container } = render(
        <MetricsPanel
          transactions={mockTransactions}
          portfolioData={mockPortfolioData}
          darkMode={false}
        />
      );

      const metricsPanel = container.querySelector('.metrics-panel');
      expect(metricsPanel).toBeTruthy();
      expect(metricsPanel.classList.contains('dark-mode')).toBe(false);
    });

    test('passes darkMode prop to all MetricCard components', () => {
      const { container } = render(
        <MetricsPanel
          transactions={mockTransactions}
          portfolioData={mockPortfolioData}
          darkMode={true}
        />
      );

      const darkModeCards = container.querySelectorAll('.metric-card.dark-mode');
      expect(darkModeCards.length).toBe(4);
    });

    test('applies dark-mode to loading state', () => {
      const { container } = render(
        <MetricsPanel
          transactions={[]}
          portfolioData={null}
          darkMode={true}
          loading={true}
        />
      );

      const metricsPanel = container.querySelector('.metrics-panel.dark-mode');
      expect(metricsPanel).toBeTruthy();
      expect(screen.getByText('Loading metrics...')).toBeTruthy();
    });

    test('applies dark-mode to error state', () => {
      const { container } = render(
        <MetricsPanel
          transactions={[]}
          portfolioData={null}
          darkMode={true}
          error="Failed to load metrics"
        />
      );

      const metricsPanel = container.querySelector('.metrics-panel.dark-mode');
      expect(metricsPanel).toBeTruthy();
      expect(screen.getByText('Failed to load metrics')).toBeTruthy();
    });
  });

  describe('Loading and Error States', () => {
    test('displays loading state', () => {
      render(
        <MetricsPanel
          transactions={[]}
          portfolioData={null}
          darkMode={false}
          loading={true}
        />
      );

      expect(screen.getByText('Loading metrics...')).toBeTruthy();
    });

    test('displays error state', () => {
      render(
        <MetricsPanel
          transactions={[]}
          portfolioData={null}
          darkMode={false}
          error="Failed to load metrics"
        />
      );

      expect(screen.getByText('Failed to load metrics')).toBeTruthy();
    });

    test('does not render metric cards when loading', () => {
      const { container } = render(
        <MetricsPanel
          transactions={mockTransactions}
          portfolioData={mockPortfolioData}
          darkMode={false}
          loading={true}
        />
      );

      const metricCards = container.querySelectorAll('.metric-card');
      expect(metricCards.length).toBe(0);
    });

    test('does not render metric cards when error exists', () => {
      const { container } = render(
        <MetricsPanel
          transactions={mockTransactions}
          portfolioData={mockPortfolioData}
          darkMode={false}
          error="Error occurred"
        />
      );

      const metricCards = container.querySelectorAll('.metric-card');
      expect(metricCards.length).toBe(0);
    });
  });
});
