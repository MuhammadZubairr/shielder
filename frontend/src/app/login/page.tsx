/**
 * Login Page
 * User login form with Arabic/English support
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { ROUTES, VALIDATION_RULES } from '@/utils/constants';
import type { LoginRequest } from '@/types';

export default function LoginPage() {
  const { login, isSubmitting } = useAuth();
  const { t, isRTL, locale, setLocale } = useLanguage();
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginRequest>>({});

  /**
   * Validate form
   */
  const validate = (): boolean => {
    const newErrors: Partial<LoginRequest> = {};

    if (!formData.email) {
      newErrors.email = t.emailRequired;
    } else if (!VALIDATION_RULES.EMAIL_REGEX.test(formData.email)) {
      newErrors.email = t.invalidEmail;
    }

    if (!formData.password) {
      newErrors.password = t.passwordRequired;
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
      await login(formData);
    } catch (error) {
      // Error handled in useAuth hook
      console.error('Login error:', error);
    }
  };

  /**
   * Handle input change
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name as keyof LoginRequest]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Language Switcher */}
        <div className="flex justify-end">
          <button
            onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            {locale === 'en' ? 'العربية' : 'English'}
          </button>
        </div>

        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Shielder</h1>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {t.welcomeBack}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t.dontHaveAccount}{' '}
            <Link
              href={ROUTES.REGISTER}
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              {t.signUp}
            </Link>
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t.email}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 input-field ${
                  errors.email ? 'border-red-500 focus:ring-red-500' : ''
                }`}
                placeholder={t.enterEmail}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t.password}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 input-field ${
                  errors.password ? 'border-red-500 focus:ring-red-500' : ''
                }`}
                placeholder={t.enterPassword}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          </div>

          {/* Remember me / Forgot password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className={`${isRTL ? 'mr-2' : 'ml-2'} block text-sm text-gray-900`}>
                {t.rememberMe}
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                {t.forgotPassword}
              </a>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary text-lg py-3"
            >
              {isSubmitting ? t.loading : t.signIn}
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
