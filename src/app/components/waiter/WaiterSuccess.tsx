import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

export function WaiterSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderNumber } = location.state || {};

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
            <h2 className="text-3xl mb-2">Order Sent!</h2>
            <p className="text-gray-600">Order has been sent to kitchen</p>
          </div>
        </div>

        {/* Order Details */}
        <div className="space-y-3 border-t pt-4">
          {orderNumber && (
            <div className="flex justify-between">
              <span className="text-gray-600">Order Number</span>
              <span className="font-mono text-xl">#{orderNumber}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Time</span>
            <span className="text-sm">{new Date().toLocaleTimeString('en-IN')}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            className="w-full h-12"
            size="lg"
            onClick={() => navigate('/waiter/home')}
          >
            Back to Tables
          </Button>
        </div>
      </Card>
    </div>
  );
}
