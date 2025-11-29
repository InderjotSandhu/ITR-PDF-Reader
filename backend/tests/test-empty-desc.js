const fs = require('fs');
const path = require('path');
const {extractFundTransactions} = require('./src/extractors/transactionExtractor');
const {extractPortfolioSummary} = require('./src/extractors/portfolioExtractor');

const text = fs.readFileSync('../ITR2/output/output.txt', 'utf8');
const portfolio = extractPortfolioSummary(text);
const data = extractFundTransactions(text, portfolio);

let emptyCount = 0;
data.funds.forEach(f => {
  f.folios.forEach(fo => {
    fo.transactions.forEach(t => {
      if (!t.description || t.description.length === 0) {
        emptyCount++;
        console.log('Empty description found:');
        console.log(JSON.stringify(t, null, 2));
        console.log('---');
      }
    });
  });
});

console.log(`\nTotal transactions with empty descriptions: ${emptyCount}`);
