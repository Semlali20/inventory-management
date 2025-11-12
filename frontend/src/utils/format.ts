import { format as dateFnsFormat, parseISO } from 'date-fns';

export const format = {
  date: (date: string | Date, formatStr: string = 'PP'): string => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return dateFnsFormat(dateObj, formatStr);
    } catch (error) {
      return String(date);
    }
  },

  currency: (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  },

  number: (value: number, decimals: number = 2): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  },

  percentage: (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`;
  },
};

