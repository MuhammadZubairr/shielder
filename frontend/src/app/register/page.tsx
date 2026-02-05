/**
 * Register Page
 * User registration form with Arabic/English support
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { ROUTES, VALIDATION_RULES, LOCALES } from '@/utils/constants';
import type { RegisterRequest } from '@/types';

export default function RegisterPage() {
  const { register, isSubmitting } = useAuth();
  const { t, isRTL, locale, setLocale } = useLanguage();
  const [formData, setFormData] = useState<RegisterRequest>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    companyName: '',
    locale: LOCALES.EN,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterRequest, string>>>({});
  const [confirmPassword, setConfirmPassword] = useState('');

  /**
   * Validate form
   */
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof RegisterRequest, string>> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!VALIDATION_RULES.EMAIL_REGEX.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!VALIDATION_RULES.PASSWORD_REGEX.test(formData.password)) {
      newErrors.password =
        'Password must be at least 8 characters with uppercase, lowercase, and number';
    }

    if (confirmPassword !== formData.password) {
      newErrors.password = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await register(formData);
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  /**
   * Handle input change
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof RegisterRequest]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Shielder</h1>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              href={ROUTES.LOGIN}
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div className="md:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 input-field ${
                  errors.email ? 'border-red-500' : ''
                }`}
                placeholder="your.email@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 input-field ${
                  errors.password ? 'border-red-500' : ''
                }`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 input-field"
                placeholder="••••••••"
              />
            </div>

            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName || ''}
                onChange={handleChange}
                className="mt-1 input-field"
                placeholder="John"
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName || ''}
                onChange={handleChange}
                className="mt-1 input-field"
                placeholder="Doe"
              />
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                Company Name
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                value={formData.companyName || ''}
                onChange={handleChange}
                className="mt-1 input-field"
                placeholder="Your Company"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={handleChange}
                className="mt-1 input-field"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            {/* Preferred Language */}
            <div className="md:col-span-2">
              <label htmlFor="locale" className="block text-sm font-medium text-gray-700">
                Preferred Language
              </label>
              <select
                id="locale"
                name="locale"
                value={formData.locale || LOCALES.EN}
                onChange={handleChange}
                className="mt-1 input-field"
              >
                <option value={LOCALES.EN}>English</option>
                <option value={LOCALES.AR}>Arabic (العربية)</option>
              </select>
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              I agree to the{' '}
              <a href="#" className="text-primary-600 hover:text-primary-500">
                Terms and Conditions
              </a>
            </label>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary text-lg py-3"
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
          <Link href={ROUTES.HOME} className="hover:text-primary-600">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
