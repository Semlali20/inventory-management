import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  actions?: ReactNode;
  variant?: 'default' | 'glass' | 'neumorphism';
  hover?: boolean;
  delay?: number;
}

export const Card = ({ 
  children, 
  className, 
  title, 
  actions, 
  variant = 'default',
  hover = true,
  delay = 0 
}: CardProps) => {
  const variants = {
    default: 'card-3d',
    glass: 'card-glass',
    neumorphism: 'card-neumorphism',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={cn(
        variants[variant],
        'p-6',
        hover && variant === 'default' && 'hover:shadow-3d-lg',
        className
      )}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
          {title && (
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {title}
            </h3>
          )}
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div>{children}</div>
    </motion.div>
  );
};
