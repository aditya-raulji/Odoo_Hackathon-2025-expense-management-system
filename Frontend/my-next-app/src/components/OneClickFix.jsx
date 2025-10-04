'use client';

import { useState } from 'react';

export default function OneClickFix() {
  const [fixing, setFixing] = useState(false);

  const handleOneClickFix = async () => {
    setFixing(true);
    try {
      console.log('🚀 Running one-click fix...');
      
      // Step 1: Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      console.log('✅ Cleared all storage');
      
      // Step 2: Wait a moment
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 3: Redirect to auth page
      window.location.href = '/auth';
      
    } catch (error) {
      console.error('❌ One-click fix failed:', error);
    } finally {
      setFixing(false);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={handleOneClickFix}
        disabled={fixing}
        className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 font-semibold"
      >
        {fixing ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Fixing...
          </>
        ) : (
          <>
            🚀 One-Click Fix
          </>
        )}
      </button>
    </div>
  );
}
