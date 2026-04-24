import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useApp } from '../../context/AppContext';
import { ArrowLeft } from 'lucide-react';
import { businessTypeConfigs } from '../../data/appData';

export function OrderReview() {
  const navigate = useNavigate();
  const { cart, updateCartItemQuantity, settings, selectedTable, orderType } = useApp();

  const subtotal = cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
  const gst = Math.round(subtotal * (settings.gstPercentage / 100));
  const total = subtotal + gst;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="p-8 text-center space-y-4">
          <p className="text-gray-600">Cart is empty</p>
          <Button onClick={() => navigate('/cashier/menu')}>
            Add Items
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/cashier/menu')} className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <h1 className="text-xl">Review Order</h1>
          <div className="w-20" />
        </div>
        {/* Breadcrumb */}
        <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
          <span>Cashier</span>
          <span>›</span>
          <span>{orderType === 'dine-in' ? 'Dine-In' : 'Takeaway'}</span>
          <span>›</span>
          <span className="text-gray-900 font-medium">Review</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Order Details */}
        <Card className="p-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Type</span>
              <span className="capitalize">{orderType}</span>
            </div>
            {orderType === 'dine-in' && selectedTable && (
              <div className="flex justify-between">
                <span className="text-gray-600">Table Number</span>
                <span>Table {selectedTable.number}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Items */}
        <Card className="p-4 space-y-3">
          <h2 className="font-medium">Items</h2>
          {cart.map(item => (
            <div key={item.menuItem.id} className="flex items-center gap-3 py-2 border-b last:border-0">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{item.menuItem.name}</p>
                  {item.menuItem.type === 'veg' ? (
                    <div className="w-3 h-3 border border-green-600 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                    </div>
                  ) : (
                    <div className="w-3 h-3 border border-red-600 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600">₹{item.menuItem.price} × {item.quantity}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateCartItemQuantity(item.menuItem.id, item.quantity - 1)}
                  className="h-8 w-8 p-0"
                >
                  −
                </Button>
                <span className="w-6 text-center">{item.quantity}</span>
                <Button
                  size="sm"
                  onClick={() => updateCartItemQuantity(item.menuItem.id, item.quantity + 1)}
                  className="h-8 w-8 p-0"
                >
                  +
                </Button>
              </div>
              <p className="w-20 text-right font-medium">₹{item.menuItem.price * item.quantity}</p>
            </div>
          ))}
        </Card>

        {/* Bill Summary */}
        <Card className="p-4 space-y-3">
          <h2 className="font-medium">Bill Summary</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{businessTypeConfigs[settings.businessType].taxLabel} ({settings.gstPercentage}%)</span>
              <span>₹{gst}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="font-medium text-lg">Grand Total</span>
              <span className="font-medium text-2xl">₹{total}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <Button
          className="w-full h-12"
          size="lg"
          onClick={() => navigate('/cashier/payment')}
        >
          Proceed to Payment
        </Button>
      </div>
    </div>
  );
}