import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useApp } from '../../context/AppContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { LogOut } from 'lucide-react';

export function CashierHome() {
  const navigate = useNavigate();
  const { setOrderType, currentUser, logout } = useApp();

  const handleOrderType = (type: 'dine-in' | 'takeaway') => {
    setOrderType(type);
    if (type === 'dine-in') {
      navigate('/cashier/tables');
    } else {
      navigate('/cashier/menu');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl">SmartServe</h1>
            <p className="text-sm text-gray-600">Welcome, {currentUser?.name}</p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to logout? Any unsaved work will be lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        <h2 className="text-xl text-center text-gray-700">Select Order Type</h2>
        
        <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
          <Card 
            className="p-8 cursor-pointer hover:shadow-lg transition-all border-2 hover:border-blue-500"
            onClick={() => handleOrderType('dine-in')}
          >
            <div className="text-center space-y-3">
              <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-2xl">Dine-In</h3>
              <p className="text-sm text-gray-600">Select table and take order</p>
            </div>
          </Card>

          <Card 
            className="p-8 cursor-pointer hover:shadow-lg transition-all border-2 hover:border-green-500"
            onClick={() => handleOrderType('takeaway')}
          >
            <div className="text-center space-y-3">
              <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-2xl">Takeaway</h3>
              <p className="text-sm text-gray-600">Quick billing for takeout</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}