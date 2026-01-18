import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'accent';
}

export function StatsCard({ title, value, icon, trend, variant = 'default' }: StatsCardProps) {
  return (
    <div className={cn(
      'p-6 rounded-xl gradient-card shadow-card border border-border/50 transition-all duration-300 hover:shadow-lg animate-scale-in',
      variant === 'primary' && 'border-primary/30 hover:shadow-glow-primary',
      variant === 'success' && 'border-success/30 hover:shadow-glow-success',
      variant === 'accent' && 'border-accent/30 hover:shadow-glow-accent',
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-display font-bold mt-2">{value}</p>
          {trend && (
            <p className={cn(
              'text-sm mt-2 font-medium',
              trend.isPositive ? 'text-success' : 'text-destructive'
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}% este mês
            </p>
          )}
        </div>
        <div className={cn(
          'p-3 rounded-lg',
          variant === 'default' && 'bg-secondary',
          variant === 'primary' && 'gradient-primary',
          variant === 'success' && 'gradient-success',
          variant === 'accent' && 'gradient-accent',
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}
