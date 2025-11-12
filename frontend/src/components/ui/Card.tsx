import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

export interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  variant?: '3d' | 'glass' | 'neumorphism' | 'flat';
  className?: string;
  headerAction?: ReactNode;
  footer?: ReactNode;
  hoverable?: boolean;
  onClick?: () => void;
}

export const Card = ({
  children,
  title,
  subtitle,
  icon,
  variant = '3d',
  className,
  headerAction,
  footer,
  hoverable = true,
  onClick,
}: CardProps) => {
  const baseClasses = 'overflow-hidden';
  
  const variantClasses = {
    '3d': hoverable ? 'card-3d' : 'card-3d-flat',
    'glass': 'card-glass',
    'neumorphism': 'card-neumorphism',
    'flat': 'bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        baseClasses,
        variantClasses[variant],
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {/* Header */}
      {(title || subtitle || icon || headerAction) && (
        <div className="px-6 py-4 border-b border-neutral-100/50 dark:border-neutral-700/50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              {icon && (
                <div className="flex-shrink-0 p-2 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                  {icon}
                </div>
              )}
              <div className="flex-1 min-w-0">
                {title && (
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {headerAction && (
              <div className="flex-shrink-0">
                {headerAction}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="px-6 py-4 bg-neutral-50/50 dark:bg-neutral-900/30 border-t border-neutral-100/50 dark:border-neutral-700/50">
          {footer}
        </div>
      )}
    </motion.div>
  );
};

// Stat Card Component (for Dashboard)
export interface StatCardProps {
  title: string;
  value: string | number;
  icon: any; // Lucide icon component
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'danger';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  delay?: number;
  onClick?: () => void;
}

export const StatCard = ({
  title,
  value,
  icon: Icon,
  color = 'primary',
  trend,
  delay = 0,
  onClick,
}: StatCardProps) => {
  const colorClasses = {
    primary: {
      bg: 'from-primary-500 to-primary-600',
      icon: 'bg-white/20 text-white',
      text: 'text-white',
    },
    accent: {
      bg: 'from-accent-teal to-accent-teal-light',
      icon: 'bg-white/20 text-white',
      text: 'text-white',
    },
    success: {
      bg: 'from-success to-success-light',
      icon: 'bg-white/20 text-white',
      text: 'text-white',
    },
    warning: {
      bg: 'from-warning to-warning-light',
      icon: 'bg-white/20 text-white',
      text: 'text-white',
    },
    danger: {
      bg: 'from-danger to-danger-light',
      icon: 'bg-white/20 text-white',
      text: 'text-white',
    },
  };

  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay,
        type: "spring",
        stiffness: 100 
      }}
      whileHover={{ 
        scale: 1.05, 
        y: -8,
        transition: { duration: 0.2 }
      }}
      className={cn(
        "relative overflow-hidden rounded-2xl shadow-3d-lg",
        "bg-gradient-to-br",
        colors.bg,
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12" />
      </div>

      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={cn("p-3 rounded-xl", colors.icon)}>
            <Icon className="w-6 h-6" />
          </div>
          
          {trend && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.2 }}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold",
                "bg-white/20 backdrop-blur-sm",
                colors.text
              )}
            >
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.3 }}
        >
          <h3 className={cn("text-sm font-medium mb-1 opacity-90", colors.text)}>
            {title}
          </h3>
          <p className={cn("text-3xl font-bold", colors.text)}>
            {value}
          </p>
        </motion.div>
      </div>

      {/* Shine Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{
          duration: 2,
          delay: delay + 0.5,
          repeat: Infinity,
          repeatDelay: 3,
        }}
      />
    </motion.div>
  );
};

// Simple Card Variants
export const CardSimple = ({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string 
}) => (
  <div className={cn("card-3d p-6", className)}>
    {children}
  </div>
);

export const CardGlass = ({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string 
}) => (
  <div className={cn("card-glass p-6", className)}>
    {children}
  </div>
);

export const CardNeumorphism = ({ 
  children, 
  className 
}: { 
  children: ReactNode; 
  className?: string 
}) => (
  <div className={cn("card-neumorphism p-6", className)}>
    {children}
  </div>
);