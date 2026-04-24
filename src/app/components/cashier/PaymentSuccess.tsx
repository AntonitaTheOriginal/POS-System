import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useApp } from '../../context/AppContext';
import { Printer } from 'lucide-react';

export function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart, setSelectedTable, setOrderType } = useApp();
  const { orderId, balance } = location.state || {};

  const handleNewOrder = () => {
    clearCart();
    setSelectedTable(null);
    setOrderType(null);
    navigate('/cashier/home');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-4">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <div>
            <h2 className="text-3xl mb-2">Payment Successful!</h2>
            <p className="text-gray-600">Order has been placed</p>
          </div>
        </div>

        {/* Order Details */}
        <div className="space-y-3 border-t pt-4">
          {orderId && (
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID</span>
              <span className="font-mono">{orderId.slice(-8).toUpperCase()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Date & Time</span>
            <span className="text-sm">{new Date().toLocaleString('en-IN')}</span>
          </div>
          {balance > 0 && (
            <div className="flex justify-between pt-2 border-t">
              <span className="font-medium text-green-600">Balance Returned</span>
              <span className="font-medium text-xl text-green-600">₹{balance}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            className="w-full h-12"
            size="lg"
            onClick={handleNewOrder}
          >
            New Order
          </Button>
          <Button
            variant="secondary"
            className="w-full h-12 flex items-center gap-2"
            size="lg"
            onClick={() => navigate(`/admin/invoice/${orderId}`)}
          >
            <Printer className="w-4 h-4" />
            Print Bill
          </Button>
          <Button
            variant="outline"
            className="w-full h-12"
            size="lg"
            onClick={() => navigate('/cashier/home')}
          >
            Back to Home
          </Button>
        </div>
      </Card>
    </div>
  );
}
