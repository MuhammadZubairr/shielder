import Link from 'next/link';
import { ROUTES } from '@/utils/constants';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Shielder
          </h1>
          <p className="text-2xl text-gray-700 mb-4">
            Industrial Filters Digital Platform
          </p>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            Enterprise digital backbone for industrial filters. Streamline your operations,
            manage products, and grow your business with our comprehensive platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href={ROUTES.REGISTER}
              className="btn-primary px-8 py-4 text-lg"
            >
              Get Started
            </Link>
            <Link
              href={ROUTES.LOGIN}
              className="btn-secondary px-8 py-4 text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="card text-center">
            <div className="text-4xl mb-4">🏭</div>
            <h3 className="text-xl font-bold mb-2">Product Catalog</h3>
            <p className="text-gray-600">
              Comprehensive catalog management with multilingual support
            </p>
          </div>

          <div className="card text-center">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-bold mb-2">Order Management</h3>
            <p className="text-gray-600">
              Streamlined order processing and tracking system
            </p>
          </div>

          <div className="card text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Analytics & Reports</h3>
            <p className="text-gray-600">
              Real-time insights and comprehensive reporting
            </p>
          </div>
        </div>

        {/* Multilingual Support */}
        <div className="mt-16 text-center">
          <p className="text-gray-600">
            Available in English and Arabic (العربية)
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-24">
        <div className="container mx-auto px-4 text-center">
          <p>© 2026 Shielder Digital Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
