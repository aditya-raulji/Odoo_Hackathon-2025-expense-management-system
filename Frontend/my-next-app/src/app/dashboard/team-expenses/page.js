"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ManagerHeader from '@/components/ManagerHeader';
import ManagerNavigation from '@/components/ManagerNavigation';

export default function TeamExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('all');

  const router = useRouter();
  const { user, company, logout } = useAuth();

  // Mock data for team expenses
  const mockTeamExpenses = [
    {
      id: 1,
      employeeName: "Rajesh Kumar",
      employeeEmail: "rajesh@company.com",
      employeeId: "EMP001",
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
      employeeId: "EMP002",
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
      employeeId: "EMP003",
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
      employeeId: "EMP004",
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
      employeeId: "EMP005",
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
      employeeId: "EMP006",
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
      employeeId: "EMP007",
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
      employeeId: "EMP008",
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
    },
    {
      id: 9,
      employeeName: "Arjun Mehta",
      employeeEmail: "arjun@company.com",
      employeeId: "EMP009",
      amount: 1500,
      category: "Transportation",
      description: "Monthly metro pass",
      date: "2024-01-07",
      receipt: "receipt_009.pdf",
      status: "pending",
      submittedAt: "2024-01-07T08:30:00Z"
    },
    {
      id: 10,
      employeeName: "Deepika Nair",
      employeeEmail: "deepika@company.com",
      employeeId: "EMP010",
      amount: 3200,
      category: "Training",
      description: "Professional certification course",
      date: "2024-01-06",
      receipt: "receipt_010.pdf",
      status: "pending",
      submittedAt: "2024-01-06T16:45:00Z"
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
      setExpenses(mockTeamExpenses);
      setLoading(false);
    }, 1000);
  }, [user, router]);

  const filteredExpenses = expenses.filter(expense => {
    const matchesFilter = filter === 'all' || expense.status === filter;
    const matchesSearch = expense.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    
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

  const getTeamStats = () => {
    const total = expenses.length;
    const approved = expenses.filter(exp => exp.status === 'approved').length;
    const rejected = expenses.filter(exp => exp.status === 'rejected').length;
    const pending = expenses.filter(exp => exp.status === 'pending').length;
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const approvedAmount = expenses.filter(exp => exp.status === 'approved').reduce((sum, exp) => sum + exp.amount, 0);
    const pendingAmount = expenses.filter(exp => exp.status === 'pending').reduce((sum, exp) => sum + exp.amount, 0);
    
    return { total, approved, rejected, pending, totalAmount, approvedAmount, pendingAmount };
  };

  const teamStats = getTeamStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading team expenses...</p>
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
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Team Expenses Overview</h2>
                <p className="text-sm text-gray-600">Complete overview of all team member expenses</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live Updates</span>
              </div>
            </div>
          </div>

          {/* Team Stats Cards */}
          <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
                    <p className="text-2xl font-bold text-blue-600">{teamStats.total}</p>
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
                    <p className="text-2xl font-bold text-green-600">{teamStats.approved}</p>
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
                    <p className="text-2xl font-bold text-yellow-600">{teamStats.pending}</p>
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
                    <p className="text-2xl font-bold text-red-600">{teamStats.rejected}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
                    <p className="text-lg font-bold text-purple-600">{formatCurrency(teamStats.totalAmount)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Approved Amount</h3>
                    <p className="text-lg font-bold text-emerald-600">{formatCurrency(teamStats.approvedAmount)}</p>
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
                  placeholder="Search by employee name, description, or category..."
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
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
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

          {/* Team Expenses Table */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg shadow-sm">
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
                      Date
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
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-md">
                              <span className="text-sm font-medium text-blue-600">
                                {expense.employeeName.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{expense.employeeName}</div>
                            <div className="text-sm text-gray-500">{expense.employeeId}</div>
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
                        {formatDate(expense.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => console.log('View details for expense:', expense.id)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            👁️ View
                          </button>
                          {expense.status === 'pending' && (
                            <button
                              onClick={() => console.log('Quick approve expense:', expense.id)}
                              className="text-green-600 hover:text-green-900 transition-colors"
                            >
                              ✓ Quick Approve
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

            {/* Employee Summary Cards */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Employee Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from(new Set(expenses.map(exp => exp.employeeName))).map(employeeName => {
                  const employeeExpenses = expenses.filter(exp => exp.employeeName === employeeName);
                  const employeeStats = {
                    total: employeeExpenses.length,
                    approved: employeeExpenses.filter(exp => exp.status === 'approved').length,
                    pending: employeeExpenses.filter(exp => exp.status === 'pending').length,
                    rejected: employeeExpenses.filter(exp => exp.status === 'rejected').length,
                    totalAmount: employeeExpenses.reduce((sum, exp) => sum + exp.amount, 0),
                    approvedAmount: employeeExpenses.filter(exp => exp.status === 'approved').reduce((sum, exp) => sum + exp.amount, 0)
                  };
                  
                  return (
                    <div key={employeeName} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow animate-fade-in">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-md">
                          <span className="text-lg font-medium text-blue-600">
                            {employeeName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-medium text-gray-900">{employeeName}</h4>
                          <p className="text-sm text-gray-500">{employeeExpenses[0]?.employeeEmail}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Total Expenses:</span>
                          <span className="text-sm font-medium">{employeeStats.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Approved:</span>
                          <span className="text-sm font-medium text-green-600">{employeeStats.approved}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Pending:</span>
                          <span className="text-sm font-medium text-yellow-600">{employeeStats.pending}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Rejected:</span>
                          <span className="text-sm font-medium text-red-600">{employeeStats.rejected}</span>
                        </div>
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Total Amount:</span>
                            <span className="text-sm font-medium">{formatCurrency(employeeStats.totalAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Approved Amount:</span>
                            <span className="text-sm font-medium text-green-600">{formatCurrency(employeeStats.approvedAmount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
