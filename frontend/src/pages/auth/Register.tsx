import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { GraduationCap, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import api from '../../lib/axios';

export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', data);
      if (response.data.success) {
        toast.success('Registration successful! Please login.');
        navigate('/login');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
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
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
              Log in instead
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Full Name"
            leftIcon={<User className="w-5 h-5" />}
            placeholder="John Doe"
            error={errors.fullName?.message as string}
            {...register('fullName', { 
              required: 'Full name is required',
              minLength: { value: 2, message: 'Minimum 2 characters' }
            })}
          />

          <Input
            label="Email Address"
            type="email"
            leftIcon={<Mail className="w-5 h-5" />}
            placeholder="you@example.com"
            error={errors.email?.message as string}
            {...register('email', { 
              required: 'Email is required',
              pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email address' }
            })}
          />

          <Input
            label="Phone Number"
            type="tel"
            leftIcon={<Phone className="w-5 h-5" />}
            placeholder="9876543210"
            error={errors.phone?.message as string}
            {...register('phone', { 
              required: 'Phone number is required',
              pattern: { value: /^[6-9]\d{9}$/, message: 'Enter a valid 10-digit Indian mobile number' }
            })}
          />

          <Input
            label="Password"
            type="password"
            leftIcon={<Lock className="w-5 h-5" />}
            placeholder="••••••••"
            error={errors.password?.message as string}
            {...register('password', { 
              required: 'Password is required',
              minLength: { value: 8, message: 'Minimum 8 characters' },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                message: 'Must contain uppercase, lowercase, and number'
              }
            })}
          />

          <Input
            label="Confirm Password"
            type="password"
            leftIcon={<Lock className="w-5 h-5" />}
            placeholder="••••••••"
            error={errors.confirmPassword?.message as string}
            {...register('confirmPassword', { 
              required: 'Please confirm password',
              validate: value => value === password || 'Passwords do not match'
            })}
          />

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full h-12 text-base"
              isLoading={isLoading}
              rightIcon={!isLoading && <ArrowRight className="w-5 h-5" />}
            >
              Create Account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
