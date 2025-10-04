"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseHistory from '@/components/ExpenseHistory';
import { rulesAPI } from '@/lib/api';

export default function EmployeeDashboard() {
  const [showCreateExpense, setShowCreateExpense] = useState(false);
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const router = useRouter();
  const { user, company, logout } = useAuth();

  useEffect(() => {
    if (!user || (user.role !== 'employee' && user.role !== 'admin')) {
      router.push('/auth');
      return;
    }
    fetchCategories();
  }, [user, router]);

  const fetchCategories = async () => {
    try {
      const response = await rulesAPI.getCategories();
      if (response.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleExpenseSubmitted = (newExpense) => {
    setExpenses(prev => [newExpense, ...prev]);
    setShowCreateExpense(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Expense Management</h2>
            <button
              onClick={() => setShowCreateExpense(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Submit New Expense
            </button>
          </div>
        </div>

        {/* Expense Form Modal */}
        {showCreateExpense && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <ExpenseForm 
                onExpenseSubmitted={handleExpenseSubmitted}
                categories={categories}
              />
            </div>
          </div>
        )}

        {/* Expense History */}
        <ExpenseHistory />
      </div>
    </div>
  );
}
