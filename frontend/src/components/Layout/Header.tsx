import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { LogOut, User, Moon, Sun, Bell } from 'lucide-react';
import { Button } from '../ui/Button';
import { useState } from 'react';

export const Header = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [notifications] = useState(3); // Mock notification count

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-md border-b border-neutral-200/50 dark:border-neutral-700/50 z-50 lg:ml-64 shadow-3d-sm"
    >
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary-500 to-accent-teal bg-clip-text text-transparent">
            Stock Management
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="relative p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            <Bell className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            {notifications > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"
              />
            )}
          </motion.button>

          {/* Theme Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-warning" />
            ) : (
              <Moon className="w-5 h-5 text-neutral-600" />
            )}
          </motion.button>

          {/* User Info */}
          <div className="flex items-center gap-3 pl-3 border-l border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold text-sm">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hidden sm:block">
                {user?.username || 'User'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              icon={<LogOut className="w-4 h-4" />}
              className="hidden sm:flex"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};
