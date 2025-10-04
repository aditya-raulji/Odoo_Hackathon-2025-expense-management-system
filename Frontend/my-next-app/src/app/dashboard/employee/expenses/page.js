"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import EmployeeHeader from '@/components/EmployeeHeader';
import EmployeeNavigation from '@/components/EmployeeNavigation';

export default function MyExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('all');

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
    },
    {
      id: 5,
      description: "Flight ticket",
      date: "2024-01-11",
      category: "Travel",
      paidBy: "Sarah",
      remarks: "Business trip to Mumbai",
      amount: 8500,
      currency: "INR",
      status: "approved",
      receipt: "receipt_005.pdf",
      submittedAt: "2024-01-11T08:45:00Z",
      approvedAt: "2024-01-11T12:20:00Z",
      approvedBy: "Manager Name"
    },
    {
      id: 6,
      description: "Hotel booking",
      date: "2024-01-10",
      category: "Travel",
      paidBy: "Sarah",
      remarks: "2 nights stay in Mumbai",
      amount: 6000,
      currency: "INR",
      status: "submitted",
      receipt: "receipt_006.pdf",
      submittedAt: "2024-01-10T15:30:00Z",
      approvedAt: null,
      approvedBy: null
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
      setLoading(false);
    }, 1000);
  }, [user, router]);

  const filteredExpenses = expenses.filter(expense => {
    const matchesFilter = filter === 'all' || expense.status === filter;
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.remarks.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDateRange = true;
    if (dateRange !== 'all') {
      const expenseDate = new Date(expense.date);
      const now = new Date();
      const daysDiff = Math.floor((now - expenseDate) / (1000 * 60 * 60 * 24));
      
      switch (dateRange) {
        case 'today':
          matchesDateRange = daysDiff === 0;
          break;
        case 'week':
          matchesDateRange = daysDiff <= 7;
          break;
        case 'month':
          matchesDateRange = daysDiff <= 30;
          break;
        case 'quarter':
          matchesDateRange = daysDiff <= 90;
          break;
        default:
          matchesDateRange = true;
      }
    }
    
    return matchesFilter && matchesSearch && matchesDateRange;
  });

  const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  const getCategoryColor = (category) => {
    const colors = {
      'Food': 'bg-green-100 text-green-800',
      'Transportation': 'bg-blue-100 text-blue-800',
      'Office Supplies': 'bg-purple-100 text-purple-800',
      'Travel': 'bg-indigo-100 text-indigo-800',
      'Training': 'bg-yellow-100 text-yellow-800',
      'Entertainment': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getStats = () => {
    const total = expenses.length;
    const draft = expenses.filter(exp => exp.status === 'draft').length;
    const submitted = expenses.filter(exp => exp.status === 'submitted').length;
    const approved = expenses.filter(exp => exp.status === 'approved').length;
    const rejected = expenses.filter(exp => exp.status === 'rejected').length;
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const approvedAmount = expenses.filter(exp => exp.status === 'approved').reduce((sum, exp) => sum + exp.amount, 0);
    
    return { total, draft, submitted, approved, rejected, totalAmount, approvedAmount };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your expenses...</p>
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
                <h2 className="text-3xl font-bold text-gray-800 mb-2">My Expenses</h2>
                <p className="text-sm text-gray-600">Track and manage all your expense submissions</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live Updates</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Total</h3>
                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Draft</h3>
                    <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Pending</h3>
                    <p className="text-2xl font-bold text-yellow-600">{stats.submitted}</p>
                  </div>
                </div>
              </div>
              
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
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Rejected</h3>
                    <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by description, category, or remarks..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="submitted">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                </select>
              </div>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="p-8">
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
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{expense.description}</div>
                        <div className="text-sm text-gray-500">{expense.remarks}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(expense.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(expense.category)}`}>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {expense.submittedAt ? 
                          new Date(expense.submittedAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 
                          '-'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => console.log('View details for expense:', expense.id)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            👁️ View
                          </button>
                          {expense.status === 'draft' && (
                            <button
                              onClick={() => console.log('Edit expense:', expense.id)}
                              className="text-gray-600 hover:text-gray-900 transition-colors"
                            >
                              ✏️ Edit
                            </button>
                          )}
                          <button
                            onClick={() => console.log('Download receipt for expense:', expense.id)}
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                          >
                            📄 Receipt
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredExpenses.length === 0 && (
                <div className="text-center text-gray-500 py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No expenses found</h3>
                  <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
