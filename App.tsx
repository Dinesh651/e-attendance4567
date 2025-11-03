import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginComponent from './components/LoginComponent';
import AdminDashboard from './components/AdminDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import Header from './components/Header';
import { Role } from './types';
import { Spinner } from './components/icons';

const AppContent: React.FC = () => {
    const { user, isInitializing } = useAuth();

    if (isInitializing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <Spinner className="w-12 h-12 text-blue-600" />
            </div>
        );
    }

    if (!user) {
        return <LoginComponent />;
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            <Header />
            <main className="py-8 px-4 sm:px-6 lg:px-8">
                {user.role === Role.ADMIN ? <AdminDashboard /> : <EmployeeDashboard />}
            </main>
        </div>
    );
}


const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
