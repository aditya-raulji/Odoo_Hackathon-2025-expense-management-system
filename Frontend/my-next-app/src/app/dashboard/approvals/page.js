"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ManagerHeader from '@/components/ManagerHeader';
import ManagerNavigation from '@/components/ManagerNavigation';
import ExpenseCard from '@/components/ExpenseCard';
import StatsCard from '@/components/StatsCard';

export default function ManagerApprovalsDashboard() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const { user, company, logout } = useAuth();

  // Mock data for demonstration
  const mockExpenses = [
    {
      id: 1,
      employeeName: "Rajesh Kumar",
      employeeEmail: "rajesh@company.com",
      amount: 2500,
      category: "Travel",
      description: "Client meeting travel expenses",
      date: "2024-01-15",
      receipt: "receipt_001.pdf",
      status: "pending",
      submittedAt: "2024-01-15T10:30:00Z"
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
      status: "pending",
      submittedAt: "2024-01-14T15:45:00Z"
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
      status: "pending",
      submittedAt: "2024-01-13T09:20:00Z"
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
      status: "pending",
      submittedAt: "2024-01-12T14:15:00Z"
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
      status: "pending",
      submittedAt: "2024-01-11T11:30:00Z"
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
      setExpenses(mockExpenses);
      setLoading(false);
    }, 1000);
  }, [user, router]);

  const handleApprove = (expenseId, comment = '') => {
    console.log('Approving expense:', expenseId, 'with comment:', comment);
    
    // Update local state
    setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
    
    // Show success message
    alert(`Expense #${expenseId} approved successfully!`);
  };

  const handleReject = (expenseId, comment = '') => {
    console.log('Rejecting expense:', expenseId, 'with comment:', comment);
    
    // Update local state
    setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
    
    // Show success message
    alert(`Expense #${expenseId} rejected!`);
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pending approvals...</p>
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
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Pending Expense Approvals</h2>
                <p className="text-sm text-gray-600">Review and approve expense submissions from your team</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live Updates</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatsCard
                title="Pending Approvals"
                value={expenses.length}
                color="yellow"
                icon={
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              
              <StatsCard
                title="Approved This Month"
                value="12"
                color="green"
                icon={
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              
              <StatsCard
                title="Rejected This Month"
                value="3"
                color="red"
                icon={
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              
              <StatsCard
                title="Total Amount"
                value={formatCurrency(expenses.reduce((sum, exp) => sum + exp.amount, 0))}
                color="blue"
                icon={
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                }
              />
            </div>
          </div>

          {/* Expenses List */}
          <div className="flex-1 overflow-y-auto p-8">
            {expenses.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No pending approvals</h3>
                <p className="mt-1 text-sm text-gray-500">All caught up! New expense submissions will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {expenses.map((expense) => (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onViewDetails={(id) => console.log('View details for expense:', id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
