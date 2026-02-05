import React from 'react';
import { render, screen } from '@testing-library/react';
import MetricCard from './MetricCard';

describe('MetricCard', () => {
  test('renders metric card with currency format', () => {
    render(
      <MetricCard
        label="Total Investment"
        value={100000}
        icon="💰"
        format="currency"
        colorType="neutral"
        darkMode={false}
      />
    );

    expect(screen.getByText('Total Investment')).toBeTruthy();
    expect(screen.getByText('💰')).toBeTruthy();
    expect(screen.getByText(/₹1,00,000/)).toBeTruthy();
  });

  test('renders metric card with percentage format', () => {
    render(
      <MetricCard
        label="Return %"
        value={15.5}
        icon="🎯"
        format="percentage"
        colorType="positive"
        darkMode={false}
      />
    );

    expect(screen.getByText('Return %')).toBeTruthy();
    expect(screen.getByText('15.50%')).toBeTruthy();
  });

  test('applies correct color class for positive value', () => {
    const { container } = render(
      <MetricCard
        label="Gains"
        value={5000}
        icon="📈"
        format="currency"
        colorType="auto"
        darkMode={false}
      />
    );

    expect(container.querySelector('.color-positive')).toBeTruthy();
  });

  test('applies correct color class for negative value', () => {
    const { container } = render(
      <MetricCard
        label="Losses"
        value={-5000}
        icon="📉"
        format="currency"
        colorType="auto"
        darkMode={false}
      />
    );

    expect(container.querySelector('.color-negative')).toBeTruthy();
  });
});
