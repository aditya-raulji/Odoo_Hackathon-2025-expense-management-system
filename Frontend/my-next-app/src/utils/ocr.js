import Tesseract from 'tesseract.js';

export class OCRService {
  constructor() {
    this.isProcessing = false;
  }

  async extractTextFromImage(imageFile) {
    if (this.isProcessing) {
      throw new Error('OCR is already processing another image');
    }

    this.isProcessing = true;

    try {
      const { data: { text } } = await Tesseract.recognize(
        imageFile,
        'eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          }
        }
      );

      this.isProcessing = false;
      return this.parseExpenseData(text);
    } catch (error) {
      this.isProcessing = false;
      throw new Error(`OCR failed: ${error.message}`);
    }
  }

  parseExpenseData(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    const extractedData = {
      amount: null,
      date: null,
      description: '',
      category: '',
      vendor: ''
    };

    // Extract amount (look for currency patterns)
    const amountPatterns = [
      /(\$|€|£|₹|¥|USD|EUR|GBP|INR|JPY)\s*(\d+(?:\.\d{2})?)/i,
      /(\d+(?:\.\d{2})?)\s*(\$|€|£|₹|¥|USD|EUR|GBP|INR|JPY)/i,
      /total[:\s]*(\$|€|£|₹|¥|USD|EUR|GBP|INR|JPY)?\s*(\d+(?:\.\d{2})?)/i,
      /amount[:\s]*(\$|€|£|₹|¥|USD|EUR|GBP|INR|JPY)?\s*(\d+(?:\.\d{2})?)/i
    ];

    for (const pattern of amountPatterns) {
      const match = text.match(pattern);
      if (match) {
        extractedData.amount = parseFloat(match[2] || match[1]);
        break;
      }
    }

    // Extract date (look for various date formats)
    const datePatterns = [
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
      /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
      /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{2,4})/i,
      /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+(\d{1,2}),?\s+(\d{2,4})/i
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          const dateStr = match[0];
          const parsedDate = new Date(dateStr);
          if (!isNaN(parsedDate.getTime())) {
            extractedData.date = parsedDate.toISOString().split('T')[0];
            break;
          }
        } catch (e) {
          continue;
        }
      }
    }

    // Extract description (usually the longest meaningful line)
    const meaningfulLines = lines.filter(line => 
      line.length > 10 && 
      !line.match(/^\d+$/) && 
      !line.match(/^[^\w\s]*$/) &&
      !line.toLowerCase().includes('total') &&
      !line.toLowerCase().includes('amount') &&
      !line.toLowerCase().includes('tax')
    );

    if (meaningfulLines.length > 0) {
      extractedData.description = meaningfulLines[0];
    }

    // Extract vendor/merchant name (usually first line or contains business keywords)
    const vendorKeywords = ['restaurant', 'hotel', 'store', 'shop', 'cafe', 'bar', 'market', 'gas', 'station'];
    const vendorLine = lines.find(line => 
      vendorKeywords.some(keyword => line.toLowerCase().includes(keyword)) ||
      line.match(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/) // Title case words
    );

    if (vendorLine) {
      extractedData.vendor = vendorLine;
    }

    // Suggest category based on keywords
    const categoryKeywords = {
      'Travel': ['taxi', 'uber', 'lyft', 'flight', 'train', 'bus', 'metro', 'transport'],
      'Meals': ['restaurant', 'cafe', 'food', 'dining', 'lunch', 'dinner', 'breakfast'],
      'Accommodation': ['hotel', 'motel', 'bnb', 'accommodation', 'lodging'],
      'Office Supplies': ['office', 'supplies', 'stationery', 'paper', 'pen', 'pencil'],
      'Software': ['software', 'app', 'subscription', 'license', 'saas'],
      'Training': ['training', 'course', 'education', 'learning', 'workshop'],
      'Marketing': ['marketing', 'advertising', 'promotion', 'campaign'],
      'Entertainment': ['movie', 'theater', 'concert', 'entertainment', 'game']
    };

    const textLower = text.toLowerCase();
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => textLower.includes(keyword))) {
        extractedData.category = category;
        break;
      }
    }

    return extractedData;
  }

  // Format extracted data for form
  formatForForm(extractedData) {
    return {
      amount: extractedData.amount?.toString() || '',
      currency: this.detectCurrency(extractedData.amount),
      category: extractedData.category || '',
      description: extractedData.description || '',
      expenseDate: extractedData.date || '',
      vendor: extractedData.vendor || ''
    };
  }

  detectCurrency(amount) {
    // Default currency detection based on amount format
    // This could be enhanced with more sophisticated detection
    if (amount && amount.toString().includes('.')) {
      return 'USD'; // Default to USD for decimal amounts
    }
    return 'USD';
  }

  // Validate extracted data
  validateExtractedData(data) {
    const errors = [];

    if (!data.amount || isNaN(data.amount) || data.amount <= 0) {
      errors.push('Amount could not be extracted or is invalid');
    }

    if (!data.date) {
      errors.push('Date could not be extracted');
    }

    if (!data.description) {
      errors.push('Description could not be extracted');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const ocrService = new OCRService();
