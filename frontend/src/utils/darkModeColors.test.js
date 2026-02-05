/**
 * Unit tests for dark mode functionality
 * Feature: data-visualization-dashboard, Task 12.4
 * Requirements: 11.1, 11.3, 11.4
 */

import {
  darkModeColors,
  lightModeColors,
  getColorPalette,
  getChartColor,
  getSemanticColor,
  calculateContrastRatio,
  verifyContrastCompliance
} from './darkModeColors';

describe('Dark Mode Unit Tests', () => {
  describe('Color scheme application', () => {
    test('getColorPalette returns dark mode colors when darkMode is true', () => {
      const palette = getColorPalette(true);
      expect(palette).toBe(darkModeColors);
      expect(palette.background.primary).toBe('#1a1a2e');
      expect(palette.text.primary).toBe('#e0e0e0');
    });

    test('getColorPalette returns light mode colors when darkMode is false', () => {
      const palette = getColorPalette(false);
      expect(palette).toBe(lightModeColors);
      expect(palette.background.primary).toBe('#ffffff');
      expect(palette.text.primary).toBe('#333333');
    });

    test('dark mode background colors are defined', () => {
      expect(darkModeColors.background.primary).toBeDefined();
      expect(darkModeColors.background.secondary).toBeDefined();
      expect(darkModeColors.background.tertiary).toBeDefined();
      expect(darkModeColors.background.overlay).toBeDefined();
    });

    test('dark mode text colors are defined', () => {
      expect(darkModeColors.text.primary).toBeDefined();
      expect(darkModeColors.text.secondary).toBeDefined();
      expect(darkModeColors.text.tertiary).toBeDefined();
      expect(darkModeColors.text.inverse).toBeDefined();
    });

    test('dark mode chart colors are defined', () => {
      expect(darkModeColors.chart.primary).toBeDefined();
      expect(Array.isArray(darkModeColors.chart.primary)).toBe(true);
      expect(darkModeColors.chart.primary.length).toBeGreaterThan(0);
      expect(darkModeColors.chart.positive).toBeDefined();
      expect(darkModeColors.chart.negative).toBeDefined();
      expect(darkModeColors.chart.neutral).toBeDefined();
    });

    test('dark mode metric colors are defined', () => {
      expect(darkModeColors.metrics.positive).toBeDefined();
      expect(darkModeColors.metrics.negative).toBeDefined();
      expect(darkModeColors.metrics.neutral).toBeDefined();
      expect(darkModeColors.metrics.positive.value).toBeDefined();
      expect(darkModeColors.metrics.positive.border).toBeDefined();
      expect(darkModeColors.metrics.positive.background).toBeDefined();
    });

    test('dark mode interactive colors are defined', () => {
      expect(darkModeColors.interactive.primary).toBeDefined();
      expect(darkModeColors.interactive.primaryHover).toBeDefined();
      expect(darkModeColors.interactive.secondary).toBeDefined();
      expect(darkModeColors.interactive.secondaryHover).toBeDefined();
      expect(darkModeColors.interactive.disabled).toBeDefined();
    });

    test('light mode colors are defined with same structure as dark mode', () => {
      expect(lightModeColors.background).toBeDefined();
      expect(lightModeColors.text).toBeDefined();
      expect(lightModeColors.chart).toBeDefined();
      expect(lightModeColors.metrics).toBeDefined();
      expect(lightModeColors.interactive).toBeDefined();
    });
  });

  describe('Theme toggle transitions', () => {
    test('getChartColor returns different colors for dark and light mode', () => {
      const darkColor = getChartColor(0, true);
      const lightColor = getChartColor(0, false);
      
      expect(darkColor).toBeDefined();
      expect(lightColor).toBeDefined();
      expect(darkColor).not.toBe(lightColor);
    });

    test('getChartColor cycles through palette correctly', () => {
      const darkPalette = darkModeColors.chart.primary;
      const paletteLength = darkPalette.length;
      
      // Test cycling through palette
      for (let i = 0; i < paletteLength * 2; i++) {
        const color = getChartColor(i, true);
        expect(color).toBe(darkPalette[i % paletteLength]);
      }
    });

    test('getSemanticColor returns positive color for positive values', () => {
      const darkPositive = getSemanticColor(100, true);
      const lightPositive = getSemanticColor(100, false);
      
      expect(darkPositive).toBe(darkModeColors.chart.positive);
      expect(lightPositive).toBe(lightModeColors.chart.positive);
    });

    test('getSemanticColor returns negative color for negative values', () => {
      const darkNegative = getSemanticColor(-100, true);
      const lightNegative = getSemanticColor(-100, false);
      
      expect(darkNegative).toBe(darkModeColors.chart.negative);
      expect(lightNegative).toBe(lightModeColors.chart.negative);
    });

    test('getSemanticColor returns neutral color for zero', () => {
      const darkNeutral = getSemanticColor(0, true);
      const lightNeutral = getSemanticColor(0, false);
      
      expect(darkNeutral).toBe(darkModeColors.chart.neutral);
      expect(lightNeutral).toBe(lightModeColors.chart.neutral);
    });

    test('semantic colors are different between dark and light mode', () => {
      expect(darkModeColors.chart.positive).not.toBe(lightModeColors.chart.positive);
      expect(darkModeColors.chart.negative).not.toBe(lightModeColors.chart.negative);
      expect(darkModeColors.chart.neutral).not.toBe(lightModeColors.chart.neutral);
    });

    test('background colors transition between modes', () => {
      const darkBg = darkModeColors.background.primary;
      const lightBg = lightModeColors.background.primary;
      
      expect(darkBg).not.toBe(lightBg);
      expect(darkBg).toMatch(/^#[0-9a-f]{6}$/i);
      expect(lightBg).toMatch(/^#[0-9a-f]{6}$/i);
    });

    test('text colors transition between modes', () => {
      const darkText = darkModeColors.text.primary;
      const lightText = lightModeColors.text.primary;
      
      expect(darkText).not.toBe(lightText);
      expect(darkText).toMatch(/^#[0-9a-f]{6}$/i);
      expect(lightText).toMatch(/^#[0-9a-f]{6}$/i);
    });

    test('metric colors transition between modes', () => {
      expect(darkModeColors.metrics.positive.value).not.toBe(lightModeColors.metrics.positive.value);
      expect(darkModeColors.metrics.negative.value).not.toBe(lightModeColors.metrics.negative.value);
      expect(darkModeColors.metrics.neutral.value).not.toBe(lightModeColors.metrics.neutral.value);
    });

    test('interactive colors transition between modes', () => {
      expect(darkModeColors.interactive.primary).not.toBe(lightModeColors.interactive.primary);
      expect(darkModeColors.interactive.primaryHover).not.toBe(lightModeColors.interactive.primaryHover);
    });
  });

  describe('Contrast ratios (WCAG AA compliance)', () => {
    const WCAG_AA_NORMAL_TEXT = 4.5;
    const WCAG_AA_LARGE_TEXT = 3.0;

    test('calculateContrastRatio returns valid ratio for valid hex colors', () => {
      const ratio = calculateContrastRatio('#ffffff', '#000000');
      expect(ratio).toBeGreaterThan(0);
      expect(ratio).toBeLessThanOrEqual(21); // Maximum possible contrast ratio
    });

    test('calculateContrastRatio handles colors without # prefix', () => {
      const ratio = calculateContrastRatio('ffffff', '000000');
      expect(ratio).toBeGreaterThan(0);
    });

    test('calculateContrastRatio returns 0 for invalid colors', () => {
      const ratio = calculateContrastRatio('invalid', '#000000');
      expect(ratio).toBe(0);
    });

    test('dark mode primary text meets WCAG AA contrast', () => {
      const ratio = calculateContrastRatio(
        darkModeColors.text.primary,
        darkModeColors.background.primary
      );
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    });

    test('dark mode secondary text meets WCAG AA contrast', () => {
      const ratio = calculateContrastRatio(
        darkModeColors.text.secondary,
        darkModeColors.background.primary
      );
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    });

    test('dark mode tertiary text meets WCAG AA contrast', () => {
      const ratio = calculateContrastRatio(
        darkModeColors.text.tertiary,
        darkModeColors.background.primary
      );
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    });

    test('dark mode positive chart color meets WCAG AA contrast', () => {
      const ratio = calculateContrastRatio(
        darkModeColors.chart.positive,
        darkModeColors.background.primary
      );
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    });

    test('dark mode negative chart color meets WCAG AA contrast', () => {
      const ratio = calculateContrastRatio(
        darkModeColors.chart.negative,
        darkModeColors.background.primary
      );
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    });

    test('dark mode neutral chart color meets WCAG AA contrast', () => {
      const ratio = calculateContrastRatio(
        darkModeColors.chart.neutral,
        darkModeColors.background.primary
      );
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    });

    test('all dark mode primary chart colors meet WCAG AA contrast', () => {
      darkModeColors.chart.primary.forEach((color, index) => {
        const ratio = calculateContrastRatio(color, darkModeColors.background.primary);
        expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
      });
    });

    test('dark mode metric positive value meets WCAG AA contrast', () => {
      const ratio = calculateContrastRatio(
        darkModeColors.metrics.positive.value,
        darkModeColors.background.primary
      );
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    });

    test('dark mode metric negative value meets WCAG AA contrast', () => {
      const ratio = calculateContrastRatio(
        darkModeColors.metrics.negative.value,
        darkModeColors.background.primary
      );
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    });

    test('dark mode metric neutral value meets WCAG AA contrast', () => {
      const ratio = calculateContrastRatio(
        darkModeColors.metrics.neutral.value,
        darkModeColors.background.primary
      );
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    });

    test('dark mode axis text meets WCAG AA contrast', () => {
      const ratio = calculateContrastRatio(
        darkModeColors.chart.axis,
        darkModeColors.background.primary
      );
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    });

    test('dark mode interactive primary meets WCAG AA contrast for large text', () => {
      const ratio = calculateContrastRatio(
        darkModeColors.interactive.primary,
        darkModeColors.background.primary
      );
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_LARGE_TEXT);
    });

    test('dark mode status colors meet WCAG AA contrast', () => {
      const statusColors = [
        darkModeColors.status.success,
        darkModeColors.status.warning,
        darkModeColors.status.error,
        darkModeColors.status.info
      ];

      statusColors.forEach((color) => {
        const ratio = calculateContrastRatio(color, darkModeColors.background.primary);
        expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
      });
    });

    test('verifyContrastCompliance returns compliance results for dark mode', () => {
      const compliance = verifyContrastCompliance(true);
      
      expect(compliance).toHaveProperty('results');
      expect(compliance).toHaveProperty('allPass');
      expect(compliance).toHaveProperty('failures');
      
      expect(compliance.results.textPrimary).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
      expect(compliance.results.textSecondary).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
      expect(compliance.results.textTertiary).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
      expect(compliance.results.chartPositive).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
      expect(compliance.results.chartNegative).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
      expect(compliance.results.chartNeutral).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    });

    test('verifyContrastCompliance indicates all colors pass WCAG AA for dark mode', () => {
      const compliance = verifyContrastCompliance(true);
      
      expect(compliance.allPass).toBe(true);
      expect(compliance.failures).toHaveLength(0);
    });

    test('verifyContrastCompliance returns compliance results for light mode', () => {
      const compliance = verifyContrastCompliance(false);
      
      expect(compliance).toHaveProperty('results');
      expect(compliance).toHaveProperty('allPass');
      expect(compliance).toHaveProperty('failures');
    });

    test('contrast ratios are consistent across multiple calculations', () => {
      const color1 = darkModeColors.text.primary;
      const color2 = darkModeColors.background.primary;
      
      const ratio1 = calculateContrastRatio(color1, color2);
      const ratio2 = calculateContrastRatio(color1, color2);
      const ratio3 = calculateContrastRatio(color1, color2);
      
      expect(ratio1).toBe(ratio2);
      expect(ratio2).toBe(ratio3);
    });

    test('contrast ratio is symmetric (order does not matter)', () => {
      const color1 = darkModeColors.text.primary;
      const color2 = darkModeColors.background.primary;
      
      const ratio1 = calculateContrastRatio(color1, color2);
      const ratio2 = calculateContrastRatio(color2, color1);
      
      expect(ratio1).toBe(ratio2);
    });

    test('white on black has maximum contrast ratio', () => {
      const ratio = calculateContrastRatio('#ffffff', '#000000');
      expect(ratio).toBeCloseTo(21, 1);
    });

    test('same color has minimum contrast ratio', () => {
      const ratio = calculateContrastRatio('#888888', '#888888');
      expect(ratio).toBe(1);
    });
  });

  describe('Color format validation', () => {
    test('all dark mode colors are valid hex format', () => {
      const hexRegex = /^#[0-9a-f]{6}$/i;
      
      expect(darkModeColors.background.primary).toMatch(hexRegex);
      expect(darkModeColors.text.primary).toMatch(hexRegex);
      expect(darkModeColors.chart.positive).toMatch(hexRegex);
      expect(darkModeColors.chart.negative).toMatch(hexRegex);
      expect(darkModeColors.chart.neutral).toMatch(hexRegex);
    });

    test('all light mode colors are valid hex format', () => {
      const hexRegex = /^#[0-9a-f]{6}$/i;
      
      expect(lightModeColors.background.primary).toMatch(hexRegex);
      expect(lightModeColors.text.primary).toMatch(hexRegex);
      expect(lightModeColors.chart.positive).toMatch(hexRegex);
      expect(lightModeColors.chart.negative).toMatch(hexRegex);
      expect(lightModeColors.chart.neutral).toMatch(hexRegex);
    });

    test('chart primary colors array contains only valid hex colors', () => {
      const hexRegex = /^#[0-9a-f]{6}$/i;
      
      darkModeColors.chart.primary.forEach((color) => {
        expect(color).toMatch(hexRegex);
      });
      
      lightModeColors.chart.primary.forEach((color) => {
        expect(color).toMatch(hexRegex);
      });
    });
  });

  describe('Color palette completeness', () => {
    test('dark mode and light mode have same color structure', () => {
      const darkKeys = Object.keys(darkModeColors);
      const lightKeys = Object.keys(lightModeColors);
      
      expect(darkKeys.sort()).toEqual(lightKeys.sort());
    });

    test('background colors have all required properties', () => {
      const requiredProps = ['primary', 'secondary', 'tertiary', 'overlay'];
      
      requiredProps.forEach((prop) => {
        expect(darkModeColors.background).toHaveProperty(prop);
        expect(lightModeColors.background).toHaveProperty(prop);
      });
    });

    test('text colors have all required properties', () => {
      const requiredProps = ['primary', 'secondary', 'tertiary', 'inverse'];
      
      requiredProps.forEach((prop) => {
        expect(darkModeColors.text).toHaveProperty(prop);
        expect(lightModeColors.text).toHaveProperty(prop);
      });
    });

    test('chart colors have all required properties', () => {
      const requiredProps = ['primary', 'positive', 'negative', 'neutral', 'grid', 'axis'];
      
      requiredProps.forEach((prop) => {
        expect(darkModeColors.chart).toHaveProperty(prop);
        expect(lightModeColors.chart).toHaveProperty(prop);
      });
    });

    test('metrics colors have all required properties', () => {
      const requiredTypes = ['positive', 'negative', 'neutral'];
      const requiredProps = ['border', 'value', 'background'];
      
      requiredTypes.forEach((type) => {
        expect(darkModeColors.metrics).toHaveProperty(type);
        expect(lightModeColors.metrics).toHaveProperty(type);
        
        requiredProps.forEach((prop) => {
          expect(darkModeColors.metrics[type]).toHaveProperty(prop);
          expect(lightModeColors.metrics[type]).toHaveProperty(prop);
        });
      });
    });

    test('interactive colors have all required properties', () => {
      const requiredProps = ['primary', 'primaryHover', 'secondary', 'secondaryHover', 'disabled'];
      
      requiredProps.forEach((prop) => {
        expect(darkModeColors.interactive).toHaveProperty(prop);
        expect(lightModeColors.interactive).toHaveProperty(prop);
      });
    });

    test('status colors have all required properties', () => {
      const requiredProps = ['success', 'warning', 'error', 'info'];
      
      requiredProps.forEach((prop) => {
        expect(darkModeColors.status).toHaveProperty(prop);
        expect(lightModeColors.status).toHaveProperty(prop);
      });
    });
  });
});
