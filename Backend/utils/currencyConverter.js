const fetch = require('node-fetch');

class CurrencyConverter {
  constructor() {
    this.apiKey = process.env.EXCHANGE_RATE_API_KEY;
    this.baseUrl = 'https://v6.exchangerate-api.com/v6';
    this.cache = new Map();
    this.cacheExpiry = 60 * 60 * 1000; // 1 hour
  }

  async getExchangeRate(fromCurrency, toCurrency) {
    const cacheKey = `${fromCurrency}_${toCurrency}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.rate;
    }

    try {
      if (!this.apiKey) {
        console.warn('Exchange rate API key not configured, using mock rates');
        return this.getMockRate(fromCurrency, toCurrency);
      }

      const response = await fetch(`${this.baseUrl}/${this.apiKey}/latest/${fromCurrency}`);
      
      if (!response.ok) {
        throw new Error(`Exchange rate API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.result !== 'success') {
        throw new Error(`Exchange rate API error: ${data.error}`);
      }

      const rate = data.conversion_rates[toCurrency];
      
      if (!rate) {
        throw new Error(`Currency ${toCurrency} not supported`);
      }

      // Cache the rate
      this.cache.set(cacheKey, {
        rate,
        timestamp: Date.now()
      });

      return rate;
    } catch (error) {
      console.error('Currency conversion error:', error.message);
      // Fallback to mock rate
      return this.getMockRate(fromCurrency, toCurrency);
    }
  }

  getMockRate(fromCurrency, toCurrency) {
    // Mock exchange rates for common currencies
    const mockRates = {
      'USD': { 'EUR': 0.85, 'GBP': 0.73, 'INR': 83.0, 'JPY': 110.0, 'CAD': 1.25, 'AUD': 1.35 },
      'EUR': { 'USD': 1.18, 'GBP': 0.86, 'INR': 97.5, 'JPY': 129.0, 'CAD': 1.47, 'AUD': 1.59 },
      'GBP': { 'USD': 1.37, 'EUR': 1.16, 'INR': 113.5, 'JPY': 150.0, 'CAD': 1.71, 'AUD': 1.85 },
      'INR': { 'USD': 0.012, 'EUR': 0.010, 'GBP': 0.009, 'JPY': 1.33, 'CAD': 0.015, 'AUD': 0.016 },
      'JPY': { 'USD': 0.009, 'EUR': 0.008, 'GBP': 0.007, 'INR': 0.75, 'CAD': 0.011, 'AUD': 0.012 },
      'CAD': { 'USD': 0.80, 'EUR': 0.68, 'GBP': 0.58, 'INR': 66.5, 'JPY': 88.0, 'AUD': 1.08 },
      'AUD': { 'USD': 0.74, 'EUR': 0.63, 'GBP': 0.54, 'INR': 61.5, 'JPY': 81.5, 'CAD': 0.93 }
    };

    if (fromCurrency === toCurrency) {
      return 1.0;
    }

    const rate = mockRates[fromCurrency]?.[toCurrency];
    if (rate) {
      return rate;
    }

    // If no direct rate, try reverse rate
    const reverseRate = mockRates[toCurrency]?.[fromCurrency];
    if (reverseRate) {
      return 1 / reverseRate;
    }

    // Default fallback
    console.warn(`No mock rate found for ${fromCurrency} to ${toCurrency}, using 1.0`);
    return 1.0;
  }

  async convertAmount(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
      return {
        originalAmount: amount,
        convertedAmount: amount,
        exchangeRate: 1.0,
        fromCurrency,
        toCurrency
      };
    }

    const exchangeRate = await this.getExchangeRate(fromCurrency, toCurrency);
    const convertedAmount = parseFloat((amount * exchangeRate).toFixed(2));

    return {
      originalAmount: amount,
      convertedAmount,
      exchangeRate,
      fromCurrency,
      toCurrency
    };
  }

  formatCurrency(amount, currency) {
    const currencySymbols = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'INR': '₹',
      'JPY': '¥',
      'CAD': 'C$',
      'AUD': 'A$'
    };

    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
  }

  formatConversion(originalAmount, originalCurrency, convertedAmount, convertedCurrency) {
    const originalFormatted = this.formatCurrency(originalAmount, originalCurrency);
    const convertedFormatted = this.formatCurrency(convertedAmount, convertedCurrency);
    
    return `${convertedFormatted} (original: ${originalFormatted})`;
  }

  // Get supported currencies
  getSupportedCurrencies() {
    return [
      { code: 'USD', name: 'US Dollar', symbol: '$' },
      { code: 'EUR', name: 'Euro', symbol: '€' },
      { code: 'GBP', name: 'British Pound', symbol: '£' },
      { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
      { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
      { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' }
    ];
  }

  // Validate currency code
  isValidCurrency(currency) {
    const supportedCurrencies = this.getSupportedCurrencies().map(c => c.code);
    return supportedCurrencies.includes(currency.toUpperCase());
  }
}

module.exports = new CurrencyConverter();
