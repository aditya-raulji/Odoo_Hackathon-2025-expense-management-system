'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      // Redirect based on user role
      if (user?.role === 'admin') {
        router.push('/dashboard/admin');
      } else if (user?.role === 'manager') {
        router.push('/dashboard/approvals');
      } else if (user?.role === 'employee') {
        router.push('/dashboard/expenses');
      }
    }
  }, [user, isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-8">
          <div className="text-2xl font-bold text-white">ExMan</div>
          <nav className="flex items-center gap-6 text-sm text-blue-200">
            <button className="hover:text-white">Features</button>
            <button className="hover:text-white">Pricing</button>
            <button className="hover:text-white">Support</button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <a href="/auth" className="text-sm text-blue-200 hover:text-white">Log in</a>
          <a href="/auth" className="bg-white text-blue-900 text-sm font-medium px-4 py-2 rounded hover:bg-blue-50">Get Started</a>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 px-8 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-extrabold tracking-tight text-white mb-6">
            Expense Management Made Simple
          </h1>
          <p className="mt-6 text-blue-200 text-lg max-w-2xl mx-auto">
            Streamline your company's expense tracking, approval workflows, and financial reporting with our comprehensive expense management system.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <a href="/auth" className="bg-white text-blue-900 text-sm font-medium px-6 py-3 rounded hover:bg-blue-50">
              Start Free Trial
            </a>
            <button className="bg-blue-600 text-white text-sm px-6 py-3 rounded hover:bg-blue-700">
              Watch Demo
            </button>
          </div>
        </div>
      </main>

      {/* Features */}
      <section className="relative z-10 px-8 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Why Choose ExMan?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-white mb-2">Role-Based Access</h3>
              <p className="text-blue-200">Admin, Manager, and Employee roles with appropriate permissions and workflows.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold text-white mb-2">Multi-Currency Support</h3>
              <p className="text-blue-200">Automatic currency detection and conversion for global companies.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-white mb-2">Real-Time Reporting</h3>
              <p className="text-blue-200">Comprehensive dashboards and reports for better financial insights.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
