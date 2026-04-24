import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Toaster } from './components/ui/sonner';

// Auth
import { CommonLogin } from './components/auth/CommonLogin';
import { RoleRedirect } from './components/auth/RoleRedirect';

// Cashier
import { CashierHome } from './components/cashier/CashierHome';
import { TableSelection } from './components/cashier/TableSelection';
import { MenuOrder } from './components/cashier/MenuOrder';
import { OrderReview } from './components/cashier/OrderReview';
import { Payment } from './components/cashier/Payment';
import { PaymentSuccess } from './components/cashier/PaymentSuccess';

// Waiter
import { WaiterHome } from './components/waiter/WaiterHome';
import { WaiterOrder } from './components/waiter/WaiterOrder';
import { WaiterSuccess } from './components/waiter/WaiterSuccess';

// Kitchen
import { KitchenDisplay } from './components/kitchen/KitchenDisplay';

// Admin
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminOrders } from './components/admin/AdminOrders';
import { AdminMenu } from './components/admin/AdminMenu';
import { AdminUsers } from './components/admin/AdminUsers';
import { AdminSettings } from './components/admin/AdminSettings';
import { AdminReports } from './components/admin/AdminReports';
import { AdminBilling } from './components/admin/AdminBilling';
import { AdminTables } from './components/admin/AdminTables';
import { ThermalReceipt } from './components/admin/ThermalReceipt';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Root and Auth */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<CommonLogin />} />
          <Route path="/redirect" element={<RoleRedirect />} />
          
          {/* Cashier Routes */}
          <Route path="/cashier/home" element={<CashierHome />} />
          <Route path="/cashier/tables" element={<TableSelection />} />
          <Route path="/cashier/menu" element={<MenuOrder />} />
          <Route path="/cashier/review" element={<OrderReview />} />
          <Route path="/cashier/payment" element={<Payment />} />
          <Route path="/cashier/success" element={<PaymentSuccess />} />
          
          {/* Waiter Routes */}
          <Route path="/waiter/home" element={<WaiterHome />} />
          <Route path="/waiter/order" element={<WaiterOrder />} />
          <Route path="/waiter/success" element={<WaiterSuccess />} />
          
          {/* Kitchen Routes */}
          <Route path="/kitchen/orders" element={<KitchenDisplay />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/menu" element={<AdminMenu />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/billing" element={<AdminBilling />} />
          <Route path="/admin/tables" element={<AdminTables />} />
          <Route path="/admin/invoice/:orderId" element={<ThermalReceipt />} />
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;