'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiUtils } from '@/lib/api';

export default function AutoFix() {
  const { user, isAuthenticated, checkAuthStatus } = useAuth();
  const [fixAttempted, setFixAttempted] = useState(false);

  useEffect(() => {
    // Auto-fix authentication issues
    const autoFix = async () => {
      if (!fixAttempted && !isAuthenticated && apiUtils.isAuthenticated()) {
        console.log('🔧 Auto-fixing authentication...');
        setFixAttempted(true);
        
        try {
          // Clear old token and retry
          apiUtils.removeAuthToken();
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          
          // Trigger auth check
          await checkAuthStatus();
          
          console.log('✅ Auto-fix completed');
        } catch (error) {
          console.log('❌ Auto-fix failed:', error.message);
        }
      }
    };

    autoFix();
  }, [isAuthenticated, fixAttempted, checkAuthStatus]);

  // Don't render anything - this is a background component
  return null;
}
