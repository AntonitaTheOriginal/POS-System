import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from './AdminLayout';
import { Search, Printer, Eye, FileText, Download } from 'lucide-react';

export function AdminBilling() {
  const navigate = useNavigate();
  const { orders } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const paidOrders = orders.filter(o => !!o.paymentMode || o.status === 'completed');
  
  const filteredOrders = paidOrders.filter(order => 
    order.orderNumber.toString().includes(searchTerm) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedOrders = [...filteredOrders].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const cashTotal = paidOrders.filter(o => o.paymentMode === 'cash').reduce((sum, o) => sum + o.total, 0);
  const upiTotal = paidOrders.filter(o => o.paymentMode === 'upi').reduce((sum, o) => sum + o.total, 0);
  const cardTotal = paidOrders.filter(o => o.paymentMode === 'card').reduce((sum, o) => sum + o.total, 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-1">Billing Management</h2>
            <p className="text-muted-foreground text-sm">View and manage all generated invoices</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search Order # or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-[250px] md:w-[300px]"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-white to-gray-50 border-none shadow-sm ring-1 ring-black/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{paidOrders.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-white to-gray-50 border-none shadow-sm ring-1 ring-black/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                <span className="text-xl font-bold">₹</span>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-white to-gray-50 border-none shadow-sm ring-1 ring-black/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                <Printer className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Payment Breakdown</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-muted-foreground">Cash: ₹{cashTotal}</span>
                  <span className="text-xs text-muted-foreground">UPI: ₹{upiTotal}</span>
                  <span className="text-xs text-muted-foreground">Card: ₹{cardTotal}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Bills Table */}
        <Card className="border-none shadow-sm ring-1 ring-black/5 overflow-hidden">
          {sortedOrders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium">No bills found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50/50 border-b border-gray-100 text-muted-foreground font-medium uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Order #</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Payment</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sortedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono font-bold text-blue-600">#{order.orderNumber}</span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="capitalize text-[10px] font-bold">
                          {order.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                          className={order.paymentMode === 'cash' ? 'bg-green-100 text-green-700 hover:bg-green-100 border-none' : 'bg-purple-100 text-purple-700 hover:bg-purple-100 border-none'}
                        >
                          {order.paymentMode?.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-bold">
                        ₹{order.total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => navigate(`/admin/invoice/${order.id}`)}
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => navigate(`/admin/invoice/${order.id}`)}
                          >
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
