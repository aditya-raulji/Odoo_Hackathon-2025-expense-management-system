'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiUtils } from '@/lib/api';

export default function QuickFix() {
  const { checkAuthStatus } = useAuth();
  const [fixing, setFixing] = useState(false);

  const handleQuickFix = async () => {
    setFixing(true);
    try {
      console.log('🔧 Running quick fix...');
      
      // Step 1: Clear localStorage
      localStorage.clear();
      console.log('✅ Cleared localStorage');
      
      // Step 2: Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 3: Reload page
      window.location.reload();
      
    } catch (error) {
      console.error('❌ Quick fix failed:', error);
    } finally {
      setFixing(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleQuickFix}
        disabled={fixing}
        className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
      >
        {fixing ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Fixing...
          </>
        ) : (
          <>
            🔧 Quick Fix
          </>
        )}
      </button>
    </div>
  );
}
