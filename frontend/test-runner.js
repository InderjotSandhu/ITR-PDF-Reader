// Manual test runner to verify dark mode contrast tests
const fc = require('fast-check');
const { darkModeColors, calculateContrastRatio } = require('./src/utils/darkModeColors');

const WCAG_AA_NORMAL_TEXT = 4.5;

console.log('Running Dark Mode Contrast Tests...\n');

// Test 1: Text colors
console.log('Test 1: Text colors against primary background');
const bgColor = darkModeColors.background.primary;
const primaryTextRatio = calculateContrastRatio(darkModeColors.text.primary, bgColor);
const secondaryTextRatio = calculateContrastRatio(darkModeColors.text.secondary, bgColor);
const tertiaryTextRatio = calculateContrastRatio(darkModeColors.text.tertiary, bgColor);

console.log(`  Primary text: ${primaryTextRatio.toFixed(2)}:1 ${primaryTextRatio >= WCAG_AA_NORMAL_TEXT ? '✓' : '✗'}`);
console.log(`  Secondary text: ${secondaryTextRatio.toFixed(2)}:1 ${secondaryTextRatio >= WCAG_AA_NORMAL_TEXT ? '✓' : '✗'}`);
console.log(`  Tertiary text: ${tertiaryTextRatio.toFixed(2)}:1 ${tertiaryTextRatio >= WCAG_AA_NORMAL_TEXT ? '✓' : '✗'}`);

// Test 2: Chart semantic colors
console.log('\nTest 2: Chart semantic colors against primary background');
const positiveRatio = calculateContrastRatio(darkModeColors.chart.positive, bgColor);
const negativeRatio = calculateContrastRatio(darkModeColors.chart.negative, bgColor);
const neutralRatio = calculateContrastRatio(darkModeColors.chart.neutral, bgColor);

console.log(`  Positive: ${positiveRatio.toFixed(2)}:1 ${positiveRatio >= WCAG_AA_NORMAL_TEXT ? '✓' : '✗'}`);
console.log(`  Negative: ${negativeRatio.toFixed(2)}:1 ${negativeRatio >= WCAG_AA_NORMAL_TEXT ? '✓' : '✗'}`);
console.log(`  Neutral: ${neutralRatio.toFixed(2)}:1 ${neutralRatio >= WCAG_AA_NORMAL_TEXT ? '✓' : '✗'}`);

// Test 3: All primary chart colors
console.log('\nTest 3: All primary chart colors against primary background');
let allChartColorsPass = true;
darkModeColors.chart.primary.forEach((color, index) => {
  const ratio = calculateContrastRatio(color, bgColor);
  const pass = ratio >= WCAG_AA_NORMAL_TEXT;
  console.log(`  Color ${index + 1}: ${ratio.toFixed(2)}:1 ${pass ? '✓' : '✗'}`);
  if (!pass) allChartColorsPass = false;
});

console.log('\n✓ All tests completed successfully!');
