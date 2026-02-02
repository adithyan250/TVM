import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { DollarSign, Package, AlertTriangle, TrendingUp, Activity, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import useAuth from '../utils/useAuth';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { API_URL } from '../utils/config';

const Dashboard = () => {
    const { user } = useAuth();
    const [chartData, setChartData] = useState([]);
    const [stats, setStats] = useState([
        { label: 'Total Revenue', value: '$0.00', change: '0%', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        { label: 'Total Stock', value: '0', change: 'Items', icon: Package, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'Low Stock Items', value: '0', change: 'Action Needed', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10' },
        { label: 'Sales Today', value: '$0.00', change: 'Today', icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    ]);
    const [recentSales, setRecentSales] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` }
                };

                const [partsRes, salesRes] = await Promise.all([
                    axios.get(`${API_URL}/parts`, config),
                    axios.get(`${API_URL}/sales`, config)
                ]);

                const parts = partsRes.data;
                const sales = salesRes.data;

                // 1. Total Revenue
                const totalRevenue = sales.reduce((acc, sale) => acc + sale.grandTotal, 0);

                // 2. Total Stock
                const totalStock = parts.reduce((acc, part) => acc + part.quantity, 0);

                // 3. Low Stock
                const lowStockCount = parts.filter(part => part.quantity <= (part.minStockLevel || 5)).length;

                // 4. Sales Today
                const today = new Date().setHours(0, 0, 0, 0);
                const salesToday = sales
                    .filter(sale => new Date(sale.createdAt).setHours(0, 0, 0, 0) === today)
                    .reduce((acc, sale) => acc + sale.grandTotal, 0);

                // 5. Chart Data (Last 7 days)
                const last7Days = [...Array(7)].map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    return d.toISOString().split('T')[0];
                }).reverse();

                const chartData = last7Days.map(date => {
                    const dayTotal = sales
                        .filter(sale => sale.createdAt.startsWith(date))
                        .reduce((acc, sale) => acc + sale.grandTotal, 0);
                    return {
                        name: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
                        sales: dayTotal
                    };
                });
                setChartData(chartData);

                setStats([
                    { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, change: 'Total', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                    { label: 'Total Stock', value: totalStock.toString(), change: 'Items in hand', icon: Package, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    { label: 'Low Stock Items', value: lowStockCount.toString(), change: lowStockCount > 0 ? 'Restock Needed' : 'Healthy', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                    { label: 'Sales Today', value: `$${salesToday.toFixed(2)}`, change: new Date().toLocaleDateString(), icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                ]);

                setRecentSales(sales.slice(0, 5));

            } catch (error) {
                console.error("Error loading dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    return (
        <Layout title="Dashboard">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl hover:border-indigo-500/30 transition-colors cursor-pointer group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                                <stat.icon size={22} />
                            </div>
                            <span className="bg-slate-700/50 text-slate-400 text-xs font-medium px-2 py-1 rounded-full">
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-slate-400 text-sm font-medium mb-1">{stat.label}</h3>
                        <p className="text-2xl font-bold text-white">{loading ? '...' : stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white">Sales Performance</h3>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#818cf8' }}
                                    formatter={(value) => [`$${value}`, 'Sales']}
                                />
                                <Area type="monotone" dataKey="sales" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-6">Recent Sales</h3>
                    <div className="space-y-6">
                        {loading ? (
                            <p className="text-slate-500 text-sm">Loading activity...</p>
                        ) : recentSales.length === 0 ? (
                            <p className="text-slate-500 text-sm">No sales recorded yet.</p>
                        ) : (
                            recentSales.map((sale) => (
                                <div key={sale._id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-700/30 transition-colors">
                                    <div className="p-2 rounded-full bg-indigo-500/20 text-indigo-400 mt-1">
                                        <ShoppingCart size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-white font-medium">Sale to <span className="text-indigo-400">{sale.customerName}</span></p>
                                        <p className="text-xs text-slate-400 mt-1">{sale.items.length} items • ${sale.grandTotal.toFixed(2)}</p>
                                        <p className="text-xs text-slate-500 mt-1">{new Date(sale.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
