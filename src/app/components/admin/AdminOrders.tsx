import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from './AdminLayout';

export function AdminOrders() {
  const navigate = useNavigate();
  const { orders, tables, setSelectedTable, setOrderType, setCart, setActiveOrderId } = useApp();

  const sortedOrders = [...orders].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getStatusBadge = (status: typeof orders[0]['status']) => {
    const colors = {
      new: 'bg-red-600',
      preparing: 'bg-yellow-600',
      ready: 'bg-green-600',
      served: 'bg-blue-600',
      completed: 'bg-gray-600',
    };
    return <Badge className={colors[status]}>{status.toUpperCase()}</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl mb-2">Orders Management</h2>
          <p className="text-gray-600">View and manage all orders</p>
        </div>

        {orders.length === 0 ? (
          <Card className="p-12 text-center shadow-sm">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 text-lg">No orders yet</p>
            <p className="text-gray-400 text-sm mt-2">Orders will appear here automatically</p>
          </Card>
        ) : (
          <Card className="overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium">Order #</th>
                    <th className="text-left p-4 text-sm font-medium">Type</th>
                    <th className="text-left p-4 text-sm font-medium">Table</th>
                    <th className="text-left p-4 text-sm font-medium">Items</th>
                    <th className="text-left p-4 text-sm font-medium">Amount</th>
                    <th className="text-left p-4 text-sm font-medium">Payment</th>
                    <th className="text-left p-4 text-sm font-medium">Status</th>
                    <th className="text-left p-4 text-sm font-medium">Date</th>
                    <th className="text-left p-4 text-sm font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedOrders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-4 font-mono text-sm">#{order.orderNumber}</td>
                      <td className="p-4">
                        <Badge variant="outline" className="capitalize">{order.type}</Badge>
                      </td>
                      <td className="p-4 text-sm">
                        {order.tableId ? `Table ${order.tableId.replace('t', '')}` : '-'}
                      </td>
                      <td className="p-4 text-sm">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </td>
                      <td className="p-4 font-medium">₹{order.total}</td>
                      <td className="p-4">
                        {order.paymentMode ? (
                          <Badge variant={order.paymentMode === 'cash' ? 'secondary' : 'default'}>
                            {order.paymentMode.toUpperCase()}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-4">{getStatusBadge(order.status)}</td>
                      <td className="p-4 text-sm text-gray-600">{formatDate(order.createdAt)}</td>
                      <td className="p-4 text-right">
                        {order.status !== 'completed' && (
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              const table = tables.find(t => t.id === order.tableId);
                              if (table) setSelectedTable(table);
                              setOrderType(order.type);
                              setCart(order.items);
                              setActiveOrderId(order.id);
                              navigate('/cashier/payment');
                            }}
                          >
                            Settle
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}