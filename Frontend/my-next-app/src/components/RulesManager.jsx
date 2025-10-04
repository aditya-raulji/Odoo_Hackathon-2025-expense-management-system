'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Users, 
  DollarSign, 
  Tag, 
  Percent,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { rulesAPI } from '@/lib/api';

const RulesManager = () => {
  const [rules, setRules] = useState([]);
  const [approvers, setApprovers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm();

  const watchedValues = watch();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rulesResponse, approversResponse, categoriesResponse] = await Promise.all([
        rulesAPI.getRules(),
        rulesAPI.getApprovers(),
        rulesAPI.getCategories()
      ]);

      if (rulesResponse.success) {
        setRules(rulesResponse.data.rules);
      }
      if (approversResponse.success) {
        setApprovers(approversResponse.data.approvers);
      }
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data.categories);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setProcessingId('submit');
      
      const ruleData = {
        name: data.name,
        threshold: data.threshold ? parseInt(data.threshold) : null,
        requiredApprovers: data.requiredApprovers ? data.requiredApprovers.split(',').map(id => parseInt(id.trim())) : null,
        isSequential: data.isSequential === 'true',
        minAmount: data.minAmount ? parseFloat(data.minAmount) : null,
        maxAmount: data.maxAmount ? parseFloat(data.maxAmount) : null,
        categoryFilters: data.categoryFilters ? data.categoryFilters.split(',').map(cat => cat.trim()) : null
      };

      let response;
      if (editingRule) {
        response = await rulesAPI.updateRule(editingRule.id, ruleData);
      } else {
        response = await rulesAPI.createRule(ruleData);
      }

      if (response.success) {
        toast.success(editingRule ? 'Rule updated successfully!' : 'Rule created successfully!');
        reset();
        setShowForm(false);
        setEditingRule(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error saving rule:', error);
      toast.error(error.message || 'Failed to save rule');
    } finally {
      setProcessingId(null);
    }
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setValue('name', rule.name);
    setValue('threshold', rule.threshold || '');
    setValue('requiredApprovers', rule.requiredApprovers ? rule.requiredApprovers.join(', ') : '');
    setValue('isSequential', rule.isSequential.toString());
    setValue('minAmount', rule.minAmount || '');
    setValue('maxAmount', rule.maxAmount || '');
    setValue('categoryFilters', rule.categoryFilters ? rule.categoryFilters.join(', ') : '');
    setShowForm(true);
  };

  const handleDelete = async (ruleId) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      setProcessingId(ruleId);
      const response = await rulesAPI.deleteRule(ruleId);
      
      if (response.success) {
        toast.success('Rule deleted successfully!');
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast.error(error.message || 'Failed to delete rule');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = () => {
    reset();
    setShowForm(false);
    setEditingRule(null);
  };

  const getApproverNames = (approverIds) => {
    if (!approverIds || approverIds.length === 0) return 'None';
    return approverIds.map(id => {
      const approver = approvers.find(a => a.id === id);
      return approver ? approver.name : `User ${id}`;
    }).join(', ');
  };

  const getCategoryNames = (categoryFilters) => {
    if (!categoryFilters || categoryFilters.length === 0) return 'All';
    return categoryFilters.join(', ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading rules...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Approval Rules</h2>
          <p className="text-gray-600">Configure approval workflows for expenses</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Rule</span>
        </button>
      </div>

      {/* Rules List */}
      <div className="bg-white rounded-lg shadow-sm border">
        {rules.length === 0 ? (
          <div className="p-12 text-center">
            <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No rules configured</h3>
            <p className="text-gray-600 mb-4">Create your first approval rule to get started</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Rule
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rule Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categories
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Approvers
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
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                      <div className="text-sm text-gray-500">
                        Created by {rule.createdBy}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {rule.threshold ? (
                          <>
                            <Percent className="h-4 w-4 text-blue-500 mr-2" />
                            <span className="text-sm text-gray-900">{rule.threshold}% threshold</span>
                          </>
                        ) : (
                          <>
                            <Users className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm text-gray-900">Specific approvers</span>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {rule.isSequential ? 'Sequential' : 'Parallel'}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {rule.minAmount && rule.maxAmount 
                            ? `${rule.minAmount} - ${rule.maxAmount}`
                            : rule.minAmount 
                            ? `≥ ${rule.minAmount}`
                            : rule.maxAmount
                            ? `≤ ${rule.maxAmount}`
                            : 'Any amount'
                          }
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {getCategoryNames(rule.categoryFilters)}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {getApproverNames(rule.requiredApprovers)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        rule.isActive 
                          ? 'text-green-600 bg-green-100' 
                          : 'text-red-600 bg-red-100'
                      }`}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(rule)}
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(rule.id)}
                          disabled={processingId === rule.id}
                          className="text-red-600 hover:text-red-800 flex items-center disabled:opacity-50"
                        >
                          {processingId === rule.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-1" />
                          )}
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rule Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingRule ? 'Edit Rule' : 'Create New Rule'}
                </h3>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Rule Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rule Name *
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Rule name is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="e.g., High Value Expenses"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                {/* Rule Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Approval Type
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="threshold"
                          {...register('approvalType')}
                          className="mr-2"
                        />
                        <span className="text-sm">Percentage Threshold</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="specific"
                          {...register('approvalType')}
                          className="mr-2"
                        />
                        <span className="text-sm">Specific Approvers</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Approval Flow
                    </label>
                    <select
                      {...register('isSequential', { required: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="true">Sequential (one after another)</option>
                      <option value="false">Parallel (all at once)</option>
                    </select>
                  </div>
                </div>

                {/* Threshold */}
                {watchedValues.approvalType === 'threshold' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Approval Threshold (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      {...register('threshold')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="e.g., 60"
                    />
                  </div>
                )}

                {/* Specific Approvers */}
                {watchedValues.approvalType === 'specific' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Required Approvers
                    </label>
                    <input
                      type="text"
                      {...register('requiredApprovers')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Enter user IDs separated by commas (e.g., 1, 2, 3)"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Available approvers: {approvers.map(a => `${a.name} (${a.id})`).join(', ')}
                    </p>
                  </div>
                )}

                {/* Amount Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('minAmount')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Maximum Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('maxAmount')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="No limit"
                    />
                  </div>
                </div>

                {/* Category Filters */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Filters
                  </label>
                  <input
                    type="text"
                    {...register('categoryFilters')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="Enter categories separated by commas (e.g., Travel, Meals)"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Available categories: {categories.join(', ')}
                  </p>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processingId === 'submit'}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    {processingId === 'submit' && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>{editingRule ? 'Update Rule' : 'Create Rule'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RulesManager;
