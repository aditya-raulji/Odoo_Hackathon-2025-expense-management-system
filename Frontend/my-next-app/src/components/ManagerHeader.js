"use client";

export default function ManagerHeader({ 
  title, 
  subtitle, 
  userName, 
  companyName, 
  onLogout 
}) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="text-2xl font-bold text-gray-800">
              ExMan.
            </div>
            <div className="text-sm text-gray-600">
              {subtitle || companyName}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {userName}</span>
            <button
              onClick={onLogout}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors px-3 py-1 rounded-md hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
