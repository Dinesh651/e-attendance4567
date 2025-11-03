// Fix: Replaced placeholder content with Header component implementation.
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogoutIcon } from './icons';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">
            Audit Firm Dashboard
          </h1>
          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 hidden sm:block">Welcome, {user.name}</span>
              <button
                onClick={logout}
                className="text-gray-500 hover:text-gray-700 focus:outline-none flex items-center p-2 rounded-full hover:bg-gray-100"
                title="Logout"
              >
                <span className="sr-only">Logout</span>
                <LogoutIcon className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
