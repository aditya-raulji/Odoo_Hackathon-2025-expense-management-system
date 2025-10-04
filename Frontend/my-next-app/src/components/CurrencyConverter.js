"use client";

import { useState, useEffect } from 'react';
import { ocrService } from '@/services/ocrService';

export default function CurrencyConverter({ 
  amount, 
  fromCurrency, 
  onCurrencyChange, 
  onAmountChange 
}) {
  const [currencies, setCurrencies] = useState([]);
  const [toCurrency, setToCurrency] = useState('INR');
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [isConverting, setIsConverting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadCurrencies();
  }, []);

  useEffect(() => {
    if (amount && fromCurrency && toCurrency) {
      convertCurrency();
    }
  }, [amount, fromCurrency, toCurrency]);

  const loadCurrencies = async () => {
    try {
      const currencyList = await ocrService.getCountriesAndCurrencies();
      setCurrencies(currencyList);
    } catch (error) {
      console.error('Failed to load currencies:', error);
    }
  };

  const convertCurrency = async () => {
    if (!amount || fromCurrency === toCurrency) {
      setConvertedAmount(amount);
      setExchangeRate(1);
      return;
    }

    setIsConverting(true);
    try {
      const converted = await ocrService.convertCurrency(amount, fromCurrency, toCurrency);
      const rate = converted / amount;
      
      setConvertedAmount(converted);
      setExchangeRate(rate);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Currency conversion failed:', error);
      setConvertedAmount(amount);
      setExchangeRate(1);
    } finally {
      setIsConverting(false);
    }
  };

  const handleCurrencyChange = (newCurrency) => {
    setToCurrency(newCurrency);
    onCurrencyChange?.(newCurrency);
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getCurrencySymbol = (currencyCode) => {
    const currency = currencies.find(c => c.code === currencyCode);
    return currency?.symbol || currencyCode;
  };

  return (
    <div className="space-y-4">
      {/* Currency Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Convert to Currency
        </label>
        <select
          value={toCurrency}
          onChange={(e) => handleCurrencyChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {currencies.map(currency => (
            <option key={currency.code} value={currency.code}>
              {currency.symbol} {currency.name} ({currency.code})
            </option>
          ))}
        </select>
      </div>

      {/* Conversion Display */}
      {amount && fromCurrency && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Original Amount:</span>
            <span className="font-medium">
              {formatCurrency(amount, fromCurrency)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Converted Amount:</span>
            <span className="font-medium text-blue-600">
              {isConverting ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Converting...</span>
                </div>
              ) : (
                formatCurrency(convertedAmount, toCurrency)
              )}
            </span>
          </div>

          {exchangeRate !== 1 && (
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Exchange Rate:</span>
              <span>1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}</span>
            </div>
          )}

          {lastUpdated && (
            <div className="text-xs text-gray-400 text-center">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      )}

      {/* Conversion Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💱 Currency Conversion</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Real-time exchange rates from ExchangeRate-API</li>
          <li>• Automatic conversion to company base currency</li>
          <li>• Rates updated every hour</li>
          <li>• Supports 160+ currencies worldwide</li>
        </ul>
      </div>
    </div>
  );
}
