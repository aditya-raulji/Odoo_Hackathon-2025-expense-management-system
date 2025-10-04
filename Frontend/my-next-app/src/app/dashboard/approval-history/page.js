"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ManagerHeader from '@/components/ManagerHeader';
import ManagerNavigation from '@/components/ManagerNavigation';

export default function ApprovalHistoryPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const router = useRouter();
  const { user, company, logout } = useAuth();

  // Mock data for approval history
  const mockHistoryData = [
    {
      id: 1,
      employeeName: "Rajesh Kumar",
      employeeEmail: "rajesh@company.com",
      amount: 2500,
      category: "Travel",
      description: "Client meeting travel expenses",
      date: "2024-01-15",
      receipt: "receipt_001.pdf",
      status: "approved",
      submittedAt: "2024-01-15T10:30:00Z",
      approvedAt: "2024-01-15T14:20:00Z",
      approvedBy: "Manager Name",
      comment: "Approved for client meeting"
    },
    {
      id: 2,
      employeeName: "Priya Sharma",
      employeeEmail: "priya@company.com",
      amount: 1200,
      category: "Meals",
      description: "Team lunch with client",
      date: "2024-01-14",
      receipt: "receipt_002.pdf",
      status: "approved",
      submittedAt: "2024-01-14T15:45:00Z",
      approvedAt: "2024-01-14T16:30:00Z",
      approvedBy: "Manager Name",
      comment: "Client entertainment approved"
    },
    {
      id: 3,
      employeeName: "Amit Singh",
      employeeEmail: "amit@company.com",
      amount: 3500,
      category: "Office Supplies",
      description: "Laptop accessories and software licenses",
      date: "2024-01-13",
      receipt: "receipt_003.pdf",
      status: "rejected",
      submittedAt: "2024-01-13T09:20:00Z",
      approvedAt: "2024-01-13T11:15:00Z",
      approvedBy: "Manager Name",
      comment: "Software licenses not approved - use company provided licenses"
    },
    {
      id: 4,
      employeeName: "Sneha Patel",
      employeeEmail: "sneha@company.com",
      amount: 800,
      category: "Transportation",
      description: "Taxi fare for office visits",
      date: "2024-01-12",
      receipt: "receipt_004.pdf",
      status: "approved",
      submittedAt: "2024-01-12T14:15:00Z",
      approvedAt: "2024-01-12T15:45:00Z",
      approvedBy: "Manager Name",
      comment: "Transportation approved"
    },
    {
      id: 5,
      employeeName: "Vikram Joshi",
      employeeEmail: "vikram@company.com",
      amount: 1800,
      category: "Training",
      description: "Online course subscription",
      date: "2024-01-11",
      receipt: "receipt_005.pdf",
      status: "approved",
      submittedAt: "2024-01-11T11:30:00Z",
      approvedAt: "2024-01-11T13:20:00Z",
      approvedBy: "Manager Name",
      comment: "Training course approved for skill development"
    },
    {
      id: 6,
      employeeName: "Anita Gupta",
      employeeEmail: "anita@company.com",
      amount: 4500,
      category: "Travel",
      description: "Conference travel expenses",
      date: "2024-01-10",
      receipt: "receipt_006.pdf",
      status: "rejected",
      submittedAt: "2024-01-10T09:00:00Z",
      approvedAt: "2024-01-10T10:30:00Z",
      approvedBy: "Manager Name",
      comment: "Conference budget exceeded - please use alternative travel options"
    },
    {
      id: 7,
      employeeName: "Rohit Verma",
      employeeEmail: "rohit@company.com",
      amount: 900,
      category: "Meals",
      description: "Client dinner meeting",
      date: "2024-01-09",
      receipt: "receipt_007.pdf",
      status: "approved",
      submittedAt: "2024-01-09T18:30:00Z",
      approvedAt: "2024-01-09T19:15:00Z",
      approvedBy: "Manager Name",
      comment: "Client dinner approved"
    },
    {
      id: 8,
      employeeName: "Kavya Reddy",
      employeeEmail: "kavya@company.com",
      amount: 2200,
      category: "Office Supplies",
      description: "Stationery and office equipment",
      date: "2024-01-08",
      receipt: "receipt_008.pdf",
      status: "approved",
      submittedAt: "2024-01-08T14:20:00Z",
      approvedAt: "2024-01-08T15:45:00Z",
      approvedBy: "Manager Name",
      comment: "Office supplies approved"
    }
  ];

  useEffect(() => {
    // Temporary: Comment out role check for testing
    // if (!user || user.role !== 'manager') {
    //   router.push('/auth');
    //   return;
    // }
    
    // Simulate API call with mock data
    setTimeout(() => {
      setExpenses(mockHistoryData);
      setLoading(false);
    }, 1000);
  }, [user, router]);

  const filteredExpenses = expenses.filter(expense => {
    const matchesFilter = filter === 'all' || expense.status === filter;
    const matchesSearch = expense.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'pending': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Travel': 'bg-blue-100 text-blue-800',
      'Meals': 'bg-green-100 text-green-800',
      'Office Supplies': 'bg-purple-100 text-purple-800',
      'Transportation': 'bg-yellow-100 text-yellow-800',
      'Training': 'bg-indigo-100 text-indigo-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getStats = () => {
    const total = expenses.length;
    const approved = expenses.filter(exp => exp.status === 'approved').length;
    const rejected = expenses.filter(exp => exp.status === 'rejected').length;
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const approvedAmount = expenses.filter(exp => exp.status === 'approved').reduce((sum, exp) => sum + exp.amount, 0);
    
    return { total, approved, rejected, totalAmount, approvedAmount };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading approval history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <ManagerHeader
        title="Manager Dashboard"
        subtitle={company?.name || 'Company Name'}
        userName={user?.name || 'Manager'}
        onLogout={logout}
      />
      
      {/* Navigation */}
      <ManagerNavigation />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg flex flex-col overflow-hidden animate-scale-in">
          {/* Header Section */}
          <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Approval History</h2>
                <p className="text-sm text-gray-600">Complete history of all expense approvals and rejections</p>
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
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Total Processed</h3>
                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
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
              
              <div className="bg-gray-50 p-6 rounded-lg">
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
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
                    <p className="text-lg font-bold text-purple-600">{formatCurrency(stats.totalAmount)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Approved Amount</h3>
                    <p className="text-lg font-bold text-emerald-600">{formatCurrency(stats.approvedAmount)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by employee name, description, or category..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Approval History Table */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Processed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {expense.employeeName.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{expense.employeeName}</div>
                            <div className="text-sm text-gray-500">{expense.employeeEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(expense.amount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(expense.category)}`}>
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{expense.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(expense.status)}`}>
                          {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(expense.submittedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(expense.approvedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => console.log('View details for expense:', expense.id)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => console.log('View comment for expense:', expense.id, expense.comment)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          View Comment
                        </button>
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
