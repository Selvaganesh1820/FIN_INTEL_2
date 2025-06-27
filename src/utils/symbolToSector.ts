const symbolToSector: Record<string, string> = {
  // Tech Giants
  AAPL: 'Technology', MSFT: 'Technology', GOOGL: 'Technology', AMZN: 'Consumer', META: 'Technology', NFLX: 'Entertainment',
  // AI & Semiconductors
  NVDA: 'Semiconductors', AMD: 'Semiconductors', INTC: 'Semiconductors', TSM: 'Semiconductors', AVGO: 'Semiconductors',
  // Electric Vehicles & Energy
  TSLA: 'Automotive', NIO: 'Automotive', RIVN: 'Automotive', F: 'Automotive', GM: 'Automotive',
  // Finance & Banking
  JPM: 'Finance', BAC: 'Finance', WFC: 'Finance', GS: 'Finance', MS: 'Finance',
  // Healthcare & Biotech
  JNJ: 'Healthcare', PFE: 'Healthcare', UNH: 'Healthcare', ABBV: 'Healthcare', MRK: 'Healthcare',
  // Consumer & Retail
  WMT: 'Retail', HD: 'Retail', PG: 'Consumer', KO: 'Consumer', PEP: 'Consumer',
  // Communication & Media
  DIS: 'Entertainment', CMCSA: 'Media', VZ: 'Telecom', T: 'Telecom',
  // Industrial & Aerospace
  BA: 'Aerospace', CAT: 'Industrial', GE: 'Industrial', LMT: 'Aerospace',
  // Energy & Oil
  XOM: 'Energy', CVX: 'Energy', COP: 'Energy',
  // Real Estate & REITs
  AMT: 'REIT', PLD: 'REIT',
  // Crypto & Fintech
  COIN: 'Fintech', SQ: 'Fintech', PYPL: 'Fintech',
};

export default symbolToSector; 