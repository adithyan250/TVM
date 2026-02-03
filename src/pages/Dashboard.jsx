import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { DollarSign, Package, AlertTriangle, TrendingUp, Activity, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import useAuth from '../utils/useAuth';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { API_URL } from '../utils/config';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [chartData, setChartData] = useState([]);
    const [allSales, setAllSales] = useState([]);
    const [timeRange, setTimeRange] = useState('week'); // 'week', 'month', 'year'
    const [stats, setStats] = useState([
        { label: 'Total Revenue', value: '₹0.00', change: '0%', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        { label: 'Total Stock', value: '0', change: 'Items', icon: Package, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'Low Stock Items', value: '0', change: 'Action Needed', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10' },
        { label: 'Sales Today', value: '₹0.00', change: 'Today', icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10' },
    ]);
    const [recentSales, setRecentSales] = useState([]);
    const [loading, setLoading] = useState(true);

    // Process chart data based on range
    const processChartData = (salesData, range) => {
        const now = new Date();
        let dataPoints = [];

        if (range === 'week') {
            // Last 7 days
            dataPoints = [...Array(7)].map((_, i) => {
                const d = new Date(now);
                d.setDate(d.getDate() - i);
                return d.toISOString().split('T')[0]; // YYYY-MM-DD
            }).reverse();

            return dataPoints.map(date => {
                const filteredSales = salesData.filter(sale => {
                    try {
                        return new Date(sale.createdAt).toISOString().startsWith(date);
                    } catch (e) { return false; }
                });

                const dayTotal = filteredSales.reduce((acc, sale) => acc + sale.grandTotal, 0);
                const dayProfit = filteredSales.reduce((acc, sale) => {
                    const saleProfit = sale.items.reduce((p, item) => p + ((item.price - (item.wholesalePrice || 0)) * item.quantity), 0);
                    return acc + saleProfit;
                }, 0);

                return {
                    name: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
                    fullDate: date,
                    sales: dayTotal,
                    profit: dayProfit
                };
            });
        } else if (range === 'month') {
            // Last 30 days
            dataPoints = [...Array(30)].map((_, i) => {
                const d = new Date(now);
                d.setDate(d.getDate() - i);
                return d.toISOString().split('T')[0];
            }).reverse();

            return dataPoints.map(date => {
                const filteredSales = salesData.filter(sale => {
                    try {
                        return new Date(sale.createdAt).toISOString().startsWith(date);
                    } catch (e) { return false; }
                });

                const dayTotal = filteredSales.reduce((acc, sale) => acc + sale.grandTotal, 0);
                const dayProfit = filteredSales.reduce((acc, sale) => {
                    const saleProfit = sale.items.reduce((p, item) => p + ((item.price - (item.wholesalePrice || 0)) * item.quantity), 0);
                    return acc + saleProfit;
                }, 0);

                return {
                    name: new Date(date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
                    sales: dayTotal,
                    profit: dayProfit
                };
            });
        } else if (range === 'year') {
            // Last 12 months
            dataPoints = [...Array(12)].map((_, i) => {
                const d = new Date(now);
                d.setMonth(d.getMonth() - i);
                return d.toISOString().slice(0, 7); // YYYY-MM
            }).reverse();

            return dataPoints.map(monthStr => {
                const filteredSales = salesData.filter(sale => {
                    try {
                        return new Date(sale.createdAt).toISOString().startsWith(monthStr);
                    } catch (e) { return false; }
                });

                const monthTotal = filteredSales.reduce((acc, sale) => acc + sale.grandTotal, 0);
                const monthProfit = filteredSales.reduce((acc, sale) => {
                    const saleProfit = sale.items.reduce((p, item) => p + ((item.price - (item.wholesalePrice || 0)) * item.quantity), 0);
                    return acc + saleProfit;
                }, 0);

                // Format YYYY-MM to "Jan"
                const [y, m] = monthStr.split('-');
                const dateObj = new Date(parseInt(y), parseInt(m) - 1, 1);

                return {
                    name: dateObj.toLocaleDateString(undefined, { month: 'short' }),
                    year: y,
                    sales: monthTotal,
                    profit: monthProfit
                };
            });
        }
    };

    useEffect(() => {
        if (allSales.length > 0) {
            const data = processChartData(allSales, timeRange);
            setChartData(data);

            // Calculate totals for the selected period
            const periodRevenue = data.reduce((acc, item) => acc + item.sales, 0);
            const periodProfit = data.reduce((acc, item) => acc + item.profit, 0);

            setStats(prevStats => {
                const newStats = [...prevStats];
                newStats[0] = {
                    ...newStats[0],
                    value: `₹${periodRevenue.toFixed(2)}`,
                    change: timeRange === 'week' ? 'Last 7 Days' : timeRange === 'month' ? 'Last 30 Days' : 'Last Year'
                };
                newStats[1] = {
                    ...newStats[1],
                    value: `₹${periodProfit.toFixed(2)}`,
                    change: timeRange === 'week' ? 'Last 7 Days' : timeRange === 'month' ? 'Last 30 Days' : 'Last Year'
                };
                return newStats;
            });
        }
    }, [timeRange, allSales]);

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
                setAllSales(sales);

                // 1. Total Revenue
                const totalRevenue = sales.reduce((acc, sale) => acc + sale.grandTotal, 0);

                // 2. Total Stock
                const totalStock = parts.reduce((acc, part) => acc + part.quantity, 0);

                // 3. Low Stock
                const lowStockCount = parts.filter(part => part.quantity <= (part.minStockLevel || 5)).length;

                // 4. Sales Today
                const todayStr = new Date().toISOString().split('T')[0];
                const salesToday = sales
                    .filter(sale => {
                        try {
                            return new Date(sale.createdAt).toISOString().startsWith(todayStr);
                        } catch (e) { return false; }
                    })
                    .reduce((acc, sale) => acc + sale.grandTotal, 0);

                // 5. Total Profit
                const totalProfit = sales.reduce((acc, sale) => {
                    const saleProfit = sale.items.reduce((itemDetailsAcc, item) => {
                        // Default to 0 cost if wholesalePrice is missing (legacy data)
                        // Note: We might want to look up current part cost for legacy data, but simpler to assume 0 or just ignore. 
                        // Actually, if it's 0, profit = selling price. That's misleading. 
                        // But we can't do much about past data without cost history.
                        // For now, use recorded wholesalePrice.
                        const cost = item.wholesalePrice || 0;
                        return itemDetailsAcc + ((item.price - cost) * item.quantity);
                    }, 0);
                    return acc + saleProfit;
                }, 0);

                // Initial Chart Data (uses default 'week')
                setChartData(processChartData(sales, 'week'));

                setStats([
                    { label: 'Total Revenue', value: `₹${totalRevenue.toFixed(2)}`, change: 'Total', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                    { label: 'Total Profit', value: `₹${totalProfit.toFixed(2)}`, change: 'Gross Profit', icon: DollarSign, color: 'text-green-400', bg: 'bg-green-400/10' },
                    { label: 'Total Stock', value: totalStock.toString(), change: 'Items in hand', icon: Package, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    { label: 'Low Stock Items', value: lowStockCount.toString(), change: lowStockCount > 0 ? 'Restock Needed' : 'Healthy', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                    { label: 'Sales Today', value: `₹${salesToday.toFixed(2)}`, change: new Date().toLocaleDateString(), icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10' },
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        onClick={() => {
                            if (stat.label === 'Low Stock Items') {
                                navigate('/inventory?filter=low_stock');
                            }
                        }}
                        className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl hover:border-indigo-500/30 transition-colors cursor-pointer group"
                    >
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
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <h3 className="text-lg font-bold text-white">Sales Performance</h3>
                        <div className="flex bg-slate-900 rounded-lg p-1">
                            {['week', 'month', 'year'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${timeRange === range
                                        ? 'bg-indigo-600 text-white shadow-lg'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                        }`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
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
                                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#818cf8' }}
                                    formatter={(value) => [`₹${value}`, 'Sales']}
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
                                        <p className="text-xs text-slate-400 mt-1">{sale.items.length} items • ₹{sale.grandTotal.toFixed(2)}</p>
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
