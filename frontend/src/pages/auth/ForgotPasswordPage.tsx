import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authService } from '@/services/auth.service';
import { ROUTES } from '@/config/constants';
import { PasswordResetRequest } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { validation } from '@/utils/validation';
import toast from 'react-hot-toast';

export const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetRequest>();

  const onSubmit = async (data: PasswordResetRequest) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setIsSubmitted(true);
      toast.success('Password reset link sent to your email');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Check your email</h2>
            <p className="text-gray-600 mb-6">
              We've sent a password reset link to your email address.
            </p>
            <Link to={ROUTES.LOGIN}>
              <Button>Back to Login</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Forgot password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we'll send you a reset link
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            {...register('email', {
              required: 'Email is required',
              validate: (value) => validation.email(value) || 'Invalid email address',
            })}
            error={errors.email?.message}
            autoComplete="email"
          />
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Send reset link
          </Button>
          <div className="text-center text-sm">
            <Link to={ROUTES.LOGIN} className="text-primary-600 hover:text-primary-500">
              Back to login
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

