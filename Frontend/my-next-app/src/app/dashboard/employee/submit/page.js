"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { expenseAPI } from '@/lib/api';
import EmployeeHeader from '@/components/EmployeeHeader';
import EmployeeNavigation from '@/components/EmployeeNavigation';
import OCRUpload from '@/components/OCRUpload';
import CurrencyConverter from '@/components/CurrencyConverter';

export default function SubmitExpensePage() {
  const [formData, setFormData] = useState({
    description: '',
    expenseDate: '',
    category: '',
    paidBy: '',
    amount: '',
    currency: 'INR',
    remarks: '',
    receipt: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showOCR, setShowOCR] = useState(false);
  const [ocrError, setOcrError] = useState('');
  const [convertedAmount, setConvertedAmount] = useState(0);

  const router = useRouter();
  const { user, company, logout } = useAuth();

  const categories = [
    'Food',
    'Transportation',
    'Office Supplies',
    'Travel',
    'Training',
    'Entertainment',
    'Other'
  ];

  const currencies = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.expenseDate) {
      newErrors.expenseDate = 'Expense date is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.paidBy.trim()) {
      newErrors.paidBy = 'Paid by field is required';
    }

    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }

    if (!formData.receipt) {
      newErrors.receipt = 'Receipt is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        receipt: file
      }));
      
      if (errors.receipt) {
        setErrors(prev => ({
          ...prev,
          receipt: ''
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Submit expense to backend API
      const response = await expenseAPI.submitExpense({
        description: formData.description,
        expenseDate: formData.expenseDate,
        category: formData.category,
        paidBy: formData.paidBy,
        amount: formData.amount,
        currency: formData.currency,
        remarks: formData.remarks,
        receipt: formData.receipt
      });

      console.log('Expense submitted successfully:', response.data);
      setShowSuccess(true);

      // Reset form after success
      setTimeout(() => {
        setFormData({
          description: '',
          expenseDate: '',
          category: '',
          paidBy: '',
          amount: '',
          currency: 'INR',
          remarks: '',
          receipt: null
        });
        setShowSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Expense submission error:', error);
      setErrors({ 
        submit: error.message || 'Failed to submit expense. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOCRUpload = () => {
    setShowOCR(true);
    setOcrError('');
  };

  const handleOCRComplete = (ocrData) => {
    console.log('OCR Data received:', ocrData);
    
    // Auto-fill form with OCR data
    setFormData(prev => ({
      ...prev,
      description: ocrData.description || prev.description,
      expenseDate: ocrData.date || prev.expenseDate,
      category: ocrData.category || prev.category,
      paidBy: user?.name || prev.paidBy,
      amount: ocrData.amount?.toString() || prev.amount,
      currency: ocrData.currency || prev.currency,
      remarks: `Merchant: ${ocrData.merchant}${ocrData.items ? `\nItems: ${ocrData.items.map(item => item.name).join(', ')}` : ''}` || prev.remarks
    }));

    setShowOCR(false);
    setOcrError('');
  };

  const handleOCRError = (error) => {
    setOcrError(error);
    setShowOCR(false);
  };

  const handleCurrencyChange = (newCurrency) => {
    setFormData(prev => ({
      ...prev,
      currency: newCurrency
    }));
  };

  const handleAmountChange = (newAmount) => {
    setFormData(prev => ({
      ...prev,
      amount: newAmount
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <EmployeeHeader
        title="Employee Dashboard"
        subtitle={company?.name || 'Company Name'}
        userName={user?.name || 'Employee'}
        onLogout={logout}
      />
      
      {/* Navigation */}
      <EmployeeNavigation />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Form */}
          <div className="bg-white rounded-xl shadow-lg animate-scale-in">
            {/* Form Header */}
            <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Submit New Expense</h2>
                  <p className="text-sm text-gray-600">Fill in the details below to submit your expense</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Auto-save</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter expense description"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Expense Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expense Date *
                </label>
                <input
                  type="date"
                  name="expenseDate"
                  value={formData.expenseDate}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.expenseDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.expenseDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.expenseDate}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.category ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              {/* Paid By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paid By *
                </label>
                <input
                  type="text"
                  name="paidBy"
                  value={formData.paidBy}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.paidBy ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Who paid for this expense"
                />
                {errors.paidBy && (
                  <p className="mt-1 text-sm text-red-600">{errors.paidBy}</p>
                )}
              </div>

              {/* Amount and Currency */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount *
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.amount ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {currencies.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks
                </label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes or remarks"
                />
              </div>

              {/* Receipt Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Receipt *
                </label>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className={`hidden ${errors.receipt ? 'border-red-300' : 'border-gray-300'}`}
                      id="receipt-upload"
                    />
                    <label
                      htmlFor="receipt-upload"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span className="text-sm text-gray-600">
                          {formData.receipt ? formData.receipt.name : 'Choose file or drag and drop'}
                        </span>
                      </div>
                    </label>
                    <button
                      type="button"
                      onClick={handleOCRUpload}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg"
                    >
                      📷 OCR Scan
                    </button>
                  </div>
                  {errors.receipt && (
                    <p className="text-sm text-red-600">{errors.receipt}</p>
                  )}
                  {ocrError && (
                    <p className="text-sm text-red-600">{ocrError}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-md hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    'Submit Expense'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Side - Info & Timeline */}
          <div className="space-y-6">
            {/* OCR Upload Modal */}
            {showOCR && (
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">📷 OCR Receipt Scanner</h3>
                  <button
                    onClick={() => setShowOCR(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <OCRUpload
                  onOCRComplete={handleOCRComplete}
                  onError={handleOCRError}
                />
              </div>
            )}

            {/* Currency Converter */}
            {formData.amount && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <CurrencyConverter
                  amount={parseFloat(formData.amount) || 0}
                  fromCurrency={formData.currency}
                  onCurrencyChange={handleCurrencyChange}
                  onAmountChange={handleAmountChange}
                />
              </div>
            )}

            {/* Status Timeline */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Submission Status</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Draft</p>
                    <p className="text-xs text-gray-500">Expense created but not submitted</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-yellow-600">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Waiting Approval</p>
                    <p className="text-xs text-gray-500">Submitted and pending manager review</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-green-600">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Approved</p>
                    <p className="text-xs text-gray-500">Expense approved by manager</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Message */}
            {showSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-green-800">Expense Submitted Successfully!</h3>
                    <p className="text-sm text-green-600">Your expense has been submitted for approval.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-4">💡 Tips</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Upload clear, readable receipts</li>
                <li>• Use OCR feature for quick data entry</li>
                <li>• Submit expenses within 30 days</li>
                <li>• Include detailed descriptions</li>
                <li>• Currency conversion is automatic</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
