import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export function RoleRedirect() {
  const navigate = useNavigate();
  const { currentUser } = useApp();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Redirect based on role
    switch (currentUser.role) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'cashier':
        navigate('/cashier/home');
        break;
      case 'waiter':
        navigate('/waiter/home');
        break;
      case 'kitchen':
        navigate('/kitchen/orders');
        break;
      default:
        navigate('/login');
    }
  }, [currentUser, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
