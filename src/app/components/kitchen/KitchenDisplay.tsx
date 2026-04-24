import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
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

export function KitchenDisplay() {
  const navigate = useNavigate();
  const { orders, updateOrderStatus, currentUser, logout } = useApp();

  const activeOrders = orders.filter(o => 
    o.status === 'new' || o.status === 'preparing' || o.status === 'ready'
  ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const getStatusColor = (status: typeof orders[0]['status']) => {
    switch (status) {
      case 'new':
        return 'bg-red-600';
      case 'preparing':
        return 'bg-yellow-600';
      case 'ready':
        return 'bg-green-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getNextStatus = (currentStatus: typeof orders[0]['status']) => {
    switch (currentStatus) {
      case 'new':
        return 'preparing';
      case 'preparing':
        return 'ready';
      case 'ready':
        return 'served';
      default:
        return currentStatus;
    }
  };

  const getActionLabel = (status: typeof orders[0]['status']) => {
    switch (status) {
      case 'new':
        return 'Start Preparing';
      case 'preparing':
        return 'Mark Ready';
      case 'ready':
        return 'Mark Served';
      default:
        return 'Update';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl">Kitchen Display</h1>
            <p className="text-sm text-gray-600">Welcome, {currentUser?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {activeOrders.length} Active Orders
            </Badge>
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
                    Are you sure you want to logout? Active orders are still being prepared.
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
      </div>

      {/* Orders Grid */}
      <div className="p-4">
        {activeOrders.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="space-y-2">
              <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xl text-gray-600">No active orders</p>
              <p className="text-sm text-gray-500">New orders will appear here</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeOrders.map(order => (
              <Card key={order.id} className="p-4 space-y-4">
                {/* Order Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-2xl font-mono">#{order.orderNumber}</p>
                    <p className="text-sm text-gray-600">
                      {order.type === 'dine-in' && order.tableId && (
                        <>Table {order.tableId.replace('t', '')}</>
                      )}
                      {order.type === 'takeaway' && <>Takeaway</>}
                    </p>
                    <p className="text-xs text-gray-500">{formatTime(order.createdAt)}</p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.toUpperCase()}
                  </Badge>
                </div>

                {/* Items List */}
                <div className="space-y-2 border-t pt-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{item.menuItem.name}</p>
                          {item.menuItem.type === 'veg' ? (
                            <div className="w-3 h-3 border border-green-600 flex items-center justify-center flex-shrink-0">
                              <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                            </div>
                          ) : (
                            <div className="w-3 h-3 border border-red-600 flex items-center justify-center flex-shrink-0">
                              <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                            </div>
                          )}
                        </div>
                        {item.notes && (
                          <p className="text-xs text-gray-600 italic">{item.notes}</p>
                        )}
                      </div>
                      <span className="font-medium ml-2">×{item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <Button
                  className="w-full"
                  onClick={() => updateOrderStatus(order.id, getNextStatus(order.status))}
                  variant={order.status === 'ready' ? 'default' : 'secondary'}
                >
                  {getActionLabel(order.status)}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}