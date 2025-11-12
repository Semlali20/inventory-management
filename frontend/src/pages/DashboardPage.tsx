import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Loading } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';
import { Package, Warehouse, Move, Bell, TrendingUp, Plus } from 'lucide-react';
import { productService } from '@/services/product.service';
import { inventoryService } from '@/services/inventory.service';
import { movementService } from '@/services/movement.service';
import { alertService } from '@/services/alert.service';
import { format } from '@/utils/format';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#2C3E90', '#00BFA5', '#FF6B35', '#4CAF50', '#FFA726'];

export const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalInventory: 0,
    totalMovements: 0,
    totalAlerts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [products, inventory, movements, alerts] = await Promise.all([
          productService.getItems({ size: 1 }),
          inventoryService.getInventory({ size: 1 }),
          movementService.getMovements({ size: 1 }),
          alertService.getAlerts({ size: 1 }),
        ]);

        setStats({
          totalProducts: products.totalElements,
          totalInventory: inventory.totalElements,
          totalMovements: movements.totalElements,
          totalAlerts: alerts.totalElements,
        });

        // Mock chart data - replace with real data
        setChartData([
          { name: 'Mon', products: 120, inventory: 450 },
          { name: 'Tue', products: 135, inventory: 480 },
          { name: 'Wed', products: 150, inventory: 520 },
          { name: 'Thu', products: 145, inventory: 510 },
          { name: 'Fri', products: 160, inventory: 550 },
          { name: 'Sat', products: 140, inventory: 500 },
          { name: 'Sun', products: 130, inventory: 470 },
        ]);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  const pieData = [
    { name: 'In Stock', value: 75, color: '#4CAF50' },
    { name: 'Low Stock', value: 15, color: '#FFA726' },
    { name: 'Out of Stock', value: 10, color: '#EF5350' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Dashboard
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Welcome to Stock Management System
          </p>
        </div>
        <Button variant="accent" icon={<Plus className="w-4 h-4" />}>
          Quick Action
        </Button>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Products"
          value={format.number(stats.totalProducts, 0)}
          icon={Package}
          color="primary"
          trend={{ value: 12, isPositive: true }}
          delay={0.1}
        />
        <StatCard
          title="Inventory Items"
          value={format.number(stats.totalInventory, 0)}
          icon={Warehouse}
          color="accent"
          trend={{ value: 8, isPositive: true }}
          delay={0.2}
        />
        <StatCard
          title="Movements"
          value={format.number(stats.totalMovements, 0)}
          icon={Move}
          color="success"
          delay={0.3}
        />
        <StatCard
          title="Active Alerts"
          value={format.number(stats.totalAlerts, 0)}
          icon={Bell}
          color={stats.totalAlerts > 10 ? 'danger' : 'warning'}
          delay={0.4}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card title="Weekly Inventory Trends" variant="glass">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
              <XAxis dataKey="name" stroke="#6C757D" />
              <YAxis stroke="#6C757D" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                }}
              />
              <Legend />
              <Bar dataKey="products" fill="#2C3E90" radius={[8, 8, 0, 0]} />
              <Bar dataKey="inventory" fill="#00BFA5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Line Chart */}
        <Card title="Stock Movement Trends" variant="glass">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
              <XAxis dataKey="name" stroke="#6C757D" />
              <YAxis stroke="#6C757D" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="products"
                stroke="#2C3E90"
                strokeWidth={3}
                dot={{ fill: '#2C3E90', r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="inventory"
                stroke="#00BFA5"
                strokeWidth={3}
                dot={{ fill: '#00BFA5', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Pie Chart and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <Card title="Stock Status Distribution" variant="glass">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent Activity */}
        <Card title="Recent Activity" variant="glass" className="lg:col-span-2">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: item * 0.1 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                  {item}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                    Product {item} updated
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    2 hours ago
                  </p>
                </div>
                <TrendingUp className="w-5 h-5 text-success" />
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
