'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { Upload, FileText, X, Loader2, Camera, DollarSign, Calendar, Tag, FileImage } from 'lucide-react';
import { expenseAPI } from '@/lib/api';
import { ocrService } from '@/utils/ocr';
import { format } from 'date-fns';

const ExpenseForm = ({ onExpenseSubmitted, categories = [] }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [ocrData, setOcrData] = useState(null);
  const [showOCRPreview, setShowOCRPreview] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm();

  const watchedValues = watch();

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF) or PDF');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploadedFile(file);
    setIsProcessingOCR(true);

    try {
      // Process OCR for image files only
      if (file.type.startsWith('image/')) {
        const extractedData = await ocrService.extractTextFromImage(file);
        const formattedData = ocrService.formatForForm(extractedData);
        
        // Validate extracted data
        const validation = ocrService.validateExtractedData(extractedData);
        
        if (validation.isValid) {
          setOcrData(formattedData);
          setShowOCRPreview(true);
          
          // Auto-fill form with extracted data
          setValue('amount', formattedData.amount);
          setValue('currency', formattedData.currency);
          setValue('category', formattedData.category);
          setValue('description', formattedData.description);
          setValue('expenseDate', formattedData.expenseDate);
          
          toast.success('Receipt processed successfully! Please review the extracted information.');
        } else {
          toast.warning('OCR processing completed but some data could not be extracted. Please fill in manually.');
          setOcrData(formattedData);
          setShowOCRPreview(true);
        }
      } else {
        toast.info('PDF uploaded successfully. Please fill in the expense details manually.');
      }
    } catch (error) {
      console.error('OCR processing failed:', error);
      toast.error('Failed to process receipt. Please fill in the details manually.');
    } finally {
      setIsProcessingOCR(false);
    }
  }, [setValue]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      const expenseData = {
        amount: parseFloat(data.amount),
        currency: data.currency,
        category: data.category,
        description: data.description,
        expenseDate: data.expenseDate
      };

      const response = await expenseAPI.submitExpense(expenseData, uploadedFile);
      
      if (response.success) {
        toast.success('Expense submitted successfully!');
        reset();
        setUploadedFile(null);
        setOcrData(null);
        setShowOCRPreview(false);
        onExpenseSubmitted?.(response.data.expense);
      }
    } catch (error) {
      console.error('Error submitting expense:', error);
      toast.error(error.message || 'Failed to submit expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setOcrData(null);
    setShowOCRPreview(false);
  };

  const applyOCRData = () => {
    if (ocrData) {
      setValue('amount', ocrData.amount);
      setValue('currency', ocrData.currency);
      setValue('category', ocrData.category);
      setValue('description', ocrData.description);
      setValue('expenseDate', ocrData.expenseDate);
      setShowOCRPreview(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Submit New Expense</h2>
        <p className="text-gray-600">Upload a receipt and fill in the expense details</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* File Upload Section */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Receipt Upload
          </label>
          
          {!uploadedFile ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center space-y-4">
                {isProcessingOCR ? (
                  <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                ) : (
                  <Upload className="h-12 w-12 text-gray-400" />
                )}
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {isProcessingOCR ? 'Processing receipt...' : 'Drop your receipt here'}
                  </p>
                  <p className="text-sm text-gray-500">
                    or click to browse files
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Supports JPEG, PNG, GIF, PDF (max 5MB)
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileImage className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* OCR Preview */}
        {showOCRPreview && ocrData && (
          <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-blue-900">Extracted Information</h3>
              <button
                type="button"
                onClick={() => setShowOCRPreview(false)}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Amount:</span> {ocrData.amount}
              </div>
              <div>
                <span className="font-medium">Currency:</span> {ocrData.currency}
              </div>
              <div>
                <span className="font-medium">Category:</span> {ocrData.category}
              </div>
              <div>
                <span className="font-medium">Date:</span> {ocrData.expenseDate}
              </div>
              <div className="col-span-2">
                <span className="font-medium">Description:</span> {ocrData.description}
              </div>
            </div>
            <button
              type="button"
              onClick={applyOCRData}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Apply to Form
            </button>
          </div>
        )}

        {/* Expense Details Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Amount *
            </label>
            <input
              type="number"
              step="0.01"
              {...register('amount', { required: 'Amount is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency *
            </label>
            <select
              {...register('currency', { required: 'Currency is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="INR">INR - Indian Rupee</option>
              <option value="JPY">JPY - Japanese Yen</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="AUD">AUD - Australian Dollar</option>
            </select>
            {errors.currency && (
              <p className="mt-1 text-sm text-red-600">{errors.currency.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="inline h-4 w-4 mr-1" />
              Category *
            </label>
            <select
              {...register('category', { required: 'Category is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          {/* Expense Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Expense Date *
            </label>
            <input
              type="date"
              {...register('expenseDate', { required: 'Expense date is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
            {errors.expenseDate && (
              <p className="mt-1 text-sm text-red-600">{errors.expenseDate.message}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="inline h-4 w-4 mr-1" />
            Description *
          </label>
          <textarea
            {...register('description', { required: 'Description is required' })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the expense..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              reset();
              removeFile();
            }}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Clear Form
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{isSubmitting ? 'Submitting...' : 'Submit Expense'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
