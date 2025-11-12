export const format = {
  // Format numbers with thousand separators
  number: (value: number, decimals: number = 0): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  },

  // Format currency
  currency: (value: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(value);
  },

  // Format percentage
  percentage: (value: number, decimals: number = 1): string => {
    return `${format.number(value, decimals)}%`;
  },

  // Format date
  date: (date: Date | string): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  },

  // Format date and time
  dateTime: (date: Date | string): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  },

  // Format relative time (e.g., "2 hours ago")
  relativeTime: (date: Date | string): string => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return format.date(date);
  },

  // Truncate text
  truncate: (text: string, length: number = 50): string => {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  },
};