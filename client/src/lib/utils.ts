import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount / 100);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(typeof date === 'string' ? new Date(date) : date);
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(typeof date === 'string' ? new Date(date) : date);
}

export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    placed: 'bg-blue-100 text-blue-800',
    processing: 'bg-yellow-100 text-yellow-800',
    in_production: 'bg-green-100 text-green-800',
    quality_check: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-teal-100 text-teal-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
    returned: 'bg-orange-100 text-orange-800',
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
  if (unit === 'kg') {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)} tonnes`;
    }
    return `${value} kg`;
  }
  
  if (unit === 'liters') {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M liters`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K liters`;
    }
    return `${value} liters`;
  }
  
  if (unit === 'g') {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)} kg`;
    }
    return `${value} g`;
  }
  
  return `${value} ${unit}`;
}
