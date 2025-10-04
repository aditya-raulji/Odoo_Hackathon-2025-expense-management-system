"use client";

import { useState, useRef } from 'react';
import { ocrService } from '@/services/ocrService';

export default function OCRUpload({ onOCRComplete, onError }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [progress, setProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('');
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      onError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      onError('File size must be less than 10MB');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setProcessingStage('Uploading image...');
    setPreviewImage(URL.createObjectURL(file));

    try {
      setProcessingStage('Extracting text with OCR...');
      setProgress(30);
      
      // Extract text from image
      const text = await ocrService.extractTextFromImage(file);
      setExtractedText(text);
      setProgress(70);

      setProcessingStage('Processing receipt data...');
      // Process with OCR service
      const result = await ocrService.processReceipt(file);
      
      setProgress(100);
      setProcessingStage('Complete!');
      
      if (result.success) {
        onOCRComplete(result.data);
      } else {
        // Show more detailed error message including extracted text
        const errorMessage = result.error || 'Failed to process receipt';
        const detailedError = result.extractedText ? 
          `${errorMessage}\n\nExtracted Text Preview:\n${result.extractedText.substring(0, 200)}...` : 
          errorMessage;
        onError(detailedError);
      }
    } catch (error) {
      console.error('OCR processing error:', error);
      onError('Failed to process receipt. Please try again.');
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setProgress(0);
        setProcessingStage('');
      }, 2000);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleCameraCapture = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const resetOCR = () => {
    setPreviewImage(null);
    setExtractedText('');
    setIsProcessing(false);
    setProgress(0);
    setProcessingStage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {previewImage ? (
          <div className="space-y-4">
            <img
              src={previewImage}
              alt="Receipt preview"
              className="mx-auto max-h-64 rounded-lg shadow-md"
            />
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Receipt uploaded successfully!</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resetOCR();
                }}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Remove & Try Again
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div>
              <p className="text-lg font-medium text-gray-900">Upload Receipt</p>
              <p className="text-sm text-gray-500">Drag and drop or click to select</p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraCapture}
        className="hidden"
      />

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Choose File
        </button>
        
        <button
          onClick={() => cameraInputRef.current?.click()}
          disabled={isProcessing}
          className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Take Photo
        </button>
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-sm text-blue-600">{processingStage}</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="text-center">
            <span className="text-xs text-blue-600">{progress}% Complete</span>
          </div>
        </div>
      )}

      {/* Extracted Text Preview */}
      {extractedText && !isProcessing && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Extracted Text:</h4>
          <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-32 overflow-y-auto">
            <pre className="text-xs text-gray-900 font-mono whitespace-pre-wrap leading-relaxed">{extractedText}</pre>
          </div>
        </div>
      )}

      {/* OCR Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 OCR Tips:</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Ensure receipt is well-lit and clear</li>
          <li>• Keep camera steady while taking photo</li>
          <li>• Avoid shadows and glare on receipt</li>
          <li>• Make sure text is readable and not blurry</li>
          <li>• Supported formats: JPG, PNG, PDF</li>
        </ul>
      </div>
    </div>
  );
}
