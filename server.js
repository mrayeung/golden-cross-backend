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
  'Nasdaq': ['NVDA', 'AAPL', 'AMZN', 'META', 'AVGO', 'BRK.B', 'GOOGL', 'GOOG', 'TSLA', 'WMT', 'JPM', 'V', 'LLY', 'NFLX', 'MA', 'ORCL', 'COST', 'XOM', 'PG', 'JNJ', 'HD', 'BAC', 'ABBV', 'KO', 'PM', 'PLTR', 'TMUS', 'GE', 'UNH', 'CSCO', 'CRM', 'IBM', 'WFC', 'CVX', 'ABT', 'LIN', 'MCD', 'INTU', 'NOW', 'MS', 'AXP', 'DIS', 'ISRG', 'T', 'ACN', 'MRK', 'AMD', 'GS', 'RTX', 'VZ', 'BKNG', 'PEP', 'UBER', 'ADBE', 'TXN', 'PGR', 'CAT', 'QCOM', 'SCHW', 'SPGI', 'BA', 'AMGN', 'BLK', 'BSX', 'TMO', 'NEE', 'SYK', 'HON', 'C', 'TJX', 'DE', 'DHR', 'GILD', 'ADP', 'GEV', 'UNP', 'AMAT', 'PFE', 'PANW', 'CMCSA', 'ETN', 'LOW', 'COF', 'ANET', 'MU', 'CB', 'CRWD', 'VRTX', 'MMC', 'LMT', 'APH', 'MDT', 'LRCX', 'ADI', 'COP', 'KKR', 'BX', 'KLAC', 'ICE', 'AMT', 'WELL', 'PLD', 'MO', 'CME', 'SBUX', 'BMY', 'SO', 'TT', 'WM', 'NKE', 'HCA', 'FI', 'CTAS', 'DASH', 'CEG', 'DUK', 'SHW', 'EQIX', 'MCK', 'MCO', 'INTC', 'ELV', 'MDLZ', 'ABNB', 'PH', 'AJG', 'CI', 'UPS', 'TDG', 'CDNS', 'AON', 'CVS', 'FTNT', 'RSG', 'MMM', 'ORLY', 'DELL', 'ECL', 'ZTS', 'SNPS', 'APO', 'WMB', 'RCL', 'GD', 'CL', 'ITW', 'MAR', 'CMG', 'HWM', 'PYPL', 'NOC', 'MSI', 'PNC', 'EMR', 'USB', 'JCI', 'WDAY', 'ADSK', 'BK', 'KMI', 'AZO', 'COIN', 'APD', 'MNST', 'TRV', 'AXON', 'ROP', 'CARR', 'NEM', 'EOG', 'FCX', 'CSX', 'DLR', 'HLT', 'VST', 'PAYX', 'COR', 'NSC', 'AFL', 'ALL', 'AEP', 'CHTR', 'PWR', 'MET', 'PSA', 'SPG', 'NXPI', 'REGN', 'GWW', 'FDX', 'TFC', 'OKE', 'O', 'SRE', 'AIG', 'BDX', 'MPC', 'CTVA', 'PCAR', 'CPRT', 'AMP', 'NDAQ', 'TEL', 'D', 'FAST', 'ROST', 'PSX', 'EW', 'URI', 'GM', 'LHX', 'KMB', 'VRSK', 'SLB', 'CMI', 'KDP', 'KR', 'CCI', 'MSCI', 'GLW', 'EXC', 'FICO', 'TGT', 'FIS', 'TTWO', 'IDXX', 'KVUE', 'LULU', 'OXY', 'HES', 'AME', 'F', 'FANG', 'PEG', 'VLO', 'YUM', 'GRMN', 'XEL', 'CTSH', 'CBRE', 'DHI', 'OTIS', 'EA', 'ED', 'BKR', 'CAH', 'PRU', 'RMD', 'ETR', 'HIG', 'ROK', 'EBAY', 'SYY', 'TRGP', 'ACGL', 'VMC', 'PCG', 'WAB', 'MCHP', 'ODFL', 'DXCM', 'WEC', 'LYV', 'VICI', 'MLM', 'EQT', 'EFX', 'IR', 'CSGP', 'HSY', 'GEHC', 'MPWR', 'CCL', 'IT', 'A', 'DAL', 'EXR', 'BRO', 'KHC', 'XYL', 'NRG', 'WTW', 'STZ', 'IRM', 'GIS', 'ANSS', 'LEN', 'RJF', 'AVB', 'MTB', 'BR', 'VTR', 'K', 'LVS', 'DD', 'ROL', 'WRB', 'DTE', 'STT', 'KEYS', 'EXE', 'HUM', 'NUE', 'AWK', 'CNC', 'TSCO', 'STX', 'UAL', 'VRSN', 'AEE', 'EQR', 'GDDY', 'FITB', 'IQV', 'PPG', 'PPL', 'DRI', 'TPL', 'DG', 'IP', 'TYL', 'VLTO', 'SBAC', 'FTV', 'CHD', 'SMCI', 'DOV', 'EL', 'MTD', 'ATO', 'CNP', 'ES', 'STE', 'WBD', 'FE', 'TDY', 'CINF', 'CPAY', 'HPE', 'CBOE', 'HPQ', 'CDW', 'HBAN', 'ADM', 'SW', 'PODD', 'EXPE', 'SYF', 'NTAP', 'LH', 'NVR', 'ULTA', 'CMS', 'HUBB', 'AMCR', 'NTRS', 'ON', 'EIX', 'WAT', 'TROW', 'PHM', 'DLTR', 'INVH', 'DVN', 'PTC', 'DOW', 'TSN', 'STLD', 'IFF', 'MKC', 'LII', 'WSM', 'DGX', 'WY', 'ERIE', 'WDC', 'RF', 'BIIB', 'CTRA', 'LDOS', 'L', 'GPN', 'JBL', 'LUV', 'NI', 'ZBH', 'GEN', 'ESS', 'LYB', 'FSLR', 'MAA', 'PKG', 'GPC', 'CFG', 'KEY', 'HAL', 'PFG', 'TRMB', 'HRL', 'FFIV', 'SNA', 'RL', 'TPR', 'PNR', 'FDS', 'DECK', 'MOH', 'DPZ', 'WST', 'CLX', 'LNT', 'BAX', 'EXPD', 'J', 'EVRG', 'CF', 'BBY', 'BALL', 'ZBRA', 'PAYC', 'EG', 'APTV', 'COO', 'KIM', 'HOLX', 'AVY', 'TKO', 'JBHT', 'OMC', 'IEX', 'UDR', 'TXT', 'MAS', 'JKHY', 'TER', 'ALGN', 'SOLV', 'INCY', 'REG', 'BF.B', 'BLDR', 'CPT', 'UHS', 'NDSN', 'ARE', 'JNPR', 'ALLE', 'DOC', 'SJM', 'FOX', 'POOL', 'MOS', 'FOXA', 'BEN', 'BXP', 'CHRW', 'AKAM', 'PNW', 'RVTY', 'HST', 'SWKS', 'CAG', 'NWSA', 'TAP', 'DVA', 'AIZ', 'CPB', 'SWK', 'MRNA', 'LKQ', 'KMX', 'VTRS', 'BG', 'EPAM', 'GL', 'WBA', 'DAY', 'HAS', 'AOS', 'EMN', 'HII', 'HSIC', 'WYNN', 'NCLH', 'MGM', 'MKTX', 'IPG', 'FRT', 'PARA', 'LW', 'MTCH', 'TECH', 'AES', 'GNRC', 'CRL', 'ALB', 'APA', 'IVZ', 'MHK', 'NWS', 'ENPH', 'CZR'],
  'DowJones': ["AAPL", "MSFT", "JNJ", "V", "WMT"]
};

// Cached signal data
let cachedSignals = {
  'SP500': {},
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
app.get('/api/indicator', async (req, res) => {
  const index = req.query.index;
  if (!indexSymbols[index]) {
    return res.status(400).json({ error: 'Invalid index' });
  }

  // Run detection fresh on every request
  const freshData = await detectSignal(index);
  cachedSignals[index] = freshData; // optional cache update
  res.json(freshData);
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
