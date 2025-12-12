import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
  }).format(amount / 100);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(typeof date === 'string' ? new Date(date) : date);
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(typeof date === 'string' ? new Date(date) : date);
}

export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    placed: 'bg-[#305269] text-white',
    processing: 'bg-[#C2adc2] text-[#305269]',
    in_production: 'bg-[#663366] text-white',
    quality_check: 'bg-[#ffd8a4] text-[#305269]',
    shipped: 'bg-[#FF9E1C] text-white',
    delivered: 'bg-[#9cdddd] text-[#305269]',
    completed: 'bg-[#08ABAB] text-white',
    cancelled: 'bg-[#f38aad] text-white',
    returned: 'bg-[#fad0de] text-[#305269]',
  };

  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getRmaStatusColor(status: string): string {
  const colors: Record<string, string> = {
    submitted: 'bg-[#305269] text-white',
    requested: 'bg-[#305269] text-white',
    approved: 'bg-[#08ABAB] text-white',
    declined: 'bg-[#f38aad] text-white',
    in_transit: 'bg-[#663366] text-white',
    received: 'bg-[#9cdddd] text-[#305269]',
    processing: 'bg-[#C2adc2] text-[#305269]',
    completed: 'bg-[#08ABAB] text-white',
    rejected: 'bg-[#f38aad] text-white',
  };

  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

export function calculateProgress(status: string): number {
  const statusMap: Record<string, number> = {
    placed: 20,
    processing: 40,
    in_production: 60,
    quality_check: 80,
    shipped: 90,
    delivered: 100,
    completed: 100,
    cancelled: 0,
    returned: 0,
  };

  return statusMap[status] || 0;
}

export function calculateOrderStages(status: string): { label: string, active: boolean }[] {
  const stages = [
    { label: 'Order Placed', status: 'placed' },
    { label: 'In Production', status: 'in_production' },
    { label: 'Quality Check', status: 'quality_check' },
    { label: 'Shipped', status: 'shipped' },
    { label: 'Delivered', status: 'delivered' },
  ];

  const currentIndex = stages.findIndex(stage => stage.status === status);
  
  return stages.map((stage, index) => ({
    label: stage.label,
    active: index <= currentIndex
  }));
}

export function formatEnvironmentalImpact(value: number, unit: string): string {
  const formatWithCommas = (num: number, decimals: number = 1): string => {
    return num.toLocaleString('en-US', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  };

  const formatWholeWithCommas = (num: number): string => {
    return Math.round(num).toLocaleString('en-US');
  };

  if (unit === 'kg') {
    if (value >= 1000) {
      return `${formatWithCommas(value / 1000)} tonnes`;
    }
    return `${formatWholeWithCommas(value)} kg`;
  }
  
  if (unit === 'litres') {
    if (value >= 1000000) {
      return `${formatWithCommas(value / 1000000)}M litres`;
    }
    if (value >= 1000) {
      return `${formatWithCommas(value / 1000)}K litres`;
    }
    return `${formatWholeWithCommas(value)} litres`;
  }
  
  if (unit === 'g') {
    if (value >= 1000) {
      return `${formatWithCommas(value / 1000)} kg`;
    }
    return `${formatWholeWithCommas(value)} g`;
  }
  
  return `${formatWholeWithCommas(value)} ${unit}`;
}
