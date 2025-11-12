import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Move,
  MapPin,
  CheckCircle,
  Bell,
  Menu,
  X,
} from 'lucide-react';
import { ROUTES } from '@/config/constants';
import { cn } from '@/utils/cn';

const navigation = [
  { name: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { name: 'Products', href: ROUTES.PRODUCTS, icon: Package },
  { name: 'Inventory', href: ROUTES.INVENTORY, icon: Warehouse },
  { name: 'Movements', href: ROUTES.MOVEMENTS, icon: Move },
  { name: 'Locations', href: ROUTES.LOCATIONS, icon: MapPin },
  { name: 'Quality', href: ROUTES.QUALITY, icon: CheckCircle },
  { name: 'Alerts', href: ROUTES.ALERTS, icon: Bell },
];

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-neutral-800 rounded-xl shadow-3d-md"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </motion.button>

      {/* Sidebar */}
      <aside className="hidden lg:block fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md border-r border-neutral-200/50 dark:border-neutral-700/50 z-40 overflow-y-auto scrollbar-thin">
        <nav className="p-4 space-y-2">
          {navigation.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <NavLink
                  to={item.href}
                  className={({ isActive: active }) =>
                    cn(
                      'group flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 relative',
                      active
                        ? 'bg-gradient-primary text-white shadow-3d-md'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:shadow-3d-sm'
                    )
                  }
                >
                  {({ isActive: active }) => (
                    <>
                      <Icon className={cn(
                        'w-5 h-5 transition-transform duration-300',
                        active && 'scale-110'
                      )} />
                      <span>{item.name}</span>
                      {active && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute right-2 w-2 h-2 bg-white rounded-full"
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </motion.div>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="lg:hidden fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md border-r border-neutral-200/50 dark:border-neutral-700/50 z-40 overflow-y-auto scrollbar-thin"
            onClick={() => setIsOpen(false)}
          >
            <nav className="p-4 space-y-2">
              {navigation.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <NavLink
                      to={item.href}
                      className={({ isActive: active }) =>
                        cn(
                          'group flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300',
                          active
                            ? 'bg-gradient-primary text-white shadow-3d-md'
                            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:shadow-3d-sm'
                        )
                      }
                    >
                      {({ isActive: active }) => (
                        <>
                          <Icon className={cn(
                            'w-5 h-5 transition-transform duration-300',
                            active && 'scale-110'
                          )} />
                          <span>{item.name}</span>
                          {active && (
                            <motion.div
                              layoutId="activeIndicator"
                              className="absolute right-2 w-2 h-2 bg-white rounded-full"
                              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                          )}
                        </>
                      )}
                    </NavLink>
                  </motion.div>
                );
              })}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
        />
      )}
    </>
  );
};
