import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
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
import { ArrowLeft, Home, X } from 'lucide-react';

export function MenuOrder() {
  const navigate = useNavigate();
  const { 
    menuItems, 
    cart, 
    addToCart, 
    updateCartItemQuantity,
    selectedTable,
    orderType,
    clearCart
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState('Starters');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['Starters', 'Main Course', 'Breads', 'Rice & Biryani', 'Desserts', 'Beverages'];

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && item.available;
  });

  const getItemQuantity = (itemId: string) => {
    return cart.find(item => item.menuItem.id === itemId)?.quantity || 0;
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);

  const handleCancelOrder = () => {
    clearCart();
    navigate('/cashier/home');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <h1 className="text-xl">Create Order</h1>
            {orderType === 'dine-in' && selectedTable && (
              <p className="text-sm text-gray-600">Table {selectedTable.number}</p>
            )}
            {orderType === 'takeaway' && (
              <p className="text-sm text-gray-600">Takeaway Order</p>
            )}
          </div>
          {cart.length > 0 ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <X className="w-5 h-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel this order? All items will be removed from the cart.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Continue Order</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancelOrder}>Cancel Order</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => navigate('/cashier/home')}>
              <Home className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Breadcrumb */}
        <div className="mb-2 text-xs text-gray-500 flex items-center gap-1">
          <span>Cashier</span>
          <span>›</span>
          <span>{orderType === 'dine-in' ? 'Dine-In' : 'Takeaway'}</span>
          <span>›</span>
          <span className="text-gray-900 font-medium">Menu</span>
        </div>

        {/* Search */}
        <Input
          placeholder="Search menu items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Categories */}
      <div className="flex overflow-x-auto bg-white border-b p-2 gap-2 sticky top-[148px] z-10">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category)}
            className="min-w-fit"
            size="sm"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="p-4 space-y-3">
        {filteredItems.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No items found</p>
          </Card>
        ) : (
          filteredItems.map(item => {
            const quantity = getItemQuantity(item.id);
            return (
              <Card key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{item.name}</h3>
                      {item.type === 'veg' ? (
                        <div className="w-4 h-4 border-2 border-green-600 flex items-center justify-center">
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        </div>
                      ) : (
                        <div className="w-4 h-4 border-2 border-red-600 flex items-center justify-center">
                          <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                        </div>
                      )}
                    </div>
                    <p className="text-lg text-gray-900">₹{item.price}</p>
                  </div>
                  
                  {quantity === 0 ? (
                    <Button
                      size="sm"
                      onClick={() => addToCart(item)}
                      className="h-10 px-6"
                    >
                      Add
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCartItemQuantity(item.id, quantity - 1)}
                        className="h-10 w-10 p-0"
                      >
                        −
                      </Button>
                      <span className="w-8 text-center font-medium">{quantity}</span>
                      <Button
                        size="sm"
                        onClick={() => updateCartItemQuantity(item.id, quantity + 1)}
                        className="h-10 w-10 p-0"
                      >
                        +
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Cart Summary Footer */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">{totalItems} items</p>
              <p className="text-xl">₹{subtotal}</p>
            </div>
            <Button
              size="lg"
              onClick={() => navigate('/cashier/review')}
              className="h-12 px-8"
            >
              Review Order
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}