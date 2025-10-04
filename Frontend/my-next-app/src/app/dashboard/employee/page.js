"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import EmployeeHeader from '@/components/EmployeeHeader';
import EmployeeNavigation from '@/components/EmployeeNavigation';

export default function EmployeeDashboard() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    toSubmit: 0,
    toSubmitAmount: 0,
    waitingApproval: 0,
    waitingAmount: 0,
    approved: 0,
    approvedAmount: 0
  });

  const router = useRouter();
  const { user, company, logout } = useAuth();

  // Mock data for employee expenses
  const mockExpenses = [
    {
      id: 1,
      description: "Restaurant bill",
      date: "2024-01-15",
      category: "Food",
      paidBy: "Sarah",
      remarks: "Client meeting lunch",
      amount: 2500,
      currency: "INR",
      status: "draft",
      receipt: "receipt_001.pdf",
      submittedAt: null,
      approvedAt: null,
      approvedBy: null
    },
    {
      id: 2,
      description: "Taxi fare",
      date: "2024-01-14",
      category: "Transportation",
      paidBy: "Sarah",
      remarks: "Office to client location",
      amount: 800,
      currency: "INR",
      status: "submitted",
      receipt: "receipt_002.pdf",
      submittedAt: "2024-01-14T10:30:00Z",
      approvedAt: null,
      approvedBy: null
    },
    {
      id: 3,
      description: "Office supplies",
      date: "2024-01-13",
      category: "Office Supplies",
      paidBy: "Sarah",
      remarks: "Stationery and notebooks",
      amount: 1200,
      currency: "INR",
      status: "approved",
      receipt: "receipt_003.pdf",
      submittedAt: "2024-01-13T09:20:00Z",
      approvedAt: "2024-01-13T14:30:00Z",
      approvedBy: "Manager Name"
    },
    {
      id: 4,
      description: "Conference ticket",
      date: "2024-01-12",
      category: "Training",
      paidBy: "Sarah",
      remarks: "Tech conference registration",
      amount: 5000,
      currency: "INR",
      status: "rejected",
      receipt: "receipt_004.pdf",
      submittedAt: "2024-01-12T11:15:00Z",
      approvedAt: "2024-01-12T16:45:00Z",
      approvedBy: "Manager Name"
    }
  ];

  useEffect(() => {
    // Temporary: Comment out role check for testing
    // if (!user || user.role !== 'employee') {
    //   router.push('/auth');
    //   return;
    // }

    // Simulate API call with mock data
    setTimeout(() => {
      setExpenses(mockExpenses);
      calculateStats(mockExpenses);
      setLoading(false);
    }, 1000);
  }, [user, router]);

  const calculateStats = (expenseData) => {
    const toSubmit = expenseData.filter(exp => exp.status === 'draft');
    const waitingApproval = expenseData.filter(exp => exp.status === 'submitted');
    const approved = expenseData.filter(exp => exp.status === 'approved');

    const stats = {
      toSubmit: toSubmit.length,
      toSubmitAmount: toSubmit.reduce((sum, exp) => sum + exp.amount, 0),
      waitingApproval: waitingApproval.length,
      waitingAmount: waitingApproval.reduce((sum, exp) => sum + exp.amount, 0),
      approved: approved.length,
      approvedAmount: approved.reduce((sum, exp) => sum + exp.amount, 0)
    };

    setStats(stats);
  };

  const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-800',
      'submitted': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      'draft': 'To Submit',
      'submitted': 'Waiting Approval',
      'approved': 'Approved',
      'rejected': 'Rejected'
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <EmployeeHeader
        title="Employee Dashboard"
        subtitle={company?.name || 'Company Name'}
        userName={user?.name || 'Employee'}
        onLogout={logout}
      />
      
      {/* Navigation */}
      <EmployeeNavigation />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg animate-scale-in">
          {/* Header Section */}
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">My Expense Dashboard</h2>
                <p className="text-sm text-gray-600">Track and manage your expense submissions</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live Updates</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* To Submit */}
              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">To Submit</h3>
                    <p className="text-2xl font-bold text-gray-600">{stats.toSubmit}</p>
                    <p className="text-sm text-gray-500">{formatCurrency(stats.toSubmitAmount)}</p>
                  </div>
                </div>
              </div>

              {/* Waiting Approval */}
              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Waiting Approval</h3>
                    <p className="text-2xl font-bold text-yellow-600">{stats.waitingApproval}</p>
                    <p className="text-sm text-gray-500">{formatCurrency(stats.waitingAmount)}</p>
                  </div>
                </div>
              </div>

              {/* Approved */}
              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Approved</h3>
                    <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                    <p className="text-sm text-gray-500">{formatCurrency(stats.approvedAmount)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Expenses */}
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Recent Expenses</h3>
              <button
                onClick={() => router.push('/dashboard/employee/expenses')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expenses.slice(0, 5).map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{expense.description}</div>
                        <div className="text-sm text-gray-500">{expense.remarks}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(expense.date).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(expense.amount, expense.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(expense.status)}`}>
                          {getStatusText(expense.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => console.log('View details for expense:', expense.id)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {expenses.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No expenses found</h3>
                <p className="mt-1 text-sm text-gray-500">Start by submitting your first expense.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
