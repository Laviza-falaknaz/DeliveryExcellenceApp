// Currency formatting utilities

export function formatPrice(amount: number | string, currency: string = 'GBP'): string {
  // Convert to number if string (handles database numeric type which may return as string)
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  const currencySymbols: Record<string, string> = {
    'GBP': '£',
    'USD': '$',
    'EUR': '€',
    'AED': 'AED ',
  };
  
  const symbol = currencySymbols[currency.toUpperCase()] || currency + ' ';
  
  return `${symbol}${numericAmount.toLocaleString('en-GB', { 
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
