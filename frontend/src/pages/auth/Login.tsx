import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { GraduationCap, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [debugError, setDebugError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setDebugError(null);
    try {
      const response = await api.post('/auth/login', data);
      if (response.data.success) {
        toast.success('Logged in successfully!');
        login(response.data.data.user, response.data.data.accessToken, response.data.data.refreshToken);
        
        if (response.data.data.user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/student/dashboard');
        }
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Network error';
      const status = error.response?.status || 'No response';
      const detail = `Status: ${status} | ${msg} | API: ${import.meta.env.VITE_API_URL}`;
      setDebugError(detail);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 card p-8 md:p-10">
        <div className="text-center">
          <Link to="/" className="mx-auto w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mb-4 hover:opacity-90 transition-opacity" title="Go to Homepage">
            <GraduationCap className="text-white w-7 h-7" />
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
              Register now
            </Link>
          </p>
        </div>

        {debugError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs font-mono text-red-700 break-all">{debugError}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              autoComplete="email"
              leftIcon={<Mail className="w-5 h-5" />}
              placeholder="you@example.com"
              error={errors.email?.message as string}
              {...register('email', { 
                required: 'Email is required',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email address' }
              })}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                leftIcon={<Lock className="w-5 h-5" />}
                placeholder="••••••••"
                error={errors.password?.message as string}
                {...register('password', { required: 'Password is required' })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 cursor-pointer">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                Forgot password?
              </a>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base"
            isLoading={isLoading}
            rightIcon={!isLoading && <ArrowRight className="w-5 h-5" />}
          >
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
