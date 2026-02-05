import * as fc from 'fast-check';
import { darkModeColors, calculateContrastRatio } from './darkModeColors';

const WCAG_AA_NORMAL_TEXT = 4.5;
const WCAG_AA_LARGE_TEXT = 3.0;

describe('Property 14: Dark Mode Contrast', () => {
  test('text colors meet WCAG AA contrast against primary background', () => {
    const bgColor = darkModeColors.background.primary;
    
    const primaryTextRatio = calculateContrastRatio(darkModeColors.text.primary, bgColor);
    expect(primaryTextRatio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    
    const secondaryTextRatio = calculateContrastRatio(darkModeColors.text.secondary, bgColor);
    expect(secondaryTextRatio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    
    const tertiaryTextRatio = calculateContrastRatio(darkModeColors.text.tertiary, bgColor);
    expect(tertiaryTextRatio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
  });

  test('chart semantic colors meet WCAG AA contrast against primary background', () => {
    const bgColor = darkModeColors.background.primary;
    
    const positiveRatio = calculateContrastRatio(darkModeColors.chart.positive, bgColor);
    expect(positiveRatio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    
    const negativeRatio = calculateContrastRatio(darkModeColors.chart.negative, bgColor);
    expect(negativeRatio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    
    const neutralRatio = calculateContrastRatio(darkModeColors.chart.neutral, bgColor);
    expect(neutralRatio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
  });

  test('chart axis colors meet WCAG AA contrast against primary background', () => {
    const bgColor = darkModeColors.background.primary;
    const axisRatio = calculateContrastRatio(darkModeColors.chart.axis, bgColor);
    expect(axisRatio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
  });

  test('all primary chart colors meet WCAG AA contrast against primary background', () => {
    const bgColor = darkModeColors.background.primary;
    darkModeColors.chart.primary.forEach((color) => {
      const ratio = calculateContrastRatio(color, bgColor);
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    });
  });

  test('metric card colors meet WCAG AA contrast against primary background', () => {
    const bgColor = darkModeColors.background.primary;
    
    const positiveValueRatio = calculateContrastRatio(darkModeColors.metrics.positive.value, bgColor);
    expect(positiveValueRatio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    
    const negativeValueRatio = calculateContrastRatio(darkModeColors.metrics.negative.value, bgColor);
    expect(negativeValueRatio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    
    const neutralValueRatio = calculateContrastRatio(darkModeColors.metrics.neutral.value, bgColor);
    expect(neutralValueRatio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
  });

  test('tooltip text meets WCAG AA contrast against tooltip background', () => {
    const tooltipBg = '#2a2a4a';
    const tooltipTextRatio = calculateContrastRatio(darkModeColors.chart.tooltipText, tooltipBg);
    expect(tooltipTextRatio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
  });

  test('interactive element colors meet WCAG AA contrast against primary background', () => {
    const bgColor = darkModeColors.background.primary;
    
    const primaryRatio = calculateContrastRatio(darkModeColors.interactive.primary, bgColor);
    expect(primaryRatio).toBeGreaterThanOrEqual(WCAG_AA_LARGE_TEXT);
    
    const primaryHoverRatio = calculateContrastRatio(darkModeColors.interactive.primaryHover, bgColor);
    expect(primaryHoverRatio).toBeGreaterThanOrEqual(WCAG_AA_LARGE_TEXT);
  });

  test('status colors meet WCAG AA contrast against primary background', () => {
    const bgColor = darkModeColors.background.primary;
    
    const successRatio = calculateContrastRatio(darkModeColors.status.success, bgColor);
    expect(successRatio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    
    const warningRatio = calculateContrastRatio(darkModeColors.status.warning, bgColor);
    expect(warningRatio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    
    const errorRatio = calculateContrastRatio(darkModeColors.status.error, bgColor);
    expect(errorRatio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    
    const infoRatio = calculateContrastRatio(darkModeColors.status.info, bgColor);
    expect(infoRatio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
  });

  test('property: primary and secondary text colors maintain WCAG AA contrast against primary and secondary backgrounds', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          darkModeColors.background.primary,
          darkModeColors.background.secondary
        ),
        fc.constantFrom(
          darkModeColors.text.primary,
          darkModeColors.text.secondary
        ),
        (bgColor, textColor) => {
          const ratio = calculateContrastRatio(textColor, bgColor);
          return ratio >= WCAG_AA_NORMAL_TEXT;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('property: all chart colors maintain WCAG AA contrast against primary background', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...darkModeColors.chart.primary),
        (chartColor) => {
          const ratio = calculateContrastRatio(chartColor, darkModeColors.background.primary);
          return ratio >= WCAG_AA_NORMAL_TEXT;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('property: semantic colors maintain WCAG AA contrast against primary and secondary backgrounds', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          darkModeColors.background.primary,
          darkModeColors.background.secondary
        ),
        fc.constantFrom(
          darkModeColors.chart.positive,
          darkModeColors.chart.negative,
          darkModeColors.chart.neutral
        ),
        (bgColor, semanticColor) => {
          const ratio = calculateContrastRatio(semanticColor, bgColor);
          return ratio >= WCAG_AA_NORMAL_TEXT;
        }
      ),
      { numRuns: 100 }
    );
  });
});
