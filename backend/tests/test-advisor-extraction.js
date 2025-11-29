// Test advisor extraction patterns

const testCases = [
  {
    isinLine: "G357-Scheme Name - ISIN: INF123456789 (Advisor: ARN-123456) Registrar : CAMS",
    expected: "ARN-123456"
  },
  {
    isinLine: "G357-Scheme Name - ISIN: INF123456789 Advisor: ARN-123456 Registrar : CAMS",
    expected: "ARN-123456"
  },
  {
    isinLine: "G357-Scheme Name - ISIN: INF123456789 (Advisor: DIRECT) Registrar : CAMS",
    expected: "DIRECT"
  },
  {
    isinLine: "G357-Scheme Name - ISIN: INF123456789 Advisor: DIRECT Registrar : CAMS",
    expected: "DIRECT"
  },
  {
    isinLine: "G357-Scheme Name - ISIN: INF123456789 Registrar : CAMS",
    expected: null
  }
];

// Test pattern
const pattern = /(?:\()?Advisor[:\s]+([A-Z0-9]+-?[A-Z0-9]*)(?:\))?/;

console.log('Testing Advisor Extraction Pattern\n');
console.log('Pattern:', pattern.toString(), '\n');

testCases.forEach((testCase, index) => {
  const match = testCase.isinLine.match(pattern);
  const result = match ? match[1] : null;
  const passed = result === testCase.expected;
  
  console.log(`Test ${index + 1}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Input: ${testCase.isinLine}`);
  console.log(`  Expected: ${testCase.expected}`);
  console.log(`  Got: ${result}`);
  console.log('');
});
