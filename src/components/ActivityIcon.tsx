import React from 'react';
import * as Icons from 'lucide-react';

interface ActivityIconProps {
  iconName: string;
  color?: string;
  className?: string;
  size?: number;
}

export const AVAILABLE_ACTIVITY_ICONS = [
  'Store',
  'Laptop',
  'Briefcase',
  'UtensilsCrossed',
  'Car',
  'Home',
  'HeartPulse',
  'ShoppingBag',
  'GraduationCap',
  'TrendingUp',
  'PiggyBank',
  'Smartphone',
  'Wrench',
  'Coffee',
  'Truck',
  'Building2',
  'Scale',
  'DollarSign',
  'Sparkles',
];

export const AVAILABLE_ACTIVITY_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#ef4444', // red
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#84cc16', // lime
  '#f97316', // orange
  '#64748b', // slate
];

export const ActivityIcon: React.FC<ActivityIconProps> = ({
  iconName,
  color,
  className = 'w-5 h-5',
  size = 20,
}) => {
  // @ts-expect-error dynamic lucide icon component lookup
  const IconComponent = Icons[iconName] || Icons.CircleDot;
  return <IconComponent size={size} className={className} style={color ? { color } : undefined} />;
};
