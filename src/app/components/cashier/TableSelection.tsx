import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { useApp } from '../../context/AppContext';
import { ArrowLeft, Home } from 'lucide-react';

export function TableSelection() {
  const navigate = useNavigate();
  const { tables, setSelectedTable, setOrderType, getOrderById, setCart, setActiveOrderId } = useApp();

  const handleSelectTable = (table: typeof tables[0]) => {
    if (table.status === 'available') {
      setSelectedTable(table);
      setOrderType('dine-in');
      navigate('/cashier/menu');
    } else if (table.status === 'occupied' && table.currentOrderId) {
      const existingOrder = getOrderById(table.currentOrderId);
      if (existingOrder) {
        setSelectedTable(table);
        setOrderType('dine-in');
        setCart(existingOrder.items);
        setActiveOrderId(existingOrder.id);
        navigate('/cashier/review');
      }
    }
  };

  const getTableColor = (status: typeof tables[0]['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 border-green-300 hover:border-green-500 shadow-sm';
      case 'occupied':
        return 'bg-red-50 border-red-200 hover:border-red-400 shadow-md ring-1 ring-red-100';
      case 'reserved':
        return 'bg-yellow-100 border-yellow-300 cursor-not-allowed opacity-70';
    }
  };

  const getStatusBadge = (status: typeof tables[0]['status']) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-600">Available</Badge>;
      case 'occupied':
        return (
          <div className="flex flex-col items-center gap-1">
            <Badge className="bg-red-600">Occupied</Badge>
            <span className="text-[10px] font-bold text-red-600 animate-pulse">CLICK TO SETTLE</span>
          </div>
        );
      case 'reserved':
        return <Badge className="bg-yellow-600">Reserved</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/cashier/home')} className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl">Select Table</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigate('/cashier/home')}>
            <Home className="w-5 h-5" />
          </Button>
        </div>
        {/* Breadcrumb */}
        <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
          <span>Cashier</span>
          <span>›</span>
          <span>Dine-In</span>
          <span>›</span>
          <span className="text-gray-900 font-medium">Select Table</span>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white border-b p-4">
        <div className="flex gap-4 justify-center flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
            <span className="text-sm">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
            <span className="text-sm">Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
            <span className="text-sm">Reserved</span>
          </div>
        </div>
      </div>

      {/* Table Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tables.map(table => (
            <Card
              key={table.id}
              className={`p-6 cursor-pointer transition-all border-2 ${getTableColor(table.status)}`}
              onClick={() => handleSelectTable(table)}
            >
              <div className="text-center space-y-3">
                <div className="space-y-1">
                  <p className="text-3xl">{table.number}</p>
                  <p className="text-xs text-gray-600">{table.capacity} seats</p>
                </div>
                {getStatusBadge(table.status)}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}