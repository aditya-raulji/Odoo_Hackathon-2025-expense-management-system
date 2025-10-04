"use client";

import { useState } from 'react';

export default function ExpenseCard({ expense, onApprove, onReject, onViewDetails, showActions = true }) {
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [comment, setComment] = useState('');

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

  const getStatusColor = (status) => {
    const colors = {
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'pending': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleAction = (type) => {
    setActionType(type);
    setShowModal(true);
  };

  const confirmAction = () => {
    if (actionType === 'approve' && onApprove) {
      onApprove(expense.id, comment);
    } else if (actionType === 'reject' && onReject) {
      onReject(expense.id, comment);
    }
    setShowModal(false);
    setComment('');
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-sm font-medium text-blue-600">
                    {expense.employeeName.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{expense.employeeName}</h3>
                <p className="text-sm text-gray-500">{expense.employeeEmail}</p>
                {expense.employeeId && (
                  <p className="text-xs text-gray-400">ID: {expense.employeeId}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Amount</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(expense.amount)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Category</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(expense.category)}`}>
                  {expense.category}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date</p>
                <p className="text-sm text-gray-900">{formatDate(expense.date)}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
              <p className="text-sm text-gray-900">{expense.description}</p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm text-gray-500">Receipt: {expense.receipt}</span>
              </div>
              
              {expense.status && (
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(expense.status)}`}>
                  {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                </span>
              )}
            </div>
          </div>
          
          {showActions && (
            <div className="flex flex-col gap-2 ml-6">
              {expense.status === 'pending' && (
                <>
                        <button
                          onClick={() => handleAction('approve')}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleAction('reject')}
                          className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-2 rounded-lg hover:from-red-700 hover:to-rose-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                          ✗ Reject
                        </button>
                </>
              )}
              <button
                onClick={() => {
                  console.log('View details for expense:', expense.id);
                  onViewDetails && onViewDetails(expense.id);
                }}
                className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
              >
                👁️ View Details
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="mt-2 px-7 py-3">
                <h3 className="text-lg font-medium text-gray-900 text-center">
                  {actionType === 'approve' ? 'Approve' : 'Reject'} Expense
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500 text-center">
                    Expense #{expense.id} by {expense.employeeName}
                  </p>
                  <p className="text-sm text-gray-500 text-center">
                    Amount: {formatCurrency(expense.amount)}
                  </p>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Comment (Optional)
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    rows="3"
                    placeholder="Add your comment here..."
                  />
                </div>
              </div>
              <div className="items-center px-4 py-3">
                <div className="flex gap-3">
                  <button
                    onClick={confirmAction}
                    className={`px-4 py-2 text-white text-base font-medium rounded-md w-full shadow-sm focus:outline-none focus:ring-2 ${
                      actionType === 'approve' 
                        ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                        : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    }`}
                  >
                    {actionType === 'approve' ? 'Approve' : 'Reject'}
                  </button>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="mt-3 px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
