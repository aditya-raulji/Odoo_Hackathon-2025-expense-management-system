"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { 
  FileText, 
  CheckCircle, 
  Users, 
  Settings, 
  DollarSign,
  TrendingUp,
  Clock
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const { user, company } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }

    // Redirect based on role
    if (user.role === 'employee') {
      router.push('/dashboard/employee');
    } else if (user.role === 'manager') {
      router.push('/dashboard/manager');
    } else if (user.role === 'admin') {
      router.push('/dashboard/admin');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const getRoleBasedStats = () => {
    switch (user.role) {
      case 'employee':
        return [
          { name: 'Total Expenses', value: '0', icon: FileText, color: 'text-blue-600' },
          { name: 'Pending Approval', value: '0', icon: Clock, color: 'text-yellow-600' },
          { name: 'Approved', value: '0', icon: CheckCircle, color: 'text-green-600' }
        ];
      case 'manager':
        return [
          { name: 'Pending Approvals', value: '0', icon: Clock, color: 'text-yellow-600' },
          { name: 'Approved This Month', value: '0', icon: CheckCircle, color: 'text-green-600' },
          { name: 'Total Amount', value: '$0.00', icon: DollarSign, color: 'text-blue-600' }
        ];
      case 'admin':
        return [
          { name: 'Total Users', value: '0', icon: Users, color: 'text-blue-600' },
          { name: 'Active Rules', value: '0', icon: Settings, color: 'text-purple-600' },
          { name: 'Total Expenses', value: '0', icon: TrendingUp, color: 'text-green-600' }
        ];
      default:
        return [];
    }
  };

  const getQuickActions = () => {
    switch (user.role) {
      case 'employee':
        return [
          { name: 'Submit New Expense', href: '/dashboard/employee', icon: FileText },
          { name: 'View My Expenses', href: '/dashboard/employee', icon: FileText }
        ];
      case 'manager':
        return [
          { name: 'Review Approvals', href: '/dashboard/manager', icon: CheckCircle },
          { name: 'View All Expenses', href: '/dashboard/manager', icon: FileText }
        ];
      case 'admin':
        return [
          { name: 'Manage Users', href: '/dashboard/admin', icon: Users },
          { name: 'Configure Rules', href: '/dashboard/rules', icon: Settings },
          { name: 'View Approvals', href: '/dashboard/manager', icon: CheckCircle }
        ];
      default:
        return [];
    }
  };

  const stats = getRoleBasedStats();
  const quickActions = getQuickActions();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            {company?.name} • {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{stat.name}</h3>
                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => router.push(action.href)}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <Icon className="h-6 w-6 text-blue-600 mr-3" />
                  <span className="font-medium text-gray-900">{action.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="text-center text-gray-500 py-8">
            <p>No recent activity to display.</p>
            <p className="text-sm mt-2">Your recent actions will appear here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
