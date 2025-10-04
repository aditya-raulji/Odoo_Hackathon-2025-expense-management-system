"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import RulesManager from '@/components/RulesManager';

export default function RulesPage() {
  const router = useRouter();
  const { user, company, logout } = useAuth();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/auth');
      return;
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RulesManager />
      </div>
    </div>
  );
}
