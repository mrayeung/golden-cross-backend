const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// Define symbols per index
const indexSymbols = {
  'SP500': ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA"],
  'Nasdaq': ["AAPL", "MSFT", "GOOGL", "AMZN", "META"],
  'DowJones': ["AAPL", "MSFT", "JNJ", "V", "WMT"]
};

// Cached signal data
let cachedSignals = {
  'S&P': {},
  'Nasdaq': {},
  'DowJones': {}
};

// Generate simulated stock prices
const getStockPrices = async (symbol) => {
  return Array.from({ length: 200 }, () => Math.random() * 100 + 3000);
};

// Simple moving average
const movingAverage = (arr, windowSize) => {
  return arr.map((_, i) =>
    i >= windowSize
      ? arr.slice(i - windowSize, i).reduce((a, b) => a + b, 0) / windowSize
      : null
  );
};

// Signal detection
const detectSignal = async (index) => {
  const symbols = indexSymbols[index];
  const results = [];

  for (const symbol of symbols) {
    const prices = await getStockPrices(symbol);
    const ma50 = movingAverage(prices, 50);
    const ma200 = movingAverage(prices, 200);

    const lastMA50 = ma50[ma50.length - 1];
    const lastMA200 = ma200[ma200.length - 1];

    const signal =
      lastMA50 > lastMA200 ? 'Golden Cross' :
      lastMA50 < lastMA200 ? 'Death Cross' :
      'Neutral';

    results.push({ symbol, signal });
  }

  return {
    signal: results,
    timestamp: new Date().toISOString()
  };
};

// Run detection every hour
cron.schedule('0 * * * *', async () => {
  for (const index in indexSymbols) {
    cachedSignals[index] = await detectSignal(index);
    console.log(`Updated signals for ${index}`);
  }
});

// API endpoint
app.get('/api/indicator', (req, res) => {
  const index = req.query.index;
  if (!cachedSignals[index]) {
    return res.status(400).json({ error: 'Invalid index' });
  }
  res.json(cachedSignals[index]);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
