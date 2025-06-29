// server.js
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// Predefined stock symbols for each index
const indexSymbols = {
  'S&P': ["AAPL", "MSFT", "GOOGL", "AMZN", "NVDA"],
  'Nasdaq': ["AAPL", "MSFT", "GOOGL", "AMZN", "META"],
  'DowJones': ["AAPL", "MSFT", "JNJ", "V", "WMT"]
};

// Cache for storing signals
let cachedSignals = {
  'S&P': {},
  'Nasdaq': {},
  'DowJones': {}
};

// Simulate 200 historical stock prices
const getStockPrices = async (symbol) => {
  return Array.from({ length: 200 }, () => Math.random() * 100 + 3000);
};

// Simple moving average
const movingAverage = (arr, windowSize) =>
  arr.map((_, i) =>
    i >= windowSize
      ? arr.slice(i - windowSize, i).reduce((a, b) => a + b) / windowSize
      : null
  );

// Determine cross signals
const detectSignal = async (index) => {
  const symbols = indexSymbols[index];
  const results = [];

  for (const symbol of symbols) {
    const prices = await getStockPrices(symbol);
    const ma50 = movingAverage(prices, 50);
    const ma200 = movingAverage(prices, 200);
    const lastMA50 = ma50[ma50.length - 1];
    const lastMA200 =
