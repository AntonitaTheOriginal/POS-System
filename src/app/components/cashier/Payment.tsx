import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useApp } from '../../context/AppContext';
import { ArrowLeft } from 'lucide-react';

export function Payment() {
  const navigate = useNavigate();
  const { cart, settings, selectedTable, orderType, addOrder, updateTableStatus, activeOrderId, setActiveOrderId, getOrderById } = useApp();
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | null>(null);
  const [amountReceived, setAmountReceived] = useState<number>(0);

  const subtotal = cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
  const gst = Math.round(subtotal * (settings.gstPercentage / 100));
  const total = subtotal + gst;
  const balance = amountReceived - total;

  const handleConfirmPayment = () => {
    if (!paymentMode) return;
    if (paymentMode === 'cash' && amountReceived < total) {
      return;
    }

    // Create/Update order
    const orderId = activeOrderId || `ORD${Date.now()}`;
    const existingOrder = activeOrderId ? getOrderById(activeOrderId) : null;

    const order = {
      id: orderId,
      orderNumber: existingOrder ? existingOrder.orderNumber : (Date.now() % 10000),
      type: orderType!,
      tableId: selectedTable?.id,
      items: cart,
      subtotal,
      gst,
      total,
      status: isNewOrder ? 'new' as const : 'completed' as const,
      createdBy: existingOrder ? existingOrder.createdBy : 'Cashier',
      createdAt: existingOrder ? existingOrder.createdAt : new Date().toISOString(),
      paymentMode,
      amountReceived: paymentMode === 'cash' ? amountReceived : total,
      completedAt: new Date().toISOString(),
    };

    addOrder(order);

    // Update table status if dine-in
    if (orderType === 'dine-in' && selectedTable) {
      updateTableStatus(selectedTable.id, 'available');
    }

    setActiveOrderId(null);
    navigate('/cashier/success', { state: { orderId: order.id, balance } });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/cashier/review')} className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <h1 className="text-xl">Payment</h1>
          <div className="w-20" />
        </div>
        {/* Breadcrumb */}
        <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
          <span>Cashier</span>
          <span>›</span>
          <span>{orderType === 'dine-in' ? 'Dine-In' : 'Takeaway'}</span>
          <span>›</span>
          <span className="text-gray-900 font-medium">Payment</span>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Amount Display */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-white">
          <p className="text-sm text-gray-600 mb-1">Total Amount</p>
          <p className="text-5xl">₹{total}</p>
        </Card>

        {/* Payment Method */}
        <div className="space-y-3">
          <h2 className="font-medium">Select Payment Method</h2>
          
          {settings.enabledPaymentModes.includes('cash') && (
            <Card
              className={`p-6 cursor-pointer transition-all ${
                paymentMode === 'cash' 
                  ? 'border-2 border-blue-500 bg-blue-50' 
                  : 'border-2 border-transparent hover:border-gray-300'
              }`}
              onClick={() => setPaymentMode('cash')}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Cash</h3>
                  <p className="text-sm text-gray-600">Pay with cash</p>
                </div>
              </div>
            </Card>
          )}

          {settings.enabledPaymentModes.includes('upi') && (
            <Card
              className={`p-6 cursor-pointer transition-all ${
                paymentMode === 'upi' 
                  ? 'border-2 border-blue-500 bg-blue-50' 
                  : 'border-2 border-transparent hover:border-gray-300'
              }`}
              onClick={() => {
                setPaymentMode('upi');
                setAmountReceived(total);
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">UPI</h3>
                  <p className="text-sm text-gray-600">Pay with UPI</p>
                </div>
              </div>
            </Card>
          )}

          {settings.enabledPaymentModes.includes('card') && (
            <Card
              className={`p-6 cursor-pointer transition-all ${
                paymentMode === 'card' 
                  ? 'border-2 border-blue-500 bg-blue-50' 
                  : 'border-2 border-transparent hover:border-gray-300'
              }`}
              onClick={() => {
                setPaymentMode('card');
                setAmountReceived(total);
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Card</h3>
                  <p className="text-sm text-gray-600">Pay with Card</p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Cash Input */}
        {paymentMode === 'cash' && (
          <Card className="p-4 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount Received</Label>
              <Input
                id="amount"
                type="number"
                value={amountReceived || ''}
                onChange={(e) => setAmountReceived(Number(e.target.value))}
                placeholder="Enter amount"
                className="h-12 text-lg"
              />
            </div>
            {amountReceived > 0 && (
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-600">Balance to Return</span>
                <span className={`text-xl font-medium ${balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ₹{Math.abs(balance)}
                </span>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Confirm Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <Button
          className="w-full h-12"
          size="lg"
          disabled={!paymentMode || (paymentMode === 'cash' && amountReceived < total)}
          onClick={handleConfirmPayment}
        >
          Confirm Payment
        </Button>
      </div>
    </div>
  );
}