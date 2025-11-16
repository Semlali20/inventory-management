import { useState, FormEvent, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/auth.slice';
import { authService } from '@/services/auth.service';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Package,
  Sparkles,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';
import { GradientButton } from '@/components/ui/GradientButton';
import { ROUTES } from '@/config/constants';
import toast from 'react-hot-toast';

// Constants for Remember Me functionality
const REMEMBER_ME_KEY = 'remember_me_credentials';

interface RememberedCredentials {
  usernameOrEmail: string;
  remember: boolean;
}

export const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    usernameOrEmail: '', // Backend expects this field name
    password: '',
    remember: false,
  });

  // Load remembered credentials on component mount
  useEffect(() => {
    const loadRememberedCredentials = () => {
      try {
        const remembered = localStorage.getItem(REMEMBER_ME_KEY);
        if (remembered) {
          const credentials: RememberedCredentials = JSON.parse(remembered);
          setFormData(prev => ({
            ...prev,
            usernameOrEmail: credentials.usernameOrEmail,
            remember: credentials.remember,
          }));
          console.log('Loaded remembered credentials:', credentials.usernameOrEmail);
        }
      } catch (error) {
        console.error('Error loading remembered credentials:', error);
        // If there's an error, clean up the corrupted data
        localStorage.removeItem(REMEMBER_ME_KEY);
      }
    };

    loadRememberedCredentials();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Call real backend API
      const response = await authService.login({
        usernameOrEmail: formData.usernameOrEmail,
        password: formData.password,
      });

      // Handle Remember Me functionality
      if (formData.remember) {
        // Save credentials to localStorage (NOT password for security)
        const credentialsToRemember: RememberedCredentials = {
          usernameOrEmail: formData.usernameOrEmail,
          remember: true,
        };
        localStorage.setItem(REMEMBER_ME_KEY, JSON.stringify(credentialsToRemember));
        console.log('Saved credentials to Remember Me');
      } else {
        // Clear remembered credentials if unchecked
        localStorage.removeItem(REMEMBER_ME_KEY);
        console.log('Cleared Remember Me credentials');
      }

      // Store user in Redux
      dispatch(setUser(response.user));
      
      toast.success('Login successful!');
      navigate(ROUTES.DASHBOARD);
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Floating particles animation
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
  }));

  const features = [
    {
      icon: Package,
      title: 'Inventory Management',
      description: 'Complete control over your stock',
    },
    {
      icon: TrendingUp,
      title: 'Real-time Analytics',
      description: 'Live insights and reports',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized for performance',
    },
  ];

  return (
    <div className="relative min-h-screen flex overflow-hidden bg-neutral-900">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-purple-900 to-accent-teal opacity-50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4wNSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-20" />
      </div>

      {/* Floating Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white/10 backdrop-blur-sm"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center p-12 xl:p-20">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-xl"
        >
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3 mb-12"
            whileHover={{ scale: 1.05 }}
          >
            <div className="p-3 bg-gradient-to-br from-primary-400 to-accent-teal rounded-2xl shadow-3d-xl">
              <Package className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">StockFlow</h1>
              <p className="text-sm text-neutral-300">Inventory Management</p>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight"
          >
            Manage Your<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-teal to-primary-400">
              Inventory with Ease
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-neutral-300 mb-12"
          >
            Streamline your warehouse operations with our powerful,
            intuitive platform designed for modern businesses.
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 gap-6"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="p-2 bg-gradient-to-br from-primary-400 to-accent-teal rounded-lg">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-neutral-400">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex gap-8 mt-12"
          >
            {[
              { value: '10K+', label: 'Active Users' },
              { value: '99.9%', label: 'Uptime' },
              { value: '24/7', label: 'Support' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-teal to-primary-400">
                  {stat.value}
                </div>
                <div className="text-sm text-neutral-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 relative z-10 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-3d-xl border border-white/20 p-8 lg:p-10">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome Back
              </h2>
              <p className="text-neutral-300">
                Sign in to continue to your dashboard
              </p>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username/Email Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-semibold text-white mb-2">
                  Username or Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-accent-teal transition-colors" />
                  <input
                    type="text"
                    value={formData.usernameOrEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, usernameOrEmail: e.target.value })
                    }
                    className="input-glass pl-12 pr-4 py-4 w-full text-white placeholder-neutral-500 focus:border-accent-teal/50"
                    placeholder="Username or email"
                    required
                    autoComplete="username"
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-semibold text-white mb-2">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-accent-teal transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="input-glass pl-12 pr-12 py-4 w-full text-white placeholder-neutral-500 focus:border-accent-teal/50"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Remember & Forgot */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-between"
              >
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.remember}
                    onChange={(e) =>
                      setFormData({ ...formData, remember: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-2 border-white/30 bg-white/10 checked:bg-accent-teal checked:border-accent-teal transition-all cursor-pointer"
                  />
                  <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">
                    Remember me
                  </span>
                </label>
                <Link
                  to={ROUTES.FORGOT_PASSWORD}
                  className="text-sm text-accent-teal hover:text-accent-teal-light transition-colors font-semibold"
                >
                  Forgot password?
                </Link>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <GradientButton
                  type="submit"
                  gradient="accent"
                  size="lg"
                  loading={loading}
                  glow={true}
                  className="w-full"
                  icon={!loading && <ArrowRight className="w-5 h-5" />}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </GradientButton>
              </motion.div>
            </form>

            {/* Sign Up Link */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center mt-8 text-neutral-300"
            >
              Don't have an account?{' '}
              <Link
                to={ROUTES.REGISTER}
                className="text-accent-teal hover:text-accent-teal-light font-semibold transition-colors"
              >
                Sign up
              </Link>
            </motion.p>

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="relative my-8"
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 text-neutral-400 bg-transparent">
                  Secure login powered by JWT
                </span>
              </div>
            </motion.div>

            {/* Footer Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-2 text-sm text-neutral-400">
                <Shield className="w-4 h-4" />
                <span>Your data is encrypted and secure</span>
              </div>
            </motion.div>
          </div>

          {/* Mobile Logo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="lg:hidden mt-8 text-center"
          >
            <div className="flex items-center justify-center gap-2 text-neutral-400">
              <Package className="w-5 h-5" />
              <span className="font-semibold">StockFlow</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};