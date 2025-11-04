// Currency formatting utilities

export function formatPrice(amountInMinorUnits: number, currency: string = 'GBP'): string {
  // Convert minor units (pence/cents) to major units (pounds/dollars)
  const amount = amountInMinorUnits / 100;
  
  const currencySymbols: Record<string, string> = {
    'GBP': '£',
    'USD': '$',
    'EUR': '€',
    'AED': 'AED ',
  };
  
  const symbol = currencySymbols[currency.toUpperCase()] || currency + ' ';
  
  return `${symbol}${amount.toLocaleString('en-GB', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  })}`;
}

export function getCurrencySymbol(currency: string): string {
  const currencySymbols: Record<string, string> = {
    'GBP': '£',
    'USD': '$',
    'EUR': '€',
    'AED': 'AED',
  };
  
  return currencySymbols[currency.toUpperCase()] || currency;
}
