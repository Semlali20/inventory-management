import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Boxes,
  Layers,
  Tag,
  Box,
  Barcode,
  Move,
  MapPin,
  Map,
  Building2,
  CheckCircle,
  Menu,
  X,
  List,
  ClipboardCheck,
  Bell,
} from 'lucide-react';
import { cn } from '@/utils/cn';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },

  // Products Section
  { name: 'Items', href: '/products/items', icon: Boxes },
  { name: 'Item Variants', href: '/products/variants', icon: Layers },
  { name: 'Categories', href: '/products/categories', icon: Tag },

  // Inventory Section
  { name: 'Lots', href: '/inventory/lots', icon: Box },
  { name: 'Serials', href: '/inventory/serials', icon: Barcode },
  { name: 'Inventory', href: '/inventory/Inventories', icon: Boxes },

  // Locations Section
  { name: 'Sites', href: '/locations/sites', icon: Map },
  { name: 'Warehouses', href: '/locations/warehouses', icon: Building2 },
  { name: 'Locations', href: '/locations/locations', icon: MapPin },

  // Movements Section
  { name: 'Movements', href: '/movements', icon: Move },


  // Quality
  { name: 'Quality Controls', href: '/quality/controls', icon: CheckCircle },

  // Alerts
  { name: 'Alerts', href: '/alerts', icon: Bell },
];

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-neutral-800 rounded-xl shadow-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </motion.button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md border-r border-neutral-200/50 dark:border-neutral-700/50 z-40 overflow-y-auto scrollbar-thin">
        <nav className="p-4 space-y-2">
          {navigation.map((item, index) => {
            const Icon = item.icon;
            
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 relative',
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:shadow-md'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={cn(
                        'w-5 h-5 transition-transform duration-300',
                        isActive && 'scale-110'
                      )} />
                      <span>{item.name}</span>
                      {isActive && (
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
          <>
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-md border-r border-neutral-200/50 dark:border-neutral-700/50 z-40 overflow-y-auto scrollbar-thin"
            >
              <nav className="p-4 space-y-2">
                {navigation.map((item, index) => {
                  const Icon = item.icon;
                  
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <NavLink
                        to={item.href}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            'group flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 relative',
                            isActive
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                              : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:shadow-md'
                          )
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <Icon className={cn(
                              'w-5 h-5 transition-transform duration-300',
                              isActive && 'scale-110'
                            )} />
                            <span>{item.name}</span>
                            {isActive && (
                              <motion.div
                                layoutId="mobileActiveIndicator"
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

            {/* Overlay for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
};