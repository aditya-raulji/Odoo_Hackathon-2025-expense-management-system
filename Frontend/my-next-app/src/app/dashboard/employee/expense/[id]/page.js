"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import EmployeeHeader from '@/components/EmployeeHeader';
import EmployeeNavigation from '@/components/EmployeeNavigation';

export default function ExpenseDetailsPage() {
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);

  const router = useRouter();
  const params = useParams();
  const { user, company, logout } = useAuth();

  // Mock data for expense details
  const mockExpense = {
    id: 3,
    description: "Office supplies",
    date: "2024-01-13",
    category: "Office Supplies",
    paidBy: "Sarah",
    remarks: "Stationery and notebooks for project documentation",
    amount: 1200,
    currency: "INR",
    status: "approved",
    receipt: "receipt_003.pdf",
    submittedAt: "2024-01-13T09:20:00Z",
    approvedAt: "2024-01-13T14:30:00Z",
    approvedBy: "Manager Name",
    approvalHistory: [
      {
        id: 1,
        approver: "Sarah",
        status: "Submitted",
        time: "2024-01-13T09:20:00Z",
        comment: "Expense submitted for approval"
      },
      {
        id: 2,
        approver: "Manager Name",
        status: "Approved",
        time: "2024-01-13T14:30:00Z",
        comment: "Approved - legitimate office supplies"
      }
    ]
  };

  useEffect(() => {
    // Temporary: Comment out role check for testing
    // if (!user || user.role !== 'employee') {
    //   router.push('/auth');
    //   return;
    // }

    // Simulate API call with mock data
    setTimeout(() => {
      setExpense(mockExpense);
      setLoading(false);
    }, 1000);
  }, [user, router, params.id]);

  const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
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
      'draft': 'bg-gray-100 text-gray-800',
      'submitted': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      'draft': 'Draft',
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

  const getApprovalStatusColor = (status) => {
    const colors = {
      'Submitted': 'bg-blue-100 text-blue-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Pending': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading expense details...</p>
        </div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Expense not found</h3>
          <p className="mt-1 text-sm text-gray-500">The expense you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/dashboard/employee/expenses')}
            className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Back to Expenses
          </button>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Expense Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Expense Header */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{expense.description}</h2>
                  <p className="text-sm text-gray-600">{expense.remarks}</p>
                </div>
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(expense.status)}`}>
                  {getStatusText(expense.status)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Expense Details</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Amount</dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {formatCurrency(expense.amount, expense.currency)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Category</dt>
                      <dd>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(expense.category)}`}>
                          {expense.category}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Date</dt>
                      <dd className="text-sm text-gray-900">{formatDate(expense.date)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Paid By</dt>
                      <dd className="text-sm text-gray-900">{expense.paidBy}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Submitted</dt>
                      <dd className="text-sm text-gray-900">
                        {expense.submittedAt ? formatDateTime(expense.submittedAt) : 'Not submitted'}
                      </dd>
                    </div>
                    {expense.approvedAt && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Approved</dt>
                        <dd className="text-sm text-gray-900">{formatDateTime(expense.approvedAt)}</dd>
                      </div>
                    )}
                    {expense.approvedBy && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Approved By</dt>
                        <dd className="text-sm text-gray-900">{expense.approvedBy}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Receipt</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">{expense.receipt}</p>
                    <button
                      onClick={() => setShowReceipt(!showReceipt)}
                      className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {showReceipt ? 'Hide' : 'View'} Receipt
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Receipt Preview */}
            {showReceipt && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Receipt Preview</h3>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="text-center text-gray-500">
                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-sm">Receipt image would be displayed here</p>
                    <p className="text-xs text-gray-400">PDF or image file preview</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Approval Timeline */}
          <div className="space-y-6">
            {/* Approval Timeline */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Approval Timeline</h3>
              <div className="space-y-4">
                {expense.approvalHistory.map((item, index) => (
                  <div key={item.id} className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.status === 'Approved' ? 'bg-green-100' : 
                      item.status === 'Rejected' ? 'bg-red-100' : 
                      'bg-blue-100'
                    }`}>
                      {item.status === 'Approved' ? (
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : item.status === 'Rejected' ? (
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : (
                        <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{item.approver}</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getApprovalStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{formatDateTime(item.time)}</p>
                      {item.comment && (
                        <p className="text-sm text-gray-600 mt-1">{item.comment}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => console.log('Download receipt for expense:', expense.id)}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Receipt
                </button>
                
                {expense.status === 'draft' && (
                  <button
                    onClick={() => console.log('Edit expense:', expense.id)}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Expense
                  </button>
                )}
                
                <button
                  onClick={() => router.push('/dashboard/employee/expenses')}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Expenses
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
