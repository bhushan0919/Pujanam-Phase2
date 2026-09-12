// backend/utils/priceUtils.js

/**
 * Extract numeric price from Indian price format
 * Examples:
 *   "₹1,099/-" → 1099
 *   "₹1,099" → 1099
 *   "1099" → 1099
 *   "₹1,099.50" → 1099
 *   "Price on request" → 0
 *   "₹1,09,999/-" → 109999 (Indian lakh/crore format)
 */
const extractNumericPrice = (priceString) => {
  if (!priceString || typeof priceString !== 'string') return 0;
  
  // Remove ₹ symbol, spaces, and special characters
  let cleaned = priceString.replace(/[₹\s]/g, '');
  
  // Handle "Price on request" or similar text
  if (isNaN(parseInt(cleaned[0])) && !cleaned.match(/[\d,]/)) {
    return 0;
  }
  
  // Extract numbers with commas (handles 1,099 and 1,09,999)
  const match = cleaned.match(/[\d,]+/);
  if (!match) return 0;
  
  // Remove all commas and parse
  const numericString = match[0].replace(/,/g, '');
  const result = parseInt(numericString, 10);
  
  return isNaN(result) ? 0 : result;
};

/**
 * Format price for display
 */
const formatPrice = (amount) => {
  if (!amount || amount === 0) return 'Price on request';
  return `₹${amount.toLocaleString('en-IN')}/-`;
};

/**
 * Calculate advance amount (30% of total)
 */
const calculateAdvanceAmount = (totalPrice) => {
  const numericPrice = typeof totalPrice === 'number' ? totalPrice : extractNumericPrice(totalPrice);
  return Math.round(numericPrice * 0.3);
};

/**
 * Validate if price is valid for payment
 */
const isValidPriceForPayment = (price) => {
  const numeric = typeof price === 'number' ? price : extractNumericPrice(price);
  return numeric > 0;
};

module.exports = {
  extractNumericPrice,
  formatPrice,
  calculateAdvanceAmount,
  isValidPriceForPayment
};