'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  FileText, 
  CheckCircle, 
  Settings, 
  Users, 
  LogOut,
  User
} from 'lucide-react';

const Navigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      roles: ['admin', 'manager', 'employee']
    },
    {
      name: 'Expenses',
      href: '/dashboard/expenses',
      icon: FileText,
      roles: ['admin', 'employee']
    },
    {
      name: 'Approvals',
      href: '/dashboard/approvals',
      icon: CheckCircle,
      roles: ['admin', 'manager']
    },
    {
      name: 'Users',
      href: '/dashboard/admin',
      icon: Users,
      roles: ['admin']
    },
    {
      name: 'Rules',
      href: '/dashboard/rules',
      icon: Settings,
      roles: ['admin']
    },
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: User,
      roles: ['admin', 'manager', 'employee']
    }
  ];

  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">ExMan</h1>
            </div>
            <div className="hidden md:flex space-x-6">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <button
                    key={item.name}
                    onClick={() => router.push(item.href)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Welcome, {user?.name}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
