"use client";

import { useState } from 'react';
import OCRUpload from '@/components/OCRUpload';

export default function TestOCRPage() {
  const [ocrResults, setOcrResults] = useState(null);
  const [ocrError, setOcrError] = useState('');

  const handleOCRComplete = (data) => {
    console.log('OCR Results:', data);
    setOcrResults(data);
    setOcrError('');
  };

  const handleOCRError = (error) => {
    console.error('OCR Error:', error);
    setOcrError(error);
    setOcrResults(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🧪 OCR Testing Page
          </h1>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">📋 Test Instructions:</h2>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>DocuClipper Receipt:</strong> Upload any file with "docuclipper" or "test" in filename</li>
              <li>• <strong>Different Receipts:</strong> Upload files with "receipt", "bill", or "invoice" in filename</li>
              <li>• <strong>Real OCR:</strong> Upload any other image file for actual OCR processing</li>
              <li>• <strong>Note:</strong> This is for testing OCR functionality - actual image processing may take time</li>
            </ul>
          </div>

          {/* OCR Upload Component */}
          <div className="mb-8">
            <OCRUpload
              onOCRComplete={handleOCRComplete}
              onError={handleOCRError}
            />
          </div>

          {/* OCR Results */}
          {ocrResults && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-green-900 mb-4">✅ OCR Results:</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-green-800 mb-2">📊 Basic Info:</h3>
                  <div className="text-sm space-y-1 text-green-700">
                    <p><strong>Merchant:</strong> {ocrResults.merchant}</p>
                    <p><strong>Amount:</strong> ₹{ocrResults.amount}</p>
                    <p><strong>Currency:</strong> {ocrResults.currency}</p>
                    <p><strong>Date:</strong> {ocrResults.date}</p>
                    <p><strong>Category:</strong> {ocrResults.category}</p>
                    {ocrResults.receiptNo && <p><strong>Receipt No:</strong> {ocrResults.receiptNo}</p>}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-green-800 mb-2">📝 Items Breakdown:</h3>
                  <div className="text-sm space-y-1 text-green-700">
                    {ocrResults.items && ocrResults.items.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{item.name}</span>
                        <span>₹{item.price}</span>
                      </div>
                    ))}
                    {ocrResults.tax > 0 && (
                      <div className="border-t pt-1 mt-2 flex justify-between font-medium">
                        <span>Tax:</span>
                        <span>₹{ocrResults.tax}</span>
                      </div>
                    )}
                    <div className="border-t pt-1 mt-2 flex justify-between font-bold">
                      <span>Total:</span>
                      <span>₹{ocrResults.total}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-medium text-green-800 mb-2">📄 Description:</h3>
                <p className="text-sm text-green-700 bg-white p-3 rounded border">{ocrResults.description}</p>
              </div>
            </div>
          )}

          {/* OCR Error */}
          {ocrError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-red-900 mb-4">❌ OCR Error:</h2>
              <p className="text-sm text-red-700 whitespace-pre-wrap">{ocrError}</p>
            </div>
          )}

          {/* Sample Files Info */}
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">📁 Sample Filenames for Testing:</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <h3 className="font-medium text-gray-800">Special Cases:</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• docuclipper-receipt.jpg</li>
                  <li>• test-bill.pdf</li>
                  <li>• sample-invoice.png</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-gray-800">Receipt Types:</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• food-receipt.jpg</li>
                  <li>• gas-bill.pdf</li>
                  <li>• hotel-invoice.png</li>
                  <li>• office-receipt.jpg</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-gray-800">Real OCR:</h3>
                <ul className="text-gray-600 space-y-1">
                  <li>• any-image.jpg</li>
                  <li>• my-photo.png</li>
                  <li>• document.pdf</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
