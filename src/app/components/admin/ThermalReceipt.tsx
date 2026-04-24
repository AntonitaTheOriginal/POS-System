import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Printer } from 'lucide-react';
import { businessTypeConfigs } from '../../data/appData';

export function ThermalReceipt() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { getOrderById, settings } = useApp();

  const order = getOrderById(orderId || '');

  useEffect(() => {
    if (order) {
      // Optional: Auto-trigger print
      // window.print();
    }
  }, [order]);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-gray-600">Order not found</p>
          <Button onClick={() => navigate('/admin/billing')}>Back to Billing</Button>
        </div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Action Header - Hidden on Print */}
      <div className="max-w-md mx-auto mb-6 flex items-center justify-between print:hidden">
        <Button variant="ghost" onClick={() => window.history.back()} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Printer className="w-4 h-4" />
          Print Receipt
        </Button>
      </div>

      {/* Thermal Receipt Container */}
      <div className="max-w-[80mm] mx-auto bg-white shadow-lg p-6 font-mono text-[12px] leading-tight text-black print:shadow-none print:p-0 print:mx-0 print:w-full">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page {
              margin: 0;
              size: 80mm auto;
            }
            body {
              margin: 0;
              padding: 0;
              background: white;
            }
            .print-hidden {
              display: none !important;
            }
          }
        `}} />

        {/* Header */}
        <div className="text-center space-y-1 mb-4">
          <h1 className="text-lg font-bold uppercase">{settings.restaurantName}</h1>
          <p>{settings.address}</p>
          <p>Phone: {settings.phone}</p>
          {settings.email && <p>Email: {settings.email}</p>}
        </div>

        <div className="border-t border-dashed border-black my-2"></div>

        {/* Order Info */}
        <div className="space-y-1 mb-4">
          <div className="flex justify-between">
            <span>Order #:</span>
            <span className="font-bold">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Time:</span>
            <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex justify-between">
            <span>Type:</span>
            <span className="uppercase">{order.type}</span>
          </div>
          {order.tableId && (
            <div className="flex justify-between">
              <span>Table:</span>
              <span>{order.tableId.replace('t', '')}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Cashier:</span>
            <span>{order.createdBy}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-black my-2"></div>

        {/* Items Table */}
        <div className="mb-4">
          <div className="flex font-bold mb-1">
            <span className="flex-1">Item</span>
            <span className="w-8 text-center">Qty</span>
            <span className="w-16 text-right">Price</span>
            <span className="w-16 text-right">Total</span>
          </div>
          <div className="border-t border-black mb-2"></div>
          
          {order.items.map((item, idx) => (
            <div key={idx} className="space-y-0.5 mb-2">
              <div className="flex">
                <span className="flex-1 font-medium">{item.menuItem.name}</span>
                <span className="w-8 text-center">{item.quantity}</span>
                <span className="w-16 text-right">{item.menuItem.price}</span>
                <span className="w-16 text-right">{item.menuItem.price * item.quantity}</span>
              </div>
              {item.notes && <p className="text-[10px] italic">Note: {item.notes}</p>}
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-black my-2"></div>

        {/* Totals */}
        <div className="space-y-1 mb-4">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₹{order.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>{businessTypeConfigs[settings.businessType].taxLabel} ({settings.gstPercentage}%):</span>
            <span>₹{order.gst}</span>
          </div>
          <div className="flex justify-between text-base font-bold pt-1">
            <span>GRAND TOTAL:</span>
            <span>₹{order.total}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-black my-2"></div>

        {/* Payment Info */}
        <div className="space-y-1 mb-6 text-center">
          <p>Paid via: <span className="uppercase font-bold">{order.paymentMode || 'N/A'}</span></p>
          {order.paymentMode === 'cash' && order.amountReceived && (
            <div className="flex justify-between px-4">
              <span>Cash Received:</span>
              <span>₹{order.amountReceived}</span>
            </div>
          )}
          {order.paymentMode === 'cash' && order.amountReceived && (
            <div className="flex justify-between px-4">
              <span>Change Given:</span>
              <span>₹{order.amountReceived - order.total}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center space-y-2 mt-8">
          <p className="font-bold">THANK YOU!</p>
          <p>{settings.receiptFooter}</p>
          <div className="pt-4 flex justify-center">
            <svg className="w-24 h-24" viewBox="0 0 100 100">
              {/* Mock QR Code */}
              <rect width="100" height="100" fill="white" />
              <rect x="10" y="10" width="20" height="20" fill="black" />
              <rect x="70" y="10" width="20" height="20" fill="black" />
              <rect x="10" y="70" width="20" height="20" fill="black" />
              <rect x="40" y="40" width="20" height="20" fill="black" />
              <rect x="50" y="10" width="10" height="10" fill="black" />
              <rect x="10" y="50" width="10" height="10" fill="black" />
            </svg>
          </div>
          <p className="text-[10px] text-gray-500">Powerd by SmartServe POS</p>
        </div>
      </div>
    </div>
  );
}
