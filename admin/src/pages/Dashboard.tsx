import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Package, Users, ShoppingCart, DollarSign, TrendingUp, Clock } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/admin/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    { name: 'Total Revenue', value: `$${(stats?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { name: 'Total Orders', value: stats?.totalOrders || 0, icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { name: 'Products', value: stats?.totalProducts || 0, icon: Package, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { name: 'Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => (
          <div key={item.name} className={`bg-navy-900 border ${item.border} rounded-xl p-6 flex items-center hover:scale-[1.02] transition-transform`}>
            <div className={`p-3 rounded-lg ${item.bg}`}>
              <item.icon className={`w-6 h-6 ${item.color}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-400">{item.name}</p>
              <p className="text-2xl font-bold text-white mt-1">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-navy-900 border border-navy-800 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-5 h-5 text-primary-500 mr-2" />
            <h3 className="text-base font-medium text-white">Performance</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Avg. Order Value</span>
              <span className="text-white font-medium">
                {stats?.totalOrders > 0
                  ? `$${(stats.totalRevenue / stats.totalOrders).toFixed(2)}`
                  : '$0.00'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Conversion Rate</span>
              <span className="text-white font-medium">
                {stats?.totalUsers > 0
                  ? `${((stats.totalOrders / stats.totalUsers) * 100).toFixed(1)}%`
                  : '0%'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Products per User</span>
              <span className="text-white font-medium">
                {stats?.totalUsers > 0
                  ? (stats.totalProducts / stats.totalUsers).toFixed(1)
                  : '0'}
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-navy-900 border border-navy-800 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <Clock className="w-5 h-5 text-primary-500 mr-2" />
            <h3 className="text-base font-medium text-white">Quick Summary</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-navy-950/50 rounded-lg p-4 border border-navy-800">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Inventory Value</p>
              <p className="text-lg font-semibold text-white mt-1">
                {stats?.totalProducts ? `${stats.totalProducts} items` : '0 items'}
              </p>
            </div>
            <div className="bg-navy-950/50 rounded-lg p-4 border border-navy-800">
              <p className="text-xs text-slate-400 uppercase tracking-wider">Active Users</p>
              <p className="text-lg font-semibold text-white mt-1">
                {stats?.totalUsers || 0} registered
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-navy-800">
          <h3 className="text-lg font-medium text-white">Recent Orders</h3>
        </div>
        {stats?.recentOrders?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-navy-800">
              <thead className="bg-navy-950/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Order ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Customer</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800 bg-navy-900">
                {stats.recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-navy-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">#{order.id.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{order.shippingName || order.user?.name || '—'}</div>
                      <div className="text-sm text-slate-400">{order.shippingEmail || order.user?.email || '—'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                        order.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        order.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-white">
                      ${order.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <ShoppingCart className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 text-sm">No orders yet</p>
            <p className="text-slate-500 text-xs mt-1">When customers place orders, they'll show up here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
