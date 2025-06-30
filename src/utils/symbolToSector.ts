const symbolToSector: Record<string, string> = {
  // Tech Giants
  AAPL: 'Technology', 
  MSFT: 'Technology', 
  GOOGL: 'Technology', 
  AMZN: 'Consumer', 
  META: 'Technology',
  // AI & Semiconductors
  NVDA: 'Semiconductors',
  // Electric Vehicles
  TSLA: 'Automotive',
  // Finance & Banking
  JPM: 'Finance',
  // Healthcare & Biotech
  JNJ: 'Healthcare',
  // Finance & Payments
  V: 'Finance'
};

export const symbolToLogo: Record<string, string> = {
  'Bharat Dynamics': 'https://companieslogo.com/img/orig/BHARATDYNAMICS.NS_BIG-7e2e2e2e.png',
  'Bharat Elec': 'https://companieslogo.com/img/orig/BEL.NS_BIG-7e2e2e2e.png',
  'BPCL': 'https://companieslogo.com/img/orig/BPCL.NS_BIG-7e2e2e2e.png',
  'Brigade Ent': 'https://companieslogo.com/img/orig/BRIGADE.NS_BIG-7e2e2e2e.png',
  'C. E. Info Syst': 'https://companieslogo.com/img/orig/MAPMYINDIA.NS_BIG-7e2e2e2e.png',
  'CAMS': 'https://companieslogo.com/img/orig/CAMS.NS_BIG-7e2e2e2e.png',
  'CESC': 'https://companieslogo.com/img/orig/CESC.NS_BIG-7e2e2e2e.png',
  // Add more as needed
};

export function getLogoUrl(symbol: string) {
  if (symbolToLogo[symbol]) return symbolToLogo[symbol];

  // US/global stocks by symbol
  const symbolToDomain: Record<string, string> = {
    AAPL: 'apple.com',
    MSFT: 'microsoft.com',
    GOOGL: 'google.com',
    AMZN: 'amazon.com',
    TSLA: 'tesla.com',
    NVDA: 'nvidia.com',
    META: 'meta.com',
    JPM: 'jpmorganchase.com',
    JNJ: 'jnj.com',
    V: 'visa.com',
    // Add more as needed
  };
  if (symbolToDomain[symbol]) {
    return `https://logo.clearbit.com/${symbolToDomain[symbol]}`;
  }

  // fallback
  return 'https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg?auto=compress&cs=tinysrgb&w=600';
}

export default symbolToSector; 