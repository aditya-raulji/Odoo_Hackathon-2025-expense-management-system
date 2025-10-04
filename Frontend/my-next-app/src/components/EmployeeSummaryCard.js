"use client";

export default function EmployeeSummaryCard({ employeeName, employeeEmail, employeeId, expenses }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const stats = {
    total: expenses.length,
    approved: expenses.filter(exp => exp.status === 'approved').length,
    pending: expenses.filter(exp => exp.status === 'pending').length,
    rejected: expenses.filter(exp => exp.status === 'rejected').length,
    totalAmount: expenses.reduce((sum, exp) => sum + exp.amount, 0),
    approvedAmount: expenses.filter(exp => exp.status === 'approved').reduce((sum, exp) => sum + exp.amount, 0)
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
          <span className="text-lg font-medium text-blue-600">
            {employeeName.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <div className="ml-4">
          <h4 className="text-lg font-medium text-gray-900">{employeeName}</h4>
          <p className="text-sm text-gray-500">{employeeEmail}</p>
          {employeeId && (
            <p className="text-xs text-gray-400">ID: {employeeId}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Total Expenses:</span>
          <span className="text-sm font-medium">{stats.total}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Approved:</span>
          <span className="text-sm font-medium text-green-600">{stats.approved}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Pending:</span>
          <span className="text-sm font-medium text-yellow-600">{stats.pending}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-500">Rejected:</span>
          <span className="text-sm font-medium text-red-600">{stats.rejected}</span>
        </div>
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Total Amount:</span>
            <span className="text-sm font-medium">{formatCurrency(stats.totalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Approved Amount:</span>
            <span className="text-sm font-medium text-green-600">{formatCurrency(stats.approvedAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
