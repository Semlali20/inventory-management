import { ReactNode, ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'accent' | 'success' | 'danger' | 'warning' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  className,
  disabled,
  ...props
}: ButtonProps) => {
  const baseClasses = 'btn-3d';

  const variantClasses = {
    primary: 'btn-3d-primary',
    accent: 'btn-3d-accent',
    success: 'btn-3d-success',
    danger: 'btn-3d-danger',
    warning: 'btn-3d-warning',
    outline: 'btn-3d-outline border-primary-500 text-primary-600 hover:bg-primary-50 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-900/20',
    ghost: 'btn-3d-ghost text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
    xl: 'px-8 py-4 text-lg gap-3',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  };

  return (
    <motion.button
      whileTap={!disabled && !loading ? { scale: 0.95 } : {}}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <Loader2 className={cn(iconSizeClasses[size], 'animate-spin')} />
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span className={iconSizeClasses[size]}>{icon}</span>
      )}
      
      <span>{children}</span>
      
      {!loading && icon && iconPosition === 'right' && (
        <span className={iconSizeClasses[size]}>{icon}</span>
      )}
    </motion.button>
  );
};

// Icon Button (circular button with just an icon)
export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  variant?: 'primary' | 'accent' | 'success' | 'danger' | 'warning' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  className?: string;
  tooltip?: string;
}

export const IconButton = ({
  icon,
  variant = 'ghost',
  size = 'md',
  loading = false,
  className,
  disabled,
  tooltip,
  ...props
}: IconButtonProps) => {
  const variantClasses = {
    primary: 'btn-3d-primary',
    accent: 'btn-3d-accent',
    success: 'btn-3d-success',
    danger: 'btn-3d-danger',
    warning: 'btn-3d-warning',
    ghost: 'btn-3d-ghost text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100',
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={!disabled && !loading ? { scale: 0.9 } : {}}
      className={cn(
        'btn-3d rounded-full flex items-center justify-center',
        variantClasses[variant],
        sizeClasses[size],
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      title={tooltip}
      {...props}
    >
      {loading ? (
        <Loader2 className={cn(iconSizeClasses[size], 'animate-spin')} />
      ) : (
        <span className={iconSizeClasses[size]}>{icon}</span>
      )}
    </motion.button>
  );
};

// Button Group
export interface ButtonGroupProps {
  children: ReactNode;
  className?: string;
}

export const ButtonGroup = ({ children, className }: ButtonGroupProps) => {
  return (
    <div className={cn('inline-flex rounded-xl shadow-3d-sm overflow-hidden', className)}>
      {children}
    </div>
  );
};

// Floating Action Button (FAB)
export interface FABProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  variant?: 'primary' | 'accent' | 'success' | 'danger';
  size?: 'md' | 'lg';
  loading?: boolean;
  tooltip?: string;
  className?: string;
}

export const FAB = ({
  icon,
  position = 'bottom-right',
  variant = 'primary',
  size = 'lg',
  loading = false,
  tooltip,
  className,
  disabled,
  ...props
}: FABProps) => {
  const positionClasses = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-20 right-6',
    'top-left': 'fixed top-20 left-6',
  };

  const variantClasses = {
    primary: 'btn-3d-primary',
    accent: 'btn-3d-accent',
    success: 'btn-3d-success',
    danger: 'btn-3d-danger',
  };

  const sizeClasses = {
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
  };

  const iconSizeClasses = {
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  };

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1, rotate: 90 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className={cn(
        'btn-3d rounded-full flex items-center justify-center z-50',
        'shadow-3d-xl hover:shadow-3d-2xl',
        positionClasses[position],
        variantClasses[variant],
        sizeClasses[size],
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      title={tooltip}
      {...props}
    >
      {loading ? (
        <Loader2 className={cn(iconSizeClasses[size], 'animate-spin')} />
      ) : (
        <span className={iconSizeClasses[size]}>{icon}</span>
      )}
    </motion.button>
  );
};

// Gradient Button with Glow Effect
export interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  gradient?: 'primary' | 'accent' | 'success' | 'danger' | 'rainbow';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: ReactNode;
  loading?: boolean;
  glow?: boolean;
  className?: string;
}

export const GradientButton = ({
  children,
  gradient = 'primary',
  size = 'md',
  icon,
  loading = false,
  glow = true,
  className,
  disabled,
  ...props
}: GradientButtonProps) => {
  const gradientClasses = {
    primary: 'bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700',
    accent: 'bg-gradient-to-r from-accent-teal via-accent-teal-light to-accent-teal',
    success: 'bg-gradient-to-r from-success via-success-light to-success',
    danger: 'bg-gradient-to-r from-danger via-danger-light to-danger',
    rainbow: 'bg-gradient-to-r from-primary-500 via-accent-teal to-success',
  };

  const glowClasses = {
    primary: 'hover:glow-primary',
    accent: 'hover:glow-accent',
    success: 'hover:shadow-[0_0_20px_rgba(76,175,80,0.4)]',
    danger: 'hover:shadow-[0_0_20px_rgba(239,83,80,0.4)]',
    rainbow: 'hover:shadow-[0_0_30px_rgba(0,191,165,0.5)]',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm gap-2',
    md: 'px-6 py-3 text-base gap-2',
    lg: 'px-8 py-4 text-lg gap-3',
    xl: 'px-10 py-5 text-xl gap-3',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'relative inline-flex items-center justify-center rounded-xl font-bold text-white',
        'shadow-3d-lg transition-all duration-300',
        'overflow-hidden',
        gradientClasses[gradient],
        sizeClasses[size],
        glow && glowClasses[gradient],
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {/* Animated Shine Effect */}
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      
      <span className="relative flex items-center gap-2">
        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
        {!loading && icon && <span>{icon}</span>}
        <span>{children}</span>
      </span>
    </motion.button>
  );
};