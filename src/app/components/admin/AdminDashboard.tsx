import { Card } from '../ui/card';
import { useApp } from '../../context/AppContext';
import { AdminLayout } from './AdminLayout';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { businessTypeConfigs } from '../../data/appData';
import { Info, ArrowRight } from 'lucide-react';

export function AdminDashboard() {
  const { orders, settings } = useApp();

  const businessConfig = businessTypeConfigs[settings.businessType];

  // Calculate today's stats
  const today = new Date().toDateString();
  const todayOrders = orders.filter(order => {
    const reportDate = order.completedAt ? new Date(order.completedAt) : new Date(order.createdAt);
    return reportDate.toDateString() === today;
  });

  const paidOrders = todayOrders.filter(o => !!o.paymentMode || o.status === 'completed');
  const todaySales = paidOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = paidOrders.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(todaySales / totalOrders) : 0;

  const cashOrders = paidOrders.filter(o => o.paymentMode === 'cash');
  const upiOrders = paidOrders.filter(o => o.paymentMode === 'upi');
  const cashAmount = cashOrders.reduce((sum, o) => sum + o.total, 0);
  const upiAmount = upiOrders.reduce((sum, o) => sum + o.total, 0);

  const dineInOrders = paidOrders.filter(o => o.type === 'dine-in');
  const takeawayOrders = paidOrders.filter(o => o.type === 'takeaway');

  const lifetimePaidOrders = orders.filter(o => !!o.paymentMode || o.status === 'completed');
  const lifetimeRevenue = lifetimePaidOrders.reduce((sum, o) => sum + o.total, 0);

  // Prepare chart data
  // Orders vs Time (hourly breakdown)
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const hourOrders = paidOrders.filter(order => {
      const reportDate = order.completedAt ? new Date(order.completedAt) : new Date(order.createdAt);
      const orderHour = reportDate.getHours();
      return orderHour === hour;
    });
    const sales = hourOrders.reduce((sum, o) => sum + o.total, 0);
    return {
      hour: `${hour}:00`,
      orders: hourOrders.length,
      sales: sales,
    };
  }).filter(data => data.orders > 0 || data.sales > 0);

  // Payment mode data for pie chart
  const paymentData = [
    { name: 'Cash', value: cashAmount, count: cashOrders.length },
    { name: 'UPI', value: upiAmount, count: upiOrders.length },
  ].filter(d => d.value > 0);

  const COLORS = ['#10b981', '#3b82f6'];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl mb-2">Dashboard</h2>
          <p className="text-gray-600">Overview of today's performance</p>
        </div>

        {/* Business Type Info Banner */}
        <Card className="p-5 shadow-sm bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-gray-900 mb-1">
                Your POS is customized for {businessConfig.name}
              </p>
              <p className="text-sm text-gray-700 mb-3">{businessConfig.description}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Active Roles:</span>{' '}
                  <span className="font-medium">{businessConfig.activeRoles.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(', ')}</span>
                </div>
                <div>
                  <span className="text-gray-600">Editable Categories:</span>{' '}
                  <span className="font-medium">{businessConfig.editableCategories.length}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Mini Role Flow - Only show if has multiple active roles */}
        {businessConfig.activeRoles.length > 1 && (
          <Card className="p-5 shadow-sm">
            <h3 className="font-medium mb-3 text-sm text-gray-600">Order Flow</h3>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <div className="px-3 py-2 bg-gray-100 rounded text-sm font-medium">Customer</div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              {businessConfig.activeRoles.includes('cashier') && (
                <>
                  <div className="px-3 py-2 bg-blue-100 text-blue-700 rounded text-sm font-medium">Cashier</div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </>
              )}
              {businessConfig.activeRoles.includes('waiter') && (
                <>
                  <div className="px-3 py-2 bg-green-100 text-green-700 rounded text-sm font-medium">Waiter</div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </>
              )}
              {businessConfig.activeRoles.includes('kitchen') && (
                <>
                  <div className="px-3 py-2 bg-orange-100 text-orange-700 rounded text-sm font-medium">Kitchen</div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </>
              )}
              <div className="px-3 py-2 bg-gray-100 rounded text-sm font-medium">Served</div>
            </div>
          </Card>
        )}

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 shadow-sm border-l-4 border-l-blue-500">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Today's Sales</p>
              <p className="text-3xl font-bold">₹{todaySales.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{totalOrders} completed orders</p>
            </div>
          </Card>

          <Card className="p-6 shadow-sm">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Avg Order Value</p>
              <p className="text-3xl font-bold">₹{avgOrderValue}</p>
              <p className="text-xs text-gray-500">Per order today</p>
            </div>
          </Card>

          <Card className="p-6 shadow-sm">
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Active Tables</p>
              <p className="text-3xl font-bold">{orders.filter(o => o.status !== 'completed').length}</p>
              <p className="text-xs text-gray-500">Currently in progress</p>
            </div>
          </Card>

          <Card className="p-6 shadow-sm bg-gray-900 text-white">
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Lifetime Revenue</p>
              <p className="text-3xl font-bold text-green-400">₹{lifetimeRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{lifetimeCompletedOrders.length} total sales</p>
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

        {/* Active Orders */}
        <Card className="p-6 shadow-sm">
          <h3 className="font-medium mb-4">Active Orders</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-medium text-red-600">
                {orders.filter(o => o.status === 'new').length}
              </p>
              <p className="text-sm text-gray-600">New</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-medium text-yellow-600">
                {orders.filter(o => o.status === 'preparing').length}
              </p>
              <p className="text-sm text-gray-600">Preparing</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-medium text-green-600">
                {orders.filter(o => o.status === 'ready').length}
              </p>
              <p className="text-sm text-gray-600">Ready</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-medium text-blue-600">
                {orders.filter(o => o.status === 'served').length}
              </p>
              <p className="text-sm text-gray-600">Served</p>
            </div>
          </div>
        </Card>

        {/* Analytics Section */}
        {paidOrders.length > 0 && (
          <>
            <div className="mt-8">
              <h3 className="text-xl font-medium mb-4">📊 Analytics</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Orders vs Time Line Chart */}
              <Card className="p-6 shadow-sm">
                <h4 className="font-medium mb-4">Orders Over Time (Today)</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Sales vs Time Bar Chart */}
              <Card className="p-6 shadow-sm">
                <h4 className="font-medium mb-4">Sales Over Time (Today)</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            {/* Payment Mode Distribution */}
            {paymentData.length > 0 && (
              <Card className="p-6 shadow-sm">
                <h4 className="font-medium mb-4">Payment Mode Distribution</h4>
                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                  <ResponsiveContainer width="100%" height={250} className="max-w-xs">
                    <PieChart>
                      <Pie
                        data={paymentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {paymentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="space-y-4">
                    {paymentData.map((item, index) => (
                      <div key={item.name} className="flex items-center gap-4">
                        <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[index] }} />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">
                            {item.count} orders • ₹{item.value.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </>
        )}

        {todayOrders.length === 0 && (
          <Card className="p-12 text-center shadow-sm">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 text-lg">No orders yet today</p>
            <p className="text-gray-400 text-sm mt-2">Orders will appear here automatically</p>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}