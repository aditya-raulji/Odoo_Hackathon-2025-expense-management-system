'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authAPI, apiUtils } from '@/lib/api';

export default function AuthDebugger() {
  const { user, isAuthenticated, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState(null);
  const [testing, setTesting] = useState(false);

  const runDebugTest = async () => {
    setTesting(true);
    try {
      const token = apiUtils.getAuthToken();
      const hasToken = apiUtils.isAuthenticated();
      
      let authTest = null;
      let profileTest = null;
      let serverTest = null;
      
      // Test server configuration
      try {
        const response = await fetch('http://localhost:5000/api/auth/debug-server');
        serverTest = await response.json();
      } catch (error) {
        serverTest = { error: error.message };
      }
      
      if (token) {
        try {
          authTest = await authAPI.debugAuth();
        } catch (error) {
          authTest = { error: error.message };
        }
        
        try {
          profileTest = await authAPI.getCurrentUser();
        } catch (error) {
          profileTest = { error: error.message };
        }
      }
      
      setDebugInfo({
        token: token ? `${token.substring(0, 20)}...` : 'No token',
        hasToken,
        isAuthenticated,
        user,
        loading,
        serverTest,
        authTest,
        profileTest,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setDebugInfo({ error: error.message });
    } finally {
      setTesting(false);
    }
  };

  const clearAuth = () => {
    apiUtils.removeAuthToken();
    setDebugInfo(null);
    window.location.reload();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto my-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Debugger</h2>
      
      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={runDebugTest}
            disabled={testing}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {testing ? 'Testing...' : 'Run Debug Test'}
          </button>
          
          <button
            onClick={clearAuth}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Clear Auth & Reload
          </button>
        </div>

        {debugInfo && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Debug Information:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Current Status:</h3>
          <ul className="text-sm space-y-1">
            <li><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</li>
            <li><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</li>
            <li><strong>User:</strong> {user ? `${user.name} (${user.role})` : 'None'}</li>
            <li><strong>Token Exists:</strong> {apiUtils.isAuthenticated() ? 'Yes' : 'No'}</li>
          </ul>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Quick Fixes:</h3>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Click "Clear Auth & Reload" to reset everything</li>
            <li>Go to <code>/auth</code> and log in again</li>
            <li>Check browser console for error messages</li>
            <li>Make sure backend server is running on port 5000</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
