import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User,
  Building,
  Phone,
  ArrowRight,
  CheckCircle2,
  Package,
  Shield,
  Zap,
  Users
} from 'lucide-react';
import { GradientButton } from '@/components/ui/Button';
import { ROUTES } from '@/config/constants';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Multi-step form
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate registration
    setTimeout(() => {
      setLoading(false);
      navigate(ROUTES.LOGIN);
    }, 2000);
  };

  const nextStep = () => {
    if (step < 2) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // Floating particles
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
  }));

  const benefits = [
    {
      icon: Shield,
      title: 'Secure & Protected',
      description: 'Enterprise-grade security for your data',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized performance for your workflow',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together seamlessly',
    },
  ];

  const passwordRequirements = [
    { met: formData.password.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(formData.password), text: 'One uppercase letter' },
    { met: /[0-9]/.test(formData.password), text: 'One number' },
    { met: /[!@#$%^&*]/.test(formData.password), text: 'One special character' },
  ];

  return (
    <div className="relative min-h-screen flex overflow-hidden bg-neutral-900">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-primary-900 to-accent-teal opacity-50">
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
            y: [0, -40, 0],
            x: [0, 20, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Left Side - Benefits */}
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
            <div className="p-3 bg-gradient-to-br from-purple-500 to-accent-teal rounded-2xl shadow-3d-xl">
              <Package className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">StockFlow</h1>
              <p className="text-sm text-neutral-300">Inventory Management</p>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight"
          >
            Start Your<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-accent-teal">
              Free Trial Today
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-neutral-300 mb-12"
          >
            Join thousands of businesses already using StockFlow to
            streamline their inventory management.
          </motion.p>

          {/* Benefits */}
          <div className="space-y-6 mb-12">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-start gap-4 group"
              >
                <div className="flex-shrink-0 p-3 bg-white/10 rounded-xl group-hover:bg-white/20 transition-all">
                  <benefit.icon className="w-6 h-6 text-accent-teal" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    {benefit.title}
                  </h3>
                  <p className="text-neutral-400 text-sm">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Testimonial */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="card-glass p-6 border-l-4 border-accent-teal"
          >
            <p className="text-white italic mb-4">
              "StockFlow transformed our warehouse operations. We've seen a 40%
              increase in efficiency since switching!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-teal to-primary-500 flex items-center justify-center text-white font-bold">
                JD
              </div>
              <div>
                <div className="text-white font-semibold">John Doe</div>
                <div className="text-neutral-400 text-sm">
                  CEO, Tech Solutions Inc.
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Glassmorphism Card */}
          <div className="card-glass p-8 sm:p-10 backdrop-blur-2xl border border-white/20 shadow-3d-2xl">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-accent-teal mb-4 shadow-glow-accent">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Create Account
              </h2>
              <p className="text-neutral-300">
                Get started with your free account
              </p>
            </motion.div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center">
                  <motion.div
                    animate={{
                      scale: step === s ? 1.2 : 1,
                      backgroundColor: step >= s ? '#00BFA5' : 'rgba(255,255,255,0.2)',
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-all ${
                      step >= s ? 'shadow-glow-accent' : ''
                    }`}
                  >
                    {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
                  </motion.div>
                  {s < 2 && (
                    <div className={`w-12 h-1 mx-2 rounded transition-all ${
                      step > s ? 'bg-accent-teal' : 'bg-white/20'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Step 1 - Personal Info */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-5"
                >
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        First Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData({ ...formData, firstName: e.target.value })
                          }
                          className="input-glass pl-12 pr-4 py-3 w-full text-white placeholder-neutral-500"
                          placeholder="John"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Last Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData({ ...formData, lastName: e.target.value })
                          }
                          className="input-glass pl-12 pr-4 py-3 w-full text-white placeholder-neutral-500"
                          placeholder="Doe"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="input-glass pl-12 pr-4 py-3 w-full text-white placeholder-neutral-500"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="input-glass pl-12 pr-4 py-3 w-full text-white placeholder-neutral-500"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  {/* Company */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Company Name
                    </label>
                    <div className="relative">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) =>
                          setFormData({ ...formData, company: e.target.value })
                        }
                        className="input-glass pl-12 pr-4 py-3 w-full text-white placeholder-neutral-500"
                        placeholder="Your Company Inc."
                      />
                    </div>
                  </div>

                  {/* Next Button */}
                  <GradientButton
                    type="button"
                    onClick={nextStep}
                    gradient="accent"
                    size="lg"
                    className="w-full mt-6"
                    icon={<ArrowRight className="w-5 h-5" />}
                  >
                    Continue
                  </GradientButton>
                </motion.div>
              )}

              {/* Step 2 - Password */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-5"
                >
                  {/* Password */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        className="input-glass pl-12 pr-12 py-3 w-full text-white placeholder-neutral-500"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Requirements */}
                  <div className="space-y-2">
                    {passwordRequirements.map((req, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle2
                          className={`w-4 h-4 ${
                            req.met ? 'text-success' : 'text-neutral-600'
                          }`}
                        />
                        <span className={`text-sm ${
                          req.met ? 'text-success' : 'text-neutral-500'
                        }`}>
                          {req.text}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({ ...formData, confirmPassword: e.target.value })
                        }
                        className="input-glass pl-12 pr-12 py-3 w-full text-white placeholder-neutral-500"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-danger text-sm mt-2">Passwords do not match</p>
                    )}
                  </div>

                  {/* Terms */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.terms}
                      onChange={(e) =>
                        setFormData({ ...formData, terms: e.target.checked })
                      }
                      className="w-5 h-5 mt-1 rounded border-2 border-white/30 bg-white/10 checked:bg-accent-teal checked:border-accent-teal"
                      required
                    />
                    <span className="text-sm text-neutral-300 group-hover:text-white">
                      I agree to the{' '}
                      <a href="#" className="text-accent-teal hover:underline">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="#" className="text-accent-teal hover:underline">
                        Privacy Policy
                      </a>
                    </span>
                  </label>

                  {/* Buttons */}
                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold transition-all"
                    >
                      Back
                    </button>
                    <GradientButton
                      type="submit"
                      gradient="accent"
                      size="lg"
                      loading={loading}
                      glow={true}
                      className="flex-1"
                      icon={<CheckCircle2 className="w-5 h-5" />}
                    >
                      {loading ? 'Creating...' : 'Create Account'}
                    </GradientButton>
                  </div>
                </motion.div>
              )}
            </form>

            {/* Divider */}
            {step === 1 && (
              <>
                <div className="my-8 flex items-center gap-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <span className="text-sm text-neutral-400">OR</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>

                {/* Social Signup */}
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold transition-all hover:scale-105">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </button>
                  <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold transition-all hover:scale-105">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    GitHub
                  </button>
                </div>
              </>
            )}

            {/* Login Link */}
            <p className="text-center mt-8 text-neutral-300">
              Already have an account?{' '}
              <Link
                to={ROUTES.LOGIN}
                className="text-accent-teal hover:text-accent-teal-light font-semibold"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};