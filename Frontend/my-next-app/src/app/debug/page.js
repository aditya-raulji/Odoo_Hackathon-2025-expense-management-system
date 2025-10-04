'use client';

import AuthDebugger from '@/components/AuthDebugger';

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <AuthDebugger />
      </div>
    </div>
  );
}
