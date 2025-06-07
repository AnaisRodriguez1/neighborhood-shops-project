/**
 * Utility functions for formatting data
 */

/**
 * Format currency with Chilean peso symbol
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format phone number for display (Chilean format)
 */
export const formatPhone = (phone: string): string => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as +569 XXXX XXXX for Chilean mobile numbers (9 digits)
  if (cleaned.length === 9 && cleaned.startsWith('9')) {
    return `+569 ${cleaned.slice(1, 5)} ${cleaned.slice(5)}`;
  }
  
  // Format as +569 XXXX XXXX if 11 digits starting with 569
  if (cleaned.length === 11 && cleaned.startsWith('569')) {
    return `+569 ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
  }
  
  // Format as +569 XXXX XXXX if 12 digits starting with 56 (Chile country code)
  if (cleaned.length === 12 && cleaned.startsWith('56') && cleaned.charAt(2) === '9') {
    return `+569 ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
  }
  
  return phone; // Return original if doesn't match Chilean mobile format
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Capitalize first letter of each word
 */
export const capitalizeWords = (text: string): string => {
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

export function getFirstName(fullName: string): string {
    if (!fullName) return "";
    return fullName.split(" ")[0];
}

/**
 * Capitalize first letter of a string
 */
export const capitalizeFirstLetter = (text: string): string => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};