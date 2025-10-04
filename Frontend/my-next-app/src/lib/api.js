// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    // Log the error for debugging
    console.error('API Error:', {
      status: response.status,
      statusText: response.statusText,
      message: data.message,
      url: response.url
    });
    
    // For 401/403 errors, don't throw error immediately - let components handle it
    if (response.status === 401 || response.status === 403) {
      console.warn('Authentication error - token may be invalid');
    }
    
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('Auth header set with token:', token.substring(0, 20) + '...');
  } else {
    console.warn('No auth token found in localStorage');
  }
  
  return headers;
};

// Helper function to get auth headers for file uploads
const getAuthHeadersForUpload = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const headers = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Authentication API
export const authAPI = {
  // Signup new admin user and create company
  signup: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },


  // Login user
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  // Verify email with 6-digit code
  verifyEmail: async (email, code) => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
    });
    return handleResponse(response);
  },

  // Resend verification code
  resendVerification: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  },

  // Forgot password
  forgotPassword: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  },

  // Reset password
  resetPassword: async (token, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password }),
    });
    return handleResponse(response);
  },

  // Get current user profile
  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Debug authentication status
  debugAuth: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/debug`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Refresh JWT token
  refreshToken: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Logout user
  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

};

// User Management API (Admin only)
export const userAPI = {
  // Create new user
  createUser: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  // Get all users in company
  getUsers: async (role = null) => {
    const params = role ? `?role=${role}` : '';
    const response = await fetch(`${API_BASE_URL}/users${params}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get managers in company
  getManagers: async () => {
    const response = await fetch(`${API_BASE_URL}/users/managers`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get user by ID
  getUserById: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Update user
  updateUser: async (userId, userData) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Profile API
export const profileAPI = {
  // Get current user's profile
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/profile/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Create user profile
  createProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/profile/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/profile/update`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  },

  // Search profiles
  searchProfiles: async (query, limit = 10, offset = 0) => {
    const params = new URLSearchParams({ q: query, limit, offset });
    const response = await fetch(`${API_BASE_URL}/profile/search?${params}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get pro users
  getProUsers: async (limit = 10, offset = 0) => {
    const params = new URLSearchParams({ limit, offset });
    const response = await fetch(`${API_BASE_URL}/profile/pro-users?${params}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get profile by username
  getProfileByUsername: async (username) => {
    const response = await fetch(`${API_BASE_URL}/profile/username/${username}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Notifications API
export const notificationAPI = {
  // Get user notifications
  getNotifications: async (limit = 50, offset = 0, unreadOnly = false) => {
    const params = new URLSearchParams({ limit, offset, unread_only: unreadOnly });
    const response = await fetch(`${API_BASE_URL}/notifications?${params}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const response = await fetch(`${API_BASE_URL}/notifications/mark-read/${notificationId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get unread count
  getUnreadCount: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Expenses API
export const expenseAPI = {
  // Submit new expense
  submitExpense: async (expenseData, receiptFile = null) => {
    const formData = new FormData();
    
    // Add expense data
    Object.keys(expenseData).forEach(key => {
      formData.append(key, expenseData[key]);
    });
    
    // Add receipt file if provided
    if (receiptFile) {
      formData.append('receipt', receiptFile);
    }

    const response = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: getAuthHeadersForUpload(),
      body: formData,
    });
    return handleResponse(response);
  },

  // Get user's expenses
  getExpenses: async (status = null) => {
    const params = status ? `?status=${status}` : '';
    const response = await fetch(`${API_BASE_URL}/expenses${params}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get my expenses with filters
  getMyExpenses: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    const response = await fetch(`${API_BASE_URL}/expenses/my?${params}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get specific expense
  getExpenseById: async (expenseId) => {
    const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get pending expenses for approval
  getPendingExpenses: async (teamOnly = false) => {
    const params = teamOnly ? '?teamOnly=true' : '';
    const response = await fetch(`${API_BASE_URL}/expenses/pending${params}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Update expense
  updateExpense: async (expenseId, expenseData) => {
    const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(expenseData),
    });
    return handleResponse(response);
  },

  // Approve/reject expense
  approveExpense: async (expenseId, approved, comments = '') => {
    const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}/approve`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ approved, comments }),
    });
    return handleResponse(response);
  },

  // Delete expense (if draft)
  deleteExpense: async (expenseId) => {
    const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get expense details
  getExpenseDetails: async (expenseId) => {
    const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Reject expense
  rejectExpense: async (expenseId, rejectionReason) => {
    const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ rejectionReason }),
    });
    return handleResponse(response);
  },

  // Get available expense categories
  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/expenses/categories`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Approval Rules API (Admin only)
export const rulesAPI = {
  // Create new approval rule
  createRule: async (ruleData) => {
    const response = await fetch(`${API_BASE_URL}/rules`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(ruleData),
    });
    return handleResponse(response);
  },

  // Get all approval rules
  getRules: async (activeOnly = false) => {
    const params = activeOnly ? '?active=true' : '';
    const response = await fetch(`${API_BASE_URL}/rules${params}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get specific approval rule
  getRule: async (ruleId) => {
    const response = await fetch(`${API_BASE_URL}/rules/${ruleId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Update approval rule
  updateRule: async (ruleId, ruleData) => {
    const response = await fetch(`${API_BASE_URL}/rules/${ruleId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(ruleData),
    });
    return handleResponse(response);
  },

  // Delete approval rule
  deleteRule: async (ruleId) => {
    const response = await fetch(`${API_BASE_URL}/rules/${ruleId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get pending approvals (for managers/admins)
  getPendingApprovals: async () => {
    const response = await fetch(`${API_BASE_URL}/expenses/approvals/pending`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get approval rules statistics
  getRulesStats: async () => {
    const response = await fetch(`${API_BASE_URL}/rules/stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Approve expense
  approveExpense: async (expenseId) => {
    const response = await fetch(`${API_BASE_URL}/expenses/${expenseId}/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get available approvers
  getApprovers: async () => {
    const response = await fetch(`${API_BASE_URL}/rules/approvers`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Utility functions
export const apiUtils = {
  // Set auth token
  setAuthToken: (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
      console.log('Token saved to localStorage');
    }
  },

  // Get auth token
  getAuthToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  },

  // Remove auth token
  removeAuthToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('authToken');
    }
    return false;
  },

  // Logout user
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
    // Don't automatically redirect - let the component handle it
  },
};
