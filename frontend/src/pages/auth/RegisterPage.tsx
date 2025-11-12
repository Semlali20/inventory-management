import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authService } from '@/services/auth.service';
import { ROUTES } from '@/config/constants';
import { RegisterRequest } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { validation } from '@/utils/validation';
import toast from 'react-hot-toast';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterRequest & { confirmPassword: string }>();

  const password = watch('password');

  const onSubmit = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      await authService.register(data);
      toast.success('Registration successful! Please login.');
      navigate(ROUTES.LOGIN);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Create account</h2>
          <p className="mt-2 text-sm text-gray-600">Sign up for a new account</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Username"
            type="text"
            {...register('username', { required: 'Username is required' })}
            error={errors.username?.message}
            autoComplete="username"
          />
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
          <Input
            label="First Name"
            type="text"
            {...register('firstName')}
            error={errors.firstName?.message}
            autoComplete="given-name"
          />
          <Input
            label="Last Name"
            type="text"
            {...register('lastName')}
            error={errors.lastName?.message}
            autoComplete="family-name"
          />
          <Input
            label="Password"
            type="password"
            {...register('password', {
              required: 'Password is required',
              validate: (value) => {
                const result = validation.password(value);
                return result.valid || result.message;
              },
            })}
            error={errors.password?.message}
            autoComplete="new-password"
          />
          <Input
            label="Confirm Password"
            type="password"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === password || 'Passwords do not match',
            })}
            error={errors.confirmPassword?.message}
            autoComplete="new-password"
          />
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Sign up
          </Button>
          <div className="text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link to={ROUTES.LOGIN} className="text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

