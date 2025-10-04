"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import ApprovalTable from '@/components/ApprovalTable';

export default function ManagerDashboard() {
  const [teamOnly, setTeamOnly] = useState(true);

  const router = useRouter();
  const { user, company, logout } = useAuth();

  useEffect(() => {
    if (!user || (user.role !== 'manager' && user.role !== 'admin')) {
      router.push('/auth');
      return;
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Toggle */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">View Options</h3>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="viewMode"
                  value="team"
                  checked={teamOnly}
                  onChange={() => setTeamOnly(true)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Team Only</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="viewMode"
                  value="all"
                  checked={!teamOnly}
                  onChange={() => setTeamOnly(false)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">All Expenses</span>
              </label>
            </div>
          </div>
        </div>

        {/* Approval Table */}
        <ApprovalTable teamOnly={teamOnly} />
      </div>
    </div>
  );
}
