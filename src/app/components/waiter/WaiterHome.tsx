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

export function WaiterHome() {
  const navigate = useNavigate();
  const { tables, currentUser, logout, orders } = useApp();

  const assignedTables = tables.filter(t => t.assignedWaiterId === currentUser?.id);
  const allTables = assignedTables.length === 0 ? tables : assignedTables;

  const getTableOrders = (tableId: string) => {
    return orders.filter(o => o.tableId === tableId && o.status !== 'completed');
  };

  const handleSelectTable = (table: typeof tables[0]) => {
    navigate('/waiter/order', { state: { tableId: table.id } });
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
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl">Tables</h2>
          <Badge variant="secondary">
            {allTables.filter(t => t.status === 'occupied').length} Occupied
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {allTables.map(table => {
            const tableOrders = getTableOrders(table.id);
            const isOccupied = table.status === 'occupied';

            return (
              <Card
                key={table.id}
                className={`p-6 cursor-pointer transition-all border-2 ${
                  isOccupied 
                    ? 'bg-blue-50 border-blue-300 hover:border-blue-500' 
                    : 'bg-white hover:border-gray-300'
                }`}
                onClick={() => handleSelectTable(table)}
              >
                <div className="text-center space-y-2">
                  <p className="text-3xl">{table.number}</p>
                  <p className="text-xs text-gray-600">{table.capacity} seats</p>
                  {isOccupied ? (
                    <Badge className="bg-blue-600">Occupied</Badge>
                  ) : (
                    <Badge variant="outline">Available</Badge>
                  )}
                  {tableOrders.length > 0 && (
                    <p className="text-xs text-blue-600">{tableOrders.length} active orders</p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}