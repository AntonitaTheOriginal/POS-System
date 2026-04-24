import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from './AdminLayout';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar as CalendarIcon, Printer, Download } from 'lucide-react';
import { format } from 'date-fns';
import { businessTypeConfigs } from '../../data/appData';

export function AdminReports() {
  const { orders, settings } = useApp();
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setHours(0, 0, 0, 0)),
    to: new Date(new Date().setHours(23, 59, 59, 999)),
  });

  // Filter orders by date range using completedAt for accurate revenue reporting
  const filteredOrders = orders.filter(order => {
    const reportDate = order.completedAt ? new Date(order.completedAt) : new Date(order.createdAt);
    return reportDate >= dateRange.from && reportDate <= dateRange.to;
  });

  const paidOrders = filteredOrders.filter(o => !!o.paymentMode || o.status === 'completed');
  
  // Calculate statistics
  const totalSales = paidOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = paidOrders.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;
  
  // Profit calculation (assuming 40% profit margin)
  const estimatedProfit = Math.round(totalSales * 0.4);

  const cashOrders = paidOrders.filter(o => o.paymentMode === 'cash');
  const upiOrders = paidOrders.filter(o => o.paymentMode === 'upi');
  const cashAmount = cashOrders.reduce((sum, o) => sum + o.total, 0);
  const upiAmount = upiOrders.reduce((sum, o) => sum + o.total, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    alert('PDF download functionality would be implemented here');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl mb-2">Reports</h2>
            <p className="text-gray-600">View and export sales reports</p>
          </div>
          
          {/* Date Range Selector */}
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  {format(dateRange.from, 'MMM dd')} - {format(dateRange.to, 'MMM dd')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4" align="end">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Quick Select</p>
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setDateRange({
                          from: new Date(new Date().setHours(0, 0, 0, 0)),
                          to: new Date(new Date().setHours(23, 59, 59, 999)),
                        })}
                      >
                        Today
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const yesterday = new Date();
                          yesterday.setDate(yesterday.getDate() - 1);
                          setDateRange({
                            from: new Date(yesterday.setHours(0, 0, 0, 0)),
                            to: new Date(yesterday.setHours(23, 59, 59, 999)),
                          });
                        }}
                      >
                        Yesterday
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const weekAgo = new Date();
                          weekAgo.setDate(weekAgo.getDate() - 7);
                          setDateRange({
                            from: weekAgo,
                            to: new Date(),
                          });
                        }}
                      >
                        Last 7 Days
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          const monthAgo = new Date();
                          monthAgo.setDate(monthAgo.getDate() - 30);
                          setDateRange({
                            from: monthAgo,
                            to: new Date(),
                          });
                        }}
                      >
                        Last 30 Days
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 shadow-sm">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Total Sales</p>
              <p className="text-3xl">₹{totalSales.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{completedOrders.length} orders</p>
            </div>
          </Card>

          <Card className="p-6 shadow-sm">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-3xl">{totalOrders}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
          </Card>

          <Card className="p-6 shadow-sm">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Avg Order Value</p>
              <p className="text-3xl">₹{avgOrderValue}</p>
              <p className="text-xs text-gray-500">Per order</p>
            </div>
          </Card>

          <Card className="p-6 shadow-sm">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Estimated Profit</p>
              <p className="text-3xl">₹{estimatedProfit.toLocaleString()}</p>
              <p className="text-xs text-gray-500">40% margin</p>
            </div>
          </Card>
        </div>

        {/* Payment Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 shadow-sm">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <span>💵</span> Cash Payments
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Orders</span>
                <span className="text-lg font-medium">{cashOrders.length}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-600">Amount</span>
                <span className="text-2xl font-medium">₹{cashAmount.toLocaleString()}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-sm">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <span>📱</span> UPI Payments
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Orders</span>
                <span className="text-lg font-medium">{upiOrders.length}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-600">Amount</span>
                <span className="text-2xl font-medium">₹{upiAmount.toLocaleString()}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Print Report
          </Button>
          <Button onClick={handleDownloadPDF} variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>

        {/* Sales Table */}
        {paidOrders.length > 0 ? (
          <Card className="overflow-hidden shadow-sm">
            <div className="p-4 bg-gray-50 border-b">
              <h3 className="font-medium">Sales Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium">Order #</th>
                    <th className="text-left p-4 text-sm font-medium">Date</th>
                    <th className="text-left p-4 text-sm font-medium">Type</th>
                    <th className="text-left p-4 text-sm font-medium">Items</th>
                    <th className="text-left p-4 text-sm font-medium">Payment</th>
                    <th className="text-right p-4 text-sm font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {paidOrders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-4 font-mono text-sm">#{order.orderNumber}</td>
                      <td className="p-4 text-sm text-gray-600">{formatDate(order.createdAt)}</td>
                      <td className="p-4 text-sm capitalize">{order.type}</td>
                      <td className="p-4 text-sm">{order.items.length} items</td>
                      <td className="p-4 text-sm capitalize">{order.paymentMode}</td>
                      <td className="p-4 text-right font-medium">₹{order.total.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 border-t-2">
                    <td colSpan={5} className="p-4 text-right font-medium">Total:</td>
                    <td className="p-4 text-right font-medium text-lg">₹{totalSales.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <Card className="p-12 text-center shadow-sm">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-gray-500 text-lg">No data available for selected period</p>
            <p className="text-gray-400 text-sm mt-2">Try selecting a different date range</p>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}