import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  ArrowLeft,
  Send,
  CheckCircle,
  Package,
  Shield,
  Key
} from 'lucide-react';
import { GradientButton, Button } from '@/components/ui/Button';
import { ROUTES } from '@/config/constants';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate sending reset email
    setTimeout(() => {
      setLoading(false);
      setEmailSent(true);
    }, 2000);
  };

  const handleResend = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  // Floating particles
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-neutral-900 p-6">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-indigo-900 to-purple-900 opacity-50">
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

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link to={ROUTES.LOGIN}>
            <Button
              variant="ghost"
              icon={<ArrowLeft className="w-4 h-4" />}
              className="text-white hover:bg-white/10"
            >
              Back to Login
            </Button>
          </Link>
        </motion.div>

        {/* Glassmorphism Card */}
        <div className="card-glass p-8 sm:p-10 backdrop-blur-2xl border border-white/20 shadow-3d-2xl">
          {!emailSent ? (
            // Request Reset Form
            <>
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-8"
              >
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 mb-4 shadow-glow-primary"
                >
                  <Key className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Forgot Password?
                </h2>
                <p className="text-neutral-300">
                  No worries! Enter your email and we'll send you reset instructions.
                </p>
              </motion.div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-semibold text-white mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-primary-400 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-glass pl-12 pr-4 py-4 w-full text-white placeholder-neutral-500 focus:border-primary-400/50"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <GradientButton
                    type="submit"
                    gradient="primary"
                    size="lg"
                    loading={loading}
                    glow={true}
                    className="w-full"
                    icon={<Send className="w-5 h-5" />}
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </GradientButton>
                </motion.div>
              </form>

              {/* Info Box */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl"
              >
                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-white font-semibold mb-1">
                      Secure Process
                    </h4>
                    <p className="text-sm text-neutral-300">
                      The reset link will expire in 1 hour for your security.
                      If you don't see the email, check your spam folder.
                    </p>
                  </div>
                </div>
              </motion.div>
            </>
          ) : (
            // Success State
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-success to-success-light mb-6 shadow-3d-xl"
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>

              <h2 className="text-3xl font-bold text-white mb-3">
                Check Your Email
              </h2>
              <p className="text-neutral-300 mb-2">
                We've sent password reset instructions to
              </p>
              <p className="text-accent-teal font-semibold mb-8">
                {email}
              </p>

              {/* Instructions */}
              <div className="text-left space-y-3 mb-8 p-6 bg-white/5 rounded-xl border border-white/10">
                <h4 className="text-white font-semibold mb-3">Next Steps:</h4>
                {[
                  'Check your email inbox (and spam folder)',
                  'Click the reset link in the email',
                  'Create your new password',
                  'Sign in with your new password',
                ].map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-neutral-300 text-sm">{step}</p>
                  </motion.div>
                ))}
              </div>

              {/* Resend Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <p className="text-neutral-400 text-sm mb-4">
                  Didn't receive the email?
                </p>
                <Button
                  variant="outline"
                  onClick={handleResend}
                  loading={loading}
                  className="w-full border-white/20 text-white hover:bg-white/10"
                  icon={<Send className="w-4 h-4" />}
                >
                  {loading ? 'Sending...' : 'Resend Email'}
                </Button>
              </motion.div>

              {/* Back to Login */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-6"
              >
                <Link
                  to={ROUTES.LOGIN}
                  className="text-accent-teal hover:text-accent-teal-light font-semibold text-sm transition-colors"
                >
                  ← Back to Login
                </Link>
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Logo Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-white/60">
            <Package className="w-5 h-5" />
            <span className="font-semibold">StockFlow</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};